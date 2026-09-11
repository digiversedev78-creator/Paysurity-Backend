# Canonical Requirements: Compliance & Legal
**Vertical:** Compliance & Legal (COM) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Scope:** PCI DSS, CCPA, TCPA, CAN-SPAM, ADA/WCAG, SOX, NACHA, 1099-K, state nexus

---

## Database Schema

**Migration:** `db/migrations/002b_compliance.sql`

```sql
-- Document retention index: soft controls for how long data must be kept
CREATE TABLE data_retention_policies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_category     VARCHAR(100) NOT NULL UNIQUE,
  table_name        VARCHAR(100) NOT NULL,
  retention_years   SMALLINT NOT NULL,
  legal_basis       TEXT NOT NULL,               -- citation: PCI DSS 3.2.1, IRS Rev. Proc., etc.
  deletion_method   VARCHAR(30) NOT NULL
                    CHECK (deletion_method IN ('HARD_DELETE','SOFT_DELETE','ANONYMIZE','ARCHIVE_GCS')),
  auto_enforce      BOOLEAN NOT NULL DEFAULT FALSE, -- if TRUE, batch job enforces; else manual
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CCPA consumer data requests
CREATE TABLE ccpa_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  consumer_id       UUID REFERENCES consumers(id),
  request_type      VARCHAR(20) NOT NULL
                    CHECK (request_type IN ('KNOW','DELETE','OPT_OUT_SALE','PORTABILITY')),
  requester_email   VARCHAR(255) NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'RECEIVED'
                    CHECK (status IN ('RECEIVED','VERIFYING','IN_PROGRESS','COMPLETED','DENIED','CANCELLED')),
  verification_method VARCHAR(30),             -- how identity was verified
  verified_at       TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  denial_reason     TEXT,
  -- CCPA mandates 45-day response; 90-day absolute maximum
  due_date          DATE NOT NULL,             -- = submitted_at + 45 days
  extended_due_date DATE,                      -- max 45-day extension allowed
  data_export_gcs_path TEXT,                   -- for PORTABILITY requests
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE ccpa_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON ccpa_requests USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- PCI DSS compliance checkpoints (SAQ-A for hosted fields model)
CREATE TABLE pci_compliance_checkpoints (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkpoint_code VARCHAR(50) NOT NULL UNIQUE,  -- e.g. 'REQ_3_3_NO_SAD_POST_AUTH'
  description     TEXT NOT NULL,
  pci_requirement VARCHAR(20) NOT NULL,         -- e.g. '3.3', '6.3', '8.2'
  status          VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('COMPLIANT','PARTIAL','NON_COMPLIANT','NOT_APPLICABLE','PENDING')),
  evidence_gcs_path TEXT,
  last_assessed_at TIMESTAMPTZ,
  next_assessment_date DATE,
  assessed_by     UUID REFERENCES users(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ADA/WCAG accessibility compliance tracking per screen
CREATE TABLE accessibility_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen_id       VARCHAR(100) NOT NULL,        -- e.g. 'merchant.dashboard', 'consumer.loyalty'
  portal          VARCHAR(30) NOT NULL
                  CHECK (portal IN ('MERCHANT','CONSUMER','INTERNAL','PUBLIC')),
  wcag_level      VARCHAR(5) NOT NULL DEFAULT 'AA'
                  CHECK (wcag_level IN ('A','AA','AAA')),
  audit_date      DATE NOT NULL,
  violations      JSONB,                        -- [{id, severity, description, element}]
  pass_count      INTEGER NOT NULL DEFAULT 0,
  fail_count      INTEGER NOT NULL DEFAULT 0,
  audited_by      VARCHAR(100),                 -- tool name or auditor
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Seed:** `db/seeds/002b_compliance_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  ('com.ccpa.response_days',           '45',    'integer', 'CCPA mandated response window in days', FALSE),
  ('com.ccpa.max_extension_days',      '45',    'integer', 'CCPA max extension additional days', FALSE),
  ('com.ccpa.verification_required',   'true',  'boolean', 'Identity verification required before executing CCPA request', FALSE),
  ('com.pci.scope',                    'SAQ_A', 'string',  'PCI DSS scope level (SAQ-A for hosted fields; no PANs in our systems)', FALSE),
  ('com.pci.annual_review_month',      '3',     'integer', 'Annual PCI assessment month (March)', FALSE),
  ('com.wcag.target_level',            'AA',    'string',  'WCAG compliance target level for all UI', FALSE),
  ('com.financial_record.retain_years','7',     'integer', 'Financial record retention (IRS requirement)', FALSE),
  ('com.employee_record.retain_years', '7',     'integer', 'Employee payroll record retention', FALSE),
  ('com.audit_log.retain_years',       '7',     'integer', 'Audit event log retention', FALSE),
  ('com.security_event.retain_months', '13',    'integer', 'Security event retention in months', FALSE),
  ('com.1099k.threshold_cents',        '60000', 'integer', 'IRS 1099-K reporting threshold in cents (update in DB annually)', FALSE),
  ('com.nacha.cutoff_hour_utc',        '17',    'integer', 'NACHA ACH file submission cutoff: 5 PM UTC', FALSE)
ON CONFLICT (key) DO NOTHING;

-- Data retention policies seeded
INSERT INTO data_retention_policies (data_category, table_name, retention_years, legal_basis, deletion_method, auto_enforce)
VALUES
  ('payment_records',       'payments',              7,  'IRS Rev. Proc. 98-25; card network rules',            'ARCHIVE_GCS', FALSE),
  ('settlement_records',    'settlement_batches',    7,  'IRS Rev. Proc. 98-25',                                'ARCHIVE_GCS', FALSE),
  ('payroll_records',       'payroll_runs',          7,  'IRS Publication 15; FLSA 29 CFR 516',                 'ARCHIVE_GCS', FALSE),
  ('tax_withholding_ytd',   'tax_withholding_ytd',   7,  'IRS Publication 15',                                   'ARCHIVE_GCS', FALSE),
  ('audit_events',          'loyalty_audit_events',  7,  'Internal policy; regulatory best practice',            'ARCHIVE_GCS', FALSE),
  ('consumer_pii_loyalty',  'loyalty_accounts',      0,  'CCPA right to delete; see DEV_IMPL_STANDARD Rule 8',   'ANONYMIZE',   FALSE),
  ('security_events',       'security_events',       2,  'Internal security policy; SOC 2',                      'HARD_DELETE', TRUE),
  ('ai_session_messages',   'ai_session_messages',   1,  'Minimal retention; no financial data',                 'HARD_DELETE', TRUE),
  ('api_usage_logs',        'api_usage_logs',        2,  'Rate limit audit; customer disputes',                  'HARD_DELETE', TRUE)
ON CONFLICT (data_category) DO UPDATE SET retention_years=EXCLUDED.retention_years, legal_basis=EXCLUDED.legal_basis;

-- PCI DSS checkpoints seeded (SAQ-A — hosted payment fields model)
INSERT INTO pci_compliance_checkpoints (checkpoint_code, description, pci_requirement, status)
VALUES
  ('REQ_3_NO_PAN_STORAGE',    'No PANs stored anywhere in PaySurity systems — enforced by PAN redaction middleware', '3.3', 'COMPLIANT'),
  ('REQ_4_TLS_IN_TRANSIT',    'All cardholder data over TLS 1.2+ minimum (enforced at load balancer)', '4.2.1', 'COMPLIANT'),
  ('REQ_6_HOSTED_FIELDS',     'Card capture via FluidPay hosted fields only — no PAN traverses PaySurity systems', '6.4', 'COMPLIANT'),
  ('REQ_8_MFA_ADMIN',         'MFA enforced for all admin access to payment-related functions', '8.4', 'COMPLIANT'),
  ('REQ_10_LOG_MONITORING',   'All access to cardholder scope logged to security_events (immutable)', '10.2', 'COMPLIANT'),
  ('REQ_12_ANNUAL_REVIEW',    'Annual PCI SAQ-A review and attestation', '12.3', 'PENDING')
ON CONFLICT (checkpoint_code) DO NOTHING;
```

---

## REQ-COM-001: CCPA Consumer Rights Fulfillment

```typescript
/**
 * submitCCPARequest(type, email, tenantId) — Consumer submits CCPA request.
 * 1. Create ccpa_requests record (status=RECEIVED, due_date = TODAY + 45)
 * 2. Send verification email via NOT engine: "Your request # — verify your identity"
 * 3. Assign to PAYSURITY_ADMIN and ENTERPRISE_ADMIN for tenant
 * 4. Write audit event: ccpa.request.received
 *
 * fulfillCCPADelete(requestId) — Execute RIGHT TO DELETE (see DEV_IMPL_STANDARD Rule 8).
 * fulfillCCPAKnow(requestId) — Export of all data the platform holds for this consumer.
 *   Generates CSV/JSON export: orders, loyalty transactions, notifications, payments (amounts only — no PAN).
 *   Delivered as signed GCS URL to requestor's verified email.
 */
```

**Batch:** `com.ccpa_due_date_monitor` | Cron: `0 8 * * *`  
Find `ccpa_requests` WHERE `status IN ('RECEIVED','IN_PROGRESS') AND due_date <= CURRENT_DATE + 5`.  
Alert `PAYSURITY_ADMIN` if approaching 45-day deadline.

---

## REQ-COM-002: ADA/WCAG 2.1 AA Compliance

All screens in MERCHANT, CONSUMER, and PUBLIC portals must meet:
- **Perceivable:** All images have `alt` text. Color is not the sole indicator. Min contrast ratio 4.5:1 for normal text; 3:1 for large text.
- **Operable:** All actions keyboard-accessible. Focus order logical. No keyboard traps. Skip navigation links.
- **Understandable:** Error messages identify the field and suggest correction. Form labels programmatically associated with inputs.
- **Robust:** Semantic HTML5. ARIA roles where native semantics insufficient. Screen reader tested (NVDA, VoiceOver, JAWS).

Critical accessibility requirements for POS:
- POS terminal UI: high-contrast mode (for bright environments). Font size override via `posr.ui.font_size_level` config.
- Consumer-facing kiosk: ADA-compliant reach height (config flags hardware mode vs. desk mode).
- All receipt PDFs: machine-readable (not image-scanned PDFs).

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/privacy/ccpa` | None (public) | Submit CCPA request |
| `GET` | `/v1/privacy/ccpa/{id}/status` | Request token | Check request status |
| `GET` | `/v1/compliance/pci/checkpoints` | PAYSURITY_ADMIN | PCI compliance status |
| `GET` | `/v1/compliance/retention-policies` | ENTERPRISE_FINANCE | Data retention policy list |
| `GET` | `/v1/compliance/accessibility-audits` | PAYSURITY_ADMIN | WCAG audit history |
