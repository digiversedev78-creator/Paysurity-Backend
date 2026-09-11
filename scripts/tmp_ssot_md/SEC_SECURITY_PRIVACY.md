# Canonical Requirements: Security & Privacy
**Vertical:** Security & Privacy (SEC) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Authority:** These are platform-wide non-negotiable controls. Every service MUST implement them.

---

## Database Schema

**Migration:** `db/migrations/002_security.sql`

```sql
-- Security event log: authentication, authorization, suspicious activity
CREATE TABLE security_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id),   -- NULL for platform-level events
  event_type      VARCHAR(50) NOT NULL
                  CHECK (event_type IN (
                    'AUTH_SUCCESS','AUTH_FAILURE','MFA_SUCCESS','MFA_FAILURE',
                    'PASSWORD_RESET','SESSION_CREATED','SESSION_EXPIRED','SESSION_REVOKED',
                    'API_KEY_CREATED','API_KEY_USED','API_KEY_REVOKED',
                    'PERMISSION_DENIED','SUSPICIOUS_IP','RATE_LIMIT_HIT',
                    'SECRET_ACCESSED','PAN_ACCESS_ATTEMPT','ADMIN_ACTION'
                  )),
  actor_type      VARCHAR(20) NOT NULL CHECK (actor_type IN ('USER','API_KEY','SYSTEM','UNKNOWN')),
  actor_id        VARCHAR(255),
  ip_address      INET,
  user_agent      TEXT,
  resource        VARCHAR(255),
  outcome         VARCHAR(10) NOT NULL CHECK (outcome IN ('SUCCESS','FAILURE','BLOCKED')),
  risk_score      INTEGER,              -- 0-100 computed risk; >= 80 triggers alert
  details         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);
CREATE TABLE security_events_2026_03 PARTITION OF security_events FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE security_events_2026_04 PARTITION OF security_events FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE INDEX idx_sec_events_actor ON security_events_2026_03(actor_id, event_type, created_at DESC);
CREATE INDEX idx_sec_events_high_risk ON security_events_2026_03(risk_score, created_at DESC) WHERE risk_score >= 70;

-- Active sessions (JWTs tracked for revocation)
CREATE TABLE user_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  tenant_id       UUID REFERENCES tenants(id),
  jti             VARCHAR(255) NOT NULL UNIQUE,    -- JWT ID (to support revocation)
  access_token_expires_at  TIMESTAMPTZ NOT NULL,  -- = NOW() + from config
  refresh_token_hash VARCHAR(255) NOT NULL,        -- bcrypt hash of refresh token
  refresh_token_expires_at TIMESTAMPTZ NOT NULL,
  ip_address      INET,
  user_agent      TEXT,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at      TIMESTAMPTZ,
  revoke_reason   VARCHAR(50),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sessions_jti ON user_sessions(jti) WHERE revoked_at IS NULL;
CREATE INDEX idx_sessions_user ON user_sessions(user_id) WHERE revoked_at IS NULL;

-- MFA configurations per user
CREATE TABLE user_mfa_configs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) UNIQUE,
  totp_secret_ref VARCHAR(255),             -- GCP secret ref for TOTP seed (never in DB)
  totp_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
  totp_verified_at TIMESTAMPTZ,
  push_device_token VARCHAR(500),           -- Expo push token for push MFA
  push_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
  backup_codes_hash JSONB,                  -- array of bcrypt-hashed backup codes
  last_mfa_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- IP allowlisting: for high-security tenants
CREATE TABLE ip_allowlists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  cidr            CIDR NOT NULL,
  label           VARCHAR(100),             -- 'Office', 'Production Server', etc.
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, cidr)
);
ALTER TABLE ip_allowlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ip_allowlists USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Seed:** `db/seeds/002_security_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  -- JWT / tokens
  ('sec.jwt.access_token_ttl_sec',      '900',     'integer', 'Access token TTL in seconds (15 min)', FALSE),
  ('sec.jwt.refresh_token_ttl_days',    '30',      'integer', 'Refresh token TTL in days', FALSE),
  ('sec.jwt.issuer',                    'https://api.paysurity.com', 'string', 'JWT iss claim', FALSE),
  ('sec.jwt.algorithm',                 'ML-DSA-65', 'string', 'ADV-SEC-02 [PQC]: JWT signing migrating natively to FIPS 204 ML-DSA Post-Quantum Cryptography in GCP KMS', FALSE),
  -- Passwords
  ('sec.password.min_length',           '10',      'integer', 'Minimum password length', FALSE),
  ('sec.password.require_uppercase',    'true',    'boolean', 'Require at least one uppercase letter', FALSE),
  ('sec.password.require_number',       'true',    'boolean', 'Require at least one number', FALSE),
  ('sec.password.require_special',      'true',    'boolean', 'Require at least one special character', FALSE),
  ('sec.password.bcrypt_rounds',        '12',      'integer', 'bcrypt rounds for password hashing', FALSE),
  ('sec.password.history_count',        '5',       'integer', 'Number of prior passwords that cannot be reused', FALSE),
  ('sec.password.max_age_days',         '365',     'integer', 'Days before password expiry warning (financial roles: 90)', FALSE),
  -- Login lockout
  ('sec.login.max_attempts',            '5',       'integer', 'Max failed login attempts before lockout', FALSE),
  ('sec.login.lockout_duration_min',    '30',      'integer', 'Account lockout duration in minutes', FALSE),
  ('sec.login.lockout_progressive',     'true',    'boolean', 'Progressive lockout: doubles on each lockout event', FALSE),
  -- MFA
  ('sec.mfa.totp_window',              '1',       'integer', 'TOTP tolerance window (steps before/after)', FALSE),
  ('sec.mfa.backup_codes_count',        '10',      'integer', 'Number of TOTP backup recovery codes', FALSE),
  -- Session security
  ('sec.session.max_concurrent',        '5',       'integer', 'Max concurrent sessions per user', FALSE),
  ('sec.session.idle_timeout_min',      '60',      'integer', 'Idle session timeout in minutes', FALSE),
  ('sec.session.absolute_timeout_hours','12',      'integer', 'Absolute session max length in hours', FALSE),
  -- CORS
  ('sec.cors.allowed_origins',          '["https://app.paysurity.com","https://merchant.paysurity.com","https://paysurity.com"]', 'json', 'CORS allowed origins', FALSE),
  ('sec.cors.allow_credentials',        'true',    'boolean', 'Allow credentials in CORS requests', FALSE),
  -- Security headers (applied by NGINX/proxy layer — values documented here)
  ('sec.headers.hsts_max_age_sec',      '31536000','integer', 'HSTS max-age in seconds (1 year)', FALSE),
  ('sec.headers.csp',                   'default-src https: ''self''; frame-ancestors ''none''', 'string', 'Content-Security-Policy value', FALSE),
  -- Risk scoring
  ('sec.risk.suspicious_countries',     '["RU","CN","KP","IR"]', 'json', 'ISO2 country codes triggering risk score boost', FALSE),
  ('sec.risk.alert_threshold',          '80',      'integer', 'Risk score at which OPS alert fires', FALSE),
  ('sec.events.retention_months',       '13',      'integer', 'Security event log retention in months', FALSE)
ON CONFLICT (key) DO NOTHING;
```

---

## REQ-SEC-001: Authentication & JWT Flow

**File:** `src/modules/auth/auth.service.ts`

```typescript
/**
 * login(email, password, tenantId?) — Standard username/password login.
 * 1. Load user by email; verify bcrypt password hash
 * 2. Check lockout: if consecutive_login_failures >= max_attempts AND locked_until > NOW() → ACCOUNT_LOCKED
 * 3. On failure: increment consecutive_login_failures; apply progressive lockout
 * 4. On success: reset consecutive_login_failures
 * 5. Check if MFA required (role-based — PAYROLL_ADMIN, ENTERPRISE_ADMIN always require MFA)
 *    MFA roles read from RBAC_PERMISSION_MATRIX config (never hardcoded)
 * 6. Generate: access token (ML-DSA PQC JWT, TTL from config)
 *    Claims: { sub: user_id, tenant_id, role, jti: uuid, iat, exp }
 * 7. Generate: refresh_token (crypto.randomBytes(32).toString('base64url'))
 *    Hash and store in user_sessions
 * 8. Write user_sessions record; write security_events AUTH_SUCCESS
 */
async login(email: string, password: string, tenantId?: string): Promise<AuthResponse>

/**
 * refresh(refreshToken) — Extends session via refresh token.
 * 1. Look up user_sessions by hashing provided token (bcrypt.compare)
 * 2. Validate not revoked, not expired, user still active
 * 3. Issue new access_token (same jti chain)
 * 4. Rotate refresh_token (new one issued; old one invalidated)
 */
async refresh(refreshToken: string): Promise<AuthResponse>

/**
 * verifyMFA(jti, totpCode) — MFA step-up verification.
 * 1. Load user's TOTP secret from GCP Secret Manager (never from DB)
 * 2. speakeasy.totp.verify with window from config 'sec.mfa.totp_window'
 * 3. On success: update session.mfa_verified_at; return full-access access_token
 * 4. On failure: write MFA_FAILURE security event; increment risk score
 */
async verifyMFA(jti: string, totpCode: string): Promise<AuthResponse>

/**
 * revokeSession(jti, reason) — Force-expire a session.
 * Sets user_sessions.revoked_at = NOW(). 
 * Also adds jti to Redis blocklist (TTL = remaining token lifetime) for immediate effect
 * Since JWT validation checks Redis blocklist before trusting the token signature.
 */
async revokeSession(jti: string, reason: string): Promise<void>

/**
 * ADV-SEC-03 [Zero-Knowledge Proof Identity]: 
 * verifyAttributeZKP(proofPayload) — Decodes identity without extracting raw identity metrics.
 * Ensures the platform only holds 'Proof of Attribute' instead of raw IDs (e.g. proof of age > 21 without explicitly storing DOB).
 */
async verifyAttributeZKP(proofPayload: string): Promise<boolean>
```

---

## REQ-SEC-002: Secrets Management

```
RULE (enforced in all services):
- NO credential (API key, DB password, TOTP seed, SSN, bank routing number) is stored in the DB, .env files, or code.
- ALL secrets accessed via GCP Secret Manager: secretManagerServiceClient.accessSecretVersion(name)
- Secret names follow format: projects/{project}/secrets/{category}-{identifier}/versions/latest
- On startup: services resolve secrets into memory; never log resolution values
- Secret rotation: handled by GCP; application re-reads on cache miss (5-min in-memory cache max)
- TOTP seeds: stored at path 'projects/{project}/secrets/totp-{user_id}/versions/latest'
- ACH bank accounts: 'projects/{project}/secrets/bankaccount-{employee_id}/versions/latest'
- SSN full: 'projects/{project}/secrets/ssn-{employee_id}/versions/latest'
- API keys (third-party): 'projects/{project}/secrets/{provider}-apikey/versions/latest'
```

---

## REQ-SEC-003: PAN (Payment Card) Zero-Tolerance

```
ABSOLUTE RULE — no exceptions:
- PaySurity systems NEVER receive, store, process, or log full card numbers (PAN).
- All card data captured via FluidPay hosted fields (iframe in browser; data flows direct to FluidPay).
- PaySurity receives only: FluidPay payment token (non-reversible alias).
- If a PAN appears in any log, the security_events table, API request body, or DB query:
    → Immediate automated redaction PAN_REDACT_REGEX: /\b\d{13,19}\b/g → replace with '[PAN_REDACTED]'
    → Alert OPS (risk_score = 100)
    → Write PAN_ACCESS_ATTEMPT security event
    → Halt the specific request pipeline
- PAN redaction middleware applied at: API ingress, logging middleware, DB query logger.
```

---

## REQ-SEC-004: Security Headers & Network Controls

Enforced at NGINX/Cloud Run ingress layer. Document the required values — infra team implements:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: (from config sec.headers.csp)
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
X-Trace-Id: {uuid}  ← injected on every response (not a security header but required by platform)
```

---

## ADV-SEC-04: Automated Scope-Zero Generation

**Priority:** Critical | **Framework:** Continuous Compliance

The platform must mathematically prove Scope-Zero PCI descoping at runtime. A continuous background Daemon continuously sweeps the DB arrays, logs, and egress pipelines ensuring absolutely $0$ PAN telemetry vectors exist anywhere on PAY_SURE infrastructure. Generates real-time compliance artifacts programmatically.
 
```typescript
/**
 * auditScopeZeroEnforcement() — Continuous Monitor.
 * Validates 100% Edge-Tokenization compliance, generating cryptographic attestation logs bounding backend descoping.
 */
async function auditScopeZeroEnforcement(): Promise<void>
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/auth/login` | None | Username/password login |
| `POST` | `/v1/auth/refresh` | Refresh token | Get new access token |
| `POST` | `/v1/auth/logout` | Bearer token | Revoke current session |
| `POST` | `/v1/auth/logout-all` | Bearer token (MFA for finance roles) | Revoke all sessions |
| `POST` | `/v1/auth/mfa/verify` | Partial session | Verify TOTP code |
| `POST` | `/v1/auth/mfa/setup` | Bearer token | Initiate TOTP setup |
| `GET` | `/v1/auth/sessions` | Bearer token | List active sessions |
| `DELETE` | `/v1/auth/sessions/{id}` | Bearer token | Revoke specific session |
| `GET` | `/v1/security/events` | PAYSURITY_ADMIN | Security event log |

---

## Acceptance Tests

| Test ID | Scenario | Expected |
|---|---|---|
| SEC-001-T1 | 5 failed logins | Account locked for 30 min; AUTH_FAILURE security events written |
| SEC-001-T2 | Expired access token | 401 TOKEN_EXPIRED; caller must refresh |
| SEC-001-T3 | Revoked session used | 401 UNAUTHENTICATED; Redis blocklist hit before signature check |
| SEC-001-T4 | MFA required for PAYROLL_ADMIN | Login returns partial token; access blocked until TOTP verified |
| SEC-001-T5 | PAN in API body | PAN_REDACTED in logs; PAN_ACCESS_ATTEMPT event; request blocked |
| SEC-001-T6 | CORS from unlisted origin | 403; no CORS headers returned |

---


## Valor EMV L3 Security Protocols
- **REQ-01**: Peer-to-Peer Encryption (P2PE) enforced across all Valor terminals.
- **REQ-02**: PCI-PTS boundary validations for L3 processing.
- **REQ-03**: Comm-Drop Re-encryption caching.
- **REQ-04**: Secure Key Loading and Terminal Tamper alerts.
