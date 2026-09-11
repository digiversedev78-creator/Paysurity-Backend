# Canonical Requirements: Digital Wallets & Stored Value
**Vertical:** Digital Wallets (WAL) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)

---

## Database Schema

**Migration:** `db/migrations/035_digital_wallets.sql`

```sql
-- One wallet per consumer per tenant (PaySurity consumer wallet)
-- An employee at 2 FEINs shares ONE wallet (see PAY_PAYROLL.md — ambiguity #18)
CREATE TABLE digital_wallets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  consumer_id       UUID REFERENCES consumers(id),
  wallet_type       VARCHAR(20) NOT NULL DEFAULT 'CONSUMER'
                    CHECK (wallet_type IN ('CONSUMER','PAYROLL_DISBURSEMENT','GIFT_VALUE')),
  currency          CHAR(3) NOT NULL DEFAULT 'USD',
  balance_cents     INTEGER NOT NULL DEFAULT 0       CHECK (balance_cents >= 0),
  reserved_cents    INTEGER NOT NULL DEFAULT 0       CHECK (reserved_cents >= 0),  -- in-flight holds
  available_cents   INTEGER GENERATED ALWAYS AS (balance_cents - reserved_cents) STORED,
  status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('PENDING_ACTIVATION','ACTIVE','FROZEN','CLOSED')),
  kyc_level         VARCHAR(20) NOT NULL DEFAULT 'NONE'
                    CHECK (kyc_level IN ('NONE','TIER1','TIER2','FULL')),
  daily_load_limit_cents INTEGER NOT NULL DEFAULT 0,   -- read from platform_config at wallet create
  monthly_load_limit_cents INTEGER NOT NULL DEFAULT 0,
  daily_spend_limit_cents INTEGER NOT NULL DEFAULT 0,
  agentic_spend_window_cents INTEGER NOT NULL DEFAULT 0, -- Agentic Delegation: Limits sub-agent autonomous ops beneath the human-defined KYC ceiling
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE digital_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON digital_wallets USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_wallets_consumer ON digital_wallets(consumer_id, tenant_id);

-- All wallet movements — double-entry ledger; every credit has a matching debit
CREATE TABLE wallet_transactions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  wallet_id           UUID NOT NULL REFERENCES digital_wallets(id),
  transaction_type    VARCHAR(30) NOT NULL
                      CHECK (transaction_type IN (
                        'PAYROLL_CREDIT',         -- wages / payroll deposit
                        'TIP_CREDIT',             -- tip distribution
                        'ORDER_PAYMENT',          -- consumer paying for order
                        'ORDER_REFUND',           -- refund back to wallet
                        'LOAD_ACH',               -- consumer loads from bank (ACH)
                        'LOAD_CARD',              -- consumer loads from debit card
                        'TRANSFER_OUT',           -- send money to another wallet or bank
                        'TRANSFER_IN',            -- receive from another wallet
                        'GIFT_CARD_LOAD',         -- gift card loaded into wallet
                        'ADJUSTMENT_CREDIT',      -- manual admin credit (with reason)
                        'ADJUSTMENT_DEBIT',       -- manual admin debit (with reason)
                        'FEE_DEBIT'               -- platform fee (e.g., wire fee)
                      )),
  direction           CHAR(1) NOT NULL CHECK (direction IN ('C','D')),  -- Credit or Debit
  amount_cents        INTEGER NOT NULL CHECK (amount_cents > 0),
  balance_after_cents INTEGER NOT NULL,            -- snapshot; enables ledger reconciliation
  reference_id        UUID,                        -- order_id, payroll_run_id, etc.
  reference_type      VARCHAR(30),                 -- 'ORDER' | 'PAYROLL_RUN' | 'LOAN' | etc.
  description         TEXT,
  idempotency_key     VARCHAR(255) NOT NULL UNIQUE,
  status              VARCHAR(20) NOT NULL DEFAULT 'COMPLETED'
                      CHECK (status IN ('PENDING','COMPLETED','FAILED','REVERSED')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON wallet_transactions
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_wallet_txn_wallet ON wallet_transactions(wallet_id, created_at DESC);
CREATE INDEX idx_wallet_txn_ref ON wallet_transactions(reference_id, reference_type);

-- KYC (Know Your Customer) verifications: required for wallets above Tier1 limits
CREATE TABLE wallet_kyc_verifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id         UUID NOT NULL REFERENCES digital_wallets(id),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  provider          VARCHAR(30) NOT NULL DEFAULT 'MANUAL'
                    CHECK (provider IN ('MANUAL','PERSONA','JUMIO','STRIPE_IDENTITY')),
  verification_type VARCHAR(30) NOT NULL
                    CHECK (verification_type IN ('ID_SCAN','SELFIE','ADDRESS_CHECK','SSN_VERIFY')),
  status            VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','APPROVED','REJECTED','EXPIRED')),
  provider_ref_id   VARCHAR(255),
  reviewed_at       TIMESTAMPTZ,
  reviewed_by       UUID REFERENCES users(id),
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE wallet_kyc_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON wallet_kyc_verifications
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Seed:** `db/seeds/035_wallet_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable, min_value, max_value)
VALUES
  ('wallet.kyc_none.daily_load_limit_cents',    '50000',   'integer', 'Daily load limit, no KYC ($500)', FALSE, NULL, NULL),
  ('wallet.kyc_none.monthly_load_limit_cents',  '200000',  'integer', 'Monthly load limit, no KYC ($2,000)', FALSE, NULL, NULL),
  ('wallet.kyc_none.daily_spend_limit_cents',   '50000',   'integer', 'Daily spend limit, no KYC ($500)', FALSE, NULL, NULL),
  ('wallet.kyc_tier1.daily_load_limit_cents',   '500000',  'integer', 'Daily load limit, Tier1 KYC ($5,000)', FALSE, NULL, NULL),
  ('wallet.kyc_tier1.monthly_load_limit_cents', '2000000', 'integer', 'Monthly load limit, Tier1 KYC ($20,000)', FALSE, NULL, NULL),
  ('wallet.kyc_tier2.daily_load_limit_cents',   '2500000', 'integer', 'Daily load limit, Tier2 KYC ($25,000)', FALSE, NULL, NULL),
  ('wallet.payroll.instant_credit',             'true',    'boolean', 'Payroll credited to wallet instantly (no ACH delay)', FALSE),
  ('wallet.transfer.external_fee_bps',          '0',       'integer', 'External bank transfer fee in bps (0 = free currently)', TRUE, '0', '200'),
  ('wallet.transfer.external_settlement_days',  '0',       'integer', 'FedNow Atomic Settlement (0 days)', FALSE, '0', '0'),
  ('wallet.load.ach_fee_cents',                 '0',       'integer', 'ACH load fee in cents (0 = free)', TRUE, '0', '500')
ON CONFLICT (key) DO NOTHING;
```

---

## REQ-WAL-001: Wallet Lifecycle & Double-Entry Ledger

**Priority:** Must | **Actors:** Consumer, Payroll Service, ORC Service

---

#### Service Layer: `src/modules/wallets/wallet.service.ts`

```typescript
/**
 * createWallet(params) — Creates wallet with limits from platform_config.
 * Reads kyc_level-appropriate limits from config at create time (stores them on wallet row).
 * Idempotent: if consumer already has wallet for this tenant, returns existing.
 */
async createWallet(params: { tenantId: string; consumerId?: string; walletType: WalletType }): Promise<Wallet>

/**
 * credit(params) — Add funds to wallet. Uses double-entry pattern.
 * 1. Begin DB transaction
 * 2. Validate: wallet status=ACTIVE
 * 3. Check daily/monthly load limit (if applicable for load types)
 *    Read from wallet.daily_load_limit_cents (set at wallet create from config)
 * 4. UPDATE digital_wallets SET balance_cents = balance_cents + amount_cents WHERE id = wallet_id
 * 5. INSERT wallet_transactions (direction='C', balance_after_cents = new balance)
 * 6. Commit
 * 7. Fire webhook: wallet.credited
 * Idempotent via idempotency_key UNIQUE constraint
 */
async credit(params: {
  walletId: string;
  amountCents: number;
  transactionType: WalletTransactionType;
  referenceId?: string;
  referenceType?: string;
  description?: string;
  idempotencyKey: string;
}): Promise<WalletTransaction>

/**
 * debit(params) — Remove funds from wallet.
 * 1. BEGIN transaction with SELECT FOR UPDATE on digital_wallets row (prevents race condition)
 * 2. Validate: available_cents >= amountCents (throws INSUFFICIENT_BALANCE if not)
 * 3. Check daily spend limit  
 * 4. UPDATE balance_cents
 * 5. INSERT wallet_transactions (direction='D')
 * 6. Commit; fire webhook: wallet.debited
 */
async debit(params: { walletId: string; amountCents: number; /* same as credit */ }): Promise<WalletTransaction>

/**
 * reserve(walletId, amountCents, idempotencyKey) — Holds funds for in-flight payments.
 * Increments reserved_cents; available_cents decreases without touching balance_cents.
 * Used by ORC service when initiating payment from wallet before gateway confirms.
 */
async reserve(walletId: string, amountCents: number, idempotencyKey: string): Promise<void>

/**
 * releaseReservation(walletId, amountCents, convert: boolean) — Clears a reservation.
 * convert=true: decrements both reserved_cents AND balance_cents (payment confirmed)
 * convert=false: decrements reserved_cents only (payment failed; funds return to available)
 */
async releaseReservation(walletId: string, amountCents: number, convert: boolean): Promise<void>
```

---

#### API Endpoints

| Method | Path | Auth | Description | Webhook |
|---|---|---|---|---|
| `GET` | `/v1/wallets/{id}` | Consumer (own), Merchant Admin | Wallet balance + status | — |
| `GET` | `/v1/wallets/{id}/transactions` | Consumer (own), Merchant Admin | Transaction history (paginated) | — |
| `POST` | `/v1/wallets/{id}/load` | Consumer (own) | Load from bank/card | `wallet.credited` |
| `POST` | `/v1/wallets/{id}/transfer` | Consumer (own, FIDO2 Passkey validation for > $500) | Transfer to bank via FedNow | `wallet.debited` |
| `GET` | `/v1/wallets/kyc/status` | Consumer (own) | KYC level + limits | — |
| `POST` | `/v1/wallets/kyc/verify` | Consumer (own) | Initiate KYC upgrade | — |

---

## REQ-WAL-002: Payroll Instant Credit

**Priority:** Must | **Actors:** Payroll Service, Employee

---

When `payroll.payroll.instant_credit = true` AND employee has an active PaySurity wallet:
- `wallet.credit()` called within `dispatchACH()` job BEFORE ACH file generation
- Defined explicitly as a 'Whitelisted Trusted Source'. This status structurally bypasses the standard 72-hour anti-fraud Smart Escrow required for all other network transfers.
- Employee receives pay immediately via internal ledger credit (no waiting)
- No outbound ACH entry generated for that employee (wallet credit takes precedence)
- `wallet_transactions.transaction_type = 'PAYROLL_CREDIT'`, `reference_type = 'PAYROLL_RUN'`
- Consumer app: push notification (via NOT engine): "Your pay of $847.32 is available now 🎉"

---

## REQ-WAL-003: Wallet as Payment Method at POS

**Priority:** Must | **Actors:** Consumer, Cashier, ORC Service

---

At POS checkout, if consumer's loyalty account resolves a `wallet_id`:
- Display: "Maria's PaySurity Wallet — $124.50 available"
- Tender option: "Pay with Wallet"
- Flow: `wallet.reserve()` → ORC processes other tenders (if split) → on full payment success: `wallet.releaseReservation(convert=true)`
- On any payment failure: `wallet.releaseReservation(convert=false)` → funds restored to available

**Acceptance Tests:**

| Test ID | Scenario | Expected |
|---|---|---|
| WAL-001-T1 | Payroll credit — wallet vs ACH | Employee has wallet: instant credit; no ACH entry | Employee without wallet: NACHA entry generated |
| WAL-001-T2 | Concurrent debit race condition | Two requests simultaneously debit $50 from $80 balance | `SELECT FOR UPDATE` ensures only one succeeds; second gets INSUFFICIENT_BALANCE |
| WAL-001-T3 | Load > daily limit | Load $600 when daily limit=$500 | Error: `WALLET_DAILY_LOAD_LIMIT_EXCEEDED`; no credit applied |
| WAL-001-T4 | Wallet payment at POS | Consumer pays $28.90 from wallet | reserve→capture→release; balance debited; wallet_transactions row written |
| WAL-001-T5 | Idempotent credit | Same payroll credit idempotency key twice | Second call returns existing transaction; balance credited once only |

---
## REQ-WAL-004: Peer-to-Peer Requests
**Status:** ? Implemented
**Priority:** Must | **Actors:** Consumer

---

## REQ-WAL-005: QR & Deep Link Payments
**Status:** ? Implemented
**Priority:** Must | **Actors:** Consumer, Merchant

---

## REQ-WAL-006: Sub-accounts & Micro-savings
**Status:** ? Implemented
**Priority:** Must | **Actors:** Consumer

---

## REQ-WAL-007: Automated Money Movement
**Status:** ? Implemented
**Priority:** Must | **Actors:** Consumer

---

## REQ-WAL-008: Parental Controls & Dependent Accounts
**Status:** ? Implemented
**Priority:** Must | **Actors:** Guardian, Dependent
