# Canonical Requirements: Payment Orchestration Engine
**Vertical:** Payment Orchestration (ORC) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)  
**Primary Gateway:** FluidPay (all card payments; ACH via FluidPay ACH rails)

---

## Database Schema

**Migration:** `db/migrations/005_payment_orchestration.sql`

```sql
-- Payment intents: the lifecycle record for every payment attempt
CREATE TABLE payment_intents (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id),
  location_id           UUID NOT NULL REFERENCES locations(id),
  order_id              UUID REFERENCES orders(id),          -- NULL for standalone charges (subscriptions)
  amount_cents          INTEGER NOT NULL CHECK (amount_cents > 0),
  currency              CHAR(3) NOT NULL DEFAULT 'USD',
  payment_method_type   VARCHAR(30) NOT NULL
                        CHECK (payment_method_type IN ('CARD_PRESENT','CARD_NP','ACH','CASH','GIFT_CARD','WALLET','APPLE_PAY','GOOGLE_PAY','EBT')),
  status                VARCHAR(30) NOT NULL DEFAULT 'CREATED'
                        CHECK (status IN ('CREATED','PROCESSING','AUTHORIZED','CAPTURE_PENDING','CAPTURED','FAILED','VOIDED','PARTIALLY_REFUNDED','REFUNDED','DISPUTED')),
  gateway_provider      VARCHAR(30) NOT NULL DEFAULT 'FLUIDS_PAY'
                        CHECK (gateway_provider IN ('FLUIDS_PAY','OFFLINE_QUEUE','GIFT_CARD_LEDGER','CASH_LEDGER')),
  gateway_intent_id     VARCHAR(255),                        -- FluidPay's transaction_id
  gateway_auth_code     VARCHAR(50),                        -- authorization code from issuer
  gateway_response      JSONB,                              -- full raw response from gateway (for audit)
  last_four             VARCHAR(4),
  card_brand            VARCHAR(20),                        -- VISA | MASTERCARD | AMEX | DISCOVER | etc.
  cardholder_name       VARCHAR(255),
  terminal_id           VARCHAR(100),                       -- which POS terminal processed
  is_card_present       BOOLEAN NOT NULL DEFAULT FALSE,
  capture_method        VARCHAR(20) NOT NULL DEFAULT 'AUTOMATIC'
                        CHECK (capture_method IN ('AUTOMATIC','MANUAL')),
  captured_at           TIMESTAMPTZ,
  failure_code          VARCHAR(50),                        -- machine-readable decline reason
  failure_message       TEXT,                              -- human-readable decline message
  idempotency_key       VARCHAR(255) NOT NULL UNIQUE,
  metadata              JSONB,                             -- STRICT ISO 20022 (pacs.008) Enriched Receipts schema ONLY
  iso_end_to_end_id     VARCHAR(35),                       -- ISO EndToEndId for remittance tracing
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON payment_intents USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_pi_order ON payment_intents(order_id);
CREATE INDEX idx_pi_gateway_intent ON payment_intents(gateway_intent_id);
CREATE INDEX idx_pi_status ON payment_intents(tenant_id, status, created_at DESC);

-- Refunds: linked to the captured payment_intent
CREATE TABLE refunds (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  payment_intent_id UUID NOT NULL REFERENCES payment_intents(id),
  amount_cents      INTEGER NOT NULL CHECK (amount_cents > 0),
  reason            VARCHAR(30) NOT NULL
                    CHECK (reason IN ('CUSTOMER_REQUEST','DUPLICATE','FRAUDULENT','ORDER_ERROR','QUALITY_ISSUE','OTHER')),
  reason_note       TEXT,
  status            VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','SUCCEEDED','FAILED')),
  gateway_refund_id VARCHAR(255),
  initiated_by      UUID NOT NULL REFERENCES users(id),
  initiated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  idempotency_key   VARCHAR(255) NOT NULL UNIQUE
);
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON refunds USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Disputes (chargebacks): lifecycle from open through resolution
CREATE TABLE disputes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id),
  payment_intent_id     UUID NOT NULL REFERENCES payment_intents(id),
  gateway_dispute_id    VARCHAR(255) NOT NULL UNIQUE,        -- FluidPay's dispute/chargeback ID
  reason_code           VARCHAR(50),                        -- card network reason code
  reason_description    TEXT,
  amount_cents          INTEGER NOT NULL,
  currency              CHAR(3) NOT NULL DEFAULT 'USD',
  status                VARCHAR(30) NOT NULL DEFAULT 'NEEDS_RESPONSE'
                        CHECK (status IN ('NEEDS_RESPONSE','EVIDENCE_SUBMITTED','WON','LOST','APPEALED','WITHDRAWN','EXPIRED')),
  response_due_at       TIMESTAMPTZ NOT NULL,              -- merchant must respond by this date
  evidence              JSONB,                             -- uploaded evidence files and text
  evidence_submitted_at TIMESTAMPTZ,
  resolved_at           TIMESTAMPTZ,
  resolution_amount_cents INTEGER,                         -- amount recovered (WON) or debited (LOST)
  chargeback_fee_cents  INTEGER NOT NULL DEFAULT 1500,     -- read from platform_config at creation time
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON disputes USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_disputes_status ON disputes(tenant_id, status, response_due_at);

-- Settlement batches: daily net proceed calculations
CREATE TABLE settlement_batches (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id),
  batch_date                DATE NOT NULL,
  status                    VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING','PROCESSING','COMPLETED','FAILED')),
  gross_sales_cents         INTEGER NOT NULL DEFAULT 0,
  returns_cents             INTEGER NOT NULL DEFAULT 0,
  disputes_debited_cents    INTEGER NOT NULL DEFAULT 0,
  processing_fees_cents     INTEGER NOT NULL DEFAULT 0,
  subscription_deducted_cents INTEGER NOT NULL DEFAULT 0,
  royalties_deducted_cents  INTEGER NOT NULL DEFAULT 0,
  
  -- OP-RETAIL-01 [Ledger Delivery Refactor]
  -- Replaces unified delivery tracking with atomic JSONB structure explicitly separating sub-atomic driver fees from markup
  settlement_split          JSONB NOT NULL DEFAULT '{"driver_base_cents": 0, "paysurity_markup_cents": 0}',

  net_proceeds_cents        INTEGER NOT NULL DEFAULT 0,    -- disbursed to merchant bank
  gateway_batch_id          VARCHAR(255),
  bank_ach_trace_number     VARCHAR(50),
  bank_disbursed_at         TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, batch_date)
);
ALTER TABLE settlement_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON settlement_batches USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Gateway configs: one per tenant (stores encrypted credentials reference)
CREATE TABLE gateway_configurations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) UNIQUE,
  gateway_provider  VARCHAR(30) NOT NULL DEFAULT 'FLUIDS_PAY',
  merchant_id       VARCHAR(255) NOT NULL,           -- FluidPay merchant ID (not secret; safe to store)
  api_key_secret_ref VARCHAR(255) NOT NULL,          -- GCP Secret Manager resource name — NEVER store actual key
  terminal_key_secret_ref VARCHAR(255),              -- Terminal encryption key secret ref
  processing_mode   VARCHAR(20) NOT NULL DEFAULT 'ISO'
                    CHECK (processing_mode IN ('ISO','PAYFAC','DIRECT')),
  settlement_account_last4 VARCHAR(4),               -- bank account last-4 (display only)
  settlement_routing_number_ref VARCHAR(255),        -- GCP secret ref — encrypted routing#
  settlement_account_number_ref VARCHAR(255),        -- GCP secret ref — encrypted account#
  interchange_model VARCHAR(20) NOT NULL DEFAULT 'FLAT_RATE'
                    CHECK (interchange_model IN ('FLAT_RATE','INTERCHANGE_PLUS','TIERED')),
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- RLS: only PaySurity internal services can read gateway_configurations (not merchant API keys)
ALTER TABLE gateway_configurations ENABLE ROW LEVEL SECURITY;
CREATE POLICY internal_only ON gateway_configurations USING (
  current_setting('app.role', TRUE) IN ('INTERNAL_SERVICE','PAYSURITY_ADMIN')
);
```

**Seed:** `db/seeds/005_orc_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable, min_value, max_value)
VALUES
  ('orc.fluids_pay.base_url',           'https://api.fluidspay.com/api', 'string',  'FluidPay base API URL',                         FALSE, NULL, NULL),
  ('orc.fluids_pay.sandbox_base_url',   'https://sandbox.fluidspay.com/api','string','FluidPay sandbox URL (dev/staging only)',       FALSE, NULL, NULL),
  ('orc.fluids_pay.api_version',        'v1',            'string',  'FluidPay API version prefix',                    FALSE, NULL, NULL),
  ('orc.gateway.auth_timeout_ms',       '30000',         'duration_ms','Gateway auth timeout before retry',           FALSE, '5000','60000'),
  ('orc.gateway.capture_timeout_ms',    '30000',         'duration_ms','Gateway capture timeout',                     FALSE, '5000','60000'),
  ('orc.gateway.retry_max_attempts',    '3',             'integer', 'Max retries on gateway timeout (not declines)',   FALSE, '1', '5'),
  ('orc.gateway.retry_backoff_ms',      '1000',          'duration_ms','Base backoff between retries (exponential)',   FALSE, '500','5000'),
  ('orc.cash.rounding_cents',           '0',             'integer', 'Rounding cents for cash transactions (0=exact)',  TRUE,  '0', '5'),
  ('orc.ach.max_amount_cents',          '100000000',     'integer', 'FedNow max per transaction in cents ($1M)',       FALSE, NULL, NULL),
  ('orc.ach.settlement_days',           '0',             'integer', 'FedNow/RTP Atomic Settlement (sub-second)',      FALSE, '0', '0'),
  ('orc.dispute.response_window_days',  '7',             'integer', 'Merchant days to respond to dispute before auto-escalation', FALSE,'1','21'),
  ('orc.dispute.chargeback_fee_cents',  '1500',          'integer', 'Chargeback processing fee in cents ($15)',        FALSE, NULL, NULL),
  ('orc.settlement.cutoff_hour_utc',    '3',             'integer', 'Hour (UTC) after which transactions roll to next batch', FALSE,'0','23'),
  ('orc.pci.tokenize_endpoint',         '/transaction/sale','string','FluidPay endpoint for card-present auth+capture',FALSE, NULL, NULL),
  ('orc.pci.void_endpoint',             '/transaction/void','string','FluidPay endpoint for void',                   FALSE, NULL, NULL),
  ('orc.pci.refund_endpoint',           '/transaction/refund','string','FluidPay endpoint for refund',               FALSE, NULL, NULL)
ON CONFLICT (key) DO NOTHING;

-- BistroBeest gateway config (dev/staging: points to sandbox)
DO $$ BEGIN
  IF current_setting('app.environment', TRUE) IN ('development','staging') THEN
    INSERT INTO gateway_configurations (tenant_id, gateway_provider, merchant_id, api_key_secret_ref, processing_mode, interchange_model)
    VALUES (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'FLUIDS_PAY',
      'bistrobeest-sandbox-merchant-id',
      'projects/paysurity-dev/secrets/bistrobeest-fluids-sandbox-key/versions/latest',
      'ISO',
      'FLAT_RATE'
    ) ON CONFLICT (tenant_id) DO NOTHING;
  END IF;
END $$;
```

---

## REQ-ORC-001: Payment Authorization & Capture

**Priority:** Must | **Actors:** POS Terminal, Consumer, FluidPay Gateway

---

#### Service Layer: `src/services/payment/payment.service.ts`

```typescript
/**
 * createPaymentIntent(params) — Creates a payment_intents record and calls FluidPay.
 * Reads gateway credentials from gateway_configurations (via GCP Secret Manager — never from env).
 * All timeouts and retry counts read from platform_config at call time.
 *
 * FluidPay call: POST {base_url}/{api_version}/transaction/sale
 * Headers: { Authorization: 'Bearer {api_key}', 'Content-Type': 'application/json' }
 * Body: { merchant_id, amount, payment_method: {card_present terminal_id} | {edge_token} }
 *
 * ADV-SEC-01 [Real-Time Edge Tokenization]:
 * legacy server-side vaulting flows (e.g. hosted iFrames communicating back to backend elements) are strictly prohibited.
 * ALL PANs MUST execute L3/e2e hardware native Edge-Tokenization before any payload payload traverses the PaySurity backend.
 *
 * On success (FluidPay response_code = '100'): status → CAPTURED, gateway_intent_id saved
 * On soft decline (response_code = '200'): status → FAILED, failure_code = 'SOFT_DECLINE'
 * On hard decline (response_code = '300+'): status → FAILED, failure_code = 'HARD_DECLINE'
 * On timeout: retry up to orc.gateway.retry_max_attempts with exponential backoff
 * After max retries: status → FAILED, failure_code = 'GATEWAY_TIMEOUT'
 * All retries idempotent (idempotency_key passed in FluidPay header 'X-Idempotency-Key')
 * 
 * OP-OFFLINE-06 [Financial Integrity Auth-Only]: 
 * If the physical store is offline (T_outage event active), online operations MUST inherently execute Auth-Only ('00') commands against the PAN. Capture functions are suspended until Physical Operations reconnect and perfectly reconcile the Vector Clocks minimizing financial liability for unfulfillable intents.
 */
async function createPaymentIntent(params: {
  tenantId: string;
  locationId: string;
  orderId?: string;
  amountCents: number;
  paymentMethodType: PaymentMethodType;
  terminalId?: string;            // for card-present
  edgeToken?: string;             // strictly L3/secure-enclave edge token (vaulting strictly prohibited)
  idempotencyKey: string;         // = order_id + ':payment:' + attempt_number
  metadata?: Record<string, string>;
}): Promise<PaymentIntent>

/**
 * voidPaymentIntent(intentId, reason) — Voids an authorized-but-not-captured intent.
 * Calls FluidPay POST /transaction/void.
 * If CAPTURED: throws VoidAfterCaptureError (must use refund instead).
 */
async voidPaymentIntent(intentId: string, reason: string, authorizedBy: string): Promise<void>

/**
 * createRefund(params) — Issues full or partial refund on a captured payment.
 * Calls FluidPay POST /transaction/refund.
 * Validates: refund amount ≤ (original captured - already refunded).
 * Writes refunds record. Updates payment_intent.status.
 * Triggers LOY reversal if loyalty was redeemed on this payment.
 * Triggers TAX reversal record if applicable.
 * Fires webhook: payment.refunded
 */
async createRefund(params: {
  paymentIntentId: string;
  amountCents: number;
  reason: RefundReason;
  reasonNote?: string;
  initiatedBy: string;
  idempotencyKey: string;
}): Promise<Refund>
```

---

#### API Endpoints

| Method | Path | Auth | Description | Webhook |
|---|---|---|---|---|
| `POST` | `/v1/payments/intents` | POS Session / API Key | Create and process payment | `payment.succeeded` or `payment.failed` |
| `GET` | `/v1/payments/intents/{id}` | Merchant Admin, API Key | Get payment intent detail | — |
| `POST` | `/v1/payments/intents/{id}/void` | Manager, API Key | Void auth | `payment.voided` |
| `POST` | `/v1/payments/intents/{id}/refunds` | Manager, API Key | Create refund | `payment.refunded` |
| `GET` | `/v1/payments/intents/{id}/refunds` | Merchant Admin, API Key | List refunds for intent | — |
| `GET` | `/v1/payments` | Merchant Admin, API Key | List payments (paginated, filterable) | — |

**FluidPay Integration Contract:**

| Operation | Method | Path | Auth Header | Idempotency |
|---|---|---|---|---|
| Auth + Capture | POST | `/api/v1/transaction/sale` | `Authorization: Bearer {secret}` | `X-Idempotency-Key: {key}` |
| Void | POST | `/api/v1/transaction/void` | Same | Same |
| Refund | POST | `/api/v1/transaction/refund` | Same | Same |
| Get Transaction | GET | `/api/v1/transaction/{id}` | Same | — |
| Webhook events inbound | POST | (PaySurity receives at `/webhooks/fluids-pay`) | HMAC-SHA256 sig in `X-FluidPay-Signature` | — |

**FluidPay Success Response Structure (stored in `gateway_response` JSONB):**
```json
{
  "id": "fluidspay-txn-uuid",
  "status": "approved",
  "response_code": "100",
  "auth_code": "TAS123",
  "amount": 2890,
  "created_at": "2026-03-12T19:34:00Z",
  "card": { "last_four": "4242", "type": "visa", "cardholder_name": "Maria Lopez" }
}
```

---

#### Acceptance Tests

| Test ID | Scenario | Input | Expected |
|---|---|---|---|
| ORC-001-T1 | Successful card-present | $28.90, FluidPay sandbox card 4242424242424242 | CAPTURED; gateway_intent_id persisted; `payment.succeeded` webhook |
| ORC-001-T2 | Soft decline | Sandbox card 4000000000000002 | FAILED; failure_code=SOFT_DECLINE; no retry; `payment.failed` webhook |
| ORC-001-T3 | Gateway timeout | Mock FluidPay to return 504 | Retry 3× with backoff; after 3 failures: FAILED, failure_code=GATEWAY_TIMEOUT |
| ORC-001-T4 | Idempotent duplicate | Same idempotency_key twice | Second call returns existing payment_intent; no second charge |
| ORC-001-T5 | Partial refund | $28.90 captured, refund $10 | Refund SUCCEEDED; PI status=PARTIALLY_REFUNDED; LOY reversal proportional |
| ORC-001-T6 | Full refund | $28.90 captured, refund $28.90 | PI status=REFUNDED; full LOY reversal |

---

## REQ-ORC-002: Dispute (Chargeback) Lifecycle Management

**Priority:** Must | **Actors:** Consumer (bank-initiated), Merchant Admin, FluidPay

---

#### Context

Disputes are initiated by the card-issuing bank on behalf of the consumer. PaySurity receives a webhook from FluidPay, creates a `disputes` record, debits the disputed amount from the merchant's settlement, and gives the merchant a time-bounded window to submit evidence.

#### Service Layer: `src/services/payment/dispute.service.ts`

```typescript
/**
 * handleDisputeWebhook(fluidPayPayload) — Receives FluidPay dispute webhooks.
 * Events: dispute.created | dispute.updated | dispute.won | dispute.lost
 * On dispute.created: creates disputes record, deducts amount from next settlement batch,
 *                     adds chargeback_fee_cents (from platform_config), notifies merchant via NOT.
 * On dispute.won: credits amount back to next settlement, updates status=WON.
 * On dispute.lost: updates status=LOST, ensures amount already deducted.
 */
async handleDisputeWebhook(payload: FluidPayDisputeWebhook): Promise<void>

/**
 * submitEvidence(disputeId, evidence) — Merchant submits chargeback response.
 * evidence: { compelling_evidence: string, refund_attempt: boolean, files: FileRef[] }
 * Calls FluidPay PATCH /dispute/{gateway_dispute_id}/evidence
 * Updates disputes.evidence, disputes.evidence_submitted_at, disputes.status=EVIDENCE_SUBMITTED
 * Evidence window must not be past disputes.response_due_at — validates before submission.
 */
async submitEvidence(disputeId: string, evidence: DisputeEvidence, submittedBy: string): Promise<void>
```

#### API Endpoints

| Method | Path | Auth | Description | Webhook |
|---|---|---|---|---|
| `GET` | `/v1/disputes` | Merchant Admin | List disputes (filter by status) | — |
| `GET` | `/v1/disputes/{id}` | Merchant Admin | Dispute detail + evidence | — |
| `POST` | `/v1/disputes/{id}/evidence` | Merchant Admin | Submit evidence | `dispute.evidence_submitted` |
| `POST` | `/webhooks/fluids-pay/dispute` | FluidPay (HMAC verified) | Receive dispute events | Internal |

**UI — Dispute Management Screen:**  
> Red banner on Merchant Portal top nav: "⚠️ 1 dispute requires your response by [DATE]"  
> Disputes table: columns = Status | Amount | Reason | Response Due | Days Remaining  
> "NEEDS_RESPONSE" rows sorted first  
> Tap dispute → full detail: original transaction, consumer name, reason code with plain-English explanation  
> Evidence upload: text field "Your response" + file upload (max 10MB, accepted: PDF, JPG, PNG)  
> "Submit Evidence" button — disabled if past `response_due_at`  
> After submit: status chip changes to "Submitted — awaiting decision"

---

## REQ-ORC-003: Daily Settlement Processing

**Priority:** Must | **Actors:** Finance Admin, External Accountant, Automated Batch

---

#### Service Layer: `src/services/payment/settlement.service.ts`

```typescript
/**
 * runSettlementBatch(tenantId, batchDate) — Nightly job per tenant.
 * 1. Sum all payment_intents with status=CAPTURED, created_at < cutoff_hour (config)
 * 2. Subtract refunds for this period
 * 3. Subtract dispute debits
 * 4. Calculate processing fee (read rate from config — interchange model)
 * 5. Deduct daily subscription pro-ration (monthly_fee ÷ 30; read tier from subscriptions table)
 * 6. Deduct any royalty amounts due (from frn_royalty_debits table)
 * 7. Call FluidPay to initiate ACH disbursement to merchant bank
 * 8. Write settlement_batches record
 * 9. Fire webhook: settlement.completed
 * All debits/credits idempotent via settlement_batches UNIQUE(tenant_id, batch_date)
 * 
 * OP-RETAIL-07 [Mathematical Trace: Commission Parity]:
 * Constraints applied during settlement execution:
 * A) Rounding Integrity: The ORC engine MUST utilize BigInt or exact Decimal mathematical types exclusively. Floating point calculations are mathematically prohibited.
 * B) Markup Parity: PaySurity's platform margin MUST mathematically clear first (Priority 0). In the event of a Partial Refund or Failed Delivery Hand-off, the Merchant/Driver swallows the deficit; PaySurity’s Revenue Ledger never prorates downward.
 * C) ISO 20022 Sync: All computed outputs MUST map precisely to the ISO 20022 <Chrgs> (Charges) and <Tax> blocks encoded natively in the pacs.008 disbursement payload.
 * 
 * ADV-ONB-09 [Probationary Limits]:
 * - **isSettlementEligible() Sentry:** The orchestration pipeline must dynamically intercept all PROVISIONAL sweeps. 
 * - **Threshold Matrix:** During the first 10 cycles, the system strictly enforces a maximum liquidity clearance of exactly $200 per transaction array. Volumes surpassing this are aggressively sharded and sequestered securely within the Sovereign Liquidity Vault until passing full eCDD criteria. 
 */
async function runSettlementBatch(tenantId: string, batchDate: Date): Promise<SettlementBatch>
```

**Batch Job:** `settlement.nightly_reconcile` | **Cron:** `0 3 * * *`  
Runs for ALL active tenants. Uses a cursor/pagination pattern — does not load all tenants at once.  
Logs each tenant batch to `batch_job_runs` with `records_processed = 1` per tenant.

**Settlement webhook payload:**
```json
{
  "event": "settlement.completed",
  "tenant_id": "uuid",
  "batch_date": "2026-03-12",
  "gross_sales_cents": 284500,
  "processing_fees_cents": 8245,
  "subscription_deducted_cents": 13333,
  "net_proceeds_cents": 262922,
  "bank_ach_trace": "021000089XXXXXX"
}
```

---

## REQ-ORC-004: Multi-Tender & Split Payments

**Priority:** Must | **Actors:** Consumer, Cashier, POS Terminal

---

Split tender: one order paid across multiple payment instruments. Common: loyalty discount + card; cash + card; gift card + card.

**Implementation rule:** Always process in this order:
1. Gift card (deduct from gift card ledger first — no network round trip risk)
2. Loyalty redemption discount (deduct from order total — reduces amount charged elsewhere)
3. Cash (record as cash payment — no network call)
4. Card present (FluidPay — only the remaining balance after above deductions)

**DB:** `payments` table (on `orders`) — one row per tender type per order.  
**Constraint:** `SUM(payments.amount_cents) WHERE order_id = X` must equal `orders.total_cents` after all tenders recorded.  
**Validation:** Payment service validates sum before closing order and throws `TENDER_MISMATCH` if they don't reconcile.

---

## REQ-ORC-005 through ORC-012 (Payment Types)

| REQ | Feature | Key Config | Gateway Call |
|---|---|---|---|
| ORC-005 | Card-not-present (hosted fields token) | `payment.gateway.timeout_ms` | FluidPay `/transaction/sale` with `payment_method.token` |
| ORC-006 | ACH (payroll, subscription billing) | `orc.ach.settlement_days`, NACHA format file | FluidPay ACH or separate NACHA file upload |
| ORC-007 | Gift card ledger | No gateway — internal `gift_card_balances` table | Deduct from balance; reserve on initiate; confirm on capture |
| ORC-008 | Offline store-and-forward | `posr.offline_queue_max_orders`, terminal HSM | Batch submit on reconnect via `/v1/pos/offline-sync` |
| ORC-009 | Surcharging (where legal) | `orc.surcharge_enabled`, `orc.surcharge_pct` — read from merchant_config | Applied to card_np only; not cash; disclosed on receipt |
| ORC-010 | Real-time payments (RTP/FedNow) | `orc.rtp.enabled`, `orc.rtp.max_amount_cents` | Phase 1 `Should` — FedNow API if certified in window |

```sql
-- Gift card balances table (REQ-ORC-007)
CREATE TABLE gift_card_balances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  card_code       VARCHAR(50) NOT NULL,
  card_code_hash  VARCHAR(255) NOT NULL UNIQUE,  -- bcrypt hash of card_code for lookup without exposure
  initial_amount_cents INTEGER NOT NULL,
  current_balance_cents INTEGER NOT NULL CHECK (current_balance_cents >= 0),
  expires_at      TIMESTAMPTZ,                   -- NULL = no expiry (state law dependent)
  issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at    TIMESTAMPTZ,
  status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                  CHECK (status IN ('ACTIVE','REDEEMED','VOID','EXPIRED'))
);
ALTER TABLE gift_card_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON gift_card_balances USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

---


## Valor EMV L3 Integration (Global Functional)
- **REQ-01**: Valor Terminal Handshake & Initialization (EMV L3)
- **REQ-02**: Tokenized Cryptogram Exchange
- **REQ-03**: Network Resilience & Comm-Drop Recovery
- **REQ-04**: Receipt Formatting & Terminal Sync


## PaySurity Advantage (Superiority V2.0)
**ADV-004 [Transparent Ledger]:** Settlement Reporting Enhancement. Mandatory Constraint: Fee Atomic Visibility. Every transaction record must explicitly expose Interchange, Scheme, and Markup components to the end-user in real-time.
