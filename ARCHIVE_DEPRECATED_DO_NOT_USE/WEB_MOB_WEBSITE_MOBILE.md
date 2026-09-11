# Canonical Requirements: Public Website & Consumer Mobile App
**Verticals:** WEB (Public Website) + MOB (Mobile Apps) | **Version:** v2.0-dev-prompt | **Date:** 2026-03-12  
**Standard:** `DEV_IMPLEMENTATION_STANDARD.md` — all values from DB, no hardcoding  
**WEB Stack:** Next.js 14+ (ISR for marketing pages; SSR for dynamic)  
**MOB Stack:** React Native + Expo (single codebase: iOS + Android)

---

## WEB: Public Website (paysurity.com)

### Database Schema

**Migration:** `db/migrations/070_web_content.sql`

```sql
-- CMS content: blog posts, press releases, case studies
CREATE TABLE cms_pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(255) NOT NULL UNIQUE,
  page_type       VARCHAR(30) NOT NULL CHECK (page_type IN ('BLOG','PRESS','CASE_STUDY','LANDING','PRICING','LEGAL')),
  title           VARCHAR(255) NOT NULL,
  meta_description VARCHAR(300),
  body_mdx        TEXT NOT NULL,          -- MDX content rendered at build time
  og_image_url    TEXT,
  published_at    TIMESTAMPTZ,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  author_name     VARCHAR(100),
  tags            TEXT[] NOT NULL DEFAULT '{}',
  view_count      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pricing page data: sourced from subscription_plans table (no hardcoded prices on website)
-- Pricing page reads: GET /v1/subscriptions/plans → renders dynamically
-- IMPORTANT: pricing page is SSR (server-side rendered) so it always reflects current DB prices

-- Microsite Tethering: Atomic Inventory Sync (ADV-ECOM-05)
-- The Website/Microsite Engine MUST structurally tether all product/menu views exclusively to `inventory_skus.atomic_sync_status`. 
-- Stale cache presentation is prohibited. Over-selling triggers a strict lattice vector revert mathematically.
```

**Seed:** `db/seeds/070_web_seed.sql`

```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  ('web.revalidate_sec',         '3600', 'integer', 'ISR revalidation interval in seconds (1 hour)', FALSE),
  ('web.og_image_default',       'https://cdn.paysurity.com/og-default.png', 'string', 'Default Open Graph image', FALSE),
  ('web.savings_estimator.avg_processing_fee_pct', '2.9', 'decimal', 'Competitor avg fee used in savings estimator', FALSE),
  ('web.savings_estimator.our_fee_pct',            '2.25','decimal', 'PaySurity fee used in savings estimator comparison', FALSE)
ON CONFLICT (key) DO NOTHING;
```

---

### REQ-WEB-001: Public Marketing Site

**Pages Required:**

| Page | Route | Type | SEO Priority |
|---|---|---|---|
| Home | `/` | SSR | H1: "The All-in-One Platform for Modern Restaurants" |
| Pricing | `/pricing` | SSR (live from DB) | H1: "Simple, Transparent Pricing" |
| Features | `/features/{vertical}` | ISR | One page per vertical |
| Blog | `/blog` + `/blog/{slug}` | ISR | Author, date, OG image |
| About | `/about` | ISR | — |
| Merchant Application | `/apply` | SSR | Redirects to onboarding wizard |
| CCPA/Privacy | `/privacy` | Static | Legal text; links to /privacy/ccpa-request |
| CCPA Request Form | `/privacy/ccpa-request` | SSR | POST to /v1/privacy/ccpa |

**SEO Requirements (all pages):**
```html
<!-- Required on every page — values from DB/config, never hardcoded -->
<title>{page.title} | PaySurity</title>
<meta name="description" content="{page.meta_description}" />
<meta property="og:title" content="{page.title}" />
<meta property="og:description" content="{page.meta_description}" />
<meta property="og:image" content="{page.og_image_url ?? web.og_image_default}" />
<meta property="og:image:width" content="{eco.seo.og_image_width}" />   <!-- from config -->
<meta property="og:image:height" content="{eco.seo.og_image_height}" /> <!-- from config -->
<link rel="canonical" href="https://paysurity.com{page.slug}" />
```

**Savings Estimator Widget (embeddable):**  
- Input: monthly revenue, current processing fee %  
- Calculation: savings = monthly_revenue × (competitor_fee - our_fee) / 100  
- Rates from config: never hardcoded in UI code  
- CTA: "See how much you'd save → [Start Free Trial]"

---

## MOB: Consumer Mobile App (PaySurity Consumer)

### Database Schema

```sql
-- (New columns on existing tables)

-- Consumer push notification preferences (added to consumers table)
-- push_expo_token: VARCHAR(500) — stored on consumers table
-- See NOT_NOTIFICATION_ENGINE.md for delivery flow

-- Mobile-specific consumer sessions (tracked in user_sessions with device metadata)
-- mobile_device_id VARCHAR(255) — added to user_sessions for device management

-- No purely mobile-only tables — mobile surfaces existing data via existing APIs
```

**Seed:**
```sql
INSERT INTO platform_config (key, value, data_type, description, is_merchant_overridable)
VALUES
  ('mob.consumer.version.min_ios',     '16.0', 'string', 'Minimum iOS version supported', FALSE),
  ('mob.consumer.version.min_android', '10',   'string', 'Minimum Android version supported', FALSE),
  ('mob.consumer.biometric_login',     'true', 'boolean', 'Allow biometric (FaceID/Fingerprint) login', FALSE),
  ('mob.consumer.session_ttl_days',    '90',   'integer', 'Mobile session TTL in days (vs 30d web)', FALSE),
  ('mob.consumer.force_update.ios',    '',     'string',  'Min iOS app version; older forced to update', FALSE),
  ('mob.consumer.force_update.android','',     'string',  'Min Android app version; older forced to update', FALSE),
  ('mob.merchant.features',           '["reports","alerts","clock_in_out","approvals"]', 'json', 'Features in merchant mobile app', FALSE)
ON CONFLICT (key) DO NOTHING;
```

---

### REQ-MOB-001: Consumer Mobile App Screens

**App:** `apps/consumer-mobile` (React Native + Expo)

| Screen | What It Shows | Key Interactions |
|---|---|---|
| Home | Current loyalty points + tier; nearby merchant offers; recent orders | Tap merchant → AI chat or menu |
| Loyalty | Points balance, tier progress bar; transaction history; expiry warnings | Redeem button (opens QR for cashier scan) |
| Wallet | Balance, recent transactions; load money; transfer to bank | Biometric auth for transfers > $100 |
| Order History | All past orders across all merchants | Reorder with one tap |
| AI Chat | Opens AI session for any enrolled merchant | Floating chat button per merchant |
| Notifications | All past notifications; preference toggles | Opt out of marketing SMS/email per merchant |
| Profile | Name, phone, linked merchants, payment methods | Edit phone → OTP re-verify |

**Authentication:**
- Onboarding: phone number → OTP (NOT engine TRANSACTIONAL)
- Session: JWT stored in Expo SecureStore (never AsyncStorage)
- Biometric: Expo LocalAuthentication; biometric gates wallet transfers
- Multi-device: each device gets own user_sessions row; max 5 per config

**Offline & Edge Communications:**
- Loyalty QR code: cached locally; works offline (signed by server; cashier validates on POS which may be online)
- Order history: cached 24h; reads from local SQLite (expo-sqlite)

**OP-RETAIL-04 [Edge-Mesh Sync]:**
- Native handheld Waiter/Mobile POS logic strictly mandates direct mDNS (Multicast DNS) deployment across the local subnet. 
- Waiter devices ping the KDS and Printer network iteratively bounding latency <200ms continuously. If cloud routing drops, edge-mesh peer routing guarantees 100% operation inside the four walls independent of external disruption.

---

### REQ-MOB-002: Merchant Mobile App

**App:** `apps/merchant-mobile` (React Native + Expo)

Features from config `mob.merchant.features` (array read from DB):

| Feature | What It Does |
|---|---|
| `reports` | Today's revenue, orders, top items (read-only dashboard) |
| `alerts` | Push notifications for OPS alerts (dispute opened, payroll due, revenue drop) |
| `clock_in_out` | Employee clock in/out with GPS-tagged timestamp |
| `approvals` | Payroll approval with MFA (biometric counts as MFA on mobile) |

**Merchant mobile does NOT include:** menu management, full POS operations, payroll calculation. These remain on web/POS terminal for screen real estate reasons.

---

### REQ-MOB-003: Push Notifications

Expo Push Notification integration (see NOT_NOTIFICATION_ENGINE.md for full delivery flow):

```typescript
// On app launch: register push token
const token = await Notifications.getExpoPushTokenAsync({ projectId: EXPO_PROJECT_ID });
// POST /v1/consumers/me/push-token { expo_push_token: token }
// Server stores on consumers.push_expo_token (VARCHAR 500)

// Notification handlers:
// Foreground: show in-app toast (not OS notification)
// Background: OS notification; tap → deep link to relevant screen
// Deep link format: paysurity://screen/order/{order_id}
//                   paysurity://screen/loyalty
//                   paysurity://screen/wallet
//                   paysurity://screen/alerts/{alert_id}
```

---

### API Endpoints (web + mobile)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/v1/consumer/profile` | Consumer | Own profile |
| `PATCH` | `/v1/consumer/profile` | Consumer | Update phone/name (phone change requires OTP) |
| `GET` | `/v1/consumer/notifications` | Consumer | Notification history |
| `PATCH` | `/v1/consumer/notifications/preferences` | Consumer | Update opt-in/out |
| `POST` | `/v1/consumer/push-token` | Consumer | Register/update Expo push token |
| `DELETE` | `/v1/consumer/push-token` | Consumer | Deregister (on logout) |
| `GET` | `/v1/consumer/orders` | Consumer | Order history across all merchants |
| `GET` | `/v1/web/cms/{slug}` | None (public) | CMS page content |
| `GET` | `/v1/web/sitemap` | None (public) | Sitemap data for Next.js sitemap.xml |
| `GET` | `/v1/app/config` | Consumer (mobile) | App-wide config (feature flags, min versions) |

---

### Acceptance Tests

| Test ID | Scenario | Expected |
|---|---|---|
| WEB-001-T1 | Pricing page price match DB | Change GROWTH plan price in DB → pricing page shows new price without redeploy |
| WEB-001-T2 | CCPA request form | Submit → ccpa_requests record created; confirmation email sent |
| MOB-001-T1 | Biometric wallet transfer | Biometric passes → transfer initiated; skips TOTP |
| MOB-001-T2 | Offline loyalty QR | Disable network → QR still displays; cashier scan works |
| MOB-001-T3 | Force update | App version below min → blocked screen with App Store link |
| MOB-001-T4 | Push token registration | App launch → token saved to DB; test push delivers to device |
| MOB-001-T5 | Deep link from notification | Tap alert push → opens correct screen (order detail or alert) |
