# Canonical Requirements: Loyalty Engine
**Vertical:** Loyalty Engine (LOY) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)  
**Total Requirements:** 7

---

## Database Schema — Run Once at Migration Time

**Migration:** `db/migrations/020_loyalty_engine.sql`

```sql
-- ─────────────────────────────────────────
-- LOYALTY ENGINE TABLES
-- ─────────────────────────────────────────

-- Loyalty programs: one program per tenant per brand (can be cross-brand unified — REQ-FRN-007)
CREATE TABLE loyalty_programs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  brand_id          UUID REFERENCES brands(id) ON DELETE CASCADE, -- NULL = tenant-wide (unified model)
  name              VARCHAR(100) NOT NULL,                         -- Display name, e.g. "BistroBeest Rewards"
  slug              VARCHAR(100) NOT NULL,
  model             VARCHAR(30) NOT NULL DEFAULT 'BRAND_ISOLATED'  -- BRAND_ISOLATED | UNIFIED | CROSS_REDEEM | TIERED_CROSS
                    CHECK (model IN ('BRAND_ISOLATED','UNIFIED','CROSS_REDEEM','TIERED_CROSS')),
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, brand_id)
);
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON loyalty_programs USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Loyalty tiers: merchant-configured tier ladder (seeded in SEED_BISTROBEEST)
CREATE TABLE loyalty_tiers (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                UUID NOT NULL REFERENCES tenants(id),
  brand_id                 UUID REFERENCES brands(id), -- NULL = applies to unified program
  program_id               UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
  name                     VARCHAR(50) NOT NULL,        -- e.g. "Brasserie", "Bistro", "Reserve"
  display_order            INTEGER NOT NULL,            -- 1 = lowest, ascending
  qualification_metric     VARCHAR(30) NOT NULL DEFAULT 'POINTS_EARNED_ROLLING_12M'
                           CHECK (qualification_metric IN ('POINTS_EARNED_ROLLING_12M','SPEND_ROLLING_12M','VISITS_ROLLING_12M')),
  qualification_threshold  NUMERIC(12,2) NOT NULL DEFAULT 0, -- 0 = entry tier (no threshold)
  earning_multiplier       NUMERIC(5,2) NOT NULL DEFAULT 1.00, -- e.g. 1.25 = 25% bonus rate
  benefits                 JSONB NOT NULL DEFAULT '{}', -- {birthday_bonus_points, monthly_exclusive, priority_queue, ...}
  is_active                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON loyalty_tiers USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Loyalty accounts: one per consumer per program
CREATE TABLE loyalty_accounts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  program_id        UUID NOT NULL REFERENCES loyalty_programs(id),
  consumer_id       UUID REFERENCES consumers(id), -- NULL until identity resolved
  alias_id_hash     VARCHAR(255) NOT NULL,    -- REQ-ADV-LOY-06: Sovereign Alias Resolution (1-way deterministic hashing of Phone/Email)
  merchant_salt_ref VARCHAR(255) NOT NULL,    -- REQ-ADV-LOY-08: Merchant-Unique Vault Salting
  wallet_id         UUID REFERENCES digital_wallets(id), -- linked after wallet creation
  points_balance    INTEGER NOT NULL DEFAULT 0 CHECK (points_balance >= 0), -- never negative
  lifetime_points   INTEGER NOT NULL DEFAULT 0,
  last_activity_at  TIMESTAMPTZ,             -- updated on every earn/redeem event
  expiry_date       TIMESTAMPTZ,             -- computed: last_activity_at + expiry_inactivity_days
  tier_id           UUID REFERENCES loyalty_tiers(id),
  tier_qualified_at TIMESTAMPTZ,
  tier_anniversary  TIMESTAMPTZ,             -- 12 months after tier_qualified_at
  enrollment_channel VARCHAR(30) NOT NULL    -- POS_CASHIER | POS_QR | WEB_GUEST | WEB_AUTH | WALLET
                     CHECK (enrollment_channel IN ('POS_CASHIER','POS_QR','WEB_GUEST','WEB_AUTH','WALLET')),
  enrollment_location_id UUID REFERENCES locations(id),
  status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','FRAUD_HOLD','DELETED','EXPIRED')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(program_id, alias_id_hash)
);
ALTER TABLE loyalty_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON loyalty_accounts USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_loyalty_accounts_phone ON loyalty_accounts(phone_e164, program_id);
CREATE INDEX idx_loyalty_accounts_wallet ON loyalty_accounts(wallet_id);
CREATE INDEX idx_loyalty_accounts_consumer ON loyalty_accounts(consumer_id);
CREATE INDEX idx_loyalty_accounts_expiry ON loyalty_accounts(expiry_date) WHERE status = 'ACTIVE';

-- Loyalty transactions: earn, redeem, reverse, expire events
CREATE TABLE loyalty_transactions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  account_id        UUID NOT NULL REFERENCES loyalty_accounts(id),
  order_id          UUID REFERENCES orders(id),
  transaction_type  VARCHAR(20) NOT NULL
                    CHECK (transaction_type IN ('EARN','REDEEM','REVERSE','EXPIRE','ADJUST','BONUS','TRANSFER')),
  points_delta      INTEGER NOT NULL,         -- positive for earn/bonus, negative for redeem/expire
  points_balance_after INTEGER NOT NULL,
  earn_rule_applied JSONB,                    -- snapshot of earning rule at time of event
  channel           VARCHAR(30),             -- IN_HOUSE | AI_ASSISTANT | WEB_ORDER | DOORDASH | etc.
  multiplier_applied NUMERIC(5,2),
  dollar_amount_cents INTEGER,               -- order subtotal in cents this earn was calculated on
  redeemed_dollar_value_cents INTEGER,       -- discount applied in cents (for REDEEM events)
  idempotency_key   VARCHAR(255) UNIQUE,     -- prevents double-crediting
  reversed_txn_id   UUID REFERENCES loyalty_transactions(id), -- set for REVERSE events
  actor_type        VARCHAR(20) NOT NULL DEFAULT 'SYSTEM'
                    CHECK (actor_type IN ('SYSTEM','USER','BATCH','AI_AGENT','API_KEY')),
  actor_id          UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No updated_at — this table is append-only
);
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON loyalty_transactions USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_loyalty_txns_account ON loyalty_transactions(account_id, created_at DESC);
CREATE INDEX idx_loyalty_txns_order ON loyalty_transactions(order_id);
CREATE INDEX idx_loyalty_txns_type ON loyalty_transactions(transaction_type, created_at DESC);
CREATE INDEX idx_loyalty_txns_idempotency ON loyalty_transactions(idempotency_key);
-- Immutability
CREATE TRIGGER enforce_loyalty_txn_immutability
  BEFORE UPDATE OR DELETE ON loyalty_transactions
  FOR EACH ROW EXECUTE FUNCTION raise_immutability_exception();

-- Loyalty campaigns: merchant-created bonus events
CREATE TABLE loyalty_campaigns (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  program_id        UUID NOT NULL REFERENCES loyalty_programs(id),
  name              VARCHAR(150) NOT NULL,
  start_at          TIMESTAMPTZ NOT NULL,
  end_at            TIMESTAMPTZ NOT NULL,
  time_window_start TIME,                   -- NULL = all day; else e.g. 11:00 for lunch special
  time_window_end   TIME,
  day_of_week       INTEGER[],              -- NULL = all days; [1,2,3,4,5] = Mon-Fri
  qualifying_scope  VARCHAR(30) NOT NULL DEFAULT 'ALL_ITEMS'
                    CHECK (qualifying_scope IN ('ALL_ITEMS','CATEGORY','ITEM','MIN_SPEND')),
  qualifying_ref_ids UUID[],               -- category_ids or item_ids if scope != ALL_ITEMS
  min_spend_cents   INTEGER,               -- min order subtotal to qualify; NULL if not applicable
  multiplier        NUMERIC(5,2) NOT NULL DEFAULT 2.00, -- 2.00 = double points
  is_additive       BOOLEAN NOT NULL DEFAULT FALSE, -- FALSE = multiplicative; TRUE = additive on base
  channel_filter    VARCHAR(30)[],          -- NULL = all channels; or ['IN_HOUSE','WEB_ORDER']
  status            VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN ('DRAFT','SCHEDULED','ACTIVE','ENDED','CANCELLED')),
  points_issued     INTEGER NOT NULL DEFAULT 0, -- running total (updated by batch job)
  created_by        UUID NOT NULL REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_at > start_at)
);
ALTER TABLE loyalty_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON loyalty_campaigns USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_loyalty_campaigns_active ON loyalty_campaigns(program_id, status, start_at, end_at)
  WHERE status IN ('SCHEDULED','ACTIVE');

-- Loyalty fraud events: detection log
CREATE TABLE loyalty_fraud_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  account_id        UUID REFERENCES loyalty_accounts(id),
  fraud_signal      VARCHAR(50) NOT NULL    -- ACCOUNT_FARMING | DEVICE_CLUSTER | REDEMPTION_VELOCITY | REFUND_REARN
                    CHECK (fraud_signal IN ('ACCOUNT_FARMING','DEVICE_CLUSTER','REDEMPTION_VELOCITY','REFUND_REARN','MANUAL_FLAG')),
  signal_data       JSONB NOT NULL,         -- {phone, email, device_fingerprint, attempt_count, ...}
  resolution        VARCHAR(20) DEFAULT 'PENDING'
                    CHECK (resolution IN ('PENDING','CLEARED','CONFIRMED_FRAUD','ESCALATED')),
  resolved_at       TIMESTAMPTZ,
  resolved_by       UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_loyalty_fraud_resolution ON loyalty_fraud_events(resolution, created_at) WHERE resolution = 'PENDING';

-- Loyalty audit trail
CREATE TABLE loyalty_audit_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id),
  event_type  VARCHAR(100) NOT NULL,
  actor_type  VARCHAR(20) NOT NULL CHECK (actor_type IN ('USER','SYSTEM','BATCH','API_KEY','AI_AGENT')),
  actor_id    UUID,
  entity_type VARCHAR(50) NOT NULL,
  entity_id   UUID NOT NULL,
  changed_fields JSONB,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER enforce_loyalty_audit_immutability
  BEFORE UPDATE OR DELETE ON loyalty_audit_events
  FOR EACH ROW EXECUTE FUNCTION raise_immutability_exception();

-- Automatic expiry date update trigger
CREATE OR REPLACE FUNCTION update_loyalty_expiry_date()
RETURNS TRIGGER AS $$
DECLARE v_days INTEGER;
BEGIN
  SELECT COALESCE(mc.value::integer, pc.value::integer)
    INTO v_days
    FROM platform_config pc
    LEFT JOIN merchant_config mc ON mc.config_key = pc.key AND mc.tenant_id = NEW.tenant_id
    WHERE pc.key = 'loyalty.expiry_inactivity_days';
  NEW.expiry_date := NOW() + (v_days || ' days')::interval;
  NEW.last_activity_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_loyalty_expiry_on_activity
  BEFORE INSERT OR UPDATE OF points_balance ON loyalty_accounts
  FOR EACH ROW EXECUTE FUNCTION update_loyalty_expiry_date();
```

**Seed:** `db/seeds/020_loyalty_engine_seed.sql` — references `SEED_BISTROBEEST_TEST_TENANT.md` for tier data. Additional seed:

```sql
-- BistroBeest Downtown loyalty program
INSERT INTO loyalty_programs (id, tenant_id, brand_id, name, slug, model, is_active)
VALUES (
  'prog0001-0000-0000-0000-000000000001',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'bbbb0001-0000-0000-0000-000000000001',
  'BistroBeest Rewards',
  'bistrobeest-rewards',
  'BRAND_ISOLATED',
  TRUE
) ON CONFLICT DO NOTHING;

-- Seed tiers linking to this program (tiers seeded in master seed; add program_id here)
UPDATE loyalty_tiers SET program_id = 'prog0001-0000-0000-0000-000000000001'
WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND program_id IS NULL;

-- Demo campaign: "Double Points Weekend"
INSERT INTO loyalty_campaigns (id, tenant_id, program_id, name, start_at, end_at, day_of_week, multiplier, status, created_by)
VALUES (
  'camp0001-0000-0000-0000-000000000001',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'prog0001-0000-0000-0000-000000000001',
  'Double Points Weekend',
  NOW()::date + interval '1 day',         -- starts tomorrow
  NOW()::date + interval '3 days',        -- runs 3 days
  ARRAY[6,7],                              -- Saturday=6, Sunday=7
  2.00,
  'SCHEDULED',
  'usr00001-0000-0000-0000-000000000001'
) ON CONFLICT DO NOTHING;
```

---

## REQ-LOY-001: Points Earning Engine

**Priority:** Must | **Actors:** Consumer, POS, AI, AGG Queue, Order Service

---

#### Context & Business Intent

Build the engine that calculates and credits loyalty points on every qualifying transaction. The engine reads all earning rules from the database (never from code constants), evaluates the rule hierarchy against each order, and writes a `loyalty_transactions` record atomically within the payment transaction boundary. A consumer must see updated points within 60 seconds — verified by automated acceptance test.

---

#### Service Layer

**File:** `src/services/loyalty/earning.service.ts`

```typescript
/**
 * calculateEarning(params) — Called synchronously after payment confirmation.
 * Must complete within 200ms. Runs inside the same DB transaction as payment.
 *
 * Rule evaluation order (see loyalty_campaigns + platform_config):
 *   1. Active campaign multiplier matching this order (scope, time, channel)
 *   2. Channel multiplier from merchant_config ('loyalty.channel_multiplier.{channel}')
 *   3. Category or item-level multiplier if configured in campaign
 *   4. Base rate from merchant_config ('loyalty.earning_rate_per_dollar') or platform_config default
 *   5. Tier multiplier from consumer's current tier (loyalty_tiers.earning_multiplier)
 *
 * Non-earning subtraction: Tips, tax, delivery fees, gift card face value must be
 * subtracted from order.subtotal_cents BEFORE applying earning rate.
 * Only taxable food/service subtotal earns points.
 *
 * Returns: LoyaltyEarningResult { points_earned, rule_snapshot, idempotency_key }
 * Throws: LoyaltyAccountNotFoundError | IdempotentDuplicateError (if already credited)
 */
async calculateAndCreditEarning(params: {
  orderId: string;
  tenantId: string;
  accountId: string;
  orderSubtotalCents: number;     // food/service only — tips/tax/delivery excluded by caller
  channel: OrderChannel;          // IN_HOUSE | WEB_ORDER | AI_ASSISTANT | DOORDASH | UBEREATS | etc.
  locationId: string;
  completedAt: Date;
  idempotencyKey: string;         // = order_id + ':earn' — prevents double credit on retry
  dbTx: DatabaseTransaction;      // MUST run in same transaction as payment confirmation
}): Promise<LoyaltyEarningResult>

/**
 * getActiveRules(tenantId, programId, channel, timestamp) — Returns the full earning
 * rule set applicable for this tenant/channel/time. Cached in Redis 5-minute TTL.
 * Cache key: 'loyalty:rules:{tenantId}:{programId}:{channel}:{date}'
 * Cache invalidated on: campaign status change, merchant_config write
 */
async getActiveRules(tenantId: string, programId: string, channel: string, timestamp: Date): Promise<EarningRuleSet>
```

---

#### API Endpoints

| Method | Path | Auth Role | Description | Webhook Fired |
|---|---|---|---|---|
| `GET` | `/v1/loyalty/accounts/{id}/transactions` | Member, Merchant Admin | Paginated earn/redeem history | — |
| `GET` | `/v1/loyalty/accounts/{id}/balance` | Member, Merchant Admin, POS | Current balance, tier, expiry | — |
| `POST` | `/v1/loyalty/earn` | Internal / POS Service | Credit points post-payment | `loyalty.points_earned` |
| `GET` | `/v1/loyalty/rules` | Merchant Admin | Current earning rules for tenant | — |
| `GET` | `/v1/loyalty/campaigns` | Merchant Admin | List campaigns (filter by status) | — |
| `POST` | `/v1/loyalty/campaigns` | Merchant Admin | Create bonus campaign | `loyalty.campaign_created` |
| `PATCH` | `/v1/loyalty/campaigns/{id}` | Merchant Admin | Update/cancel campaign | `loyalty.campaign_updated` |

**`POST /v1/loyalty/earn` Request:**
```json
{
  "order_id": "uuid",
  "account_id": "uuid",
  "order_subtotal_cents": 2890,
  "channel": "WEB_ORDER",
  "location_id": "uuid",
  "completed_at": "2026-03-12T19:34:00Z",
  "idempotency_key": "order_uuid:earn"
}
```
**Response `201`:**
```json
{
  "points_earned": 346,
  "new_balance": 1842,
  "multiplier_applied": 1.00,
  "campaign_applied": null,
  "tier_bonus": false,
  "transaction_id": "uuid"
}
```

**`loyalty.points_earned` Webhook Payload:**
```json
{
  "event": "loyalty.points_earned",
  "account_id": "uuid",
  "consumer_id": "uuid",
  "program_id": "uuid",
  "points_earned": 346,
  "new_balance": 1842,
  "tier_id": "uuid",
  "tier_name": "Bistro",
  "transaction_id": "uuid",
  "order_id": "uuid",
  "occurred_at": "2026-03-12T19:34:01Z"
}
```

---

#### UI/UX

**POS Screen — Post-Payment Earn Confirmation:**
> After payment authorizes: "✅ +346 BistroBeest Rewards points added to [Consumer First Name]'s account. Balance: 1,842 pts ($18.42 to redeem). Tier: Bistro."  
> Displayed for 4 seconds on cashier-facing screen. Requires no action.

**Consumer Wallet App — Transaction Feed:**
> Each `EARN` event shows: Brand logo | "+346 pts — BistroBeest Downtown" | timestamp | "Balance: 1,842 pts"  
> Tapping the item shows full rule breakdown: "Base: 12pts/$1 × $28.90 = 346 pts"

**Empty State (new member, 0 balance):**  
> "You have 0 points. Earn points every time you visit! Your first order earns you 346+ points toward a free item."

---

#### Batch Jobs

**Job:** `loyalty.campaign_status_update` | **Cron:** `*/5 * * * *` (every 5 min) | **Idempotent:** Yes  
Queries `loyalty_campaigns` where `status='SCHEDULED' AND start_at <= NOW()` → sets `status='ACTIVE'`.  
Queries where `status='ACTIVE' AND end_at <= NOW()` → sets `status='ENDED'`, fires `loyalty.campaign_ended` webhook.  
Logs to `batch_job_runs`.

---

#### Acceptance Tests

| Test ID | Scenario | Input | Expected |
|---|---|---|---|
| LOY-001-T1 | Standard earn | $28.90 WEB_ORDER, base rate 12pts/$1 | 346 pts credited; txn row written; webhook fired; balance updated |
| LOY-001-T2 | Idempotent duplicate | Same order_id + ':earn' sent twice | Second call returns 200 with same transaction_id; no second credit |
| LOY-001-T3 | Campaign multiplier active | 2× weekend campaign active, $28.90 order | 692 pts credited; earn_rule_applied shows campaign_id |
| LOY-001-T4 | DoorDash channel multiplier | DoorDash order, merchant config 0.5× | 173 pts credited (346 × 0.5) |
| LOY-001-T5 | Tip excluded | $28.90 food + $5.80 tip = $34.70 total | Earning calculated only on $28.90; tip not counted |
| LOY-001-T6 | Non-earning transaction | Gift card purchase $50 | 0 pts; no loyalty_transactions row written |

---

## REQ-LOY-002: Redemption Engine

**Priority:** Must | **Actors:** Consumer, POS Cashier, AI, Web Checkout

---

#### Context & Business Intent

Build the redemption flow that converts points to a pre-tax discount, atomically within the order transaction. Redemption is the moment the loyalty program proves its value to the consumer — it must be fast, visible, and reversible on refund. All thresholds (minimum, rate, cap) are read from `merchant_config` / `platform_config` at runtime.

---

#### Service Layer

**File:** `src/services/loyalty/redemption.service.ts`

```typescript
/**
 * initiateRedemption(params) — Called when consumer confirms point redemption.
 * Validates balance >= threshold, calculates discount, creates REDEMPTION_HOLD record.
 * Hold is converted to REDEEM on payment success, or released on payment failure/cancel.
 *
 * Returns: RedemptionResult { discount_cents, redemption_hold_id, new_balance_if_confirmed }
 * Throws: InsufficientBalanceError | BelowMinThresholdError | GuestSessionError | DailyLimitExceededError
 */
async initiateRedemption(params: {
  accountId: string;
  tenantId: string;
  pointsToRedeem: number;   // Consumer-selected amount (≥ min_threshold, ≤ balance)
  orderId: string;
  sessionType: 'POS' | 'WEB' | 'AI';
  idempotencyKey: string;   // = order_id + ':redeem'
}): Promise<RedemptionResult>

/**
 * confirmRedemption(holdId, dbTx) — Called on payment success. Converts hold to final REDEEM txn.
 * confirmRedemption(holdId, dbTx, {cancelled: true}) — Releases hold on payment failure.
 * Both calls are idempotent.
 */
async confirmRedemption(holdId: string, dbTx: DatabaseTransaction, opts?: { cancelled?: boolean }): Promise<void>

/**
 * reverseRedemption(orderId, refundAmountCents, dbTx) — On refund.
 * Full refund → return all redeemed points.
 * Partial refund → return points proportional to (refund_amount / original_order_amount).
 * Creates REVERSE loyalty_transaction linked to original REDEEM transaction.
 */
async reverseRedemption(orderId: string, refundAmountCents: number, dbTx: DatabaseTransaction): Promise<void>
```

---

#### API Endpoints

| Method | Path | Auth | Description | Webhook |
|---|---|---|---|---|
| `POST` | `/v1/loyalty/redemptions/initiate` | POS / Web / AI Service | Reserve points for an order | `loyalty.redemption_initiated` |
| `POST` | `/v1/loyalty/redemptions/{holdId}/confirm` | Order Service (internal) | Finalize redemption on payment success | `loyalty.redeemed` |
| `POST` | `/v1/loyalty/redemptions/{holdId}/cancel` | Order Service (internal) | Release hold on payment failure | — |
| `POST` | `/v1/loyalty/redemptions/reverse` | Refund Service (internal) | Return points on refund | `loyalty.points_returned` |

**Config keys read at runtime (never hardcoded):**
```
loyalty.min_redemption_points      → minimum to redeem (default: 500, merchant-overridable)
loyalty.redemption_rate_cents      → points per $0.01 (default: 100 = 100pts/$1)
loyalty.max_redemption_per_txn     → max $ cap per transaction (default: NULL = no cap)
loyalty.max_redemptions_per_day    → daily frequency cap per account (default: 1)
```

---

#### UI/UX

**POS Redemption Flow:**
```
Cashier: "Any loyalty account?"
Consumer: [gives phone number or scans QR]
POS shows: "Maria Lopez — Bistro Tier — 1,842 pts available ($18.42)
           Apply points to this order? [Yes — enter amount] [No]"
→ POS shows: "$10.00 Asset Value applied to order payload"
→ ISO-20022 Ledgers updated seamlessly with pacs.008 Asset Substitution block mapping value directly rather than a pre-tax generic discount
→ After payment: "✓ 1,000 points redeemed. New balance: 842 pts."
```

**AI Session Redemption (authenticated only):**  
> "Hi Maria! You have **1,842 points** worth **$18.42**. Want to use some tonight? Your order is currently $28.90."  
> Consumer: "Use $10 worth"  
> AI: "Done! $10.00 discount applied. Your total is now $18.90. Shall I confirm the order?"

**Guest session attempt:**  
> AI responds: "To redeem points, I need to verify your account. I am sending a secure biometric Push-to-Auth request to your mobile wallet."  
> [Initiates Push-to-Auth to device Secure Enclave → on success via facial/fingerprint scan, converts session to authenticated → redemption available]

---

#### Acceptance Tests

| Test ID | Scenario | Input | Expected |
|---|---|---|---|
| LOY-002-T1 | Valid redemption | 1,000 pts from account with 1,842 balance | $10 discount; balance → 842; REDEEM txn written |
| LOY-002-T2 | Below minimum | 300 pts requested, threshold 500 | HTTP 422 `BELOW_MIN_THRESHOLD`; no state change |
| LOY-002-T3 | Insufficient balance | 2,000 pts, balance 1,842 | HTTP 422 `INSUFFICIENT_BALANCE` |
| LOY-002-T4 | Daily limit exceeded | Second redemption same account same day | HTTP 422 `DAILY_LIMIT_EXCEEDED` |
| LOY-002-T5 | Payment fails after initiate | Redemption initiated, card declined | Hold released; balance unchanged |
| LOY-002-T6 | Full refund reversal | $28.90 order, $10 redemption, full refund | 1,000 pts returned; REVERSE txn written |
| LOY-002-T7 | Partial refund reversal | $28.90 order, $10 redemption, $14.45 refund | 500 pts returned (proportional); REVERSE txn written |

---

## REQ-LOY-003: Customer Tier Program

**Priority:** Should | **Actors:** Consumer, Merchant Admin, Batch Job

---

#### Context & Business Intent

Build the tier advancement and downgrade system. Tier evaluation runs on every earning event (real-time advance) and on a nightly batch (downgrade check). All tier thresholds, names, multipliers, and benefits are rows in `loyalty_tiers` — never hardcoded.

---

#### Service Layer

**File:** `src/services/loyalty/tier.service.ts`

```typescript
/**
 * evaluateTierAdvancement(accountId, dbTx) — Called after every EARN event.
 * Reads account's rolling 12-month metric (spend, visits, or points) vs tier thresholds.
 * If metric crosses next tier threshold → advance, write audit, fire webhook.
 * No-op if already at max tier.
 */
async evaluateTierAdvancement(accountId: string, dbTx: DatabaseTransaction): Promise<TierChangeResult | null>

/**
 * evaluateTierRetention(accountId) — Run by batch job on each account's anniversary date.
 * Checks if metric in the prior 12 months meets threshold.
 * If not → downgrade one level (not to zero).
 * At 60 and 30 days before anniversary: send retention warning notification.
 */
async evaluateTierRetention(accountId: string): Promise<TierChangeResult | null>
```

---

#### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/loyalty/tiers` | Merchant Admin | List all tiers for a program |
| `POST` | `/v1/loyalty/tiers` | Merchant Admin | Create a new tier |
| `PATCH` | `/v1/loyalty/tiers/{id}` | Merchant Admin | Update tier name/threshold/multiplier/benefits |
| `DELETE` | `/v1/loyalty/tiers/{id}` | Merchant Admin | Deactivate tier (reassigns members to tier below) |
| `GET` | `/v1/loyalty/accounts/{id}/tier-progress` | Member, POS, AI | Progress toward next tier |

**`GET /v1/loyalty/accounts/{id}/tier-progress` Response:**
```json
{
  "current_tier": { "name": "Bistro", "earning_multiplier": 1.25 },
  "next_tier": { "name": "Reserve", "earning_multiplier": 1.50 },
  "qualification_metric": "POINTS_EARNED_ROLLING_12M",
  "current_value": 834,
  "threshold_to_next": 1500,
  "progress_pct": 55.6,
  "rolling_period_start": "2025-03-12",
  "anniversary_date": "2026-09-01",
  "at_risk_of_downgrade": false
}
```

---

#### Batch Jobs

**Job:** `loyalty.tier_anniversary_check` | **Cron:** `0 3 * * *` | **Idempotent:** Yes  
- Selects accounts where `tier_anniversary::date = CURRENT_DATE`  
- Calls `evaluateTierRetention()` for each  
- Writes `TIER_DOWNGRADE` or `TIER_RETAINED` audit event  
- Fires `loyalty.tier_changed` webhook on downgrade

**Job:** `loyalty.tier_downgrade_warnings` | **Cron:** `0 2 * * *` | **Idempotent:** Yes  
- Selects accounts where `tier_anniversary BETWEEN NOW() + 30d AND NOW() + 31d` (30-day warning)  
- Selects accounts where `tier_anniversary BETWEEN NOW() + 60d AND NOW() + 61d` (60-day warning)  
- For each: checks if rolling metric meets threshold  
- If not meeting → triggers NOT engine with `loyalty.tier_downgrade_warning` template  
- One warning per account per window (idempotent via `loyalty_audit_events` check)

---

## REQ-LOY-004: Loyalty Account Management & Identity

**Priority:** Must | **Actors:** Consumer, POS Cashier, AI, Digital Wallet

---

#### Context & Business Intent

Build enrollment across all channels and the identity resolution / account merge engine. One consumer must resolve to exactly one canonical loyalty account per program. Merge is automatic when confidence is high (one empty account), consumer-confirmed when both have history. Wallet linkage is automatic on wallet creation.

---

#### Service Layer

**File:** `src/services/loyalty/account.service.ts`

```typescript
/**
 * findOrEnroll(params) — Called at checkout, POS cashier entry, or AI session.
 * Looks up existing account by performing a deterministic 1-way hash of the provided alias.
 * If found → returns account.
 * If not found → creates new enrollment record.
 * If duplicate detected (matching phone/email on second account) → triggers merge flow.
 */
async findOrEnroll(params: {
  tenantId: string; programId: string;
  phone?: string; email?: string; firstName?: string;
  channel: EnrollmentChannel; locationId?: string;
}): Promise<{ account: LoyaltyAccount; isNew: boolean; mergeRequired: boolean }>

/**
 * mergeDuplicates(primaryId, secondaryId, confirmedBy?) — Merges two accounts.
 * Auto-merge if secondary has zero transactions and zero balance.
 * Consumer-confirmation required if both have balance/history (confirmedBy = consumer_id).
 * Merged account takes highest tier, combined balance, union of transaction history.
 * Secondary account set to status='MERGED' with reference to primary.
 */
async mergeDuplicates(primaryId: string, secondaryId: string, confirmedBy?: string): Promise<LoyaltyAccount>

/**
 * linkWallet(accountId, walletId, consumerId) — Called by Digital Wallet service on wallet creation.
 * Finds loyalty accounts matching alias_id_hash generated securely across merchant-siloed bounds.
 * Links each to the new wallet_id and consumer_id.
 * Fires 'loyalty.wallet_linked' webhook per account linked.
 */
async linkWallet(walletId: string, consumerId: string, aliasIdentifier: string): Promise<number>
```

---

#### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/loyalty/accounts` | POS, Web, AI | Enroll or find account |
| `GET` | `/v1/loyalty/accounts/lookup` | POS, Merchant Admin | Lookup by phone/email |
| `GET` | `/v1/loyalty/accounts/{id}` | Member (own), Merchant Admin | Account detail |
| `POST` | `/v1/loyalty/accounts/merge` | Consumer, Merchant Admin | Merge duplicate accounts |
| `DELETE` | `/v1/loyalty/accounts/{id}` | Member (own via CCPA), Merchant Admin | Delete account (CCPA) |

**`POST /v1/loyalty/accounts` — Enrollment Request:**
```json
{
  "program_id": "uuid",
  "phone": "+13125559876",
  "email": "maria@example.com",
  "first_name": "Maria",
  "enrollment_channel": "POS_CASHIER",
  "location_id": "uuid"
}
```

**POS Cashier Lookup Screen:**  
> Cashier types phone number → system shows within 1 second:  
> - Found: "Maria Lopez | Bistro Tier | 1,842 pts | Last visit: 3 days ago"  
> - Not found: "No account found for this number. Enroll now? [Yes — takes 10 seconds] [Skip]"  
> - Duplicate detected: Shown to merchant admin only — merchant resolves; consumer not bothered at checkout

---

## REQ-LOY-005: Points Expiry & Breakage Management

**Priority:** Must | **Actors:** Consumer, Merchant Admin, Finance Admin, Batch Job

---

#### Service Layer: `src/services/loyalty/expiry.service.ts`

```typescript
/**
 * runExpiryBatch() — Nightly job. Selects accounts where expiry_date <= NOW() AND status = 'ACTIVE'.
 * Writes points_balance to 0, status = 'EXPIRED', creates EXPIRE loyalty_transaction.
 * Generates breakage_report_entries rows for the merchant's monthly report.
 * Idempotent: skips accounts already processed today (audit check).
 */
async runExpiryBatch(): Promise<ExpiryBatchResult>

/**
 * generateBreakageReport(tenantId, periodStart, periodEnd) — Aggregates EXPIRE transactions
 * in date range. Returns: total_points_expired, dollar_equivalent, member_count, escheatment_flagged.
 * Escheatment flag: queries escheating_states table for consumer's state; if match → flagged.
 */
async generateBreakageReport(tenantId: string, periodStart: Date, periodEnd: Date): Promise<BreakageReport>
```

**Additional Table:**
```sql
CREATE TABLE escheatment_states (
  state_code   CHAR(2) PRIMARY KEY,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  law_summary  TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Seeded from DEV_IMPLEMENTATION_STANDARD — PaySurity maintains this list
INSERT INTO escheatment_states (state_code, is_active, law_summary) VALUES
  ('CA', TRUE, 'California unclaimed property — stored value exempt if < $10 per item, but loyalty balances > threshold subject to review'),
  ('DE', TRUE, 'Delaware requires escheatment of unused gift certificates; loyalty programs partially exempt with annual activity'),
  ('NY', TRUE, 'New York — gift certificates do not expire; loyalty points with clear expiry policy are typically exempt'),
  ('WA', TRUE, 'Washington — stored value subject to 3-year dormancy rule'),
  ('IL', FALSE, 'Illinois — loyalty points generally exempt from unclaimed property with merchant disclosure')
ON CONFLICT (state_code) DO NOTHING;
```

---

#### Batch Jobs

**Job:** `loyalty.expire_points` | **Cron:** `0 1 * * *` | **Idempotent:** Yes  
**Job:** `loyalty.expiry_warnings` | **Cron:** `0 2 * * *` | **Idempotent:** Yes  

---

## REQ-LOY-006: Loyalty Fraud Prevention

**Priority:** Must | **Actors:** System, Risk Team, Merchant Admin

---

#### Service Layer: `src/services/loyalty/fraud.service.ts`

```typescript
/**
 * checkEnrollmentFraud(phone, email, deviceFingerprint, tenantId) — Called at enrollment.
 * Signals checked asynchronously (does not block enrollment, only blocks redemption).
 * Returns: FraudCheckResult { riskScore: 0-100, signals: string[], holdRedemption: boolean }
 */
async checkEnrollmentFraud(params: EnrollmentFraudParams): Promise<FraudCheckResult>

/**
 * checkRedemptionFraud(accountId, tenantId) — Called before any redemption.
 * Checks: daily frequency, account status (FRAUD_HOLD blocks immediately).
 * Returns: { allowed: boolean, reason?: string }
 */
async checkRedemptionFraud(accountId: string, tenantId: string): Promise<RedemptionFraudCheck>

/**
 * flagRefundRearn(orderId, accountId) — Called when refund + re-place pattern detected.
 * Puts a 24-hour hold on earning for the re-placed order.
 * Writes FRAUD_SIGNAL event to loyalty_fraud_events.
 */
async flagRefundRearn(orderId: string, accountId: string): Promise<void>
```

**Config keys (all read from DB):**
```
loyalty.fraud.max_accounts_per_phone_30d   → '2'   (flag if >2 accounts from same phone in 30 days)
loyalty.fraud.max_accounts_per_device_7d   → '3'   (flag if >3 enrollments from same device in 7 days)
loyalty.fraud.redemption_hold_hours        → '24'  (hours a fraud-hold blocks redemption)
loyalty.fraud.auto_clear_confidence_pct    → '80'  (auto-clear if automated confidence ≥ 80%)
```

---

## REQ-LOY-007: Merchant Configuration & Loyalty Analytics

**Priority:** Must | **Actors:** Merchant Admin, Brand Admin, Franchise Operator

---

#### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/loyalty/analytics/summary` | Merchant Admin, Brand Admin | Dashboard summary metrics |
| `GET` | `/v1/loyalty/analytics/breakage` | Merchant Admin, Finance | Monthly breakage report |
| `GET` | `/v1/loyalty/analytics/campaigns/{id}/performance` | Merchant Admin | Campaign ROI metrics |
| `GET` | `/v1/loyalty/analytics/members/at-risk` | Merchant Admin | Members inactive 9+ months |
| `GET` | `/v1/loyalty/config` | Merchant Admin | Current program config |
| `PATCH` | `/v1/loyalty/config` | Merchant Admin | Update earning/redemption rules |

**`GET /v1/loyalty/analytics/summary` Response:**
```json
{
  "period": "2026-02-01/2026-03-01",
  "active_members": 1847,
  "new_enrollments": 234,
  "points_issued": 4820000,
  "points_redeemed": 1240000,
  "redemption_rate_pct": 25.7,
  "points_expired": 95000,
  "points_liability_cents": 36260,
  "tier_distribution": {
    "Brasserie": 1102, "Bistro": 512, "Reserve": 198, "Chefs_Table": 35
  },
  "top_campaigns": [
    { "name": "Double Points Weekend", "points_issued": 420000, "participating_members": 312 }
  ]
}
```

**UI — Merchant Loyalty Dashboard:**  
> Entry card shows: Active Members | Points Liability ($) | Redemption Rate | Month-over-month trend arrow  
> Second row: Tier distribution donut chart | Campaign performance table  
> Bottom: "Re-engagement List" table — members inactive 9+ months, exportable as CSV  
> "Create Campaign" button → modal: name, date range, time window, multiplier, qualifying scope, channel filter → Save → status=SCHEDULED, activates automatically at start_at

**Config panel:** tabbed UI — Earning | Redemption | Tiers | Expiry | Fraud Thresholds  
Every field reads from and writes to `merchant_config` table, not application state.  
Config save calls `PATCH /v1/loyalty/config` → invalidates Redis cache immediately.

---

## Cross-Vertical Integration Points

| From | To | Mechanism |
|---|---|---|
| Order Service (payment confirmed) | LOY Earning | Synchronous call within payment DB transaction |
| Order Service (refund processed) | LOY Reversal | Synchronous call within refund DB transaction |
| POS Checkout | LOY Lookup | `GET /v1/loyalty/accounts/lookup` at order initiation |
| AI Session | LOY Redemption | `POST /v1/loyalty/redemptions/initiate` on consumer confirmation |
| Digital Wallet creation | LOY Link | `linkWallet()` fired by WAL service on wallet activation |
| NOT Engine | LOY Events | Subscribes to `loyalty.points_earned`, `loyalty.tier_changed`, `loyalty.expiry_warning` webhooks |
| FRN Brand Admin | LOY Config | Brand Admin scope on all loyalty config endpoints |
| AI Ops (OPS) | LOY Analytics | Reads `loyalty_accounts` inactive_count for re-engagement insight cards |

---
