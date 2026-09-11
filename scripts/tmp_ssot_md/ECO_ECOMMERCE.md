# Canonical Requirements: E-Commerce Storefronts
**Vertical:** E-Commerce (ECO) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**Test Tenant:** BistroBeest (`tenant_id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa`)  
**Stack:** Next.js storefront (SSR for SEO); embeds into merchant's own domain via DNS configuration

---

## Database Schema

**Migration:** `db/migrations/015_ecommerce.sql`

```sql
-- Storefront configurations: one per merchant location/brand
CREATE TABLE storefronts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  location_id       UUID REFERENCES locations(id),      -- NULL = brand-level storefront
  brand_id          UUID NOT NULL REFERENCES brands(id),
  slug              VARCHAR(100) NOT NULL UNIQUE,        -- subdomain: bistrobeest.paysurity.com/{slug}
  custom_domain     VARCHAR(255),                        -- bistrobeest.com (DNS CNAME to PaySurity)
  custom_domain_verified BOOLEAN NOT NULL DEFAULT FALSE,
  status            VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
                    CHECK (status IN ('DRAFT','ACTIVE','SUSPENDED','ARCHIVED')),
  -- Theming (no hardcoded colors/fonts)
  theme_config      JSONB NOT NULL DEFAULT '{}',
  -- {primary_color, secondary_color, font_family, logo_url, banner_url, favicon_url}
  -- SEO
  meta_title        VARCHAR(160),
  meta_description  VARCHAR(300),
  -- Features
  online_ordering_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  reservations_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
  gift_cards_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
  loyalty_widget_enabled  BOOLEAN NOT NULL DEFAULT TRUE,
  ai_chat_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE storefronts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON storefronts USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Shopping carts: persisted server-side (consumer may resume on another device)
CREATE TABLE shopping_carts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id),
  storefront_id     UUID NOT NULL REFERENCES storefronts(id),
  consumer_id       UUID REFERENCES consumers(id),       -- NULL for guest carts
  agentic_delegation_id UUID,                            -- Sovereign Sub-Agent API linkage
  session_token     VARCHAR(255),                        -- for guest cart continuity
  items             JSONB NOT NULL DEFAULT '[]',
  -- [{menu_item_id, item_name_snapshot, quantity, unit_price_cents, modifiers}]
  promo_code        VARCHAR(50),
  promo_discount_cents INTEGER NOT NULL DEFAULT 0,
  loyalty_redemption_cents INTEGER NOT NULL DEFAULT 0,
  fulfillment_type  VARCHAR(20) DEFAULT 'PICKUP'
                    CHECK (fulfillment_type IN ('PICKUP','DELIVERY','DINE_IN')),
  delivery_address  JSONB,
  scheduled_for     TIMESTAMPTZ,                         -- future order scheduling
  status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE','ABANDONED','CONVERTED')),
  converted_order_id UUID REFERENCES orders(id),
  expires_at        TIMESTAMPTZ NOT NULL,                -- = NOW() + 'eco.cart_ttl_hours' config
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON shopping_carts USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
CREATE INDEX idx_carts_consumer ON shopping_carts(consumer_id) WHERE status = 'ACTIVE';
CREATE INDEX idx_carts_session ON shopping_carts(session_token) WHERE status = 'ACTIVE';

-- Promo codes: merchant-defined discount codes
CREATE TABLE promo_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  code            VARCHAR(50) NOT NULL,
  discount_type   VARCHAR(20) NOT NULL CHECK (discount_type IN ('PERCENT','FLAT_CENTS','FREE_ITEM')),
  discount_value  INTEGER NOT NULL,                 -- % (0-100) or cents or menu_item_id
  max_uses        INTEGER,                          -- NULL = unlimited
  uses_count      INTEGER NOT NULL DEFAULT 0,
  min_order_cents INTEGER NOT NULL DEFAULT 0,
  valid_from      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_to        TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, code)
);
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON promo_codes USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

**Seed:** `db/seeds/015_eco_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable, min_value, max_value)
VALUES
  ('eco.cart_ttl_hours',          '24',    'integer', 'Shopping cart TTL in hours before expiry', TRUE, '1', '168'),
  ('eco.abandon_email_delay_min', '60',    'integer', 'Minutes after cart abandonment to send recovery email', TRUE, '30', '1440'),
  ('eco.delivery.min_order_cents','1500',  'integer', 'Minimum order for delivery ($15.00)', TRUE, '0', '10000'),
  ('eco.delivery.radius_miles',   '5.0',   'decimal', 'Max delivery radius in miles', TRUE, '0.5', '50.0'),
  ('eco.scheduled.max_days_ahead','14',    'integer', 'Max days ahead for scheduled orders', TRUE, '1', '30'),
  ('eco.storefront.cdn_ttl_sec',  '3600',  'integer', 'CDN TTL for storefront static assets', FALSE, '60', '86400'),
  ('eco.seo.og_image_width',      '1200',  'integer', 'OpenGraph image width in pixels', FALSE, NULL, NULL),
  ('eco.seo.og_image_height',     '630',   'integer', 'OpenGraph image height in pixels', FALSE, NULL, NULL)
ON CONFLICT (key) DO NOTHING;

-- BistroBeest demo storefront
DO $$ BEGIN
  IF current_setting('app.environment', TRUE) IN ('development','staging') THEN
    INSERT INTO storefronts (
      id, tenant_id, brand_id, slug, status,
      theme_config, meta_title, meta_description,
      online_ordering_enabled, loyalty_widget_enabled, ai_chat_enabled
    ) VALUES (
      'eco00001-0000-0000-0000-000000000001',
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'bbbb0001-0000-0000-0000-000000000001',
      'bistrobeest',
      'ACTIVE',
      '{"primary_color":"#1A1A2E","secondary_color":"#E94560","font_family":"Inter","logo_url":"https://cdn.paysurity.com/tenants/bistrobeest/logo.png"}',
      'BistroBeest — Fine Dining Chicago',
      'Order online from BistroBeest Chicago. Pickup, delivery, and dine-in. Earn loyalty points with every order.',
      TRUE, TRUE, TRUE
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;
```

---

## REQ-ECO-001: Storefront Online Ordering

**Priority:** Must | **Actors:** Consumer, ORC Service, LOY Service, TAX Service

```typescript
/**
 * Storefront checkout flow (Next.js → NestJS API):
 * 1. Consumer builds cart (server-persisted)
 * 2. Consumer selects fulfillment: PICKUP (time slot) | DELIVERY (address + radius check) | DINE_IN (table QR)
 * 3. Loyalty authentication (optional — same OTP flow as AI session)
 * 4. Promo code application: validatePromoCode() → apply discount
 * 5. Tax calculation: TAX service calculateOrderTax() (same API as POS)
 * 6. Payment (Dual-Path): 
 *    - Primary Path: Sovereign One-Click (FIDO2/FedNow) atomic settlement
 *    - Secondary Path: Card Fallback (FluidPay hosted fields / tokens)
 *    - OP-OFFLINE-05 [Provisional Safe-Harbor]: If the physical store is currently operating offline (T_outage), the online storefront MUST assign the order a 'PROVISIONAL' legal status. Inventory guarantees are suspended until the Vector Clock CRDT merge completes. Consumers must explicitly accept this Safe-Harbor variance.
 * 7. Order created → fires to POS / KDS (same as walk-in order)
 * 8. Confirmation email + SMS via NOT engine (TRANSACTIONAL class)
 * 9. Real-time status page: orderId-based SSE stream (Server-Sent Events) showing:
 *    RECEIVED → PREPARING → READY_FOR_PICKUP | OUT_FOR_DELIVERY
 */
```

---

## REQ-ECO-002: Cart Abandonment Recovery

```typescript
/**
 * Batch: eco.abandon_cart_recovery | Cron: */10 * * * * | Idempotent: YES
 * Find carts WHERE status=ACTIVE AND updated_at < NOW() - interval 'eco.abandon_email_delay_min minutes'
 * AND consumer_id IS NOT NULL (must be logged in to recover)
 * Send via NOT engine: template_key='eco.cart_abandon', channel=EMAIL, class=SERVICE
 * Email: "You left something behind 🛒" with cart items summary + resume link
 * After 24h with no recovery: status→ABANDONED; log eco.cart_abandoned analytics event
 */
```

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/storefronts/{slug}` | Public | Storefront config + menu |
| `POST` | `/v1/carts` | None/Consumer | Create or resume cart |
| `PATCH` | `/v1/carts/{id}` | Cart session | Update items, fulfillment |
| `DELETE` | `/v1/carts/{id}/items/{itemId}` | Cart session | Remove item |
| `POST` | `/v1/carts/{id}/apply-promo` | Cart session | Apply promo code |
| `POST` | `/v1/carts/{id}/checkout` | Cart session | Convert to order + initiate payment |
| `GET` | `/v1/orders/{id}/status-stream` | None (SSE, order token) | Real-time order status SSE |
| `GET` | `/v1/storefronts` | Merchant Admin | List storefronts |
| `POST` | `/v1/storefronts` | Merchant Admin | Create storefront |
| `PATCH` | `/v1/storefronts/{id}` | Merchant Admin | Update theme/settings |

---

## PaySurity Advantage (Superiority V2.0)

**ADV-ECOM-01 [Temporal Intent Segmentation]:**
Implements bifurcated inventory lock strategies. Online storefront carts utilize Redis-backed Soft Locks (TTL 15 mins) restricting multi-cart claiming.

**ADV-ECOM-02 [Sovereign One-Click Checkout]:**
The storefront checkout natively injects FedNow FIDO2 Passkeys as the primary 1-click execution tier, bypassing Visa/Mastercard processing.

**ADV-ECOM-03 [Agentic Commerce Gateway]:**
Native headless ordering logic supporting AI delegation via `agentic_delegation_id`. Furthermore, the SSR Next.js engine MUST automatically compile and emit JSON-LD structured data on all product endpoints to secure machine-speed taxonomy discovery by external agentic swarms.
