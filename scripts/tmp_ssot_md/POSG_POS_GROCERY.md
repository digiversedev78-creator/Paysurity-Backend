# Canonical Requirements: POS Grocery
**Vertical:** POS Grocery (POSG) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)  
**Key Differences from POSR:** Barcode scanning, PLU codes, scale integration, EBT/WIC, age verification, speed-optimized checkout (includes Hybrid Deli-Retail capabilities)

---

## Database Schema

**Migration:** `db/migrations/011_posg_grocery.sql`

```sql
-- Grocery-specific item attributes extending menu_items
CREATE TABLE grocery_item_attributes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  menu_item_id    UUID NOT NULL REFERENCES menu_items(id) UNIQUE,
  upc_codes       TEXT[] NOT NULL DEFAULT '{}',   -- one item can have multiple UPCs (different sizes)
  plu_code        VARCHAR(10),                    -- IFPS standard PLU for produce (e.g., "4011" for banana)
  embedded_barcode_type VARCHAR(20),              -- e.g. 'GS1_WEIGHT', 'GS1_PRICE' for variable measure meat/deli
  tracking_type   VARCHAR(20) NOT NULL DEFAULT 'NONE' CHECK (tracking_type IN ('NONE', 'LOT', 'SERIAL')),
  is_weighted     BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE = sold by weight (scale integration)
  weight_unit     VARCHAR(5),                     -- 'lb' | 'kg' | 'oz' — read from config
  price_per_unit_cents INTEGER,                   -- price per lb/kg if is_weighted=TRUE
  is_age_restricted BOOLEAN NOT NULL DEFAULT FALSE,
  min_age_years   INTEGER DEFAULT 21,             -- 21 for alcohol/tobacco; 18 for some states
  age_restriction_type VARCHAR(20)
                  CHECK (age_restriction_type IN ('ALCOHOL','TOBACCO','CANNABIS','OTHER')),
  is_ebt_eligible BOOLEAN NOT NULL DEFAULT TRUE,  -- SNAP-eligible items
  is_wic_eligible BOOLEAN NOT NULL DEFAULT FALSE, -- WIC-authorized items
  wic_category    VARCHAR(50),                    -- WIC food category
  deposit_cents   INTEGER NOT NULL DEFAULT 0,     -- bottle/can deposit
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE grocery_item_attributes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON grocery_item_attributes USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_grocery_upc ON grocery_item_attributes USING GIN(upc_codes);
CREATE INDEX idx_grocery_plu ON grocery_item_attributes(plu_code) WHERE plu_code IS NOT NULL;

-- ERP Lot/Serial Number Tracking (for Perishables & High-Value Retail)
CREATE TABLE inventory_lots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  product_id      UUID NOT NULL REFERENCES menu_items(id),
  lot_number      VARCHAR(100) NOT NULL,
  expiration_date DATE,
  quantity        DECIMAL(10,4) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, product_id, lot_number)
);
ALTER TABLE inventory_lots ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON inventory_lots USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Age verification log: compliance record for every restricted sale
CREATE TABLE age_verification_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  order_id          UUID NOT NULL REFERENCES orders(id),
  cashier_user_id   UUID NOT NULL REFERENCES users(id),
  restriction_type  VARCHAR(20) NOT NULL,
  verification_method VARCHAR(30) NOT NULL
                    CHECK (verification_method IN ('ID_SCAN','MANUAL_BIRTHDATE','TRUSTED_REGULAR','OVER_40_VISUAL')),
  id_birthdate      DATE,                         -- from ID scan or manual entry
  customer_appears_over_40 BOOLEAN,               -- for OVER_40_VISUAL method
  id_type           VARCHAR(20),                  -- 'DRIVERS_LICENSE' | 'PASSPORT' | 'STATE_ID'
  id_state          VARCHAR(2),
  verified_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE age_verification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON age_verification_log USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Scale readings: logged for auditable weight-based sales
CREATE TABLE scale_readings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  order_item_id   UUID NOT NULL REFERENCES order_items(id),
  scale_device_id VARCHAR(100) NOT NULL,
  raw_weight      DECIMAL(10,4) NOT NULL,
  weight_unit     VARCHAR(5) NOT NULL,
  tared_weight    DECIMAL(10,4) NOT NULL,          -- after tare subtraction
  price_per_unit_cents INTEGER NOT NULL,           -- captured at time of scan
  calculated_price_cents INTEGER NOT NULL,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE scale_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON scale_readings USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Seed:** `db/seeds/011_posg_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable, min_value, max_value)
VALUES
  ('posg.barcode.scan_timeout_ms',     '200',   'integer', 'Max ms to resolve barcode scan before showing not-found', FALSE, '50', '2000'),
  ('posg.barcode.unknown_action',      'PROMPT_CASHIER', 'string', 'Action for unrecognized barcode: PROMPT_CASHIER | CREATE_ITEM | REJECT', TRUE, NULL, NULL),
  ('posg.barcode.gs1_prefix_weight',   '21',    'string', 'GS1 prefix indicating embedded weight (Odoo style)', FALSE, NULL, NULL),
  ('posg.barcode.gs1_prefix_price',    '23',    'string', 'GS1 prefix indicating embedded price (Odoo style)', FALSE, NULL, NULL),
  ('posg.iot_box.ip_address',          '',      'string', 'IP Address for local IoT Box handling cash drawers/printers/terminals', TRUE, NULL, NULL),
  ('posg.scale.brand',                 'METTLER_TOLEDO', 'string', 'Scale hardware brand (determines driver/protocol)', FALSE, NULL, NULL),
  ('posg.scale.connection_type',       'USB_HID', 'string', 'Scale connection: USB_HID | RS232 | BLUETOOTH', FALSE, NULL, NULL),
  ('posg.scale.unit',                  'lb',    'string',  'Default weight unit: lb | kg | oz', TRUE, NULL, NULL),
  ('posg.scale.tare_prompt',           'true',  'boolean', 'Prompt cashier to tare before each weighted item', FALSE, NULL, NULL),
  ('posg.age_verify.default_min_age',  '21',    'integer', 'Default minimum age for restricted items', FALSE, '18', '21'),
  ('posg.age_verify.visual_cutoff_years','40',  'integer', 'If customer appears over this age, visual verification OK', TRUE, '25', '50'),
  ('posg.age_verify.over_40_enabled',  'true',  'boolean', 'Allow visual over-40 verification (no ID required)', TRUE, NULL, NULL),
  ('posg.ebt.provider',                'FISERV', 'string', 'EBT processing provider', FALSE, NULL, NULL),
  ('posg.ebt.receipt_split',           'true',  'boolean', 'Print split EBT/non-EBT receipt', FALSE, NULL, NULL),
  ('posg.checkout.auto_bag_fee_cents', '10',    'integer', 'Automatic bag fee in cents (where applicable; 0=disabled)', TRUE, '0', '25'),
  ('posg.checkout.quick_tender_enabled','true', 'boolean', 'Enable quick tender shortcuts (exact cash, common bills)', TRUE, NULL, NULL),
  ('posg.checkout.coupon_enabled',     'true',  'boolean', 'Enable paper coupon scanning at checkout', TRUE, NULL, NULL),
  ('posg.loyalty.multiplier_grocery',  '0.5',   'decimal', 'Loyalty earn multiplier for grocery vs restaurant (grocery items earn at 0.5x)', TRUE, '0', '3')
ON CONFLICT (key) DO NOTHING;
```

---

## REQ-POSG-001: Barcode Scan & Item Lookup

**Priority:** Must | **Actors:** Cashier, POS Terminal, Hardware Scanner

---

#### Context

Grocery POS speed is table stakes. A slowdown at scan time is a cashier and customer experience failure. Target: barcode resolved + item added to order in < 200ms. Fallback behaviors for unknown barcodes must never block the line — always offer an immediate action.

---

#### Service Layer

```typescript
/**
 * resolveBarcode(barcode, locationId) — Core scan handler.
 * 1. Query grocery_item_attributes WHERE upc_codes @> ARRAY[barcode] (GIN index)
 *    OR plu_code = barcode — within timeout from config 'posg.barcode.scan_timeout_ms'
 * 2. If found and is_weighted=TRUE: await readScale() before returning price
 * 3. If found and is_age_restricted=TRUE: return with flag → cashier age verify prompt
 * 4. If not found: read config 'posg.barcode.unknown_action':
 *    PROMPT_CASHIER: return error with barcode; cashier searches/enters manually
 *    CREATE_ITEM: create draft grocery_item; flag for manager review; add to order
 *    REJECT: show error; item not added
 * Returns: { menuItem, unitPriceCents, quantity:1, requiresAgeVerify, requiresScale, isEbtEligible }
 */
async resolveBarcode(barcode: string, locationId: string): Promise<BarcodeScanResult>

/**
 * **Superiority ADV-PRODUCE-AI (Keypad-Replacement):** 
 * Active produce identification using computer vision module.
 * Eliminates manual cashier PLU entry by identifying the item visually and feeding the predicted IFPS standard PLU string directly into the existing `plu_code` lookup pipeline.
 */
async identifyProduceByVision(imageStream: Buffer): Promise<{ resolvedPluCode: string; confidenceScore: number }>

/**
 * readScale(deviceId) — Reads current weight from scale hardware.
 * Protocol: USB HID (Mettler Toledo standard) via Node.js 'node-hid' library
 * 1. Open HID device by vendor_id/product_id (read from config, not hardcoded)
 * 2. Send tare command if 'posg.scale.tare_prompt' = true and previous item was different
 * 3. Read stable weight report (wait for variance < 0.002 across 3 readings)
 * 4. Apply unit conversion based on config 'posg.scale.unit'
 * 5. Calculate price: tared_weight × price_per_unit_cents
 * 6. Write scale_readings record
 * Returns: { weight, unit, priceCents }
 */
async readScale(deviceId: string, menuItemId: string): Promise<ScaleReading>
```

---

## REQ-POSG-002: EBT/SNAP & WIC Payments

**Priority:** Must | **Actors:** Consumer, Cashier, EBT Network (Fiserv)

---

**EBT flow (SNAP — food items only):**
1. After all items scanned: system auto-calculates EBT-eligible subtotal (items with `is_ebt_eligible=TRUE`) vs non-EBT subtotal
2. Cashier screen shows: "EBT-Eligible: $32.40 | Non-EBT: $12.50 | Total: $44.90"
3. Consumer inserts (Chip) or taps EBT card on PIN pad to comply with 2026 USDA standards (Swipe is retained strictly as the ECL Fallback mechanism if chip/tap fails)
4. EBT network (Fiserv) processes up to available SNAP balance (ORC routes to `posg.ebt.provider`)
5. Remaining balance (non-EBT items) prompted on same terminal: cash/card/wallet
6. Receipt: printed split showing EBT purchases + balance, non-EBT purchases separately

**WIC flow (Women, Infants, Children):**
- WIC-eligible items identified by `is_wic_eligible=TRUE` AND `wic_category` matching consumer's WIC benefits
- WIC card presented on PIN pad after SNAP (separate tender)
- Items must exactly match WIC authorized food package — over-limit quantities rejected
- Manager override required if any item quantity mismatch

**Age verification flow:**
1. Any `is_age_restricted=TRUE` item in order triggers pause
2. Large screen overlay: "⚠️ Age Verification Required"
3. Options (per config):
   - "Scan ID" → POS camera/slot scanner → parses DOB → validates age
   - "Enter birthdate" → manual MM/DD/YYYY → validates
   - "Customer appears 40+" → one-tap if `posg.age_verify.over_40_enabled=true`
4. If verification fails: item removed; cannot proceed with restricted item
5. Every verification written to `age_verification_log` (compliance REQUIRED)

---

## REQ-POSG-003: Speed Checkout

**Priority:** Must | **Actors:** Cashier, Consumer

---

Grocery checkout is high-velocity. Every extra second costs throughput.

**Quick Tender buttons (configurable, from platform_config — never hardcoded):** 
Rendered dynamically: "Exact ($44.90)" | "$50" | "$60" | "$100"  
One tap → cash payment registered → change calculated → drawer opens  
Config: `posg.checkout.quick_tender_enabled` (boolean) controls visibility

**Self-checkout mode:**  
Configurable per terminal: `posg.terminal.mode = 'CASHIER' | 'SELF_CHECKOUT'`  
Self-checkout: consumer scans items; weight verification on every item; cashier oversight screen monitors all self-checkout lanes; cashier approval gate for age-restricted items

**Basket size tracking:**  
`orders.cover_count` = total unique items in order (for basket analytics)  
Average items per transaction tracked in shift_close_reports for grocery ops benchmarking

---

## REQ-POSG-004: Inventory Integration

**Priority:** Should | **Actors:** Merchant Admin, Location Manager

---

**On every scan:** decrement `menu_items.stock_quantity` (if inventory tracking enabled per item)  
Config: `posg.inventory.tracking_enabled` (boolean, merchant_config)  
On stock = 0: item auto-86'd (same propagation as POSR 86 to aggregators)  
Low-stock alert: when stock ≤ `posg.inventory.low_stock_threshold` (from config) → alert Location Manager via NOT engine

**API:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/grocery/inventory` | Merchant Admin, Location Mgr | Current stock levels |
| `PATCH` | `/v1/grocery/inventory/items/{id}` | Merchant Admin | Manual stock adjustment |
| `POST` | `/v1/grocery/inventory/import` | Merchant Admin | Bulk import via CSV |
| `GET` | `/v1/grocery/barcodes/{upc}` | POS Terminal | Resolve UPC to menu item |
| `GET` | `/v1/grocery/plu/{plu}` | POS Terminal | Resolve PLU code |


## Valor EMV L3 Grocery Controls
- **REQ-07**: EBT Eligibility marking on EMV payload.
- **REQ-08**: Dual-Tender (EBT/SNAP fallback to Credit/Debit).
- **REQ-09**: Scale/Weight barcode metadata synchronization with Valor hardware logic.


## PaySurity Advantage (Superiority V2.0)
**ADV-002 [Zero-Button Flow]:** The standard multi-step confirmation checkout workflow is deprecated. Superiority Target: ≤ 3 taps from cart-finality to receipt generation.

---

## REQ-POSG-005: Unified Deli-Retail Checkout

**Priority:** Must | **Actors:** Cashier, Scale, KDS

**Hybrid Deli-Retail Native Capability:**
Allows KDS-routed deli items (e.g., custom made-to-order sandwiches) and Retail-scanned items (e.g., bottled water, packaged goods) to seamlessly coexist in a single unified checkout session.
- Made-to-order items automatically dispatch to KDS screens upon cart insertion.
- Pre-packaged goods interact natively with the standard barcode resolution.
- Both item states synchronize on the final receipt to eliminate disjointed checkout experiences.
