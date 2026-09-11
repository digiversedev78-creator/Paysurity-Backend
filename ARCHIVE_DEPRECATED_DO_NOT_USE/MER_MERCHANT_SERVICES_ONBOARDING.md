# Canonical Requirements: Merchant Services & Onboarding
**Vertical:** Merchant Services (MER) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)  
**KYB Provider:** Stripe Identity (primary) | Manual review fallback  
**Payment Gateway Underwriting:** FluidPay

---

## Database Schema

**Migration:** `db/migrations/003_merchant_onboarding.sql`

```sql
-- Merchant applications: pre-tenant record during onboarding funnel
CREATE TABLE merchant_applications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number    VARCHAR(20) NOT NULL UNIQUE,  -- format: APP-{YYYYMMDD}-{seq6}
  status                VARCHAR(30) NOT NULL DEFAULT 'STARTED'
                        CHECK (status IN (
                          'STARTED',            -- application form opened
                          'INFO_SUBMITTED',     -- business info complete
                          'KYB_IN_PROGRESS',   -- identity verification underway
                          'KYB_PASSED',         -- identity checks passed
                          'KYB_FAILED',         -- identity checks failed (terminal for this application)
                          'UNDER_REVIEW',       -- PaySurity underwriter reviewing
                          'APPROVED',           -- underwriter approved; begin configuration
                          'REJECTED',           -- underwriter rejected (terminal)
                          'ACTIVE'              -- configuration complete; live
                        )),
  -- Business identity
  legal_business_name   VARCHAR(255) NOT NULL,
  dba_name              VARCHAR(255),
  business_type         VARCHAR(30) NOT NULL
                        CHECK (business_type IN ('SOLE_PROP','LLC','C_CORP','S_CORP','PARTNERSHIP','NONPROFIT')),
  vertical              VARCHAR(30) NOT NULL
                        CHECK (vertical IN ('RESTAURANT','GROCERY','RETAIL','ECOMMERCE','SALON','OTHER')),
  ein                   VARCHAR(10),                   -- stored encrypted in GCP Secret Manager
  ein_secret_ref        VARCHAR(255),                  -- GCP secret ref for EIN
  -- Contact (ADV-CRM-01: Zero-Knowledge Personas)
  -- Plaintext storage is strictly prohibited. PII must be hashed at ingestion-time.
  owner_first_name_hash VARCHAR(255) NOT NULL,
  owner_last_name_hash  VARCHAR(255) NOT NULL,
  owner_email_hash      VARCHAR(255) NOT NULL,
  owner_phone_hash      VARCHAR(255),
  business_address      JSONB NOT NULL,               -- {street, city, state, zip, country}
  -- Plan selection
  selected_plan_code    VARCHAR(20) REFERENCES subscription_plans(plan_code),
  billing_cycle         VARCHAR(10) DEFAULT 'MONTHLY',
  -- Referral / affiliate
  referral_code         VARCHAR(50),
  affiliate_id          UUID REFERENCES affiliates(id),
  -- Assigned CSM
  assigned_csm_user_id  UUID REFERENCES users(id),
  -- Rejection detail
  rejection_reason      TEXT,
  rejection_category    VARCHAR(50),
  -- Timestamps
  submitted_at          TIMESTAMPTZ,
  kyb_started_at        TIMESTAMPTZ,
  kyb_completed_at      TIMESTAMPTZ,
  approved_at           TIMESTAMPTZ,
  rejected_at           TIMESTAMPTZ,
  activated_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Resulting tenant (set on APPROVED)
  tenant_id             UUID REFERENCES tenants(id)
);
CREATE INDEX idx_applications_status ON merchant_applications(status, created_at DESC);
CREATE INDEX idx_applications_email ON merchant_applications(owner_email);

-- KYB verifications: business identity checks via Stripe Identity (or manual)
CREATE TABLE kyb_verifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id        UUID NOT NULL REFERENCES merchant_applications(id),
  check_type            VARCHAR(30) NOT NULL
                        CHECK (check_type IN (
                          'BUSINESS_REGISTRATION',   -- Secretary of State check
                          'BENEFICIAL_OWNER_ID',      -- Owner ID scan + liveness
                          'SANCTIONS_SCREENING',      -- OFAC check
                          'ADVERSE_MEDIA',            -- news screening
                          'BANK_ACCOUNT_VERIFY',      -- micro-deposit or Plaid instant verify
                          'EIN_VERIFY'               -- IRS EIN verification
                        )),
  provider              VARCHAR(30) NOT NULL DEFAULT 'STRIPE_IDENTITY'
                        CHECK (provider IN ('STRIPE_IDENTITY','MANUAL','MIDDESK','PERSONA')),
  status                VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING','IN_PROGRESS','PASSED','FAILED','SKIPPED','REVIEW')),
  provider_session_id   VARCHAR(255),
  provider_report_ref   VARCHAR(255),               -- GCS path to provider report PDF
  risk_score            INTEGER,                    -- if provider returns a score (0-100)
  failure_reason        TEXT,
  reviewed_by           UUID REFERENCES users(id),  -- for MANUAL provider
  completed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_kyb_application ON kyb_verifications(application_id, check_type);

-- Underwriting reviews: PaySurity risk assessment
CREATE TABLE underwriting_reviews (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id        UUID NOT NULL REFERENCES merchant_applications(id) UNIQUE,
  reviewer_user_id      UUID REFERENCES users(id),
  risk_category         VARCHAR(20)
                        CHECK (risk_category IN ('LOW','MEDIUM','HIGH','PROHIBITED')),
  mcc_code              VARCHAR(4),                 -- Merchant Category Code from VISA/MC tables
  processing_volume_estimate_cents INTEGER,         -- monthly volume estimate from application
  avg_ticket_estimate_cents INTEGER,
  card_present_pct      INTEGER,                    -- % of transactions expected card-present
  chargeback_reserve_pct INTEGER DEFAULT 0,         -- % of volume held in reserve
  payout_delay_days     INTEGER DEFAULT 2,          -- settlement delay for risk
  approved_plan_code    VARCHAR(20),                -- may differ from selected_plan_code
  conditions            JSONB,                      -- [{condition, due_date}]
  notes                 TEXT,
  decision              VARCHAR(20)
                        CHECK (decision IN ('APPROVED','REJECTED','DEFERRED','ADDITIONAL_INFO')),
  decided_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Onboarding workspace: tracks 5-phase progress post-approval
CREATE TABLE onboarding_workspaces (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) UNIQUE,
  application_id        UUID NOT NULL REFERENCES merchant_applications(id),
  assigned_csm          UUID REFERENCES users(id),
  current_phase         INTEGER NOT NULL DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 5),
  -- Checklist completion (booleans stored per phase)
  phase1_complete       BOOLEAN NOT NULL DEFAULT FALSE,  -- Discovery: data import done
  phase2_complete       BOOLEAN NOT NULL DEFAULT FALSE,  -- Configuration: brand/menu/loyalty set
  phase3_complete       BOOLEAN NOT NULL DEFAULT FALSE,  -- Training: staff trained, QA signed
  phase4_complete       BOOLEAN NOT NULL DEFAULT FALSE,  -- Parallel run: reconciliation clean
  phase5_complete       BOOLEAN NOT NULL DEFAULT FALSE,  -- Go live: legacy off, hyper-care started
  go_live_date          DATE,
  hyper_care_ends_at    DATE,
  notes                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE onboarding_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON onboarding_workspaces USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Seed:** `db/seeds/003_mer_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  ('mer.kyb.required_checks',          '["BUSINESS_REGISTRATION","BENEFICIAL_OWNER_ID","SANCTIONS_SCREENING","EIN_VERIFY"]', 'json', 'KYB check types run for every application', FALSE),
  ('mer.kyb.high_risk_checks',         '["ADVERSE_MEDIA","BANK_ACCOUNT_VERIFY"]', 'json', 'Additional checks for HIGH risk category', FALSE),
  ('mer.kyb.provider',                 'STRIPE_IDENTITY', 'string', 'KYB provider (Stripe Identity primary)', FALSE),
  ('mer.kyb.stripe_base_url',          'https://api.stripe.com/v1', 'string', 'Stripe API base URL for identity', FALSE),
  ('mer.underwriting.auto_approve_threshold', '50', 'integer', 'Risk score 0-50: auto-approve; 51-75: manual review; 76+: reject', FALSE),
  ('mer.underwriting.auto_reject_threshold','76', 'integer', 'Risk score >= this → auto-reject', FALSE),
  ('mer.onboarding.hyper_care_days',   '30',    'integer', 'Days of post-go-live CSM hyper-care support', FALSE),
  ('mer.fluidpay.underwriting_path',   '/api/v1/merchant/register', 'string', 'FluidPay endpoint to register approved merchant', FALSE),
  ('mer.application.expiry_days',      '30',    'integer', 'Days before incomplete application expires', FALSE)
ON CONFLICT (key) DO NOTHING;
```

---

## REQ-MER-001: Merchant Application & KYB Flow

**Priority:** Must | **Actors:** Prospective Merchant, PaySurity CSM, Risk Underwriter

### Architectural Controls (Provisional Onboarding & Integrity)
1. **Provisional Micro-Processing (Instant Start):** Merchants skip the manual Underwriting delay. They are granted `PROVISIONAL` status. All transactions captured use `AUTOMATIC` gateway capture, but the `tenants` table applies a strict `payout_locked = TRUE` hold. Accumulation is capped at a hard limit of **$2,500**.
   * **72-Hour Provisional Threshold:** If a merchant remains in `PROVISIONAL` status for > 72 business hours, the system must either auto-refund all escrowed holdings or transition the account to 'High-Priority Manual Review' to avoid money transmission/escrow non-compliance.
2. **Deterministic Idempotency:** The gateway router must use deterministic mapping (e.g., `paymentIntent.id`) for the `X-Idempotency-Key` to safely prevent duplicate gateway capture sweeps during network retries.
   * **Idempotency Key TTL:** The gateway router explicitly defines key caching with a 24-hour Time-To-Live (TTL).
3. **Passive Behavioral Biometrics (DIBB) & 3D Selfie Liveness:** 
   * **DIBB:** Tracks copy-paste velocity, hesitation on PII inputs, and Micro-Gestural Telemetry (Gyroscope/Accelerometer jitter) as primary bot-detection signals.
   * **Liveness Validation:** Requires Active Illumination (Flash-Reflection) Analysis directly in the browser. "No-Upload" logic ensures no raw biometric video is stored.
4. **Gross-to-Net Ledger Mutability (Net Settlement):**
   * **Canonical Formula:** `Net_Settlement = sum(Gross_Sales) - (Interchange_Fees + Scheme_Fees + PaySurity_Markup) - Provisional_Escrow`
   * **Execution Rule:** Available Liquidity cannot just equal `totalVolume`. The system MUST map the transaction against `payment_fees` (joining on `transaction_id`) and strictly deduct all network Processing Costs before applying an escrow lock.

---

#### Service Layer: `src/modules/merchant/application.service.ts`

```typescript
/**
 * startApplication(params) — Creates merchant_applications record.
 * Generates application_number: 'APP-{YYYYMMDD}-{6-char nanoid}'.
 * Sends welcome email via NOT engine with secure link to continue application.
 * Returns: { application_id, continue_url }
 */
async startApplication(params: {
  legalBusinessName: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;    -- validated E.164 per Rule 7
  vertical: string;
  selectedPlanCode: string;
  referralCode?: string;
}): Promise<ApplicationStart>

/**
 * runKYBChecks(applicationId) — Orchestrates all required KYB checks in parallel.
 * Required checks read from platform_config 'mer.kyb.required_checks' array.
 * For each check:
 *   1. Creates kyb_verifications record (status=IN_PROGRESS)
 *   2. Calls appropriate provider (Stripe Identity /identity/verification_sessions)
 *   3. Gets webhook callback from provider → updates status PASSED/FAILED
 * All checks completed? → aggregate result:
 *   All PASSED: application.status = KYB_PASSED → trigger runUnderwriting()
 *   Any FAILED: application.status = KYB_FAILED → notify CSM; send merchant rejection with reason
 */
async runKYBChecks(applicationId: string): Promise<void>

/**
 * runUnderwriting(applicationId) — Automated risk scoring + optional manual review.
 * 1. Aggregate KYB results, business type, vertical, volume estimate
 * 2. Calculate composite risk score 0-100
 * 3. If score <= 'mer.underwriting.auto_approve_threshold': auto-approve → provisionTenant()
 * 4. If score >= 'mer.underwriting.auto_reject_threshold': auto-reject → notify merchant
 * 5. If in between: status = UNDER_REVIEW; assign to underwriter queue; notify PaySurity OPS
 */
async runUnderwriting(applicationId: string): Promise<void>

/**
 * provisionTenant(applicationId) — Activated on approval.
 * 1. Creates: tenants, legal_entities, brands, locations (from application data)
 * 2. Creates: merchant_subscriptions (with selected plan; trial starts)
 * 3. Registers merchant with FluidPay (POST /api/v1/merchant/register)
 *    → saves gateway_configurations record (API key stored in GCP Secret Manager)
 * 4. Creates: onboarding_workspaces record (phase 1)
 * 5. Creates: ENTERPRISE_ADMIN user account for merchant owner
 * 6. Sends: welcome email with login link; separate email with POS terminal provisioning guide
 * 7. Updates: merchant_applications.tenant_id, status = ACTIVE
 */
async provisionTenant(applicationId: string): Promise<void>
```

---

#### API Endpoints

| Method | Path | Auth | Description | Webhook |
|---|---|---|---|---|
| `POST` | `/v1/applications` | None (public) | Start merchant application | `application.started` |
| `GET` | `/v1/applications/{id}` | Application token | Check application status | — |
| `PATCH` | `/v1/applications/{id}` | Application token | Update application info | — |
| `POST` | `/v1/applications/{id}/submit` | Application token | Submit for KYB | `application.submitted` |
| `GET` | `/v1/applications/{id}/kyb-status` | Application token, PaySurity Admin | KYB check progress | — |
| `POST` | `/v1/applications/{id}/underwrite` | PAYSURITY_ADMIN | Manual underwrite decision | `application.decision_made` |
| `GET` | `/v1/admin/applications` | PAYSURITY_ADMIN | Application queue | — |
| `GET` | `/v1/onboarding/progress` | ENTERPRISE_ADMIN | Current onboarding phase progress | — |
| `PATCH` | `/v1/onboarding/phase/{n}` | PaySurity CSM | Mark phase complete | `onboarding.phase_complete` |
| `POST` | `/webhooks/stripe-identity/kyb` | Stripe (verified) | KYB verification result callback | — |

---

#### UI/UX — Public Application Wizard (5 steps)

**Step 1 — Business Info:** Legal name, DBA, business type, vertical, EIN, business address  
**Step 2 — Owner Identity:** Owner name, SSN last 4, DOB, home address, phone, email  
**Step 3 — Processing History:** Monthly volume estimate, avg ticket, % card-present, years in business  
**Step 4 — Plan Selection:** Plan comparison table; billing cycle toggle (monthly/annual)  
**Step 5 — Bank Account:** Routing + account number (Plaid instant verify preferred); fallback: micro-deposit 2-day verify

Progress bar at top. Each step saves on "Next" — crash recovery via `application_id` cookie.  
KYB screen: "We're verifying your business — this takes about 2 minutes" with animated progress.  
Rejection screen: clear reason, option to re-apply after 30 days or contact support.


## PaySurity Advantage (Superiority V2.0)
**ADV-005 [Speed-Onboarding]:** Performance SLA Hardcoded: < 120 seconds to ,500 Provisional Access using Active Illumination telemetry. This subsumes and enhances previous 72-hour provisional escrow restrictions.

**ADV-ONB-06 [CTA 2026 BOI Compliance]:**
- **Automated BOI Verification:** The system must perform an Automated FinCEN BOI Database cross-reference strictly within the initial 120-second Speed-Onboarding window natively.
- **UBO Mapping Execution:** The AI Underwriting Agent is mandated to structurally verify that the self-reported Ultimate Beneficial Owners (UBOs) precisely match the government's FinCEN BOI definitions.
- **Discrepancy Reporting:** If a mismatch is found between the application and FinCEN data, the system must trigger an immediate Electronic Customer Due Diligence (eCDD) escalation for manual underwriter review before processing or settling any provisional funds.

**ADV-ONB-07 [Lifecycle Escalation Sentry]:**
- **24-Hour SLA Execution:** A BullMQ background worker strictly monitors the `created_at` timestamp of every `PROVISIONAL` merchant.
- **Escalation Trigger:** If a merchant remains provisional exactly beyond `Date.now() - 24 * 60 * 60 * 1000`, the system automatically triggers manual eCDD escalation, severing its Provisional status dynamically.
- **Auto-Drain Resolution:** Once successfully verified, an `AUTO_DRAIN_EXECUTION` sequence natively queues an HSM `<pacs.008>` release payload to instantly execute the Sovereign Liquidity Vault escrow.

**ADV-ONB-08 [Small Merchant Waiver]:**
- **$1,000 Monthly Volume Exemption:** The `transitionToVerified` engine dynamically applies a processing-waiver if the anticipated or actual transactional processing volume is <= `$1,000` (100000 cents). This circumvents strict manual eCDD delays entirely.
