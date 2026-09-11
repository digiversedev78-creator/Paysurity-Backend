# Canonical Requirements: Affiliates, Resellers & Referrals
**Vertical:** Affiliates & Resellers (AFR) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding

---

## Database Schema

**Migration:** `db/migrations/055_affiliates.sql`

```sql
CREATE TABLE affiliates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) UNIQUE,
  affiliate_type    VARCHAR(20) NOT NULL DEFAULT 'REFERRAL'
                    CHECK (affiliate_type IN ('REFERRAL','RESELLER','ISO','VAR')),
  referral_code     VARCHAR(20) NOT NULL UNIQUE,     -- e.g. 'JOHN2024' — generated, not user-chosen
  status            VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','ACTIVE','SUSPENDED','TERMINATED')),
  commission_tier   VARCHAR(20) NOT NULL DEFAULT 'STANDARD'
                    CHECK (commission_tier IN ('STANDARD','SILVER','GOLD','PLATINUM')),
  wallet_id         UUID REFERENCES digital_wallets(id),  -- commissions paid here
  payout_schedule   VARCHAR(20) NOT NULL DEFAULT 'MONTHLY'
                    CHECK (payout_schedule IN ('WEEKLY','BIWEEKLY','MONTHLY')),
  lifetime_earnings_cents INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE affiliate_commissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id      UUID NOT NULL REFERENCES affiliates(id),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),       -- the referred merchant
  commission_type   VARCHAR(30) NOT NULL
                    CHECK (commission_type IN (
                      'SIGNUP_BONUS',        -- one-time on merchant activation
                      'MONTHLY_RESIDUAL',    -- % of merchant's monthly subscription fee
                      'VOLUME_RESIDUAL',     -- % of merchant's processing volume (ISO/VAR only)
                      'MILESTONE_BONUS'      -- bonus on merchant reaching volume milestone
                    )),
  status            VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','APPROVED','PAID','REVERSED')),
  gross_cents       INTEGER NOT NULL,
  commission_rate_bps INTEGER NOT NULL,
  commission_cents  INTEGER NOT NULL,
  period_start      DATE,
  period_end        DATE,
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY affiliate_scope ON affiliate_commissions USING (
  affiliate_id IN (SELECT id FROM affiliates WHERE user_id = current_setting('app.current_user_id')::UUID)
);
```

**Seed:** `db/seeds/055_afr_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  ('afr.signup_bonus.standard_cents',  '10000', 'integer', 'REFERRAL tier sign-up bonus per merchant activation ($100)', FALSE),
  ('afr.residual.standard_bps',        '500',   'integer', 'STANDARD tier monthly residual: 5% of merchant subscription fee', FALSE),
  ('afr.residual.silver_bps',          '750',   'integer', 'SILVER tier: 7.5%', FALSE),
  ('afr.residual.gold_bps',            '1000',  'integer', 'GOLD tier: 10%', FALSE),
  ('afr.residual.platinum_bps',        '1500',  'integer', 'PLATINUM tier: 15% — plus volume residual for ISO', FALSE),
  ('afr.volume_residual.iso_bps',      '25',    'integer', 'ISO/VAR volume residual: 0.25% of processing volume', FALSE),
  ('afr.milestone.5_merchants_cents',  '50000', 'integer', 'Bonus for 5 active referred merchants ($500)', FALSE),
  ('afr.milestone.25_merchants_cents', '300000','integer', 'Bonus for 25 active referred merchants ($3,000)', FALSE),
  ('afr.payout.min_cents',             '5000',  'integer', 'Minimum payout threshold ($50)', FALSE),
  ('afr.code.length',                  '8',     'integer', 'Referral code length (uppercase alphanumeric)', FALSE)
ON CONFLICT (key) DO NOTHING;
```

---

## Service Layer

```typescript
/**
 * generateReferralCode(affiliateId) — Creates unique code.
 * Format: 8-char uppercase alphanumeric (nanoid custom alphabet)
 * Retry until unique (conflict on INSERT → regenerate)
 */
async generateReferralCode(affiliateId: string): Promise<string>

/**
 * calculateMonthlyCommissions(periodStart, periodEnd) — Monthly batch.
 * For each affiliate.status=ACTIVE:
 *   1. Find all tenants referred by this affiliate (merchant_applications.affiliate_id)
 *   2. For each active referred tenant: sum subscription_invoices.total_cents WHERE paid_at IN period
 *   3. Commission = sum × (rate_bps / 10000) — rate read from config by commission_tier
 *   4. Write affiliate_commissions record (status=PENDING)
 *   5. Aggregate for payout if affiliate.payout_schedule due
 */
async calculateMonthlyCommissions(periodStart: Date, periodEnd: Date): Promise<void>

/**
 * payoutCommissions(affiliateId) — Pays approved commissions to wallet.
 * 1. Sum affiliate_commissions WHERE affiliate_id=X AND status=APPROVED
 * 2. If sum < payout.min_cents config → defer (not enough yet)
 * 3. wallet.credit() with total, type=ADJUSTMENT_CREDIT, reference=commission batch
 * 4. Update affiliate_commissions.status=PAID; update affiliates.lifetime_earnings_cents
 */
async payoutCommissions(affiliateId: string): Promise<void>
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/affiliates/register` | None (public) | Register as affiliate |
| `GET` | `/v1/affiliates/me` | Affiliate (own) | Own stats + referral code |
| `GET` | `/v1/affiliates/me/commissions` | Affiliate (own) | Commission history |
| `GET` | `/v1/affiliates/me/referred-merchants` | Affiliate (own) | List referred merchants + status |
| `GET` | `/v1/admin/affiliates` | PAYSURITY_ADMIN | All affiliates |
| `PATCH` | `/v1/admin/affiliates/{id}/tier` | PAYSURITY_ADMIN | Change commission tier |
| `POST` | `/v1/admin/affiliates/{id}/payout` | PAYSURITY_ADMIN | Trigger manual payout |

**Batch:** `afr.monthly_commissions` | Cron: `0 6 1 * *` | Idempotent: YES  
**Batch:** `afr.commission_payout` | Cron: `0 8 1 * *` | Idempotent: YES
