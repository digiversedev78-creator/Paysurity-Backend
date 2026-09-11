# Canonical Requirements: POS Retail
**Vertical:** POS Retail (POSR2) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Key Differences from POSR (Restaurant):** No KDS, no tables, no covers. Focus: returns, exchanges, inventory, gift cards, layaway, employee discounts.

---

## Database Schema

**Migration:** `db/migrations/012_pos_retail.sql`

```sql
-- Returns/exchanges: separate from refunds (refund = payment reversal; return = product lifecycle)
CREATE TABLE retail_returns (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  original_order_id UUID NOT NULL REFERENCES orders(id),
  return_type       VARCHAR(20) NOT NULL
                    CHECK (return_type IN ('RETURN_REFUND','EXCHANGE','STORE_CREDIT')),
  status            VARCHAR(20) NOT NULL DEFAULT 'INITIATED'
                    CHECK (status IN ('INITIATED','ITEMS_RECEIVED','REFUND_ISSUED','COMPLETED','DENIED')),
  cashier_user_id   UUID NOT NULL REFERENCES users(id),
  return_items      JSONB NOT NULL DEFAULT '[]',  -- [{order_item_id, quantity, reason}]
  condition         VARCHAR(20) CHECK (condition IN ('UNOPENED','OPENED','DAMAGED','DEFECTIVE')),
  refund_method     VARCHAR(20)                   -- 'ORIGINAL_TENDER' | 'STORE_CREDIT' | 'EXCHANGE'
                    CHECK (refund_method IN ('ORIGINAL_TENDER','STORE_CREDIT','EXCHANGE')),
  refund_amount_cents INTEGER,
  store_credit_issued_cents INTEGER NOT NULL DEFAULT 0,
  manager_override_required BOOLEAN NOT NULL DEFAULT FALSE,
  manager_approved_by UUID REFERENCES users(id),
  notes             TEXT,
  days_since_purchase INTEGER,                    -- computed for policy enforcement
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE retail_returns ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON retail_returns USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Gift cards: issued by merchant, redeemable at POS and online
CREATE TABLE gift_cards (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  card_number_hash  VARCHAR(255) NOT NULL UNIQUE,  -- bcrypt hash; display last 4 only
  card_last_four    VARCHAR(4) NOT NULL,
  initial_value_cents INTEGER NOT NULL,
  current_balance_cents INTEGER NOT NULL DEFAULT 0 CHECK (current_balance_cents >= 0),
  status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','DEPLETED','VOIDED','EXPIRED')),
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ,                   -- NULL = no expiry (check config)
  consumer_id       UUID REFERENCES consumers(id), -- if registered to a consumer
  issued_by_order_id UUID REFERENCES orders(id),   -- the sale order that issued this card
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON gift_cards USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE TEXT SEARCH INDEX IF NOT EXISTS idx_gift_cards_last4 ON gift_cards(card_last_four, tenant_id);

-- POS Cash Control & Shift Register Sessions (Odoo Parity)
CREATE TABLE retail_cash_control_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  terminal_id       VARCHAR(50) NOT NULL,
  cashier_user_id   UUID NOT NULL REFERENCES users(id),
  opened_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at         TIMESTAMPTZ,
  opening_cash_cents INTEGER NOT NULL DEFAULT 0,
  expected_closing_cents INTEGER NOT NULL DEFAULT 0,
  actual_closing_cents   INTEGER,
  variance_cents         INTEGER,
  max_acceptable_variance_cents INTEGER NOT NULL DEFAULT 500, -- Maximum $5 drift permitted
  status            VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CASH_COUNT', 'CLOSED', 'SUPERVISOR_REVIEW')),
  notes             TEXT
);
ALTER TABLE retail_cash_control_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON retail_cash_control_sessions USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Product Multi-Barcode Mapping (Odoo Parity)
-- Allows N supplier barcodes to map to exactly 1 internal SKU
CREATE TABLE retail_multi_barcodes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  product_id      UUID NOT NULL REFERENCES menu_items(id),
  barcode         VARCHAR(255) NOT NULL,
  supplier_id     UUID REFERENCES suppliers(id), -- Specific barcode tied to specific vendor shipment
  UNIQUE(tenant_id, barcode)
);
ALTER TABLE retail_multi_barcodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON retail_multi_barcodes USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE TABLE employee_discount_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  applies_to_role VARCHAR(30) NOT NULL,
  discount_type   VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENT','FLAT_CENTS')),
  discount_value  INTEGER NOT NULL,             -- % (0-100) or cents
  max_per_day_cents INTEGER,                    -- daily limit on discount usage
  requires_manager_pin BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, applies_to_role)
);
ALTER TABLE employee_discount_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON employee_discount_rules USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Seed:** `db/seeds/012_retail_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable, min_value, max_value)
VALUES
  ('pos_retail.return.window_days',          '30',    'integer', 'Default return window in days', TRUE, '0', '365'),
  ('pos_retail.return.receipt_required',     'true',  'boolean', 'Receipt required for refunds to original tender', TRUE, NULL, NULL),
  ('pos_retail.return.no_receipt_method',    'STORE_CREDIT', 'string', 'Without receipt: STORE_CREDIT | EXCHANGE | DENY', TRUE, NULL, NULL),
  ('pos_retail.return.manager_over_cents',   '5000',  'integer', 'Returns over this amount require manager ($50)', TRUE, '0', '100000'),
  ('pos_retail.return.damaged_allowed',      'true',  'boolean', 'Allow returns on OPENED items', TRUE, NULL, NULL),
  ('pos_retail.gift_card.enabled',           'true',  'boolean', 'Gift card feature enabled', TRUE, NULL, NULL),
  ('pos_retail.gift_card.min_value_cents',   '500',   'integer', 'Minimum gift card purchase ($5)', TRUE, '100', '100000'),
  ('pos_retail.gift_card.max_value_cents',   '50000', 'integer', 'Maximum gift card value ($500)', TRUE, '1000', '1000000'),
  ('pos_retail.gift_card.expiry_months',     '0',     'integer', '0 = no expiry (some states forbid expiry; check compliance)', TRUE, '0', '60'),
  ('pos_retail.price_match.enabled',         'false', 'boolean', 'Price matching feature enabled', TRUE, NULL, NULL),
  ('pos_retail.price_match.requires_manager','true',  'boolean', 'Price match requires manager approval', FALSE, NULL, NULL),
  ('pos_retail.layaway.enabled',             'false', 'boolean', 'Layaway feature enabled', TRUE, NULL, NULL),
  ('pos_retail.layaway.deposit_pct',         '20',    'integer', 'Layaway deposit percentage', TRUE, '10', '50'),
  ('pos_retail.layaway.term_days',           '60',    'integer', 'Layaway payment term in days', TRUE, '14', '180')
ON CONFLICT (key) DO NOTHING;
```

---

## REQ-POSR2-001: Returns & Exchanges

```typescript
/**
 * initiateReturn(params) — Cashier starts return process.
 * 1. Load original order; verify it exists and was FULFILLED
 * 2. Calculate days_since_purchase
 * 3. If > 'pos_retail.return.window_days' config AND no manager present → DENIED
 * 4. If refund_amount_cents > 'pos_retail.return.manager_over_cents' → set manager_override_required=TRUE
 *    → block until manager PIN entered and manager_approved_by set
 * 5. If return_type=RETURN_REFUND: call ORC.refund() (refunds to original payment method)
 * 6. If return_type=STORE_CREDIT: credit gift_card or loyalty wallet
 * 7. If return_type=EXCHANGE: initiate new order of equal value; no payment processed
 * 8. BORA (Buy Online, Return Anywhere): Cross-reference ECO_ECOMMERCE fulfillment IDs. Natively validate E-Commerce invoices.
 * 9. Restore inventory: Immediate Inventory Ingestion into the specific physical store's local stock pool (incrementing quantity).
 * Write retail_returns; write frn_audit_events (if franchise — tracks return rates per location)
 */
async initiateReturn(params: {
  originalOrderId: string;
  returnType: ReturnType;
  returnItems: Array<{ orderItemId: string; quantity: number; reason: string }>;
  condition: string;
  cashierId: string;
  managerId?: string;
}): Promise<RetailReturn>
```

---

## REQ-POSR2-002: Gift Cards

```typescript
/**
 * issueGiftCard(amountCents, tenantId, consumerId?) — Sells a gift card.
 * 1. Validate amount within config min/max
 * 2. Generate card_number (crypto.randomBytes(8) → 16-digit decimal string)
 * 3. Hash card_number; store last 4 + hash in DB
 * 4. Creates gift_cards record; ties to order as issued_by_order_id
 * 5. If consumerId: link to consumer; send digital card via email
 * 6. PhysicalCard: prints card number on receipt
 * Returns: { card_last_four, initial_value_cents } — FULL NUMBER SHOWN ONCE ON RECEIPT ONLY
 */
async issueGiftCard(amountCents: number, tenantId: string, consumerId?: string): Promise<GiftCard>

/**
 * redeemGiftCard(cardNumber, amountCents, orderId) — Use gift card at checkout.
 * SELECT FOR UPDATE on gift_cards WHERE card_number_hash=hash(cardNumber) AND tenant_id
 * Validate status=ACTIVE; validate current_balance_cents >= amountCents
 * Deduct balance; write wallet_transactions-style log (gift_card.redeemed event)
 * If balance depleted: status→DEPLETED
 */
async redeemGiftCard(cardNumber: string, amountCents: number, orderId: string): Promise<GiftCardRedemption>
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/retail/returns` | Cashier, Location Mgr | Initiate return |
| `PATCH` | `/v1/retail/returns/{id}/approve` | Location Mgr (PIN) | Manager approve large return |
| `GET` | `/v1/retail/returns` | Location Mgr | Return history |
| `POST` | `/v1/retail/gift-cards` | Cashier | Issue gift card |
| `GET` | `/v1/retail/gift-cards/{last4}/balance` | Consumer, Cashier | Check balance |
| `POST` | `/v1/retail/gift-cards/redeem` | Cashier (via order) | Redeem at checkout |
| `GET` | `/v1/retail/employee-discounts` | Merchant Admin | Discount rules |
| `POST` | `/v1/retail/employee-discounts` | Merchant Admin | Create rule |
| `POST` | `/v1/retail/price-match` | Cashier + Manager PIN | Apply price match |


## Valor EMV L3 Retail Controls
- **REQ-10**: L3 Data Enrichment (SKU, tax, and itemized passing to terminal).
- **REQ-11**: Dual Pricing (Cash Discount vs Card Surcharge displays on customer-facing terminal).

---

## PaySurity Advantage (Superiority V2.0)

**ADV-RETAIL-06 [Atomic Post-Payment Sync]:**
Replaces the flawed pre-payment 'Lock on Scan' concept.
Mandatory Constraint: Inventory deduction across the global network must execute concurrently with the physical POS payment `COMMIT` phase via the BullMQ bus with strict latency $T_{sync} < 500ms$. This guarantees physical sales immediately extinguish e-commerce stock without inducing false cart-abandonment locks.

**ADV-RETAIL-07 [AI Return Sentry: Physical Identity Verification]:**
Pivoting from purely financial validation to physical SKU integrity.
Mandatory Constraint: The system must enforce dynamic visual and weight-based SKU matching during the physical return sequence, utilizing connected scales and POS camera hardware. The AI acts as a physical gatekeeper to detect box stuffing or product switching, flagging anomalies for a Manager OTP.

**ADV-RETAIL-08 [Register-Native Clienteling]:**
Eliminates the 'Pro' upgrade tier utilized by competitors.
Mandatory Constraint: The POS must natively inject Contextual Recommendations driven by AI directly onto the cashier screen based on customer purchase history and real-time cart taxonomy, elevating average order value autonomously.
