# Canonical Requirements: Subscription & Billing Management
**Vertical:** Subscription & Billing (SUB) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Note:** This is PaySurity's billing of merchants — not merchant billing of their consumers.

---

## Database Schema

**Migration:** `db/migrations/045_subscription_billing.sql`

```sql
-- Available subscription tiers (platform-defined; merchants cannot write this table)
CREATE TABLE subscription_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code       VARCHAR(30) NOT NULL UNIQUE,  -- 'STARTER' | 'GROWTH' | 'PROFESSIONAL' | 'ENTERPRISE'
  display_name    VARCHAR(100) NOT NULL,
  monthly_fee_cents INTEGER NOT NULL,
  annual_fee_cents  INTEGER NOT NULL,            -- monthly × 10 (2-month discount)
  max_locations   INTEGER NOT NULL DEFAULT 1,
  max_users       INTEGER NOT NULL DEFAULT 5,
  max_api_keys    INTEGER NOT NULL DEFAULT 3,
  includes_payroll BOOLEAN NOT NULL DEFAULT FALSE,
  includes_franchise BOOLEAN NOT NULL DEFAULT FALSE,
  includes_ai_assistant BOOLEAN NOT NULL DEFAULT FALSE,
  includes_aggregation BOOLEAN NOT NULL DEFAULT FALSE,
  transaction_fee_bps INTEGER NOT NULL DEFAULT 250, -- flat rate in basis points (2.50%)
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One active subscription per tenant
CREATE TABLE merchant_subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) UNIQUE,
  plan_id             UUID NOT NULL REFERENCES subscription_plans(id),
  billing_cycle       VARCHAR(10) NOT NULL DEFAULT 'MONTHLY' CHECK (billing_cycle IN ('MONTHLY','ANNUAL')),
  status              VARCHAR(20) NOT NULL DEFAULT 'TRIALING'
                      CHECK (status IN ('TRIALING','ACTIVE','PAST_DUE','GRACE','RESTRICTED','TERMINATED')),
  trial_ends_at       TIMESTAMPTZ,
  current_period_start DATE NOT NULL,
  current_period_end   DATE NOT NULL,
  next_billing_date    DATE NOT NULL,
  -- AMBIGUITY #10 CLOSED: upgrade/downgrade timing
  -- UPGRADE: new plan takes effect immediately; prorated charge for remainder of period
  -- DOWNGRADE: new plan takes effect at current_period_end (not mid-period)
  -- This is stored as: pending_plan_id + pending_effective_date
  pending_plan_id     UUID REFERENCES subscription_plans(id),  -- set on DOWNGRADE; applied at period_end
  pending_effective_date DATE,                                  -- when pending_plan_id activates
  payment_method_type VARCHAR(20) NOT NULL DEFAULT 'ACH'
                      CHECK (payment_method_type IN ('ACH','CARD','SETTLEMENT_DEDUCTION')),
  payment_method_ref  VARCHAR(255),                    -- GCP secret ref or token
  overdue_since       DATE,
  grace_period_ends_at DATE,
  cancel_requested_at TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE merchant_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON merchant_subscriptions
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Invoices: one per billing period per tenant
CREATE TABLE subscription_invoices (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  subscription_id     UUID NOT NULL REFERENCES merchant_subscriptions(id),
  invoice_number      VARCHAR(20) NOT NULL UNIQUE,  -- format: INV-{tenant_short_code}-{YYYYMM}-{seq}
  period_start        DATE NOT NULL,
  period_end          DATE NOT NULL,
  due_date            DATE NOT NULL,
  plan_fee_cents      INTEGER NOT NULL,
  proration_credit_cents INTEGER NOT NULL DEFAULT 0,  -- credit for mid-period downgrades
  proration_charge_cents INTEGER NOT NULL DEFAULT 0,  -- extra charge for mid-period upgrades
  total_cents         INTEGER NOT NULL,
  status              VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                      CHECK (status IN ('DRAFT','ISSUED','PAID','OVERDUE','VOIDED','DISPUTED')),
  paid_at             TIMESTAMPTZ,
  payment_attempt_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at     TIMESTAMPTZ,
  last_failure_reason TEXT,
  pdf_gcs_path        TEXT,        -- gs://paysurity-invoices/{tenant_id}/{invoice_number}.pdf
  pdf_signed_url      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON subscription_invoices
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Seed:** `db/seeds/045_sub_seed.sql`

```sql
-- Subscription plans seeded at platform level
INSERT INTO subscription_plans (plan_code, display_name, monthly_fee_cents, annual_fee_cents,
  max_locations, max_users, max_api_keys,
  includes_payroll, includes_franchise, includes_ai_assistant, includes_aggregation,
  transaction_fee_bps, is_active, sort_order)
VALUES
  ('STARTER',      'Starter',      4900,  49000,  1,  5,  1, FALSE, FALSE, FALSE, FALSE, 275, TRUE, 1),
  ('GROWTH',       'Growth',       9900,  99000,  3, 15,  5, TRUE,  FALSE, TRUE,  TRUE,  250, TRUE, 2),
  ('PROFESSIONAL', 'Professional', 19900, 199000, 10, 50, 20, TRUE,  FALSE, TRUE,  TRUE,  225, TRUE, 3),
  ('ENTERPRISE',   'Enterprise',   49900, 499000, 999,999, 99,TRUE,  TRUE,  TRUE,  TRUE,  200, TRUE, 4)
ON CONFLICT (plan_code) DO UPDATE
  SET monthly_fee_cents=EXCLUDED.monthly_fee_cents, annual_fee_cents=EXCLUDED.annual_fee_cents,
      is_active=EXCLUDED.is_active;

INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  ('sub.trial_days',              '14',    'integer', 'Free trial length in days', FALSE),
  ('sub.grace_period_days',       '5',     'integer', 'Grace period days after first missed payment', FALSE),
  ('sub.restricted_period_days',  '7',     'integer', 'Restricted period after grace before TERMINATED', FALSE),
  ('sub.payment_retry_days',      '3',     'integer', 'Retry failed payment every N days during PAST_DUE', FALSE),
  ('sub.upgrade_proration',       'IMMEDIATE_DAILY', 'string', 'Upgrade proration method: IMMEDIATE_DAILY charges daily_rate × remaining_days', FALSE),
  ('sub.downgrade_timing',        'PERIOD_END', 'string', 'Downgrade takes effect at current period end — never mid-period', FALSE),
  ('sub.invoice_lead_days',       '7',     'integer', 'Days before period end to issue next invoice', FALSE),
  ('sub.invoice_gcs_bucket',      'paysurity-invoices', 'string', 'GCS bucket for invoice PDFs', FALSE),
  ('sub.dunning.email_day_1',     '1',     'integer', 'Send overdue notice on day 1', FALSE),
  ('sub.dunning.email_day_3',     '3',     'integer', 'Send urgent notice on day 3', FALSE),
  ('sub.dunning.email_day_5',     '5',     'integer', 'Send final warning on day 5 (grace end)', FALSE)
ON CONFLICT (key) DO NOTHING;

-- BistroBeest on GROWTH plan (dev/staging seed)
DO $$ BEGIN
  IF current_setting('app.environment', TRUE) IN ('development','staging') THEN
    INSERT INTO merchant_subscriptions (
      tenant_id, plan_id, billing_cycle, status,
      current_period_start, current_period_end, next_billing_date
    )
    SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
           id, 'MONTHLY', 'ACTIVE',
           '2026-03-01', '2026-03-31', '2026-04-01'
    FROM subscription_plans WHERE plan_code = 'GROWTH'
    ON CONFLICT (tenant_id) DO NOTHING;
  END IF;
END $$;
```

---

## REQ-SUB-001: Billing Lifecycle & Dunning

**Priority:** Must | **Actors:** Billing Batch Job, Merchant Admin, ENTERPRISE_FINANCE

---

```typescript
/**
 * generateInvoice(subscriptionId, period) — Creates invoice for the upcoming period.
 * Called N days before period_end (from config 'sub.invoice_lead_days').
 * Calculates: plan_fee + proration_charge (if upgrade occurred mid-period) - proration_credit
 * Generates invoice PDF via Puppeteer → GCS upload → sets pdf_gcs_path
 * Sends invoice to merchant via NOT engine (TRANSACTIONAL class)
 */
async generateInvoice(subscriptionId: string, period: { start: Date; end: Date }): Promise<SubscriptionInvoice>

/**
 * processPayment(invoiceId) — Attempts subscription payment collection.
 * Method: read from merchant_subscriptions.payment_method_type
 *   SETTLEMENT_DEDUCTION: deducts from next settlement batch (preferred — no failed payment risk)
 *   ACH: initiates ACH pull via ORC
 *   CARD: charges card on file via ORC
 * On success: invoice.status=PAID; subscription.status=ACTIVE
 * On failure: invoice.payment_attempt_count++; schedule retry per config
 */
async processPayment(invoiceId: string): Promise<void>

/**
 * handleUpgrade(subscriptionId, newPlanCode, requestedBy) — Plan upgrade.
 * AMBIGUITY #10 CLOSED: Upgrade behavior:
 * 1. Effective IMMEDIATELY (not at period end)
 * 2. Calculate proration: (daily_rate_new - daily_rate_old) × remaining_days_in_period
 * 3. Create an immediate invoice for the proration amount (status=ISSUED)
 * 4. Collect proration invoice immediately via same payment method
 * 5. Update merchant_subscriptions.plan_id to new plan
 * 6. Unlock new features immediately (feature flags update based on plan)
 * 7. Write audit event; fire 'subscription.upgraded' webhook
 */
async handleUpgrade(subscriptionId: string, newPlanCode: string, requestedBy: string): Promise<void>

/**
 * handleDowngrade(subscriptionId, newPlanCode, requestedBy) — Plan downgrade.
 * AMBIGUITY #10 CLOSED: Downgrade behavior:
 * 1. NOT effective immediately — effective at current_period_end
 * 2. Set pending_plan_id = new plan, pending_effective_date = current_period_end
 * 3. Features from current plan remain UNTIL period_end
 * 4. At period_end: batch applies pending_plan_id, unlocks/locks features accordingly
 * 5. If new plan excludes features (e.g., loses payroll): warn merchant of data impact
 * 6. Write audit event; fire 'subscription.downgrade_scheduled' webhook
 * IMPORTANT: Features during in-progress payrolls: payroll runs ALREADY APPROVED before
 * downgrade takes effect continue to completion regardless of new plan.
 */
async handleDowngrade(subscriptionId: string, newPlanCode: string, requestedBy: string): Promise<void>
```

---

#### API Endpoints

| Method | Path | Auth | Description | Webhook |
|---|---|---|---|---|
| `GET` | `/v1/subscriptions/plans` | Public | Available plans + pricing | — |
| `GET` | `/v1/subscriptions/current` | ENTERPRISE_ADMIN | Current subscription detail | — |
| `POST` | `/v1/subscriptions/upgrade` | ENTERPRISE_ADMIN (MFA) | Upgrade to higher plan | `subscription.upgraded` |
| `POST` | `/v1/subscriptions/downgrade` | ENTERPRISE_ADMIN (MFA) | Schedule downgrade | `subscription.downgrade_scheduled` |
| `GET` | `/v1/subscriptions/invoices` | ENTERPRISE_ADMIN, ENTERPRISE_FINANCE | Invoice history | — |
| `GET` | `/v1/subscriptions/invoices/{id}/download` | Finance roles | Signed GCS URL for PDF | — |
| `POST` | `/v1/subscriptions/invoices/{id}/dispute` | ENTERPRISE_ADMIN | Flag invoice for review | — |

---

#### Batch Jobs

**Job:** `sub.billing_cycle` | **Cron:** `0 8 * * *` | **Idempotent:** Yes  
Daily: find subscriptions where next_billing_date = TODAY → generateInvoice() → processPayment()

**Job:** `sub.apply_pending_downgrades` | **Cron:** `0 0 * * *` | **Idempotent:** Yes  
Daily at midnight: find subscriptions where pending_plan_id IS NOT NULL AND pending_effective_date ≤ TODAY → apply downgrade → clear pending fields → fire webhook

**Job:** `sub.dunning` | **Cron:** `0 9 * * *` | **Idempotent:** Yes  
Daily: find PAST_DUE subscriptions → retry payment if retry_day interval met → send dunning emails per config schedule → escalate to RESTRICTED if grace_period_ends_at ≤ TODAY
