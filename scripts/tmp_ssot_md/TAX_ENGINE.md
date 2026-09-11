# Canonical Requirements: Sales Tax Engine
**Vertical:** Tax Engine (TAX) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)  
**Provider:** TaxJar API v2 (primary) | Fallback: static `tax_override_rates` table

---

## Database Schema

**Migration:** `db/migrations/020_tax_engine.sql`

```sql
-- Real-time tax calculation results: one row per order tax lookup (cached by hash)
CREATE TABLE tax_calculations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  location_id       UUID NOT NULL REFERENCES locations(id),
  order_id          UUID REFERENCES orders(id),           -- set when tied to an order
  request_hash      VARCHAR(64) NOT NULL,                  -- SHA-256 of (location_id + items JSON + amount) — for cache
  -- Jurisdiction (AMBIGUITY #17 CLOSED — see below)
  jurisdiction_state   VARCHAR(2) NOT NULL,  -- 2-letter state code of the FULFILLING LOCATION
  jurisdiction_county  VARCHAR(100),
  jurisdiction_city    VARCHAR(100),
  jurisdiction_zip     VARCHAR(10),
  -- Amounts
  taxable_amount_cents INTEGER NOT NULL,
  exempt_amount_cents  INTEGER NOT NULL DEFAULT 0,
  tax_cents            INTEGER NOT NULL,
  effective_rate_bps   INTEGER NOT NULL,                   -- basis points; e.g. 1025 = 10.25%
  -- TaxJar response details
  provider            VARCHAR(20) NOT NULL DEFAULT 'TAXJAR'
                      CHECK (provider IN ('TAXJAR','OVERRIDE_TABLE','CACHED','OFFLINE_ESTIMATE')),
  taxjar_response     JSONB,               -- full TaxJar /v2/taxes response stored verbatim
  -- Commit status (TaxJar /v2/transactions — for remittance tracking)
  committed           BOOLEAN NOT NULL DEFAULT FALSE,      -- FALSE = quote only; TRUE = committed to TaxJar
  committed_at        TIMESTAMPTZ,
  taxjar_transaction_id VARCHAR(255),
  voided_at           TIMESTAMPTZ,
  voided_transaction_id VARCHAR(255),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tax_calculations
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_tax_calc_hash ON tax_calculations(request_hash, created_at DESC);
CREATE INDEX idx_tax_calc_order ON tax_calculations(order_id) WHERE order_id IS NOT NULL;

-- Override rates: used when TaxJar is offline OR for jurisdictions with known TaxJar gaps
CREATE TABLE tax_override_rates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id),  -- NULL = platform-level default
  state         VARCHAR(2) NOT NULL,
  county        VARCHAR(100),                  -- NULL = state-wide
  city          VARCHAR(100),                  -- NULL = county-wide
  zip           VARCHAR(10),                   -- most specific wins
  product_category VARCHAR(50) NOT NULL DEFAULT 'GENERAL'
                CHECK (product_category IN (
                  'GENERAL',
                  'FOOD_RESTAURANT',            -- prepared food sold hot (taxable in most states)
                  'FOOD_GROCERY',               -- unprepared food (exempt in IL, CA, etc.)
                  'FOOD_COLD_PREPARED',         -- cold prepared food (some states tax, some don't)
                  'ALCOHOL',                    -- always taxable; often higher rate
                  'NON_FOOD',                   -- retail items
                  'SERVICE'                     -- service charges
                )),
  rate_bps      INTEGER NOT NULL,             -- e.g. 1025 = 10.25%
  effective_from DATE NOT NULL,
  effective_to   DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(state, county, city, zip, product_category, effective_from)
);

-- Tax exemptions: for EBT (SNAP), nonprofits, resellers
CREATE TABLE tax_exemptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  consumer_id       UUID REFERENCES consumers(id),
  exemption_type    VARCHAR(30) NOT NULL
                    CHECK (exemption_type IN ('EBT_SNAP','NONPROFIT','RESALE','DIPLOMATIC','GOVERNMENT')),
  exempt_states     VARCHAR(2)[] NOT NULL DEFAULT '{}',  -- empty = all states
  certificate_ref   VARCHAR(255),                        -- GCS path to exemption certificate PDF
  valid_from        DATE NOT NULL,
  valid_to          DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE tax_exemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tax_exemptions
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Nexus tracking: where merchant has economic nexus obligation
CREATE TABLE tax_nexus (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  legal_entity_id UUID NOT NULL REFERENCES legal_entities(id),
  state           VARCHAR(2) NOT NULL,
  nexus_type      VARCHAR(20) NOT NULL
                  CHECK (nexus_type IN ('PHYSICAL','ECONOMIC','MARKETPLACE')),
  established_date DATE NOT NULL,
  registered       BOOLEAN NOT NULL DEFAULT FALSE,
  registration_number VARCHAR(50),
  UNIQUE(legal_entity_id, state)
);
ALTER TABLE tax_nexus ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tax_nexus
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Seed:** `db/seeds/020_tax_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  -- AMBIGUITY #15 CLOSED:
  -- TaxJar uses TWO endpoints for TWO distinct purposes (not one or the other):
  -- /v2/taxes → QUOTE mode (called at checkout; does NOT commit to TaxJar ledger)
  -- /v2/transactions → COMMIT mode (called after order FULFILLED; creates remittance record)
  ('tax.taxjar.base_url',             'https://api.taxjar.com', 'string', 'TaxJar API base URL', FALSE),
  ('tax.taxjar.quote_endpoint',       '/v2/taxes',              'string', 'TaxJar endpoint for real-time tax quote (quote mode; does NOT commit)', FALSE),
  ('tax.taxjar.commit_endpoint',      '/v2/transactions',       'string', 'TaxJar endpoint for committing fulfilled order to remittance ledger', FALSE),
  ('tax.taxjar.void_endpoint',        '/v2/transactions/{id}',  'string', 'TaxJar endpoint for voiding a committed transaction (DELETE method)', FALSE),
  ('tax.taxjar.rate_endpoint',        '/v2/rates/{zip}',        'string', 'TaxJar endpoint for fallback rate lookup by zip', FALSE),
  ('tax.taxjar.api_version',          'v2',                     'string', 'TaxJar API version', FALSE),
  ('tax.taxjar.timeout_ms',           '3000',  'integer', 'TaxJar call timeout before fallback to override table', FALSE, '1000', '10000'),
  ('tax.taxjar.cache_ttl_sec',        '3600',  'integer', 'Tax calculation cache TTL in seconds (cached by request_hash)', FALSE, '300', '86400'),
  -- AMBIGUITY #17 CLOSED:
  -- Multi-location tax jurisdiction: the FULFILLING LOCATION determines jurisdiction.
  -- "Fulfilling location" = the location where the order is prepared and/or picked up.
  -- Delivery to consumer's home: STILL the restaurant's address jurisdiction (not consumer's zip).
  -- This is the standard for prepared food tax in all US states. Consumer zip is NEVER used.
  ('tax.jurisdiction.basis',          'FULFILLING_LOCATION',    'string', 'Tax jurisdiction source: always the location where order is prepared. Consumer address NEVER used for restaurant tax.', FALSE),
  ('tax.fallback.use_override_table', 'true',   'boolean', 'Fall back to tax_override_rates if TaxJar times out or errors', FALSE),
  ('tax.fallback.estimate_rate_bps',  '1025',   'integer', 'Last-resort estimate rate if both TaxJar and override table fail (Chicago blended: 10.25%)', FALSE, '0', '2000'),
  -- Product category mapping: each menu_item.category slug maps to a TaxJar product_tax_code
  ('tax.product_code.FOOD_RESTAURANT','41000',  'string', 'TaxJar product tax code for hot prepared food', FALSE),
  ('tax.product_code.FOOD_COLD',      '41010',  'string', 'TaxJar product tax code for cold prepared food', FALSE),
  ('tax.product_code.ALCOHOL',        '41010',  'string', 'TaxJar product tax code for alcohol', FALSE),
  ('tax.product_code.NON_FOOD',       '00000',  'string', 'TaxJar product tax code for general merchandise', FALSE),
  ('tax.1099k_threshold_cents',       '60000',  'integer', 'IRS 1099-K threshold in cents ($600 IRS 2024+; update annually in DB, not in code)', FALSE)
ON CONFLICT (key) DO NOTHING;

-- BistroBeest override rates for offline fallback (Chicago)
INSERT INTO tax_override_rates (state, county, city, zip, product_category, rate_bps, effective_from)
VALUES
  ('IL', 'Cook', 'Chicago', '60654', 'FOOD_RESTAURANT', 1025, '2024-01-01'),  -- Chicago prepared food
  ('IL', 'Cook', 'Chicago', '60654', 'ALCOHOL',         1025, '2024-01-01'),  -- same blended rate
  ('IL', 'Cook', 'Chicago', '60654', 'NON_FOOD',        1025, '2024-01-01'),
  ('IL', 'Cook', NULL,       NULL,   'FOOD_RESTAURANT',  825, '2024-01-01'),  -- Cook County outside Chicago
  ('IL', NULL,   NULL,       NULL,   'FOOD_GROCERY',       0, '2024-01-01')   -- IL grocery exemption
ON CONFLICT DO NOTHING;

-- BistroBeest nexus: physical presence in Illinois
DO $$ BEGIN
  IF current_setting('app.environment', TRUE) IN ('development','staging') THEN
    INSERT INTO tax_nexus (tenant_id, legal_entity_id, state, nexus_type, established_date, registered, registration_number)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111',
            'IL','PHYSICAL','2020-03-01',TRUE,'IL-BIZ-2020-XXXX')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
```

---

## REQ-TAX-001: Real-Time Tax Quote (Order Checkout)

**Priority:** Must | **Actors:** Order Service, POS Terminal, AI Session, Consumer

---

#### Context & Business Intent

Tax is calculated **at order close** (just before charging the consumer) — not at item add. This ensures the final charged amount reflects current tax law for the fulfilling location. The calculation must complete in < 500ms total (TaxJar timeout = 3s with fallback). Tax is never a hardcoded rate.

---

#### Service Layer: `src/modules/tax/tax.service.ts`

```typescript
/**
 * calculateOrderTax(params) — Called by order.service.closeOrder() and ai.service.convertHoldToOrder().
 *
 * JURISDICTION DETERMINATION (Ambiguity #17):
 * jurisdiction = locations' { address.state, address.city, address.zip }
 * NEVER use consumer's delivery address as jurisdiction for restaurant tax.
 * The restaurant's address is always the tax jurisdiction for prepared food.
 *
 * FLOW:
 * 1. Build request_hash: SHA-256(location_id + sorted_items_json + taxable_amount_cents)
 * 2. Check Redis cache: if hit and age < 'tax.taxjar.cache_ttl_sec' → return cached result
 * 3. Determine product_tax_code for each order item from menu_item.category.slug
 *    → lookup platform_config 'tax.product_code.{slug}' (always from DB)
 * 4. Check tax_exemptions for consumer_id (EBT/SNAP is the most common for grocery)
 * 5. Call TaxJar POST {base_url}/v2/taxes (quote mode — Ambiguity #15):
 *    Body: {
 *      from_street, from_city, from_state, from_zip = LOCATION address (always),
 *      to_street, to_city, to_state, to_zip = LOCATION address (delivery→same; pickup→same),
 *      amount: taxable_amount_cents / 100,   -- dollars required by TaxJar
 *      shipping: 0,
 *      line_items: [{id, quantity, unit_price, product_tax_code}]
 *    }
 *    Auth: header 'Authorization: Token {taxjar_api_key_from_secret_manager}'
 * 6. On TaxJar timeout (> tax.taxjar.timeout_ms): fall to step 6a
 *    6a. Query tax_override_rates: most specific match wins (zip → city → county → state)
 *    6b. If no override found: use 'tax.fallback.estimate_rate_bps' from config
 *    6c. Set provider = 'OVERRIDE_TABLE' or 'OFFLINE_ESTIMATE'
 * 7. Write tax_calculations record (committed=FALSE — quote only)
 * 8. Cache result in Redis: key = 'tax:{request_hash}', TTL from config
 * 9. Return: { tax_cents, effective_rate_bps, jurisdiction, provider, calculation_id }
 */
async calculateOrderTax(params: {
  tenantId: string;
  locationId: string;
  orderId?: string;
  items: Array<{ menuItemId: string; quantity: number; unitPriceCents: number }>;
  consumerId?: string;             // for exemption lookup
  taxableAmountCents: number;
}): Promise<TaxCalculationResult>

/**
 * commitTaxTransaction(calculationId, orderId) — Called AFTER payment captured.
 * AMBIGUITY #15: This is the SECOND TaxJar call — POST /v2/transactions (commit mode).
 * Creates a permanent record in TaxJar's remittance ledger.
 * Required for AutoFile (TaxJar automated state filing) to work.
 * Sets tax_calculations.committed=TRUE, committed_at=NOW(), taxjar_transaction_id.
 * Idempotent: if already committed, returns existing taxjar_transaction_id.
 */
async commitTaxTransaction(calculationId: string, orderId: string): Promise<void>

/**
 * voidTaxTransaction(calculationId, refundReason) — Called on full refund or order void.
 * Calls TaxJar DELETE /v2/transactions/{taxjar_transaction_id}.
 * Sets tax_calculations.voided_at, voided_transaction_id.
 * On partial refund: calls TaxJar POST /v2/refunds instead of void.
 */
async voidTaxTransaction(calculationId: string, refundAmountCents?: number): Promise<void>
```

---

#### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/tax/calculate` | Internal, API Key | Calculate tax on a set of items for a location |
| `GET` | `/v1/tax/rates/{zip}` | Merchant Admin | Look up current rate for a zip code |
| `GET` | `/v1/tax/nexus` | ENTERPRISE_FINANCE | List nexus states |
| `POST` | `/v1/tax/nexus` | ENTERPRISE_ADMIN | Add nexus state |
| `GET` | `/v1/tax/override-rates` | Merchant Admin | View offline fallback rates |
| `POST` | `/v1/tax/override-rates` | PAYSURITY_ADMIN | Add override rate |
| `GET` | `/v1/tax/calculations/{orderId}` | Merchant Admin | Tax detail for an order |
| `GET` | `/v1/tax/exemptions` | Merchant Admin | List consumer exemptions |
| `POST` | `/v1/tax/exemptions` | Merchant Admin | Add exemption |

---

#### Batch Jobs

**Job:** `tax.commit_fulfillled_orders` | **Cron:** `*/5 * * * *` | **Idempotent:** Yes  
Every 5 minutes: find `tax_calculations` WHERE `committed = FALSE` AND `order_id IS NOT NULL` AND `orders.status = 'FULFILLED'`.  
Commit each to TaxJar `/v2/transactions`. Max 50 per run (paginated). Updates `committed = TRUE`.  
Purpose: handles race condition where commit step failed after payment capture.

**Job:** `tax.nexus_monitor` | **Cron:** `0 8 * * 1` | **Idempotent:** Yes  
Weekly: check each `legal_entity_id` for states approaching economic nexus threshold ($100K in sales or 200 transactions). Alert `ENTERPRISE_FINANCE` via NOT engine if within 20% of threshold.

**Job:** `tax.rate_table_refresh` | **Cron:** `0 6 1 * *` | **Idempotent:** Yes  
Monthly: calls TaxJar `/v2/rates` for each location's zip code → updates `tax_override_rates`. Ensures fallback table stays current even if never triggered.

---

#### Acceptance Tests

| Test ID | Scenario | Input | Expected |
|---|---|---|---|
| TAX-001-T1 | Standard restaurant order | BistroBeest Chicago, $28.90 food | TaxJar /v2/taxes called; Chicago 10.25% = $2.96 tax; provider=TAXJAR |
| TAX-001-T2 | TaxJar timeout | Mock TaxJar to timeout after 3s | Falls to override table; IL/Cook/Chicago/60654 rate 10.25% applied; provider=OVERRIDE_TABLE |
| TAX-001-T3 | Cached calculation | Same order items, same location, within cache window | Second call reads Redis; provider=CACHED; no TaxJar API call |
| TAX-001-T4 | Commit after payment | order.status FULFILLED | commitTaxTransaction called; /v2/transactions POST; committed=TRUE |
| TAX-001-T5 | Full refund void | Refund $28.90 | voidTaxTransaction called; TaxJar DELETE /v2/transactions/{id}; voided_at set |
| TAX-001-T6 | EBT exempt items | Consumer has EBT exemption; FOOD_GROCERY items | TaxJar line_items include exemption_type=food; $0 tax on exempt items |
| TAX-001-T7 | Delivery order jurisdiction | Delivery to consumer at different zip | Tax jurisdiction = RESTAURANT zip (60654), not consumer's zip ← Ambiguity #17 |
| TAX-001-T8 | Alcohol separate rate | Mixed order: food + alcohol | Separate line items with correct product_tax_codes; rates applied per category |
