# Canonical Requirements: Payroll & HR
**Vertical:** Payroll (PAY) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)  
**Payment Rail:** FluidPay ACH (NACHA file format) via ORC service

---

## Database Schema

**Migration:** `db/migrations/030_payroll.sql`

```sql
-- Employees: one record per person per FEIN
-- AMBIGUITY #18 CLOSED: One employee CAN work across 2 FEINs (e.g., River North + O'Hare,
-- which are different legal entities). They get ONE digital wallet (linked by phone/email)
-- but TWO employee records (one per FEIN). Payroll deposits from BOTH flow into the same wallet.
-- A single consumer can have N employee records; wallet is the single consolidation point.
CREATE TABLE employees (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  legal_entity_id   UUID NOT NULL REFERENCES legal_entities(id), -- FEIN scope for tax reporting
  location_id       UUID NOT NULL REFERENCES locations(id),       -- primary work location
  user_id           UUID NOT NULL REFERENCES users(id),
  wallet_id         UUID REFERENCES digital_wallets(id),          -- linked wallet (may serve 2+ employee records)
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  ssn_last_four     VARCHAR(4) NOT NULL,                          -- last 4 only; full SSN in GCP Secret Manager
  ssn_secret_ref    VARCHAR(255) NOT NULL,                        -- GCP secret ref for full SSN (W-2, tax filing)
  date_of_birth     DATE NOT NULL,
  address           JSONB NOT NULL,                               -- {street, city, state, zip}
  phone_e164        VARCHAR(20) CHECK (phone_e164 ~ '^\+[1-9]\d{7,14}$'),
  email             VARCHAR(255),
  employment_type   VARCHAR(20) NOT NULL DEFAULT 'HOURLY'
                    CHECK (employment_type IN ('HOURLY','SALARIED','TIPPED_HOURLY','CONTRACTOR_1099')),
  pay_rate_cents    INTEGER NOT NULL,                             -- cents per hour (HOURLY) OR cents per pay period (SALARIED)
  overtime_rate_cents INTEGER,                                    -- NULL = use federal 1.5x rule via config
  pay_frequency     VARCHAR(20) NOT NULL DEFAULT 'BIWEEKLY'
                    CHECK (pay_frequency IN ('WEEKLY','BIWEEKLY','SEMIMONTHLY','MONTHLY')),
  federal_filing_status VARCHAR(20) NOT NULL DEFAULT 'SINGLE'
                    CHECK (federal_filing_status IN ('SINGLE','MARRIED_FILING_JOINTLY','MARRIED_FILING_SEPARATELY','HEAD_OF_HOUSEHOLD')),
  federal_allowances INTEGER NOT NULL DEFAULT 0,
  state_filing_status VARCHAR(20),
  state_allowances  INTEGER NOT NULL DEFAULT 0,
  bank_account_last4 VARCHAR(4),
  bank_routing_ref  VARCHAR(255),                                 -- GCP secret ref for routing number
  bank_account_ref  VARCHAR(255),                                 -- GCP secret ref for account number
  bank_account_type VARCHAR(10) NOT NULL DEFAULT 'CHECKING'
                    CHECK (bank_account_type IN ('CHECKING','SAVINGS')),
  tip_pool_eligible BOOLEAN NOT NULL DEFAULT TRUE,
  status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('INVITED','ACTIVE','SUSPENDED','TERMINATED')),
  hire_date         DATE NOT NULL,
  termination_date  DATE,
  termination_reason TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(legal_entity_id, user_id)                                -- one record per person per FEIN
);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON employees USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_employees_user ON employees(user_id);
CREATE INDEX idx_employees_legal_entity ON employees(legal_entity_id);

-- Pay periods: define the payroll calendar for each legal entity
CREATE TABLE pay_periods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  pay_date        DATE NOT NULL,                -- when ACH lands in employee accounts
  status          VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                  CHECK (status IN ('OPEN','LOCKED','PROCESSING','COMPLETED','CANCELLED')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(legal_entity_id, period_start)
);
ALTER TABLE pay_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON pay_periods USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Payroll runs: one per pay period per legal entity
CREATE TABLE payroll_runs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id),
  legal_entity_id       UUID NOT NULL REFERENCES legal_entities(id),
  pay_period_id         UUID NOT NULL REFERENCES pay_periods(id) UNIQUE,
  status                VARCHAR(30) NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','CALCULATED','PENDING_APPROVAL','APPROVED','REJECTED','PROCESSING','COMPLETED','CANCELLED')),
  total_gross_cents     INTEGER NOT NULL DEFAULT 0,
  total_tax_withheld_cents INTEGER NOT NULL DEFAULT 0,
  total_deductions_cents   INTEGER NOT NULL DEFAULT 0,
  total_net_cents       INTEGER NOT NULL DEFAULT 0,       -- what employees actually receive
  employee_count        INTEGER NOT NULL DEFAULT 0,
  calculated_at         TIMESTAMPTZ,
  approved_by           UUID REFERENCES users(id),
  approved_at           TIMESTAMPTZ,
  rejection_reason      TEXT,
  ach_batch_id          VARCHAR(255),           -- NACHA batch ID from FluidPay
  ach_file_submitted_at TIMESTAMPTZ,
  ach_settled_at        TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON payroll_runs USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Line items: one row per earning/deduction type per employee per payroll run
CREATE TABLE payroll_line_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  payroll_run_id    UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id       UUID NOT NULL REFERENCES employees(id),
  line_type         VARCHAR(40) NOT NULL
                    CHECK (line_type IN (
                      'REGULAR_HOURS','OVERTIME_HOURS','SALARY',
                      'TIP_DIRECT','TIP_POOL_DISTRIBUTION',
                      'BONUS','COMMISSION','REIMBURSEMENT',
                      'FEDERAL_INCOME_TAX','STATE_INCOME_TAX','LOCAL_INCOME_TAX',
                      'SOCIAL_SECURITY_TAX','MEDICARE_TAX',
                      'HEALTH_INSURANCE','RETIREMENT_401K','GARNISHMENT','OTHER_DEDUCTION'
                    )),
  hours             NUMERIC(8,2),              -- set for REGULAR_HOURS, OVERTIME_HOURS
  rate_cents        INTEGER,                   -- rate per hour at time of payroll
  amount_cents      INTEGER NOT NULL,          -- positive = earning; negative = deduction
  tax_jurisdiction  VARCHAR(50),               -- 'FED' | 'IL' | 'IL-COOK' — from TAX engine
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE payroll_line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON payroll_line_items USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_payroll_items_run ON payroll_line_items(payroll_run_id, employee_id);

-- Pay stubs: generated PDF reference + summary (PDF stored in GCS)
CREATE TABLE pay_stubs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  payroll_run_id  UUID NOT NULL REFERENCES payroll_runs(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  gross_cents     INTEGER NOT NULL,
  net_cents       INTEGER NOT NULL,
  tax_withheld_cents INTEGER NOT NULL,
  gcs_pdf_path    TEXT NOT NULL,               -- gs://paysurity-docs/{tenant}/{employee}/{pay_period}/stub.pdf
  gcs_signed_url  TEXT,                        -- pre-signed URL (expires 7 days); refreshed on GET
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(payroll_run_id, employee_id)
);
ALTER TABLE pay_stubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON pay_stubs USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Tax withholding records: for 1099-K / W-2 generation at year-end
CREATE TABLE tax_withholding_ytd (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
  employee_id     UUID NOT NULL REFERENCES employees(id),
  tax_year        SMALLINT NOT NULL,
  federal_income_withheld_cents INTEGER NOT NULL DEFAULT 0,
  state_income_withheld_cents   INTEGER NOT NULL DEFAULT 0,
  local_income_withheld_cents   INTEGER NOT NULL DEFAULT 0,
  social_security_withheld_cents INTEGER NOT NULL DEFAULT 0,
  medicare_withheld_cents        INTEGER NOT NULL DEFAULT 0,
  gross_wages_cents              INTEGER NOT NULL DEFAULT 0,
  tips_reported_cents            INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(legal_entity_id, employee_id, tax_year)
);
ALTER TABLE tax_withholding_ytd ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tax_withholding_ytd USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Seed:** `db/seeds/030_payroll_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable, min_value, max_value)
VALUES
  ('payroll.federal.overtime_multiplier',     '1.5',   'decimal',  'Federal overtime rate multiplier (FLSA)',         FALSE, '1.5', '1.5'),
  ('payroll.federal.overtime_threshold_hours','40',    'integer',  'Weekly hours threshold before OT kicks in',       FALSE, '40',  '40'),
  ('payroll.federal.min_wage_cents',          '725',   'integer',  'Federal min wage in cents ($7.25)',                FALSE, NULL,  NULL),
  ('payroll.il.min_wage_cents',               '1400',  'integer',  'Illinois min wage in cents ($14.00, Jan 2026)',    FALSE, NULL,  NULL),
  ('payroll.il.chicago_min_wage_cents',       '1600',  'integer',  'Chicago min wage in cents ($16.00, Jan 2026)',     FALSE, NULL,  NULL),
  ('payroll.tipped.tip_credit_cents',         '0',     'integer',  'IL has no tip credit (0). Fed tip credit = 512 but IL prohibits.', FALSE, NULL, NULL),
  ('payroll.ach.nacha_company_id',            '',      'string',   'NACHA Company ID from FluidPay (set per tenant via merchant_config)', FALSE, NULL, NULL),
  ('payroll.ach.sec_code',                    'PPD',   'string',   'NACHA SEC code: PPD (consumer accounts)',         FALSE, NULL,  NULL),
  ('payroll.paystub.gcs_bucket',              'paysurity-pay-stubs', 'string', 'GCS bucket for pay stub PDFs', FALSE, NULL, NULL),
  ('payroll.approval.mfa_required',           'true',  'boolean',  'MFA required for payroll approval (always)',      FALSE, NULL,  NULL),
  ('payroll.tax_table.update_cron',           '0 6 1 1 *', 'string','Annual federal/state tax table update cron',    FALSE, NULL,  NULL)
ON CONFLICT (key) DO NOTHING;

-- BistroBeest: two demo employees (cross-FEIN scenario for ambiguity #18)
DO $$ BEGIN
  IF current_setting('app.environment', TRUE) IN ('development','staging') THEN
    INSERT INTO employees (
      id, tenant_id, legal_entity_id, location_id, user_id,
      first_name, last_name, ssn_last_four, ssn_secret_ref,
      date_of_birth, address, phone_e164, email,
      employment_type, pay_rate_cents, pay_frequency,
      federal_filing_status, federal_allowances, tip_pool_eligible,
      status, hire_date
    ) VALUES
    -- Employee 1: works River North (FEIN: BistroBeest Restaurant Group)
    ('emp00001-0000-0000-0000-000000000001',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     '11111111-1111-1111-1111-111111111111',
     'loc00001-0000-0000-0000-000000000001',
     'usr00003-0000-0000-0000-000000000003',
     'Demo', 'LocationMgr', '9876',
     'projects/paysurity-dev/secrets/demo-emp1-ssn/versions/latest',
     '1988-06-15',
     '{"street":"456 N. Wells St","city":"Chicago","state":"IL","zip":"60654"}',
     '+13125550201', 'locationmgr@bistrobeest.com',
     'SALARIED', 480000, 'BIWEEKLY',   -- $48,000/year = $1,846.15/biweekly
     'SINGLE', 1, FALSE,
     'ACTIVE', '2022-03-01'),
    -- Employee 2: SERVER, also works O'Hare Express under SAME legal entity (same FEIN in this demo)
    -- In production: different FEIN = different legal_entity_id, SAME wallet_id
    ('emp00002-0000-0000-0000-000000000002',
     'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
     '11111111-1111-1111-1111-111111111111',
     'loc00001-0000-0000-0000-000000000001',
     'usr00001-0000-0000-0000-000000000001',
     'Demo', 'Server', '5432',
     'projects/paysurity-dev/secrets/demo-emp2-ssn/versions/latest',
     '1995-03-22',
     '{"street":"789 W. Armitage Ave","city":"Chicago","state":"IL","zip":"60614"}',
     '+13125550202', 'server@bistrobeest.com',
     'TIPPED_HOURLY', 900, 'BIWEEKLY',  -- $9.00/hr + tips (above IL $14 — tipped minimum)
     'SINGLE', 0, TRUE,
     'ACTIVE', '2023-06-15')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
```

---

## REQ-PAY-001: Payroll Calculation Engine

**Priority:** Must | **Actors:** Payroll Admin, Employees, Batch Job

---

#### Service Layer: `src/modules/payroll/payroll.service.ts`

```typescript
/**
 * calculatePayroll(payPeriodId) — Builds the payroll run for a pay period.
 * For each ACTIVE employee in the legal entity:
 *
 * 1. HOURLY/TIPPED_HOURLY employees:
 *    a. Sum shift_employees hours: clock_in to clock_out for all shifts in pay period
 *    b. Regular hours: MIN(total_hours, 40 per week × weeks in period)
 *       (weekly OT rule read from platform_config 'payroll.federal.overtime_threshold_hours')
 *    c. OT hours: total_hours - regular_hours (× multiplier from config 'payroll.federal.overtime_multiplier')
 *    d. Tips: sum loyalty_transactions WHERE type='EARN' AND actor=employee is NOT applicable;
 *       sum orders.tip_cents WHERE server_user_id = employee.user_id AND shift in period
 *       AND tip_pool_enabled=FALSE (direct tips)
 *       OR: tip pool distribution amount from payroll_line_items pre-calculated by tip pool batch
 *    e. Write payroll_line_items: REGULAR_HOURS, OVERTIME_HOURS, TIP_DIRECT
 *
 * 2. SALARIED employees:
 *    a. Gross = pay_rate_cents (per period; already annualized by HR)
 *    b. Write payroll_line_items: SALARY
 *
 * 3. Tax withholding (for all):
 *    a. Call TAX service: getTaxWithholding(grossCents, filingStatus, allowances, jurisdiction)
 *    b. Jurisdiction: read from employee.address.state + city (city-level for Chicago, NYC, etc.)
 *    c. Returns: {federal_cents, state_cents, local_cents, social_security_cents, medicare_cents}
 *    d. Write payroll_line_items for each tax type (negative amounts = deductions)
 *
 * 4. Other deductions: read from employee_deduction_configs table (health, 401k, garnishments)
 *
 * 5. Update payroll_runs: total_gross, total_tax, total_net, employee_count, status=CALCULATED
 */
async calculatePayroll(payPeriodId: string): Promise<PayrollRun>

/**
 * approvePayroll(payrollRunId, approverId) — REQUIRES MFA (enforced by NestJS guard).
 * Validates status=CALCULATED or PENDING_APPROVAL.
 * Sets status=APPROVED. Enqueues ACH dispatch job.
 * Fires 'payroll.approved' webhook. Notifies employees via NOT engine: "Your pay is on the way."
 */
async approvePayroll(payrollRunId: string, approverId: string): Promise<void>

/**
 * dispatchACH(payrollRunId) — BullMQ job handler. Runs within ACH submission window.
 * 1. For each employee: builds NACHA PPD entry {routing, account, amount, name, trace_number}
 * 2. Assembles full NACHA file with batch header/trailer using config values
 * 3. Submits NACHA file to FluidPay ACH endpoint (POST /api/v1/ach/batch)
 * 4. Stores ach_batch_id on payroll_run
 * 5. If employee has PaySurity wallet AND bank_account_ref is NULL:
 *    → Direct wallet credit (instant; no ACH delay)
 *    → Creates wallet_transactions record instead of NACHA entry
 * 6. Sets payroll_run.status = PROCESSING
 * 7. Generates pay_stub PDFs: renders HTML template → GCS PDF upload → pay_stubs record
 * 8. Fires webhook: 'payroll.dispatched'
 */
async dispatchACH(payrollRunId: string): Promise<void>
```

---

#### API Endpoints

| Method | Path | Auth | Description | Webhook |
|---|---|---|---|---|
| `GET` | `/v1/employees` | PAYROLL_ADMIN, LOCATION_MGR | List employees (scoped) | — |
| `POST` | `/v1/employees` | PAYROLL_ADMIN | Add employee | `employee.created` |
| `PATCH` | `/v1/employees/{id}` | PAYROLL_ADMIN | Update employee (rate, status, etc.) | `employee.updated` |
| `POST` | `/v1/employees/{id}/terminate` | PAYROLL_ADMIN | Terminate employee | `employee.terminated` |
| `GET` | `/v1/payroll/periods` | PAYROLL_ADMIN | List pay periods | — |
| `GET` | `/v1/payroll/runs/{id}` | PAYROLL_ADMIN, ENTERPRISE_FINANCE | Payroll run detail | — |
| `POST` | `/v1/payroll/runs/{id}/calculate` | PAYROLL_ADMIN | Trigger calculation | — |
| `POST` | `/v1/payroll/runs/{id}/approve` | PAYROLL_ADMIN (MFA required) | Approve and queue dispatch | `payroll.approved` |
| `POST` | `/v1/payroll/runs/{id}/reject` | PAYROLL_ADMIN | Reject with reason | — |
| `GET` | `/v1/payroll/pay-stubs/{employeeId}` | Employee (own), PAYROLL_ADMIN | List pay stubs | — |
| `GET` | `/v1/payroll/pay-stubs/{id}/download` | Employee (own), PAYROLL_ADMIN | Signed GCS URL for PDF | — |
| `GET` | `/v1/clock/status` | Employee | Own current clock status | — |
| `POST` | `/v1/clock/in` | Employee (Biometric/PIN) | Clock in via Fingerprint/Facial Hash | `employee.clocked_in` |
| `POST` | `/v1/clock/out` | Employee (Biometric/PIN) | Clock out | `employee.clocked_out` |
| `GET` | `/v1/analytics/profitability` | TENANT_ADMIN | Real-time Profitability Matrix (Revenue - COGS - Live Labor Costs) | — |

---

#### UI/UX

**Payroll Dashboard (PAYROLL_ADMIN):**
> "Current Pay Period: Mar 1–14, 2026 | Pay Date: Mar 21"  
> Status pill: DRAFT → [Calculate] button | CALCULATED → [Review & Approve] button  
> Summary cards: 12 Employees | $18,432 Gross | $3,201 Taxes | $15,231 Net  
> Employee line-by-line table: Name | Hours | Tips | Gross | Taxes | Net | Stub  
> Expand row → full line item breakdown (regular, OT, tip, each tax)  
> [Approve Payroll] → MFA modal → slider "I confirm this payroll is correct" → TOTP code field → Submit

**Employee Self-Service (Mobile App):**
> "Your next paycheck: $847.32 — Arriving Mar 21"  
> "Clock In" large button (current status: CLOCKED OUT)  
> Recent pay stubs list → tap → PDF viewer in-app

**Multi-FEIN employee (ambiguity #18 resolved in UI):**  
> Employee working at 2 FEINs sees TWO payroll entries in their pay history: "BistroBeest Downtown — $480 | BistroBeest Express — $210" — both show in one timeline, both deposit to same wallet.

---

#### Acceptance Tests

| Test ID | Scenario | Input | Expected |
|---|---|---|---|
| PAY-001-T1 | Hourly employee with OT | 45h in week (40 regular, 5 OT) | Regular: 40×$9=$360; OT: 5×$13.50=$67.50; line items written |
| PAY-001-T2 | Salaried employee | $48,000/yr biweekly | $1,846.15 gross per period; SALARY line item |
| PAY-001-T3 | Tipped employee — direct tips | $200 in tips from orders.tip_cents | TIP_DIRECT line item $200; included in gross for tax calc |
| PAY-001-T4 | Illinois min wage check | Employee rate $9/hr → gross = $360 (40h) | $360 > IL min ($14×40=$560) — VALIDATION ERROR: rate below IL minimum |
| PAY-001-T5 | MFA gate on approval | Approve without valid TOTP | HTTP 403 MFA_REQUIRED |
| PAY-001-T6 | Wallet direct credit | Employee has PaySurity wallet, no external bank | ACH not generated; wallet_transactions credit instead; instant |
| PAY-001-T7 | Multi-FEIN employee | Employee emp00001 works 2 location records same FEIN | Two payroll_line_items streams; both deposit to same wallet_id |
| PAY-001-T8 | YTD tax update | Payroll completed | tax_withholding_ytd incremented atomically in same transaction |

---
