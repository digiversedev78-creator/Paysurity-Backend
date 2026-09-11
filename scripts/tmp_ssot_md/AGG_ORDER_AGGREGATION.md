# Canonical Requirements: Order Aggregation & Omnichannel Commerce
**Vertical:** Order Aggregation (AGG) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)

---

## Database Schema

**Migration:** `db/migrations/015_agg_order_aggregation.sql`

```sql
-- ─────────────────────────────────────────
-- ORDER AGGREGATION TABLES
-- ─────────────────────────────────────────

-- Platform connections: one row per tenant per connected delivery platform
CREATE TABLE aggregator_platform_connections (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id),
  location_id             UUID NOT NULL REFERENCES locations(id),
  platform                VARCHAR(20) NOT NULL
                          CHECK (platform IN ('DOORDASH','UBEREATS','GRUBHUB','SLICE','YELP','DIRECT_WEB')),
  status                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                          CHECK (status IN ('PENDING_AUTH','ACTIVE','PAUSED','ERROR','DISCONNECTED')),
  -- Credentials: ALL stored as GCP Secret Manager refs — NEVER raw values
  api_credential_ref      VARCHAR(255),       -- GCP secret ref for API key or OAuth token store
  webhook_secret_ref      VARCHAR(255),       -- GCP secret ref for HMAC signing secret
  platform_store_id       VARCHAR(255),       -- merchant's ID on the platform (e.g. DoorDash store_id)
  platform_menu_id        VARCHAR(255),       -- platform's menu ID for push operations
  last_menu_sync_at       TIMESTAMPTZ,
  last_order_received_at  TIMESTAMPTZ,
  error_message           TEXT,               -- last connection error (cleared on successful order)
  auto_accept             BOOLEAN NOT NULL DEFAULT TRUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, location_id, platform)
);
ALTER TABLE aggregator_platform_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON aggregator_platform_connections
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Menu item mappings: PaySurity item_id ↔ platform's item identifier
CREATE TABLE aggregator_menu_mappings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  connection_id       UUID NOT NULL REFERENCES aggregator_platform_connections(id) ON DELETE CASCADE,
  menu_item_id        UUID NOT NULL REFERENCES menu_items(id),
  platform_item_id    VARCHAR(255) NOT NULL,   -- platform's SKU or item_id
  platform_item_name  VARCHAR(255),            -- name on the platform (may differ from ours)
  price_cents_on_platform INTEGER,             -- may differ from our price due to platform fees
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  last_synced_at      TIMESTAMPTZ,
  sync_status         VARCHAR(20) NOT NULL DEFAULT 'IN_SYNC'
                      CHECK (sync_status IN ('IN_SYNC','PENDING','FAILED','REMOVED')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(connection_id, menu_item_id)
);
ALTER TABLE aggregator_menu_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON aggregator_menu_mappings
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Menu sync jobs: track each menu push operation
CREATE TABLE menu_sync_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  connection_id   UUID NOT NULL REFERENCES aggregator_platform_connections(id),
  trigger         VARCHAR(30) NOT NULL
                  CHECK (trigger IN ('MANUAL','ITEM_UPDATE','ITEM_OOS','ITEM_RESTORE','PRICE_CHANGE','FULL_SYNC','SCHEDULED')),
  triggered_by    UUID REFERENCES users(id),  -- NULL for system triggers
  item_ids        UUID[],                      -- NULL = full sync
  status          VARCHAR(20) NOT NULL DEFAULT 'QUEUED'
                  CHECK (status IN ('QUEUED','IN_PROGRESS','COMPLETED','FAILED','PARTIAL')),
  items_synced    INTEGER NOT NULL DEFAULT 0,
  items_failed    INTEGER NOT NULL DEFAULT 0,
  error_detail    JSONB,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE menu_sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON menu_sync_jobs
  USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Raw inbound webhooks: stored before processing for replay / audit
CREATE TABLE aggregator_webhook_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID REFERENCES tenants(id), -- resolved after tenant lookup
  platform          VARCHAR(20) NOT NULL,
  event_type        VARCHAR(50),                  -- e.g. 'ORDER_CREATED', 'ORDER_CANCELLED'
  platform_order_id VARCHAR(255) NOT NULL,
  signature_valid   BOOLEAN NOT NULL,             -- was HMAC/OAuth signature verified?
  raw_payload       JSONB NOT NULL,               -- full inbound body stored verbatim
  processed         BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at      TIMESTAMPTZ,
  result_order_id   UUID REFERENCES orders(id),   -- set after successful processing
  error             TEXT,
  received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform, platform_order_id, event_type)  -- prevent duplicate processing
);
CREATE INDEX idx_agg_webhooks_unprocessed ON aggregator_webhook_events(processed, received_at)
  WHERE processed = FALSE;

-- Delivery tracking: driver location & ETA updates from platforms
CREATE TABLE delivery_tracking_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id),
  platform          VARCHAR(20) NOT NULL,
  event_type        VARCHAR(30) NOT NULL  -- DRIVER_ASSIGNED | EN_ROUTE | ARRIVED | DELIVERED | FAILED
                    CHECK (event_type IN ('DRIVER_ASSIGNED','EN_ROUTE_PICKUP','ARRIVED_PICKUP','PICKED_UP','EN_ROUTE_DELIVERY','ARRIVED_DELIVERY','DELIVERED','FAILED')),
  driver_name       VARCHAR(100),
  driver_phone_masked VARCHAR(20),        -- masked by platform — e.g. +1 (312) 555-XXXX
  driver_lat        DECIMAL(9,6),
  driver_lng        DECIMAL(9,6),
  eta_minutes       INTEGER,
  platform_payload  JSONB,
  occurred_at       TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_delivery_tracking_order ON delivery_tracking_events(order_id, occurred_at DESC);
```

**Seed:** `db/seeds/015_agg_seed.sql`

```sql
-- Platform config for all aggregator integrations (values from DB — never hardcoded)
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable, min_value, max_value)
VALUES
  -- DoorDash
  ('aggregation.doordash.base_url',          'https://openapi.doordash.com', 'string', 'DoorDash Open Platform base URL', FALSE, NULL, NULL),
  ('aggregation.doordash.webhook_path',      '/webhooks/doordash',           'string', 'PaySurity inbound webhook path for DoorDash', FALSE, NULL, NULL),
  ('aggregation.doordash.ack_timeout_sec',   '60',    'integer', 'Auto-accept window for DoorDash orders', FALSE, '20', '60'),
  ('aggregation.doordash.menu_push_path',    '/v2/stores/{store_id}/menus',  'string', 'DoorDash menu push endpoint template', FALSE, NULL, NULL),
  ('aggregation.doordash.auth_method',       'JWT_EDDSA', 'string', 'DoorDash API auth method', FALSE, NULL, NULL),

  -- UberEats
  ('aggregation.ubereats.base_url',          'https://api.uber.com', 'string', 'UberEats API base URL', FALSE, NULL, NULL),
  ('aggregation.ubereats.oauth_url',         'https://auth.uber.com/oauth/v2/token', 'string', 'UberEats OAuth2 token endpoint', FALSE, NULL, NULL),
  ('aggregation.ubereats.webhook_path',      '/webhooks/ubereats', 'string', 'PaySurity inbound webhook path for UberEats', FALSE, NULL, NULL),
  ('aggregation.ubereats.ack_timeout_sec',   '20',    'integer', 'UberEats accept SLA — MUST be within 20s', FALSE, '20', '20'),
  ('aggregation.ubereats.menu_push_path',    '/v1/eats/stores/{store_id}/menus', 'string', 'UberEats menu push path', FALSE, NULL, NULL),

  -- GrubHub
  ('aggregation.grubhub.base_url',           'https://api.grubhub.com', 'string', 'GrubHub API base URL', FALSE, NULL, NULL),
  ('aggregation.grubhub.webhook_path',       '/webhooks/grubhub', 'string', 'PaySurity inbound webhook path for GrubHub', FALSE, NULL, NULL),
  ('aggregation.grubhub.ack_timeout_sec',    '60',    'integer', 'GrubHub order accept window', FALSE, '30', '60'),

  -- Cross-platform
  ('aggregation.menu_propagation_max_sec',   '300',   'integer', 'Max seconds for menu change to reach all platforms', FALSE, '60', '600'),
  ('aggregation.oos_propagation_max_sec',    '60',    'integer', 'Max seconds for OOS (86) to reach all platforms', FALSE, '10', '120'),
  ('aggregation.auto_ready_time_minutes',    '25',    'integer', 'Default quoted ready time in minutes (before AI/ML estimates available)', TRUE, '10', '90'),
  ('aggregation.menu_sync_schedule',         '0 */6 * * *', 'string', 'Cron for scheduled full menu sync (every 6h)', FALSE, NULL, NULL)
ON CONFLICT (key) DO NOTHING;

-- BistroBeest: seed platform connections (dev/staging only — prod requires OAuth auth flow)
DO $$ BEGIN
  IF current_setting('app.environment', TRUE) IN ('development','staging') THEN
    INSERT INTO aggregator_platform_connections
      (tenant_id, location_id, platform, status, api_credential_ref, webhook_secret_ref, platform_store_id, auto_accept)
    VALUES
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'loc00001-0000-0000-0000-000000000001',
       'DOORDASH', 'ACTIVE',
       'projects/paysurity-dev/secrets/bistrobeest-doordash-key/versions/latest',
       'projects/paysurity-dev/secrets/bistrobeest-doordash-webhook-secret/versions/latest',
       'bistrobeest-doordash-sandbox-store-id', TRUE),
      ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'loc00001-0000-0000-0000-000000000001',
       'UBEREATS', 'ACTIVE',
       'projects/paysurity-dev/secrets/bistrobeest-ubereats-tokens/versions/latest',
       'projects/paysurity-dev/secrets/bistrobeest-ubereats-webhook-secret/versions/latest',
       'bistrobeest-ubereats-sandbox-store-id', TRUE)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
```

---

## REQ-AGG-001: Inbound Order Webhook Reception

**Priority:** Must | **Actors:** DoorDash, UberEats, GrubHub (inbound), Kitchen Staff, Manager

---

#### Context & Business Intent

External orders from delivery platforms arrive as webhooks. The system must receive, validate signature, deduplicate, convert to a PaySurity order, route to KDS, and auto-acknowledge — all within the platform's SLA window (20s for UberEats, 60s for DoorDash/GrubHub). Failure to acknowledge within SLA causes the platform to cancel the order and may trigger penalty reviews of the merchant's account.

---

#### Service Layer: `src/modules/aggregation/aggregation.service.ts`

```typescript
/**
 * receiveWebhook(platform, rawBody, headers) — Inbound handler for all platforms.
 * Step 1: Verify HMAC signature using platform-specific signing secret from Secret Manager
 *   DoorDash: ECDSA signature in header 'X-DoorDash-Signature'
 *   UberEats: HMAC-SHA256 in header 'X-Uber-Signature'
 *   GrubHub:  HMAC-SHA256 in header 'X-Grubhub-Hmac-Token'
 * Step 2: Store raw payload in aggregator_webhook_events immediately (before processing)
 *   -- this ensures replay capability even if downstream processing fails
 * Step 3: Deduplicate: check (platform, platform_order_id, event_type) UNIQUE constraint
 *   -- if duplicate: return 200 OK immediately (idempotent)
 * Step 4: Resolve tenant from platform_store_id
 * Step 5: Publish to BullMQ queue 'aggregation.orders.inbound' with high priority
 * Step 6: Return HTTP 200 immediately (async processing in queue — do NOT wait)
 *   -- CRITICAL: must return 200 before SLA window expires
 */
async receiveWebhook(platform: AggregatePlatform, rawBody: Buffer, headers: Record<string, string>): Promise<void>

/**
 * processInboundOrder(webhookEventId) — BullMQ job handler.
 * Called asynchronously after HTTP 200 already returned.
 * 1. Load webhook event from DB
 * 2. Parse platform-specific payload into normalized PaySurity order format
 * 3. Calculate ready_time: NOW() + ConfigService.get(tenantId, 'aggregation.auto_ready_time_minutes')
 * 4. Call createOrderFromExternal()
 * 5. Call acknowledgeOrderOnPlatform() with ready_time
 * 6. Update webhook event: processed=TRUE, result_order_id
 */
async processInboundOrder(webhookEventId: string): Promise<void>

/**
 * createOrderFromExternal(normalized, tenantId, locationId) — Converts normalized external order
 * to a PaySurity orders record. Sets:
 *   source_channel = platform ('DOORDASH' | 'UBEREATS' | 'GRUBHUB')
 *   order_type = 'DELIVERY'
 *   external_order_id = platform's order ID
 *   external_platform = platform
 * Resolves menu_item_ids from aggregator_menu_mappings using platform_item_id.
 * If mapping not found: creates order with unresolved item note; alerts manager via NOT.
 * Fires to KDS: same routing as in-house orders.
 */
async createOrderFromExternal(normalized: NormalizedExternalOrder, tenantId: string, locationId: string): Promise<Order>

/**
 * acknowledgeOrderOnPlatform(connection, orderId, readyTimeMinutes) — Calls platform API.
 * DoorDash: PATCH /v2/orders/{external_order_id}/accept { estimated_pickup_minutes }
 * UberEats: POST /v1/eats/orders/{external_order_id}/acceptPosOrder { rdy_time_offset_seconds }
 * GrubHub:  POST /api/order/{external_order_id}/lines/acknowledge
 * If acknowledgment call fails: retry 3x with 5s backoff; if all fail: alert PaySurity OPS
 */
async acknowledgeOrderOnPlatform(connection: AggregatorConnection, orderId: string, readyTimeMinutes: number): Promise<void>
```

---

#### API Endpoints (Inbound Webhooks — PUBLIC, signature-verified)

| Method | Path | Signature Header | SLA Window |
|---|---|---|---|
| `POST` | `/webhooks/doordash/orders` | `X-DoorDash-Signature` (ECDSA with EdDSA key from DoorDash developer portal) | Must return 200 within 5s (async processing after) |
| `POST` | `/webhooks/ubereats/orders` | `X-Uber-Signature` (HMAC-SHA256, secret from UberEats dev dashboard) | Same — 200 immediately |
| `POST` | `/webhooks/grubhub/orders` | `X-Grubhub-Hmac-Token` (HMAC-SHA256) | Same |

**Signature Verification — DoorDash (EdDSA):**
```typescript
// packages/integrations/doordash/verify-signature.ts
import { createVerify } from 'crypto';

export function verifyDoorDashSignature(
  rawBody: Buffer,
  signatureHeader: string,          // format: "t={timestamp},v1={signature}"
  doordashPublicKey: string         // fetched from GCP Secret Manager, NOT hardcoded
): boolean {
  const parts = Object.fromEntries(signatureHeader.split(',').map(p => p.split('=')));
  const message = `${parts.t}.${rawBody.toString()}`;
  return createVerify('ed25519').update(message).verify(doordashPublicKey, parts.v1, 'base64');
}
```

---

#### Normalized Order Structure (Internal)

```typescript
// packages/shared-types/src/entities/NormalizedExternalOrder.ts
interface NormalizedExternalOrder {
  platform: 'DOORDASH' | 'UBEREATS' | 'GRUBHUB';
  platformOrderId: string;
  platformStoreId: string;
  consumerName: string;
  consumerPhone?: string;          // masked by platform — store as-is
  deliveryAddress: string;         // formatted by platform
  items: Array<{
    platformItemId: string;        // used to lookup aggregator_menu_mappings
    quantity: number;
    specialInstructions?: string;
    modifiers: Array<{ platformModId: string; name: string; priceCents: number }>;
  }>;
  subtotalCents: number;
  deliveryFeeCents: number;
  tipCents: number;
  totalCents: number;
  specialInstructions?: string;
  estimatedPickupMinutes?: number; // platform's estimate; use our config if NULL
  isScheduled: boolean;
  scheduledForTime?: string;       // ISO8601
}
```

---

#### UI/UX — Unified Order Queue

**Location: POS Terminal Home Screen** (same screen as in-house table grid)

A second tab "Delivery Queue" shows all active external orders:

> **Order Card — External:** Red/Orange header badge with platform logo (DD/UE/GH)  
> Order ID: `DD-K3X9` | Consumer: "John D." | Items: 3 | Status: IN_KITCHEN | ETA: 18 min  
> Color coding by platform for instant visual identification

**No separate tablet.** All platforms in one queue on the same screen the kitchen already uses.

**When new order arrives:**
- Chime sound (distinct from in-house — configurable via `posr.kds.external_order_sound` config key)
- Toast notification: "New DoorDash order — K3X9 (3 items)"
- Order auto-accepted (if `auto_accept = TRUE` on connection) within SLA
- Items automatically routed to correct KDS station

**If unmapped item received (mapping not found):**
> ⚠️ Banner on manager screen: "DoorDash order K3X9 has 1 unrecognized item: 'Spicy Chicken Bowl'. Map it now or cancel the item."  
> Manager can: Map to existing item | Create new item | Cancel just that item | Reject full order

---

#### Acceptance Tests

| Test ID | Scenario | Input | Expected |
|---|---|---|---|
| AGG-001-T1 | DoorDash order — valid signature | Simulated DoorDash webhook with valid EdDSA sig | 200 returned in < 1s; order created; KDS fires; acknowledged within 60s |
| AGG-001-T2 | Invalid signature | Webhook with wrong sig | 401 returned; event stored with `signature_valid=FALSE`; not processed |
| AGG-001-T3 | UberEats 20s SLA | Simulated UberEats webhook | 200 returned; platform acknowledged in < 20s total |
| AGG-001-T4 | Duplicate webhook | Same platform_order_id + event_type twice | Second call returns 200; no second order created (idempotent) |
| AGG-001-T5 | Unmapped item | Item not in aggregator_menu_mappings | Order created; unmapped item flagged; manager alert sent |
| AGG-001-T6 | DoorDash order cancellation | `ORDER_CANCELLED` webhook after ORDER_CREATED | Order status → CANCELLED; KDS notified; LOY not earned |

---

## REQ-AGG-002: Menu Parity Engine

**Priority:** Must | **Actors:** Brand Admin, Location Manager, Batch Job

---

#### Context & Business Intent

When a menu item is created, updated, priced-up, priced-down, 86'd (OOS), or restored — that change propagates to all connected aggregator platforms within the timeframes read from config. A price mismatch between BistroBeest's menu and DoorDash's menu results in either order cancellations or margin loss. The Menu Parity Engine prevents this.

---

#### Service Layer: `src/modules/aggregation/menu-sync.service.ts`

```typescript
/**
 * triggerMenuSync(params) — Entry point for all sync operations.
 * mode: 'FULL' | 'PARTIAL' (only changed items)
 * Enqueues a BullMQ job per platform per location.
 * Job writes to menu_sync_jobs with status=QUEUED.
 */
async triggerMenuSync(params: {
  tenantId: string;
  locationId: string;
  itemIds?: string[];   // NULL = full sync
  trigger: MenuSyncTrigger;
  triggeredBy?: string;
}): Promise<MenuSyncJob[]>

/**
 * executePlatformMenuSync(syncJobId) — BullMQ job handler.
 * Builds platform-specific menu payload from menu_items + aggregator_menu_mappings.
 *
 * DoorDash: PUT /v2/stores/{store_id}/menus — full menu JSON in DoorDash format
 * UberEats: PATCH /v1/eats/stores/{store_id}/menus/{menu_id}/items — partial update
 * GrubHub: POST /api/v1/restaurant/{restaurant_id}/menuitem/cascade — their cascade format
 *
 * On success: update aggregator_menu_mappings.sync_status = 'IN_SYNC', last_synced_at = NOW()
 * On failure: sync_status = 'FAILED'; retry after 5min; alert after 3 failures
 *
 * OOS propagation (86): sets item as unavailable on platform, NOT deleted.
 * Platforms: DoorDash uses is_active=false; UberEats uses suspension_reason='OUT_OF_STOCK';
 *            GrubHub uses is_active=false in cascade payload.
 */
async executePlatformMenuSync(syncJobId: string): Promise<void>

/**
 * handle86(itemId, locationId) — Called by menu.service when item is 86'd.
 * 1. Find all active aggregator_platform_connections for this location
 * 2. For each: create menu_sync_jobs for this item only with trigger=ITEM_OOS
 * 3. Enqueue with HIGH priority (must complete within orc.oos_propagation_max_sec config)
 */
async handle86(itemId: string, locationId: string): Promise<void>
```

---

#### API Endpoints

| Method | Path | Auth | Description | Webhook |
|---|---|---|---|---|
| `GET` | `/v1/aggregation/menu-sync/status` | Brand Admin, Location Mgr | Current sync status per platform | — |
| `POST` | `/v1/aggregation/menu-sync` | Brand Admin, Location Mgr | Trigger manual full sync | — |
| `GET` | `/v1/aggregation/menu-mappings` | Brand Admin | View item ↔ platform ID mappings | — |
| `PATCH` | `/v1/aggregation/menu-mappings/{id}` | Brand Admin | Update platform item ID for a mapping | — |
| `GET` | `/v1/aggregation/platforms` | Brand Admin, Location Mgr | Connected platforms + sync health | — |
| `POST` | `/v1/aggregation/platforms` | Brand Admin | Connect a new platform | `aggregation.platform_connected` |
| `DELETE` | `/v1/aggregation/platforms/{id}` | Brand Admin | Disconnect platform | `aggregation.platform_disconnected` |

**Menu Sync Status Response:**
```json
{
  "location_id": "uuid",
  "platforms": [
    {
      "platform": "DOORDASH",
      "status": "ACTIVE",
      "last_sync_at": "2026-03-12T18:00:00Z",
      "items_in_sync": 24,
      "items_pending": 0,
      "items_failed": 0,
      "next_scheduled_sync": "2026-03-13T00:00:00Z"
    }
  ]
}
```

**UI — Platform Management Screen (Merchant Portal):**  
> Per platform card: Logo | Status (green ACTIVE / yellow PENDING / red ERROR) | Items in sync | Last sync time  
> "Sync Now" button → triggers full sync → progress indicator shows  
> "View Mappings" expandable: table of PaySurity item name ↔ Platform item ID ↔ Sync status  
> Red indicator on any FAILED item → "Retry" button per item  
> "Connect Platform" wizard: select platform → OAuth redirect (UberEats) or API key entry (DoorDash, GrubHub) → validate → save

---

#### Batch Jobs

**Job:** `aggregation.menu_sync_verify` | **Cron:** `*/15 * * * *` | **Idempotent:** Yes  
Every 15 min: checks menu_sync_jobs with status='FAILED' older than 15 min → retry up to 3 times.  
After 3 failures: escalates via NOT engine to merchant with troubleshooting link.

**Job:** `aggregation.scheduled_full_sync` | **Cron:** (from platform_config `aggregation.menu_sync_schedule`) | **Idempotent:** Yes  
Full menu push to all platforms for all active locations. Runs even if no changes detected (ensures consistency).

---

## REQ-AGG-003: Delivery Lifecycle Tracking

**Priority:** Should | **Actors:** Consumer, Location Manager, Kitchen Staff

---

#### Service Layer

```typescript
/**
 * handleDeliveryTracking(webhookPayload) — Receives delivery status updates from platforms.
 * DoorDash: dasher (driver) assigned, pickup, en_route, delivered webhooks
 * UberEats: delivery_status webhooks with type: DRIVER_AT_RESTAURANT | COURIER_COMPLETED
 * GrubHub: delivery lifecycle via GrubHub Driver webhooks
 *
 * Creates delivery_tracking_events row.
 * On DRIVER_ASSIGNED: creates consumer notification (name, masked phone, ETA) via NOT engine
 * On PICKED_UP: updates order.status → FULFILLED (kitchen work done)
 * On DELIVERED: fires order.delivered webhook; updates delivery_tracking_events
 *
 * OP-RETAIL-03 [Disbursement Halt]:
 * On FAILED (Abandoned pickup): The ORC Engine acts to isolate the settlement.
 * Halts 3rd-party aggregate fee disbursement instantaneously while continuing to settle and reimburse the Merchant purely for raw food/COGS, eliminating merchant risk for external driver abandonment.
 */
async function handleDeliveryTracking(platform: string, payload: any): Promise<void>
```

**Consumer notification sequence (managed by NOT engine — templates in SEED):**
1. Order confirmed → SMS: "Your BistroBeest order was confirmed! Est. delivery: 25 min."
2. Driver assigned → Push/SMS: "Your driver [Name] is on the way to pick up your order."
3. Picked up → Push: "Your order is on its way! ETA: [X] min."
4. Delivered → Push: "Delivered! Enjoy your meal. [Rate experience] link."

---

## REQ-AGG-004: Revenue Analytics by Channel

**Priority:** Should | **Actors:** Brand Admin, Franchise Operator

---

#### API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/aggregation/analytics/revenue` | Brand Admin, Enterprise Admin | Revenue by channel with platform commission breakdown |
| `GET` | `/v1/aggregation/analytics/order-volume` | Brand Admin | Order count by channel, time-series |
| `GET` | `/v1/aggregation/analytics/items/top-by-channel` | Brand Admin | Bestsellers per channel (DD vs in-house etc.) |
| `GET` | `/v1/aggregation/analytics/commission-cost` | Enterprise Finance | Platform commissions paid (estimated from order totals + rate config) |

**Key metric — "Channel Shift Score":**  
Computed: % of orders that arrived via aggregator vs. direct (in-house + web).  
Goal: merchant should maintain ≥ 40% direct to avoid perpetual platform commission dependency.  
Dashboard: renders a gauge + week-over-week trend. Config key: `aggregation.channel_shift_target_pct` (default `40`, merchant-overridable).

---

## REQ-AGG-005 — REQ-AGG-007: Remaining Requirements Summary

| REQ | Feature | Key Implementation Notes |
|---|---|---|
| AGG-005 | Offline resilience for external orders | If POS is offline when external order arrives webhook: store in `aggregator_webhook_events`; send acknowledgment via fallback server-side service (not terminal); replay to KDS on reconnect |
| AGG-006 | Platform-specific pricing | `aggregator_menu_mappings.price_cents_on_platform` — allows different price per platform. Menu sync uses this price, not `menu_items.price_cents`. Diff tracked; brand admin sees comparison view |
| AGG-007 | Direct web ordering | `source_channel = 'DIRECT_WEB'` on orders from ECO storefront. No aggregator commission. Loyalty earns at full rate. Tracked separately in channel analytics. Connection type: `DIRECT_WEB` in `aggregator_platform_connections` |
