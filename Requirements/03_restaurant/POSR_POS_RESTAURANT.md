# Canonical Requirements: POS Restaurant — BistroBeest
**Vertical:** POS Restaurant (POSR) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)  
**Total Requirements:** 10

---

## Database Schema

**Migration:** `db/migrations/010_posr_restaurant.sql`

```sql
-- ─────────────────────────────────────────
-- RESTAURANT POS TABLES
-- ─────────────────────────────────────────

CREATE TABLE tables (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  location_id   UUID NOT NULL REFERENCES locations(id),
  name          VARCHAR(50) NOT NULL,          -- "Table 12", "Bar 3", "Patio 7"
  capacity      INTEGER NOT NULL DEFAULT 4,
  section       VARCHAR(50),                   -- "Main", "Bar", "Patio", "Private"
  x_coordinate  INTEGER NOT NULL DEFAULT 0,    -- GUI Floor Plan X pos
  y_coordinate  INTEGER NOT NULL DEFAULT 0,    -- GUI Floor Plan Y pos
  shape         VARCHAR(20) NOT NULL DEFAULT 'RECTANGLE' CHECK (shape IN ('RECTANGLE','CIRCLE','OVAL')),
  status        VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
                CHECK (status IN ('AVAILABLE','OCCUPIED','RESERVED','CLEANING')),
  qr_code_url   TEXT,                          -- pre-generated QR for table-side ordering
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(location_id, name)
);
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tables USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  location_id         UUID NOT NULL REFERENCES locations(id),
  short_id            VARCHAR(10) NOT NULL,          -- human-readable: "BB-2341"
  order_type          VARCHAR(20) NOT NULL
                      CHECK (order_type IN ('DINE_IN','TAKEOUT','DELIVERY','AI_ORDER','CATERING')),
  source_channel      VARCHAR(30) NOT NULL DEFAULT 'POS'
                      CHECK (source_channel IN ('POS','KIOSK','WEB_ORDER','AI_ASSISTANT','DOORDASH','UBEREATS','GRUBHUB','PHONE')),
  table_id            UUID REFERENCES tables(id),    -- set for DINE_IN
  consumer_id         UUID REFERENCES consumers(id), -- NULL for walk-in
  loyalty_account_id  UUID REFERENCES loyalty_accounts(id),
  server_user_id      UUID REFERENCES users(id),     -- staff member who opened the check
  split_from_order_id UUID REFERENCES orders(id),    -- Reference if this check was split from a master table order
  invoice_id          UUID,                          -- B2B Invoicing (converts POS receipt to legal invoice)
  status              VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                      CHECK (status IN ('OPEN','SENT_TO_KDS','ALL_FIRED','READY','FULFILLED','CANCELLED','REFUNDED')),
  subtotal_cents      INTEGER NOT NULL DEFAULT 0,    -- food items only; no tax, tip, fees
  tax_cents           INTEGER NOT NULL DEFAULT 0,
  tip_cents           INTEGER NOT NULL DEFAULT 0,
  delivery_fee_cents  INTEGER NOT NULL DEFAULT 0,
  discount_cents      INTEGER NOT NULL DEFAULT 0,    -- loyalty redemption, promo codes
  total_cents         INTEGER NOT NULL DEFAULT 0,    -- computed: subtotal + tax + tip + delivery - discount
  notes               TEXT,
  external_order_id   VARCHAR(255),                  -- DoorDash/UberEats reference
  external_platform   VARCHAR(30),                   -- 'DOORDASH' | 'UBEREATS' | 'GRUBHUB'
  kds_station_ids     UUID[],                        -- which KDS stations received this order
  fired_at            TIMESTAMPTZ,                   -- when order was sent to kitchen
  ready_at            TIMESTAMPTZ,                   -- when kitchen marked ready
  fulfilled_at        TIMESTAMPTZ,
  estimated_ready_at  TIMESTAMPTZ,                   -- communicated to consumer
  idempotency_key     VARCHAR(255) UNIQUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON orders USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_orders_location_status ON orders(location_id, status, created_at DESC);
CREATE INDEX idx_orders_external ON orders(external_order_id, external_platform);
CREATE INDEX idx_orders_short_id ON orders(tenant_id, short_id);

CREATE TABLE order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id      UUID NOT NULL REFERENCES menu_items(id),
  item_name         VARCHAR(255) NOT NULL,           -- snapshot at order time (menu may change)
  quantity          INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents  INTEGER NOT NULL,                -- snapshot at order time
  total_cents       INTEGER NOT NULL,
  modifiers         JSONB NOT NULL DEFAULT '[]',     -- [{name, price_delta_cents, quantity}]
  notes             TEXT,                            -- customer special instructions
  course            INTEGER NOT NULL DEFAULT 1,      -- 1: Apps, 2: Mains, 3: Desserts (for firing sequence)
  routing_printer_id UUID,                           -- Maps to specific kitchen/bar IoT printer
  kds_station_id    UUID REFERENCES kds_stations(id),
  kds_status        VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                    CHECK (kds_status IN ('PENDING','SENT','FIRED','READY','VOIDED')),
  is_comped         BOOLEAN NOT NULL DEFAULT FALSE,
  comp_reason       VARCHAR(100),
  void_reason       VARCHAR(100),
  fired_at          TIMESTAMPTZ,
  ready_at          TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON order_items USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE TABLE kds_stations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id),
  location_id    UUID NOT NULL REFERENCES locations(id),
  name           VARCHAR(100) NOT NULL,             -- "Hot Line", "Cold Station", "Bar", "Expo"
  category_ids   UUID[] NOT NULL DEFAULT '{}',      -- which menu categories route to this station
  device_id      VARCHAR(255),                      -- paired KDS hardware device ID
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE kds_stations ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON kds_stations USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  order_id            UUID NOT NULL REFERENCES orders(id),
  payment_method_type VARCHAR(30) NOT NULL
                      CHECK (payment_method_type IN ('CARD_PRESENT','CARD_NP','CASH','GIFT_CARD','LOYALTY','EBT','APPLE_PAY','GOOGLE_PAY','ACH')),
  amount_cents        INTEGER NOT NULL,
  gateway_ref_id      VARCHAR(255),                  -- FluidPay transaction ID
  gateway_status      VARCHAR(30) NOT NULL DEFAULT 'PENDING'
                      CHECK (gateway_status IN ('PENDING','AUTHORIZED','CAPTURED','DECLINED','VOIDED','REFUNDED')),
  last_four           VARCHAR(4),
  card_brand          VARCHAR(20),
  idempotency_key     VARCHAR(255) NOT NULL UNIQUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON payments USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE TABLE shift_close_reports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id),
  location_id      UUID NOT NULL REFERENCES locations(id),
  closed_by        UUID NOT NULL REFERENCES users(id),
  shift_start      TIMESTAMPTZ NOT NULL,
  shift_end        TIMESTAMPTZ NOT NULL,
  total_orders     INTEGER NOT NULL DEFAULT 0,
  total_covers     INTEGER NOT NULL DEFAULT 0,        -- guests served
  gross_sales_cents INTEGER NOT NULL DEFAULT 0,
  discounts_cents  INTEGER NOT NULL DEFAULT 0,
  refunds_cents    INTEGER NOT NULL DEFAULT 0,
  net_sales_cents  INTEGER NOT NULL DEFAULT 0,
  taxes_cents      INTEGER NOT NULL DEFAULT 0,
  tips_cents       INTEGER NOT NULL DEFAULT 0,
  cash_sales_cents INTEGER NOT NULL DEFAULT 0,
  card_sales_cents INTEGER NOT NULL DEFAULT 0,
  gift_card_cents  INTEGER NOT NULL DEFAULT 0,
  loyalty_discount_cents INTEGER NOT NULL DEFAULT 0,
  report_data      JSONB,                            -- full breakdown by payment type, server, category
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE shift_close_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON shift_close_reports USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Seed:** `db/seeds/010_posr_seed.sql`

```sql
-- BistroBeest Downtown KDS Stations
INSERT INTO kds_stations (id, tenant_id, location_id, name, category_ids, is_active)
VALUES
  ('kds00001-0000-0000-0000-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','loc00001-0000-0000-0000-000000000001',
   'Hot Line', ARRAY['cat00002-0000-0000-0000-000000000002']::UUID[], TRUE),   -- Mains
  ('kds00002-0000-0000-0000-000000000002','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','loc00001-0000-0000-0000-000000000001',
   'Cold Station', ARRAY['cat00001-0000-0000-0000-000000000001','cat00003-0000-0000-0000-000000000003']::UUID[], TRUE), -- Starters + Desserts
  ('kds00003-0000-0000-0000-000000000003','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','loc00001-0000-0000-0000-000000000001',
   'Bar', ARRAY['cat00004-0000-0000-0000-000000000004']::UUID[], TRUE)         -- Drinks
ON CONFLICT DO NOTHING;

-- Tables for River North (12 tables + bar)
INSERT INTO tables (tenant_id, location_id, name, capacity, section, status, sort_order)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'loc00001-0000-0000-0000-000000000001',
       'Table ' || n, CASE WHEN n <= 8 THEN 4 WHEN n <= 10 THEN 2 ELSE 6 END,
       CASE WHEN n <= 8 THEN 'Main' WHEN n <= 10 THEN 'Patio' ELSE 'Private' END,
       'AVAILABLE', n
FROM generate_series(1,12) AS s(n)
ON CONFLICT (location_id, name) DO NOTHING;

INSERT INTO tables (tenant_id, location_id, name, capacity, section, status, sort_order)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','loc00001-0000-0000-0000-000000000001','Bar 1',1,'Bar','AVAILABLE',13),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','loc00001-0000-0000-0000-000000000001','Bar 2',1,'Bar','AVAILABLE',14),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','loc00001-0000-0000-0000-000000000001','Bar 3',1,'Bar','AVAILABLE',15)
ON CONFLICT (location_id, name) DO NOTHING;

-- Platform config for POSR-specific settings
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable, min_value, max_value)
VALUES
  ('posr.table_turn_target_minutes',  '60',    'integer',  'Target table turn time in minutes',       TRUE, '30', '180'),
  ('posr.tip_suggestions_pct',        '[18,20,22]', 'json','Tip suggestion percentages on terminal',TRUE, NULL, NULL),
  ('posr.kds_fire_delay_seconds',     '0',     'integer',  'Delay between seat and KDS fire (0=immediate)', TRUE, '0', '300'),
  ('posr.auto_gratuity_party_size',   '6',     'integer',  'Minimum party size for auto-gratuity',    TRUE, '4', '20'),
  ('posr.auto_gratuity_pct',          '18',    'integer',  'Auto-gratuity percentage',                TRUE, '15', '25'),
  ('posr.receipt_logo_url',           '',      'string',   'URL to merchant logo on e-receipt',       TRUE, NULL, NULL),
  ('posr.item_86_propagation_sec',    '60',    'integer',  'Max seconds for 86 to reach all channels',FALSE,'10', '120'),
  ('posr.offline_queue_max_orders',   '500',   'integer',  'Max orders to queue in offline mode',     FALSE,'100','2000'),
  -- KDS ticket age color thresholds (ambiguity #14 — explicit values, not invented)
  ('posr.kds.ticket_color_yellow_minutes', '8',  'integer',  'Minutes before KDS ticket turns yellow (warning)', TRUE, '3', '30'),
  ('posr.kds.ticket_color_red_minutes',    '15', 'integer',  'Minutes before KDS ticket turns red (urgent)', TRUE, '5', '60'),
  ('posr.kds.ticket_color_purple_minutes', '25', 'integer',  'Minutes before KDS ticket turns purple (critical/escalate)', TRUE, '10', '90'),
  -- Tip pool algorithm (ambiguity #4 — tip pool formula explicitly defined below)
  ('posr.tip_pool_enabled',            'false', 'boolean',  'Whether tips are pooled vs. kept by individual server', TRUE, NULL, NULL),
  ('posr.tip_pool_algorithm',          'HOURS_WEIGHTED', 'string', 'EQUAL | HOURS_WEIGHTED | POINTS_BASED', TRUE, NULL, NULL),
  -- KDS reconnect replay order (ambiguity #8 — explicitly chronological)
  ('posr.kds.offline_replay_order',    'CHRONOLOGICAL', 'string', 'Order for KDS replay on reconnect: CHRONOLOGICAL | MOST_RECENT_FIRST', FALSE, NULL, NULL),
  ('posr.split_check_max_ways',       '8',     'integer',  'Maximum ways to split a check',           TRUE, '2', '20')
ON CONFLICT (key) DO NOTHING;
```

---

## REQ-POSR-001: Core Order Management & Table Workflow

**Priority:** Must | **Actors:** Server, Cashier, Expo, Kitchen Staff

---

#### Context & Business Intent

Build the complete order lifecycle: open a check, add items with modifiers, hold/fire courses, split checks, and close. Every screen transition must be instantaneous (< 300ms render). The table grid is the home screen for every BistroBeest POS session. All order data saved in real time — zero data loss on terminal crash.

---

#### Service Layer: `src/services/pos/order.service.ts`

```typescript
/**
 * openOrder(params) — Creates an order record linked to table (dine-in) or none (takeout).
 * Assigns server_user_id from the authenticated session.
 * table_id status → 'OCCUPIED'. Returns order ID and short_id.
 */
async openOrder(params: { tenantId, locationId, tableId?, orderType, serverId }): Promise<Order>

/**
 * addItem(params) — Appends item to an open order. Price snapshot taken from menu_items.price_cents
 * at the moment of add (not at close). Recalculates order.subtotal_cents, tax (via TAX engine), total.
 * Routes item to correct kds_station_id based on item's category_id.
 */
async addItem(params: { orderId, menuItemId, quantity, modifiers, notes }): Promise<OrderItem>

/**
 * fireToKDS(orderId, courseNumber?) — Sends unfired items to their KDS stations.
 * If courseNumber specified: fires only items in that course.
 * Sets order.status = 'SENT_TO_KDS', item.kds_status = 'SENT', order.fired_at = NOW().
 * Publishes 'kds.order_received' event to the KDS station's real-time channel (WebSocket/SSE).
 */
async fireToKDS(orderId: string, courseNumber?: number): Promise<void>

/**
 * splitCheck(orderId, splits) — Divides an order into sub-checks.
 * splits: [{items: OrderItemId[], consumer_name: string}] | {ways: number} (even split)
 * Creates N new orders linked as SPLIT_CHILD to parent. Parent status = 'SPLIT'.
 */
async splitCheck(orderId: string, splits: SplitSpec): Promise<Order[]>

/**
 * closeOrder(orderId, payments) — Accepts payment array (multi-tender), calculates totals,
 * calls ORC service for payment processing, writes shift_close_reports entry,
 * calls LOY earning, fires webhooks. All in one DB transaction.
 */
async closeOrder(orderId: string, payments: PaymentSpec[]): Promise<OrderCloseResult>

/**
 * voidOrder(orderId, reason) — Cancels an open order.
 * Frees table. Reverses any loyalty earnings on the order. Calls KDS to clear displays.
 */
async voidOrder(orderId: string, reason: string): Promise<void>
```

---

#### API Endpoints

| Method | Path | Auth | Description | Webhook |
|---|---|---|---|---|
| `POST` | `/v1/orders` | POS Session | Open new order | `order.created` |
| `GET` | `/v1/orders/{id}` | POS Session, Merchant Admin | Get full order state | — |
| `POST` | `/v1/orders/{id}/items` | POS Session | Add item | `order.item_added` |
| `DELETE` | `/v1/orders/{id}/items/{itemId}` | POS Session | Void item | `order.item_voided` |
| `POST` | `/v1/orders/{id}/fire` | POS Session | Fire to KDS | `kds.order_received` |
| `POST` | `/v1/orders/{id}/split` | POS Session | Split check | — |
| `POST` | `/v1/orders/{id}/close` | POS Session | Process payment + close | `order.closed`, `payment.succeeded` |
| `POST` | `/v1/orders/{id}/void` | Manager | Void order | `order.voided` |
| `GET` | `/v1/locations/{id}/tables` | POS Session | Table grid status | — |
| `GET` | `/v1/locations/{id}/orders` | POS Session, Manager | Open orders list | — |

---

#### UI/UX

**Home Screen — Table Grid:**  
> 4×4 grid (configurable) showing each table as colored card:  
> - **Green** = AVAILABLE — tap to open new order  
> - **Yellow** = OCCUPIED — shows server initials, elapsed time, party size, current check total  
> - **Red** = OCCUPIED > target turn time (from `posr.table_turn_target_minutes` config) — overdue alert  
> - **Blue** = RESERVED — shows reservation time and guest name  
> Tap any occupied table → opens that order in the order screen

**Order Screen:**  
> Left panel: Order items list with running total | Right panel: Menu (category tabs → item grid)  
> Item tap → modifier sheet slides up (required mods with radio buttons, optional mods with checkboxes) → "Add to Order"  
> Bottom action bar: [Fire Kitchen] [Split Check] [Print] [Close Check] [Void]  
> Fire button badge shows count of unfired items

**Close Check Screen:**  
> Subtotal | Tax | Tip (3 button suggestions from config + custom field) | Total  
> Payment type selector: Card (tap/chip), Cash, Split  
> If loyalty account linked: "Maria has 1,842 pts ($18.42) — Apply points? [Yes / No]"  
> On successful payment: loud chime, receipt options: print / email / SMS / none

**Offline Mode:**  
> Banner: "⚠️ Offline — Orders saved locally (max `posr.offline_queue_max_orders` from config)"  
> Orders accepted, payments queued for retry on reconnect  
> Card: Store-and-forward via terminal HSM — chip card present transaction stored for later clearing  
> On reconnect: all queued orders sync → payments processed → LOY earning triggered → KDS replayed

---

#### Acceptance Tests

| Test ID | Scenario | Input | Expected |
|---|---|---|---|
| POSR-001-T1 | Open, add items, fire, close | Table 5, 2 items, card payment | Order created → KDS receives within 5s → payment processed → loyalty earned → table freed |
| POSR-001-T2 | Split check 2 ways | $60 order, split evenly | 2 child orders $30 each, both closeable independently |
| POSR-001-T3 | Offline order | Network down, order taken | Order saved locally → on reconnect, synced → payment processed retrospectively |
| POSR-001-T4 | Void after fire | Item fired to KDS, then voided | KDS displays VOIDED indicator; item_total reversed; loyalty not earned for voided amount |
| POSR-001-T5 | Auto-gratuity | Party of 7 (≥ config `posr.auto_gratuity_party_size`) | 18% gratuity pre-applied, labeled "Auto-Grat", still editable by manager |

---

## REQ-POSR-002: Kitchen Display System (KDS) Integration

**Priority:** Must | **Actors:** Kitchen Staff, Expo, Line Cooks, Manager

---

#### Service Layer: `src/services/pos/kds.service.ts`

```typescript
/**
 * routeItemsToStations(orderItems, locationId) — Reads kds_stations[].category_ids config.
 * Maps each OrderItem to the correct KDS station based on menu_item.category_id.
 * Returns: Map<kds_station_id, OrderItem[]>
 */
async routeItemsToStations(orderItems: OrderItem[], locationId: string): Promise<KDSRoutingMap>

/**
 * publishToKDS(stationId, orderItems, order) — Sends order to KDS hardware via:
 * 1. WebSocket push to BistroBeest KDS app running on station device
 * 2. Fallback: HTTP POST to station local IP if WebSocket fails
 * 
 * OP-RETAIL-02 [Hardware Dead-Lock Spooler]:
 * If KDS devices are offline or Cloud_Latency > 500ms continuously, the system explicitly reverts to the ESC/POS Local Spooler.
 * Directly routes bytecode via Local-IP Direct Print to Thermal Printers, guaranteeing 0 'Vanishing Tickets' during network anomalies.
 * KDS ticket format: {table_name, server_name, course, items:[{name, qty, mods, notes}], time}
 */
async publishToKDS(stationId: string, orderItems: OrderItem[], order: Order): Promise<void>

/**
 * markItemReady(orderItemId) — Kitchen staff marks item done on KDS touchscreen.
 * Sets order_item.kds_status = 'READY', order_item.ready_at = NOW().
 * If ALL items on order = READY → order.status = 'ALL_FIRED', fires 'order.ready' event.
 * Triggers NOT engine 'order.ready' notification to consumer (if phone on file).
 */
async markItemReady(orderItemId: string, stationId: string): Promise<void>
```

**Config key:** `posr.kds_fire_delay_seconds` — read from DB at runtime; 0 = fire immediately

**KDS Screen Design:**  
> Each ticket card: colored header (color changes as age increases per DB config) | Table/Order ID | Items in large text with modifiers in smaller text  
> Swipe right → mark item READY | Swipe left → bump (recall previously ready item)  
> Sound alert on new ticket arrival (configurable per station via DB: `kds.{station_id}.alert_sound`)  
> Ticket age alert: configurable per station — turns red after N minutes (read from `kds.{station_id}.red_alert_minutes`)

---

## REQ-POSR-003: Menu & Modifier Management

**Priority:** Must | **Actors:** Merchant Admin, Brand Admin, Location Manager

---

#### API Endpoints

| Method | Path | Auth | Description | Webhook |
|---|---|---|---|---|
| `GET` | `/v1/menu` | All | Full menu with categories, items, modifiers | — |
| `POST` | `/v1/menu/items` | Merchant Admin, Brand Admin | Create item | `menu.item_created` |
| `PATCH` | `/v1/menu/items/{id}` | Merchant Admin, Brand Admin | Update item (price, availability) | `menu.item_updated` |
| `POST` | `/v1/menu/items/{id}/86` | Location Manager | Mark item out-of-stock | `menu.item_oos` |
| `DELETE` | `/v1/menu/items/{id}/86` | Location Manager | Mark item available | `menu.item_available` |
| `POST` | `/v1/menu/modifiers` | Merchant Admin | Create modifier group | — |

**Item 86 effect:** Sets `menu_items.is_active = FALSE` for the location (location-scoped, not brand-scoped if LOCAL lock level). Propagates to all connected aggregator channels within `aggregation.oos_propagation_max_sec` (read from DB). Aggregation pauses the item on DoorDash/UberEats/GrubHub automatically.

**UI:** Item card turns grey with "86'd" chip. Tap → "Restore Item" button.

---

## REQ-POSR-004: Server & Staff Management

**Priority:** Must | **Actors:** Manager, Server, Cashier

---

**Tables:**
```sql
CREATE TABLE shift_employees (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id),
  location_id   UUID NOT NULL REFERENCES locations(id),
  user_id       UUID NOT NULL REFERENCES users(id),
  shift_date    DATE NOT NULL,
  clocked_in_at TIMESTAMPTZ,
  clocked_out_at TIMESTAMPTZ,
  role          VARCHAR(30) NOT NULL,
  tip_pool_eligible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(location_id, user_id, shift_date)
);
ALTER TABLE shift_employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON shift_employees USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**API:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/pos/clock-in` | Staff | Clock in to a location/shift |
| `POST` | `/v1/pos/clock-out` | Staff | Clock out |
| `GET` | `/v1/locations/{id}/staff/on-shift` | Manager | Currently clocked-in staff |
| `GET` | `/v1/pos/orders/by-server/{userId}` | Server (own), Manager | Orders assigned to server |

**UI — Manager Dashboard:**  
> "On Shift Now" row with names, role, clock-in time, elapsed  
> Per-server performance today: covers, avg ticket, comp %, upsell rate (if AI tracking enabled)

---

## REQ-POSR-005: Multi-Channel Order Aggregation (AGG Integration)

**Priority:** Must | **Actors:** Kitchen Staff, Manager, 3rd-Party Delivery Platforms

---

See `AGG_ORDER_AGGREGATION.md` for full integration spec. POSR-specific behavior:

- `source_channel` on orders: `DOORDASH | UBEREATS | GRUBHUB` — stored at order create
- External orders appear in the same order queue as in-house orders — no separate device or screen
- External order `short_id` prefixed: `DD-XXXX`, `UE-XXXX`, `GH-XXXX` — visually distinct in KDS
- Auto-acknowledge external orders within `aggregation.{platform}.ack_timeout_sec` (read from DB)
- External order routing: same KDS station routing as in-house based on category_id
- External order loyalty: if consumer's DoorDash phone matches a BistroBeest loyalty account → earn at channel multiplier `loyalty.channel_multiplier.doordash` (read from DB, default: 0.5×)

---

## REQ-POSR-006: Payment Processing & Tip Management

**Priority:** Must | **Actors:** Consumer, Cashier, Payment Gateway

---

**All payment calls delegate to ORC_PAYMENT_ORCHESTRATION service.**

Config keys (all from DB):
```
posr.tip_suggestions_pct    → [18, 20, 22] — rendered as 3 buttons on terminal
posr.auto_gratuity_pct      → 18 — applied for parties ≥ auto_gratuity_party_size
posr.auto_gratuity_party_size → 6 — minimum party count for auto-grat
```

**Terminal tip flow:**  
1. Order total displayed on customer-facing display  
2. "Add a tip?" — shows 3 tap buttons (values from config: 18%, 20%, 22%) + "Custom" + "No Tip"  
3. Customer selects → final total displayed → tap/insert/swipe  
4. Approval received → receipt print/send options

**Tip distribution:**  
- Individual server: full tip to their payroll tip record  
- Tip pool: if `posr.tip_pool_enabled = true` (merchant_config) → collected tips pooled; distributed by `tip_pool_algorithm` (EQUAL | HOURS_WEIGHTED | POINTS_BASED) config

---

## REQ-POSR-007: Reporting & End-of-Shift Close

**Priority:** Must | **Actors:** Manager, Accountant

---

**API:**
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/pos/shifts/close` | Manager | Close shift, generate report |
| `GET` | `/v1/pos/shifts/{id}/report` | Manager, Accountant | Shift close report |
| `GET` | `/v1/pos/locations/{id}/sales/today` | Manager | Live today's sales dashboard |
| `GET` | `/v1/pos/locations/{id}/sales` | Manager, Accountant | Historical sales by date range |

**EOD Close generates:**
- `shift_close_reports` row (all financial totals)  
- Webhook: `shift.closed` with full `report_data` JSON  
- AI Ops brief entry for the day  
- Settlement batch trigger (via ORC service)

**UI — Live Sales Dashboard:**  
> Today's gross sales counter (live, updates every 30s) | Covers | Avg ticket  
> Hourly sales bar chart | Top 5 items by revenue | Loyalty redemptions today | Comps vs. target

---

## REQ-POSR-008: Loyalty Integration at POS

**Priority:** Must | **Actors:** Consumer, Cashier, POS Terminal

---

See `LOY_LOYALTY_ENGINE.md` for full spec. POSR-specific behavior:

- Loyalty lookup triggered at order open (not at close) → proactive, not an afterthought
- Phone entry on terminal → `GET /v1/loyalty/accounts/lookup?phone={e164}` → shows within 1s
- Redemption applied before tax calculation (discount reduces the taxable subtotal)
- Earning triggered inside `closeOrder()` DB transaction — same transaction as payment capture
- If consumer not enrolled: cashier screen shows "Enroll now? [Yes]" → enrollment takes < 10s

---

## REQ-POSR-009: Offline Resilience

**Priority:** Must | **Actors:** POS Terminal, Network Infrastructure

---

**Offline Detection:** Terminal monitors connectivity every 5 seconds via a ping to `health.paysurity.com/ping`. If 3 consecutive pings fail → enters OFFLINE mode.

**Offline Queue:**  
- Orders accepted; stored in encrypted local SQLite DB on the terminal  
- Card payments: Store-and-forward via terminal HSM (certified by card brands for restaurant)  
- Maximum queue depth: read from `posr.offline_queue_max_orders` (never hardcoded)

**Reconnection Sync (Deprecated Sync-on-Connect):**
OP-OFFLINE-01 [Vector Clock / CRDT Merge]:
Legacy 'Sync-on-Connect' POST batched endpoints are strictly prohibited. The system mandates Vector Clock CRDT (Conflict-free Replicated Data Type) peer-to-peer merging. When connectivity returns, the local DB replicates natively via mathematically provable lattice aggregations, completely removing race-condition overwriting.

OP-OFFLINE-02 [72-Hour Local-Enclave Auth]:
Cloud-required Auth patterns (e.g., JWT to central server) are suspended during offline modes. The POS must natively authenticate Cashiers and Managers utilizing a 72-Hour Local-Enclave Crypto-Cache securely executing offline role validations locally.

OP-OFFLINE-03 [Physical Truth Priority]:
In the event of an inventory collision (e.g., an e-commerce sale locking inventory while the physical store sells it offline), the 'Physical Truth' Priority algorithm automatically forces the e-commerce transaction to void or backorder. Physical execution strictly overrides digital claims.

OP-OFFLINE-04 [Cryptographic Intent-Spooling]:
During offline modes, FedNow/ACH instantaneous settlements are spooled locally directly on the secure HSM as a 'Cryptographic Intent.' Once connection returns, the exact signed payloads transit the ledger, perfectly resuming the atomic window.

---

## REQ-POSR-010: Receipt & Guest Communication

**Priority:** Must | **Actors:** Consumer, Cashier

---

**Config keys:**
```
posr.receipt_logo_url        → merchant logo URL (merchant_config)
posr.receipt_footer_text     → custom footer message (merchant_config, max 140 chars)
posr.receipt_email_enabled   → true/false  (merchant_config)
posr.receipt_sms_enabled     → true/false  (merchant_config)
```

**Receipt contains (never hardcoded formatting):**  
Logo → Merchant Name → Location Address + Phone  
Order items (name, qty, unit price, modifiers, comp flag)  
Subtotal | Tax (jurisdiction from TAX engine response) | Tip | Total  
Payment method(s) — card last-4, cash tendered/change  
Loyalty: points earned this visit | new balance | expiry date  
Footer text from config  
QR code linking to feedback form URL (if `posr.feedback_qr_enabled = true`)

**Delivery options presented in order:** Print (default if printer connected) → Email (if consumer on file) → SMS (if consumer opted in) → None

---


## Valor EMV L3 Restaurant Controls
- **REQ-05**: Tip Adjustment post-auth via Valor terminal capture batches.
- **REQ-06**: Split Check reconciliation tracking back to exact terminal receipt numbers.


## PaySurity Advantage (Superiority V2.0)
**ADV-002 [Zero-Button Flow]:** The standard multi-step confirmation checkout workflow is deprecated. Superiority Target: ≤ 3 taps from cart-finality to receipt generation.
