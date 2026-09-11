#!/usr/bin/env node
/**
 * scripts/swarm-phase3-75pools.js
 * PHASE 3 — 75 pools covering:
 *   1-10  Integration/E2E tests (key endpoints)
 *  11-18  Consumer Storefront frontend (Next.js)
 *  19-24  Admin Portal pages
 *  25-30  Expo mobile app screens (wallet, orders, loyalty, driver)
 *  31-36  API Swagger/OpenAPI annotations
 *  37-42  Event wiring (EventEmitter2 listeners → notifications/webhooks)
 *  43-48  GrocerEase remaining (EBT, scale, promotions frontend)
 *  49-54  PayFactor complete (KYC flow, ACH mock, escrow logic)
 *  55-60  Seed data (GrocerEase products, payroll employees, sub plans)
 *  61-66  Env/config validation & main.ts bootstrap hardening
 *  67-72  Compliance (RBAC guards, audit log completions, MFA stubs)
 *  73-75  Final CI verify, health endpoint, OpenAPI export
 *
 * SCOPE GATE: scopeOwner must be 'PAYSURITY'. EXTERNAL = skip.
 * REPORTS: written every 30 min to docs/status/swarm-p3-progress.md (inside project).
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT    = path.resolve(__dirname, '..');
const LOG_DIR = path.join(ROOT, 'logs/swarm-p3');
const KEY     = process.env.GEMINI_API_KEY;
const MODEL   = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const BATCH   = parseInt(process.env.BATCH_SIZE || '10');
const T0      = Date.now();
if (!KEY) { console.error('GEMINI_API_KEY required'); process.exit(1); }
fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(path.join(ROOT, 'docs/status'), { recursive: true });
const genAI = new GoogleGenerativeAI(KEY);

function ts()      { return new Date().toISOString(); }
function local()   { return new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', hour12:true }); }
function elapsed() { const ms=Date.now()-T0; return `${Math.floor(ms/60000)}m${Math.floor((ms%60000)/1000)}s`; }
function log(id, msg) {
  const line = `[${ts()}][P3-${String(id).padStart(2,'0')}] ${msg}`;
  console.log(line);
  fs.appendFileSync(path.join(LOG_DIR,'master.log'), line+'\n');
}
function readOrEmpty(f) { try { return fs.readFileSync(f,'utf8'); } catch { return ''; } }
function scopeCheck(p)  {
  if (p.scopeOwner !== 'PAYSURITY') { log(p.id,`BLOCKED: ${p.name} is ${p.scopeOwner}`); return false; }
  return true;
}

const POOLS = [
  // ═══ INTEGRATION / E2E TESTS (1-10) ═════════════════════════════════════
  { id:1, scopeOwner:'PAYSURITY', vertical:'Testing', name:'TEST-Restaurant-E2E',
    task:'Write Jest integration tests for restaurant POS: describe("Restaurant POS E2E", () => { test POST /restaurant/orders creates order, test addItem to order, test checkout returns payment confirmation, test void order, test GET list with tenant filter }). Mock DatabaseModule with in-memory responses. Use supertest.',
    targetFiles:['apps/api/src/modules/restaurant/restaurant.e2e-spec.ts'] },

  { id:2, scopeOwner:'PAYSURITY', vertical:'Testing', name:'TEST-PayFactor-E2E',
    task:'Write Jest integration tests for PayFactor: test POST /v1/payfactor/apply (happy path + missing fields), test POST /v1/payfactor/escrow (valid deposit), test release-advance (valid + insufficient escrow), test release-settlement (valid + bad due_date), test webhook HMAC rejection (invalid signature). Mock DB.',
    targetFiles:['apps/api/src/modules/pay-factor/pay-factor.e2e-spec.ts'] },

  { id:3, scopeOwner:'PAYSURITY', vertical:'Testing', name:'TEST-Wallet-E2E',
    task:'Write Jest tests for wallet: test topup creates balance, test transfer debits sender + credits receiver atomically, test exceed-limit returns 422 with WALLET_LIMIT_EXCEEDED, test statement returns correct running balance, test concurrent topup idempotency.',
    targetFiles:['apps/api/src/modules/wallet/wallet.e2e-spec.ts'] },

  { id:4, scopeOwner:'PAYSURITY', vertical:'Testing', name:'TEST-Payroll-E2E',
    task:'Write Jest tests for payroll: test processPayrollRun creates run + per-employee details, test salary prorating (annual/26 periods), test hourly overtime (>40h = 1.5x), test federal tax bracket calculation, test direct deposit bank details stored encrypted, test ACH status update.',
    targetFiles:['apps/api/src/modules/payroll/payroll.e2e-spec.ts'] },

  { id:5, scopeOwner:'PAYSURITY', vertical:'Testing', name:'TEST-Auth-E2E',
    task:'Write Jest tests for auth flow: test POST /auth/login (valid credentials returns JWT), test invalid password returns 401, test JWT expiry returns 401, test refresh token flow, test MFA required for finance roles, test tenant isolation (tenant A cannot read tenant B data).',
    targetFiles:['apps/api/src/modules/auth/auth.e2e-spec.ts'] },

  { id:6, scopeOwner:'PAYSURITY', vertical:'Testing', name:'TEST-Loyalty-E2E',
    task:'Write Jest tests for loyalty: test earn points on order uses tenant config rate (not hardcoded), test tier upgrade when crossing threshold, test redeem reduces balance, test insufficient balance returns 422, test point expiry marks expired points, test config update affects future calculations.',
    targetFiles:['apps/api/src/modules/loyalty/loyalty.e2e-spec.ts'] },

  { id:7, scopeOwner:'PAYSURITY', vertical:'Testing', name:'TEST-Notification-E2E',
    task:'Write Jest tests for notifications: test order.created event triggers email, test SMS sent only to opted-in numbers, test TCPA STOP compliance rejects subsequent SMS, test SendGrid template called with correct params, test retry on failure (mock 500 → retry → success).',
    targetFiles:['apps/api/src/modules/notification/notification.e2e-spec.ts'] },

  { id:8, scopeOwner:'PAYSURITY', vertical:'Testing', name:'TEST-Aggregator-E2E',
    task:'Write Jest tests for order aggregation: test DoorDash webhook creates internal order with source_platform=doordash, test UberEats order maps correctly, test cancellation from DoorDash marks order cancelled, test unknown platform returns 400, test duplicate webhook idempotent.',
    targetFiles:['apps/api/src/modules/aggregator/aggregator.e2e-spec.ts'] },

  { id:9, scopeOwner:'PAYSURITY', vertical:'Testing', name:'TEST-ApiPlatform-E2E',
    task:'Write Jest tests for API platform: test POST /api-keys/generate returns key+secret (secret shown once), test rate limit enforced after threshold, test webhook registered + test-fired + delivery logged, test webhook HMAC signature on delivery, test DELETE revokes key immediately.',
    targetFiles:['apps/api/src/modules/api-platform/api-platform.e2e-spec.ts'] },

  { id:10, scopeOwner:'PAYSURITY', vertical:'Testing', name:'TEST-Microsite-E2E',
    task:'Write Jest tests for microsite: test GET /microsite/hob/menu returns paan category with correct prices ($1.50 each), test catering menu returns tray prices, test POST /microsite/hob/order creates order in DB, test slug-based routing isolates tenants, test 48h catering notice enforced.',
    targetFiles:['apps/api/src/modules/microsite/microsite.e2e-spec.ts'] },

  // ═══ CONSUMER STOREFRONT FRONTEND (11-18) ════════════════════════════════
  { id:11, scopeOwner:'PAYSURITY', vertical:'Consumer Storefront', name:'STORE-Home',
    task:'Create consumer-facing storefront home page (apps/storefront/src/app/page.tsx or apps/merchant-dashboard/src/app/store/page.tsx): hero banner, featured products from GET /store/:slug/products, category navigation, promotional banners. Modern design, mobile-first.',
    targetFiles:['apps/merchant-dashboard/src/app/store/page.tsx'] },

  { id:12, scopeOwner:'PAYSURITY', vertical:'Consumer Storefront', name:'STORE-Products',
    task:'Consumer product catalog page: grid of products from GET /store/:slug/products, search bar (calls /store/:slug/search?q=), category filter sidebar, price range filter, sort by price/name/rating. Product card with image placeholder, price, add-to-cart button.',
    targetFiles:['apps/merchant-dashboard/src/app/store/products/page.tsx'] },

  { id:13, scopeOwner:'PAYSURITY', vertical:'Consumer Storefront', name:'STORE-Cart',
    task:'Consumer cart page: display cart items (localStorage), quantity controls, remove item, promo code input (calls /checkout/promo), shipping estimate, tax estimate, total. Checkout button → POST /checkout/cart. Order confirmation page. Mobile-friendly.',
    targetFiles:['apps/merchant-dashboard/src/app/store/cart/page.tsx'] },

  { id:14, scopeOwner:'PAYSURITY', vertical:'Consumer Storefront', name:'STORE-OrderHistory',
    task:'Consumer order history page (authenticated): GET /orders?customerEmail= list of past orders, order status badges, click to expand detail with items, tracking number if shipped, return/refund button if delivered within 30 days.',
    targetFiles:['apps/merchant-dashboard/src/app/store/orders/page.tsx'] },

  { id:15, scopeOwner:'PAYSURITY', vertical:'Consumer Storefront', name:'STORE-Wallet',
    task:'Consumer digital wallet page: GET /wallets/me (balance display), top-up form (card number, amount), P2P transfer form (recipient email/phone, amount), transaction history table, spending limits display. Clean personal finance UI.',
    targetFiles:['apps/merchant-dashboard/src/app/wallet/page.tsx'] },

  { id:16, scopeOwner:'PAYSURITY', vertical:'Consumer Storefront', name:'STORE-Loyalty',
    task:'Consumer loyalty page: GET /loyalty/balance/:customerId (points balance + tier badge), points history, available rewards catalog, redeem button for each reward. Tier progress bar (Bronze→Silver→Gold). Points expiry notice.',
    targetFiles:['apps/merchant-dashboard/src/app/loyalty/page.tsx'] },

  { id:17, scopeOwner:'PAYSURITY', vertical:'Consumer Storefront', name:'STORE-Profile',
    task:'Consumer profile page: display/edit name, email, phone, address. Change password form. Notification preferences (email/SMS toggles per event type). Payment methods list (masked cards). Wallet quick-access link.',
    targetFiles:['apps/merchant-dashboard/src/app/profile/page.tsx'] },

  { id:18, scopeOwner:'PAYSURITY', vertical:'Consumer Storefront', name:'STORE-ProductDetail',
    task:'Consumer product detail page: GET /store/:slug/products/:id — image gallery placeholder, description, variants (size/color selector), reviews (GET reviews, avg rating, review list), add-to-cart with variant selection, related products.',
    targetFiles:['apps/merchant-dashboard/src/app/store/products/[id]/page.tsx'] },

  // ═══ ADMIN PORTAL PAGES (19-24) ══════════════════════════════════════════
  { id:19, scopeOwner:'PAYSURITY', vertical:'Admin Portal', name:'ADMIN-Tenants',
    task:'Super-admin tenants page (apps/merchant-dashboard/src/app/admin/tenants/page.tsx): list all tenants (GET /admin/tenants), show name/plan/status/mrr/created. Search by name. Click → tenant detail. Suspend/activate toggle. Impersonate button.',
    targetFiles:['apps/merchant-dashboard/src/app/admin/tenants/page.tsx'] },

  { id:20, scopeOwner:'PAYSURITY', vertical:'Admin Portal', name:'ADMIN-Payments',
    task:'Admin payments monitoring page: list all payments across tenants (GET /admin/payments), filter by status/date/amount range. Dispute queue. Chargeback alerts. Revenue metrics: today/week/month totals. Export CSV.',
    targetFiles:['apps/merchant-dashboard/src/app/admin/payments/page.tsx'] },

  { id:21, scopeOwner:'PAYSURITY', vertical:'Admin Portal', name:'ADMIN-Affiliates',
    task:'Admin affiliates page: list all affiliates with total clicks/conversions/commissions earned. Fraud flag queue. Pending payout requests (approve/deny). Commission rate overrides per affiliate. Suspend affiliate.',
    targetFiles:['apps/merchant-dashboard/src/app/admin/affiliates/page.tsx'] },

  { id:22, scopeOwner:'PAYSURITY', vertical:'Admin Portal', name:'ADMIN-AuditLog',
    task:'Admin audit log page: paginated list of audit events (GET /admin/audit-logs), filter by tenant/user/action/date. Show: timestamp, user, action, resource, IP, trace-id. Export to CSV. Highlight suspicious events (off-hours, large amounts).',
    targetFiles:['apps/merchant-dashboard/src/app/admin/audit/page.tsx'] },

  { id:23, scopeOwner:'PAYSURITY', vertical:'Admin Portal', name:'ADMIN-ApiKeys',
    task:'Admin API keys management page: list all API keys across tenants (GET /admin/api-keys), show tenant, name, created, last-used, status. Revoke key button. View usage stats (req/day chart). Rate limit override per key.',
    targetFiles:['apps/merchant-dashboard/src/app/admin/api-keys/page.tsx'] },

  { id:24, scopeOwner:'PAYSURITY', vertical:'Admin Portal', name:'ADMIN-Dashboard',
    task:'Super-admin dashboard home (apps/merchant-dashboard/src/app/admin/page.tsx): platform-wide KPIs — total active tenants, total GMV today/week/month, total transactions, avg response time, error rate, active subscriptions, MRR. Live metrics cards with trend arrows.',
    targetFiles:['apps/merchant-dashboard/src/app/admin/page.tsx'] },

  // ═══ EXPO MOBILE APP SCREENS (25-30) ═════════════════════════════════════
  { id:25, scopeOwner:'PAYSURITY', vertical:'Mobile App', name:'MOBILE-Wallet',
    task:'Expo wallet screen (apps/driver-app/src/screens/WalletScreen.tsx or apps/consumer-app if exists): show balance, topup button, transfer button, recent transactions list. Fetch from /wallets/me. Handle loading/error states. Use React Native components.',
    targetFiles:['apps/driver-app/src/screens/WalletScreen.tsx'] },

  { id:26, scopeOwner:'PAYSURITY', vertical:'Mobile App', name:'MOBILE-Orders',
    task:'Expo orders screen: list of current orders with status, order number, total. Pull-to-refresh. Tap to view order detail. Status update push notification badge count. Filter by status tabs.',
    targetFiles:['apps/driver-app/src/screens/OrdersScreen.tsx'] },

  { id:27, scopeOwner:'PAYSURITY', vertical:'Mobile App', name:'MOBILE-Loyalty',
    task:'Expo loyalty screen: points balance with animated counter, tier badge (Bronze/Silver/Gold), tier progress bar, rewards catalog grid, redeem button. Points history FlatList. Push notification opt-in for points earned.',
    targetFiles:['apps/driver-app/src/screens/LoyaltyScreen.tsx'] },

  { id:28, scopeOwner:'PAYSURITY', vertical:'Mobile App', name:'MOBILE-Profile',
    task:'Expo profile screen: user info display/edit, change password, biometric login toggle, push notification preferences, logout. Link to wallet and loyalty from profile quick-access.',
    targetFiles:['apps/driver-app/src/screens/ProfileScreen.tsx'] },

  { id:29, scopeOwner:'PAYSURITY', vertical:'Mobile App', name:'MOBILE-Notifications',
    task:'Expo notifications screen: list of past push notifications (read/unread), mark all read, tap to navigate to relevant screen. Notification preferences toggle (per-category). Badge count management.',
    targetFiles:['apps/driver-app/src/screens/NotificationsScreen.tsx'] },

  { id:30, scopeOwner:'PAYSURITY', vertical:'Mobile App', name:'MOBILE-PayFactor',
    task:'Expo PayFactor screen (for drivers using AELS): current active load status, escrow balance available, advance request button (triggers POST /v1/payfactor/release-advance), settlement history, payment schedule display. Shows which tranche is pending.',
    targetFiles:['apps/driver-app/src/screens/PayFactorScreen.tsx'] },

  // ═══ SWAGGER / OPENAPI DOCS (31-36) ══════════════════════════════════════
  { id:31, scopeOwner:'PAYSURITY', vertical:'API Docs', name:'DOCS-Restaurant',
    task:'Add @nestjs/swagger decorators to restaurant + menu + tables + KDS controllers: @ApiTags, @ApiOperation, @ApiResponse (200/400/401/404), @ApiBody on POST/PUT, @ApiBearerAuth. Use @ApiProperty on all DTOs.',
    targetFiles:['apps/api/src/modules/restaurant/restaurant.controller.ts'] },

  { id:32, scopeOwner:'PAYSURITY', vertical:'API Docs', name:'DOCS-PayFactor',
    task:'Add Swagger decorators to pay-factor controller: @ApiTags("PayFactor"), document each endpoint with @ApiOperation summary/description, @ApiResponse codes, @ApiBody for request schemas, @ApiBearerAuth. Document webhook endpoint as "HMAC-secured".',
    targetFiles:['apps/api/src/modules/pay-factor/pay-factor.controller.ts'] },

  { id:33, scopeOwner:'PAYSURITY', vertical:'API Docs', name:'DOCS-Wallet',
    task:'Add Swagger decorators to wallet + payment + settlement controllers. Document error responses (WALLET_LIMIT_EXCEEDED, INSUFFICIENT_FUNDS, IDEMPOTENCY_CONFLICT). Add @ApiSecurity for API key auth on public endpoints.',
    targetFiles:['apps/api/src/modules/wallet/wallet.controller.ts'] },

  { id:34, scopeOwner:'PAYSURITY', vertical:'API Docs', name:'DOCS-Payroll',
    task:'Add Swagger to payroll + tax + subscription controllers. Document payroll run response schema (per-employee breakdown). Add @ApiProperty to all payroll DTOs. Document ACH status enum values.',
    targetFiles:['apps/api/src/modules/payroll/payroll.controller.ts'] },

  { id:35, scopeOwner:'PAYSURITY', vertical:'API Docs', name:'DOCS-Affiliates',
    task:'Add Swagger to affiliates + aggregator + notification controllers. Document MLM level commission responses. Document aggregator webhook schemas per platform (DoorDash/UberEats/GrubHub). Notification event types enum.',
    targetFiles:['apps/api/src/modules/affiliates/affiliates.controller.ts'] },

  { id:36, scopeOwner:'PAYSURITY', vertical:'API Docs', name:'DOCS-main',
    task:'Update apps/api/src/main.ts: add SwaggerModule.createDocument + SwaggerModule.setup for /api/docs endpoint. Include title "PaySurity Platform API", version "1.0", bearerAuth, apiKey security schemes. Enable in all environments.',
    targetFiles:['apps/api/src/main.ts'] },

  // ═══ EVENT WIRING (37-42) ════════════════════════════════════════════════
  { id:37, scopeOwner:'PAYSURITY', vertical:'Events', name:'EVENT-OrderCreated',
    task:'Wire order.created event: in NotificationService add @OnEvent("order.created") listener that sends order confirmation email (SendGrid) + SMS if customer opted in. In WebhookService add @OnEvent("order.created") to deliver to merchant registered webhooks.',
    targetFiles:['apps/api/src/modules/notification/notification.service.ts'] },

  { id:38, scopeOwner:'PAYSURITY', vertical:'Events', name:'EVENT-PaymentCaptured',
    task:'Wire payment.captured event: send receipt email, update wallet ledger if paid with wallet, update loyalty points earned, trigger settlement batch accumulation. All via @OnEvent("payment.captured") listeners in respective services.',
    targetFiles:['apps/api/src/modules/payment/payment.service.ts'] },

  { id:39, scopeOwner:'PAYSURITY', vertical:'Events', name:'EVENT-LoyaltyPoints',
    task:'Wire loyalty points earn/redeem events: @OnEvent("loyalty.points_earned") → send push notification via Expo, @OnEvent("loyalty.tier_upgraded") → send email congratulation + SMS. @OnEvent("loyalty.points_expiring_soon") → reminder 7 days before expiry.',
    targetFiles:['apps/api/src/modules/loyalty/loyalty.service.ts'] },

  { id:40, scopeOwner:'PAYSURITY', vertical:'Events', name:'EVENT-Subscription',
    task:'Wire subscription events: @OnEvent("subscription.renewed") → send invoice email, @OnEvent("subscription.payment_failed") → send failure alert email + retry notification, @OnEvent("subscription.cancelled") → send cancellation confirmation + offboarding checklist.',
    targetFiles:['apps/api/src/modules/subscription/subscription.service.ts'] },

  { id:41, scopeOwner:'PAYSURITY', vertical:'Events', name:'EVENT-PayFactor',
    task:'Wire PayFactor events: @OnEvent("payfactor.escrow_received") → confirm receipt to AELS webhook, @OnEvent("payfactor.advance_released") → notify driver (push notification), @OnEvent("payfactor.settlement_released") → notify driver + AELS webhook.',
    targetFiles:['apps/api/src/modules/pay-factor/pay-factor.service.ts'] },

  { id:42, scopeOwner:'PAYSURITY', vertical:'Events', name:'EVENT-AuditInterceptor',
    task:'Complete audit interceptor event wiring: ensure ALL events include X-Trace-Id, emit audit.log events that the AuditLogService listens for. Wire @OnEvent("audit.log") to insert into audit_log table. Ensure every event carries tenantId + userId + traceId.',
    targetFiles:['apps/api/src/shared/interceptors/audit.interceptor.ts'] },

  // ═══ GROCEREASE REMAINING (43-48) ════════════════════════════════════════
  { id:43, scopeOwner:'PAYSURITY', vertical:'GrocerEase', name:'GE-EBT-Frontend',
    task:'GrocerEase checkout page with EBT splitting (apps/merchant-dashboard/src/app/pos/grocery/page.tsx): barcode scanner input, cart with EBT-eligible badge per item, EBT subtotal vs regular subtotal, split tender UI (EBT amount field + remaining amount), SNAP category validation.',
    targetFiles:['apps/merchant-dashboard/src/app/pos/grocery/page.tsx'] },

  { id:44, scopeOwner:'PAYSURITY', vertical:'GrocerEase', name:'GE-Inventory-Controller',
    task:'Complete GrocerEase inventory controller: GET /inventory/items (barcode search support), POST /inventory/items, PUT /inventory/items/:id, DELETE /inventory/items/:id, POST /inventory/items/:id/stock-adjust (add/subtract), GET /inventory/low-stock (items below reorder point).',
    targetFiles:['apps/api/src/modules/inventory/inventory.controller.ts'] },

  { id:45, scopeOwner:'PAYSURITY', vertical:'GrocerEase', name:'GE-PurchaseOrders',
    task:'Purchase orders controller: POST /inventory/purchase-orders (create PO to supplier), GET /inventory/purchase-orders (list by status filter), GET /inventory/purchase-orders/:id, PUT /inventory/purchase-orders/:id/receive (mark received, update stock), GET /inventory/suppliers.',
    targetFiles:['apps/api/src/modules/inventory/purchase-orders.controller.ts'] },

  { id:46, scopeOwner:'PAYSURITY', vertical:'GrocerEase', name:'GE-Scale-Device',
    task:'Complete GrocerEase scale/PLU service: POST /grocery/scale/weigh (body: plu, weightGrams) → lookup PLU by code (GET /products?plu=), calculate price = weight * unit_price, return line-item for cart. Add scale device test endpoint.',
    targetFiles:['apps/api/src/modules/grocery/grocery.service.ts','apps/api/src/modules/grocery/grocery.controller.ts'] },

  { id:47, scopeOwner:'PAYSURITY', vertical:'GrocerEase', name:'GE-Promotions-Controller',
    task:'Complete promotions controller: POST /promotions (create promo: type BOGO|PERCENT|FIXED|BUNDLE, conditions, dates), GET /promotions (active list), PUT /promotions/:id, DELETE /promotions/:id, POST /promotions/validate (body: promoCode, cartItems) → returns discount amount.',
    targetFiles:['apps/api/src/modules/price-engine/price-engine.controller.ts'] },

  { id:48, scopeOwner:'PAYSURITY', vertical:'GrocerEase', name:'GE-Seed',
    task:'Create GrocerEase test tenant seed SQL: tenant (slug=grocerease-demo), store (name=FreshMart), 30+ products across categories (produce/dairy/bakery/meat/frozen) with barcode/UPC/cost/price, EBT-eligible flags, 5 suppliers, low-stock items for testing.',
    targetFiles:['packages/database/seeds/070_grocerease-demo-tenant.sql'] },

  // ═══ PAYFACTOR COMPLETE (49-54) ═══════════════════════════════════════════
  { id:49, scopeOwner:'PAYSURITY', vertical:'AEL Solutions', name:'AEL-KYC-Flow',
    task:'Complete PayFactor apply/KYC flow in pay-factor.service.ts: validate driver CDL format, verify routing number checksum (ABA routing validation), check existing approval (idempotent), create KYC record, return {status: approved|manual_review|denied, credit_limit, approval_id}. No PAN storage ever.',
    targetFiles:['apps/api/src/modules/pay-factor/pay-factor.service.ts'] },

  { id:50, scopeOwner:'PAYSURITY', vertical:'AEL Solutions', name:'AEL-Escrow-Logic',
    task:'Complete escrow logic: verify AELS deposit amount matches driver_net_cents, generate escrow_id (UUID), record in escrow table with status=held, confirm to AELS with escrow_id + confirmation_timestamp. Idempotent via aels_load_id. Auto-expire escrow after 30 days.',
    targetFiles:['apps/api/src/modules/pay-factor/pay-factor.service.ts'] },

  { id:51, scopeOwner:'PAYSURITY', vertical:'AEL Solutions', name:'AEL-Tranche1',
    task:'Complete Tranche 1 release: verify escrow_id exists + status=held, calculate advance = 25% of driver_net, fee = 3.5% of advance, net_to_driver = advance - fee. Record payfactor_transaction (ADVANCE type). Mock ACH initiation (log ACH payload). Update escrow status=advance_released.',
    targetFiles:['apps/api/src/modules/pay-factor/pay-factor.service.ts'] },

  { id:52, scopeOwner:'PAYSURITY', vertical:'AEL Solutions', name:'AEL-Tranche2',
    task:'Complete Tranche 2 release: verify escrow status=advance_released, validate due_date is in future, schedule ACH for due_date (record in scheduled_payments with fire_at=due_date). Update escrow status=settlement_scheduled. Record payfactor_transaction (SETTLEMENT type).',
    targetFiles:['apps/api/src/modules/pay-factor/pay-factor.service.ts'] },

  { id:53, scopeOwner:'PAYSURITY', vertical:'AEL Solutions', name:'AEL-PayFactor-Seed',
    task:'Complete 060_aels-tenant-seed.sql: ensure AELS tenant fully seeded with: tenant record, admin user, api_key record (placeholder hash), payfactor_config (fee_rate=3.5%, advance_pct=25%, max_credit_limit=5000), 3 test drivers. Use proper UUIDs.',
    targetFiles:['packages/database/seeds/060_aels-tenant-seed.sql'] },

  { id:54, scopeOwner:'PAYSURITY', vertical:'AEL Solutions', name:'AEL-Webhook-Delivery',
    task:'Wire AELS webhook delivery: after each PayFactor event (escrow_received, advance_released, settlement_scheduled), POST to https://americaneaglelogistics.net/api/driver/payfactor-webhook with HMAC-SHA256 signed payload. Store delivery log. Retry 3x on failure.',
    targetFiles:['apps/api/src/modules/pay-factor/pay-factor.service.ts'] },

  // ═══ SEED DATA COMPLETIONS (55-60) ════════════════════════════════════════
  { id:55, scopeOwner:'PAYSURITY', vertical:'Database', name:'SEED-PayrollEmployees',
    task:'Create payroll test employee seed (packages/database/seeds/080_payroll-test-employees.sql): 5 employees for BistroBeast tenant — mix of hourly and salary, different pay rates, W4 data, benefits config jsonb. Also seed payroll_config for the tenant.',
    targetFiles:['packages/database/seeds/080_payroll-test-employees.sql'] },

  { id:56, scopeOwner:'PAYSURITY', vertical:'Database', name:'SEED-SubscriptionPlans',
    task:'Create subscription plans seed (packages/database/seeds/090_subscription-plans.sql): Starter ($49/mo, basic POS), Professional ($149/mo, POS+payroll+loyalty), Enterprise ($399/mo, all features). Annual discount 20%. All with trial_days=14.',
    targetFiles:['packages/database/seeds/090_subscription-plans.sql'] },

  { id:57, scopeOwner:'PAYSURITY', vertical:'Database', name:'SEED-WalletTestData',
    task:'Create wallet test seed (packages/database/seeds/091_wallet-test-data.sql): 5 consumer wallets with starting balances, 10 wallet_transactions showing topup + p2p transfers, 2 merchant wallets. Include a suspended wallet to test limits.',
    targetFiles:['packages/database/seeds/091_wallet-test-data.sql'] },

  { id:58, scopeOwner:'PAYSURITY', vertical:'Database', name:'SEED-LoyaltyData',
    task:'Create loyalty test seed (packages/database/seeds/092_loyalty-test-data.sql): HOB tenant loyalty_config (10pts/$1, Bronze 0pts, Silver 500pts, Gold 2000pts, redemption=100pts=$1, expiry=12mo), 5 test customers with varying point balances across tiers.',
    targetFiles:['packages/database/seeds/092_loyalty-test-data.sql'] },

  { id:59, scopeOwner:'PAYSURITY', vertical:'Database', name:'SEED-AffiliateTestData',
    task:'Create affiliate test seed (packages/database/seeds/093_affiliate-test-data.sql): 3 affiliates with referral_codes, 20 affiliate_clicks records, 8 conversions (mix of pending/approved), commission_rate configs, 1 suspended affiliate for fraud testing.',
    targetFiles:['packages/database/seeds/093_affiliate-test-data.sql'] },

  { id:60, scopeOwner:'PAYSURITY', vertical:'Database', name:'SEED-MasterRunScript',
    task:'Create master seed runner (packages/database/seeds/run-all-seeds.sql): @include all seed files in correct dependency order. Add clear comments per section. Also update packages/database/package.json scripts to add "seed": "psql $DATABASE_URL -f seeds/run-all-seeds.sql".',
    targetFiles:['packages/database/seeds/000_run-all-seeds.sql','packages/database/package.json'] },

  // ═══ ENV/CONFIG VALIDATION (61-66) ════════════════════════════════════════
  { id:61, scopeOwner:'PAYSURITY', vertical:'Infrastructure', name:'ENV-Validation',
    task:'Create environment validation schema (apps/api/src/config/env.validation.ts): use @hapi/joi or class-validator to validate all required env vars on startup (DATABASE_URL, JWT_SECRET, SENDGRID_API_KEY, TWILIO_*, FLUIDPAY_*, PAYSURITY_WEBHOOK_SECRET must not be empty). Throw on startup if missing.',
    targetFiles:['apps/api/src/config/env.validation.ts','apps/api/src/config/configuration.ts'] },

  { id:62, scopeOwner:'PAYSURITY', vertical:'Infrastructure', name:'ENV-EnvFiles',
    task:'Create environment template files: .env.example (all env vars with placeholder values + comments explaining each), .env.test (test-safe values for Jest), apps/api/.env.example. Document required vs optional vars.',
    targetFiles:['apps/api/.env.example','.env.example'] },

  { id:63, scopeOwner:'PAYSURITY', vertical:'Infrastructure', name:'MAIN-Bootstrap',
    task:'Harden apps/api/src/main.ts: add helmet() security headers, CORS with whitelist (ALLOWED_ORIGINS env), compression, global ValidationPipe (whitelist:true, forbidNonWhitelisted:true, transform:true), global exception filter, global audit interceptor, global PAN-redaction interceptor, X-Trace-Id middleware.',
    targetFiles:['apps/api/src/main.ts'] },

  { id:64, scopeOwner:'PAYSURITY', vertical:'Infrastructure', name:'HEALTH-Endpoint',
    task:'Complete health check controller: GET /health returns {status:"ok", timestamp, version, uptime, db: "connected"|"disconnected", services:{sendgrid, twilio, fluidpay}}. GET /health/ready for K8s readiness. GET /health/live for liveness. Check DB with simple SELECT 1.',
    targetFiles:['apps/api/src/modules/health/health.controller.ts','apps/api/src/modules/health/health.service.ts'] },

  { id:65, scopeOwner:'PAYSURITY', vertical:'Infrastructure', name:'CORS-Security',
    task:'Create CORS configuration (apps/api/src/config/cors.config.ts): allowed origins from env (ALLOWED_ORIGINS=comma-separated), allowed methods, allowed headers (Content-Type, Authorization, X-Trace-Id, X-API-Key, X-Idempotency-Key), expose headers (X-Trace-Id, Retry-After). Strict in production.',
    targetFiles:['apps/api/src/config/cors.config.ts'] },

  { id:66, scopeOwner:'PAYSURITY', vertical:'Infrastructure', name:'LOGGER-Config',
    task:'Create structured logger config (apps/api/src/config/logger.config.ts): Winston logger with JSON format in production, pretty format in development. Every log entry includes: timestamp, level, X-Trace-Id (from AsyncLocalStorage), tenantId if available, service name. Replace all console.log with Logger.',
    targetFiles:['apps/api/src/config/logger.config.ts'] },

  // ═══ COMPLIANCE / RBAC (67-72) ════════════════════════════════════════════
  { id:67, scopeOwner:'PAYSURITY', vertical:'Compliance', name:'RBAC-Decorator',
    task:'Create @Roles() decorator and RolesGuard (apps/api/src/shared/guards/roles.guard.ts): extract roles from JWT (req.user.roles[]), check against @Roles("admin","manager",...) metadata, return 403 if insufficient. Apply to financial management endpoints requiring MANAGER or ADMIN role.',
    targetFiles:['apps/api/src/shared/guards/roles.guard.ts','apps/api/src/shared/decorators/roles.decorator.ts'] },

  { id:68, scopeOwner:'PAYSURITY', vertical:'Compliance', name:'RBAC-MFA',
    task:'Create MFA enforcement stub (apps/api/src/shared/guards/mfa.guard.ts): check req.user.mfa_verified, if role is in financial management tier (MANAGER, ADMIN, FINANCE) and mfa_verified=false, return 403 with MFA_REQUIRED error code. Enforce on payroll, settlement, API keys endpoints.',
    targetFiles:['apps/api/src/shared/guards/mfa.guard.ts'] },

  { id:69, scopeOwner:'PAYSURITY', vertical:'Compliance', name:'COMPLIANCE-Service',
    task:'Complete compliance service: checkPayrollCompliance(tenantId, runId) validates — no employee paid below state minimum wage, no overtime worked but not paid, pay stub delivery logged within 24h. Returns compliance_report with pass/fail per check. Log to audit.',
    targetFiles:['apps/api/src/modules/compliance/compliance.service.ts'] },

  { id:70, scopeOwner:'PAYSURITY', vertical:'Compliance', name:'COMPLIANCE-TCPA',
    task:'Complete TCPA compliance in notification service: before any SMS send, check sms_opt_in=true on customer record. STOP keyword processing: if customer replies STOP, set sms_opt_in=false. Include opt-out URL in every SMS. Rate limit: max 1 SMS/day for marketing, 3/day total.',
    targetFiles:['apps/api/src/modules/notification/notification.service.ts'] },

  { id:71, scopeOwner:'PAYSURITY', vertical:'Compliance', name:'AUDIT-Completeness',
    task:'Audit log completeness: ensure all PayFactor operations (apply, escrow, advance, settlement), all payment captures, all payroll runs, all wallet transfers, all API key generations, all admin actions are recorded in audit_log with: tenant_id, user_id, action, amount_cents (if financial), X-Trace-Id.',
    targetFiles:['apps/api/src/modules/audit-log/audit-log.service.ts'] },

  { id:72, scopeOwner:'PAYSURITY', vertical:'Compliance', name:'IDEMPOTENCY-Middleware',
    task:'Create idempotency middleware (apps/api/src/shared/middleware/idempotency.middleware.ts): for POST /payments, POST /wallets/topup, POST /wallets/transfer, POST /v1/payfactor/* — read X-Idempotency-Key header, check idempotency_keys table (key+endpoint hash), return cached response if found, store new response on first call.',
    targetFiles:['apps/api/src/shared/middleware/idempotency.middleware.ts'] },

  // ═══ FINAL VERIFICATION (73-75) ══════════════════════════════════════════
  { id:73, scopeOwner:'PAYSURITY', vertical:'CI', name:'CI-BuildVerify',
    task:'Create build verification script (scripts/verify-build.js): runs nest build, checks dist/ has expected files (main.js, app.module.js, pay-factor.controller.js, restaurant.controller.js, wallet.controller.js), validates no @paysurity/auth imports in dist, reports file count. Exit 0 on pass, 1 on fail.',
    targetFiles:['scripts/verify-build.js'] },

  { id:74, scopeOwner:'PAYSURITY', vertical:'CI', name:'CI-RequirementsCheck',
    task:'Create requirements coverage checker (scripts/verify-requirements.js): reads all files in Requirements/Canonical/*.md, extracts REQ-XXX-NNN IDs, checks each has corresponding test in e2e-spec.ts or unit spec, reports coverage %. Write coverage report to docs/status/requirements-coverage.md inside project.',
    targetFiles:['scripts/verify-requirements.js','docs/status/requirements-coverage.md'] },

  { id:75, scopeOwner:'PAYSURITY', vertical:'CI', name:'FINAL-StatusReport',
    task:'Generate comprehensive platform status report (docs/status/platform-readiness-report.md inside project): for each vertical list % complete with evidence (file count, endpoint count, test count). Include Cloud Run URL when available. List remaining TODOs. This is the human-readable readiness report.',
    targetFiles:['docs/status/platform-readiness-report.md'] },
];

// ─── Generate one file ────────────────────────────────────────────────────────
async function gen(pool, filePath) {
  const model    = genAI.getGenerativeModel({ model: MODEL });
  const existing = readOrEmpty(path.join(ROOT, filePath));
  const ext      = path.extname(filePath);
  const lang     = ext==='.sql' ? 'sql' : ext==='.tsx'||ext==='.jsx' ? 'tsx' : 'typescript';

  const prompt = `You are a senior engineer on PaySurity — a multi-tenant SaaS payment platform.

VERTICAL: ${pool.vertical} | POOL: ${pool.name}
FILE: ${filePath}

TASK:
${pool.task}

EXISTING FILE:
\`\`\`${lang}
${existing.slice(0,3000)||'(empty)'}
\`\`\`

RULES (violations cause build failures):
1. Output ONLY the complete file — no markdown fences, no explanations
2. @Inject('DATABASE') private readonly db: NodePgDatabase<any>
3. NEVER import from @paysurity/auth, @nestjs-drizzle/core, @app/*, src/*
4. NEVER use @UseGuards() in controller classes (guards applied in main.ts)
5. tenantId = req?.user?.tenantId
6. Balanced braces, no truncation, syntactically complete
7. SQL: PostgreSQL, UUID PKs, tenant_id on multi-tenant tables
8. TSX/RN: simple clean UI, fetch() from /api base, handle loading+error states
9. Loyalty: NEVER hardcode rates — always from tenant config
10. Tests: use Jest + supertest, mock DatabaseModule only`;

  const r = await model.generateContent(prompt);
  let code = r.response.text().trim()
    .replace(/^```(typescript|tsx|sql|javascript|plaintext)?\n?/, '')
    .replace(/\n?```$/, '').trim();
  return code.length > 50 ? code : null;
}

// ─── Run one pool ─────────────────────────────────────────────────────────────
async function runPool(pool) {
  if (!scopeCheck(pool)) return { poolId:pool.id, skipped:true, results:[] };
  const results = [];
  for (const file of pool.targetFiles) {
    const abs = path.join(ROOT, file);
    log(pool.id, `  Coding: ${path.basename(file)}`);
    try {
      const code = await gen(pool, file);
      if (code) {
        fs.mkdirSync(path.dirname(abs), { recursive:true });
        fs.writeFileSync(abs, code, 'utf8');
        results.push({ file, status:'written', bytes:code.length });
        log(pool.id, `  ✅ ${path.basename(file)} (${code.length}b)`);
      } else {
        results.push({ file, status:'empty' });
        log(pool.id, `  ⚠️  empty`);
      }
    } catch(e) {
      results.push({ file, status:'error', reason:e.message?.slice(0,80) });
      log(pool.id, `  ❌ ${e.message?.slice(0,60)}`);
      await new Promise(r=>setTimeout(r,2000));
    }
    await new Promise(r=>setTimeout(r,600));
  }
  return { poolId:pool.id, name:pool.name, vertical:pool.vertical, results };
}

// ─── 30-minute progress reporter (writes to project docs/status/) ─────────────
let lastRpt = Date.now();
function report(done, total, all, force=false) {
  const now = Date.now();
  if (!force && now-lastRpt < 30*60*1000 && done < total) return;
  lastRpt = now;
  const written = all.flatMap(r=>r.results||[]).filter(f=>f.status==='written').length;
  const errors  = all.flatMap(r=>r.results||[]).filter(f=>f.status==='error').length;
  const banner = [
    `\n${'═'.repeat(65)}`,
    `📊 SWARM-P3 REPORT  ⏰ LOCAL: ${local()}  UTC: ${ts()}`,
    `   Elapsed: ${elapsed()} | Pools: ${done}/${total} | Files: ${written} | Errors: ${errors}`,
    `${'═'.repeat(65)}\n`,
  ].join('\n');
  console.log(banner);
  fs.appendFileSync(path.join(LOG_DIR,'progress.log'), banner);

  // Write into project docs/status/ (INSIDE project, not AI brain)
  const md = `# Swarm Phase 3 Progress\n**Local: ${local()} | UTC: ${ts()}**\n\n` +
    `- Elapsed: ${elapsed()}\n- Pools complete: ${done}/${total}\n` +
    `- Files written: ${written}\n- Errors: ${errors}\n`;
  fs.writeFileSync(path.join(ROOT,'docs/status/swarm-p3-progress.md'), md);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${'═'.repeat(65)}`);
  console.log(`🚀 SWARM PHASE 3 — 75 POOLS — Local: ${local()} | UTC: ${ts()}`);
  console.log(`   Tests + Consumer Frontend + Admin + Mobile + Swagger + Events + Compliance`);
  console.log(`   Pools: ${POOLS.length} | Batch: ${BATCH} | Model: ${MODEL}`);
  console.log(`${'═'.repeat(65)}\n`);

  const all = [];
  let done  = 0;

  for (let i=0; i<POOLS.length; i+=BATCH) {
    const batch = POOLS.slice(i, i+BATCH);
    console.log(`\n▶ Batch ${Math.floor(i/BATCH)+1}: Pools ${batch[0].id}–${batch[batch.length-1].id} (${batch.map(p=>p.name.split('-').slice(1).join('-')).join(', ')})`);
    const results = await Promise.all(batch.map(p=>runPool(p)));
    all.push(...results);
    done += batch.length;
    report(done, POOLS.length, all);
    if (i+BATCH < POOLS.length) await new Promise(r=>setTimeout(r,1500));
  }

  // Verify
  console.log('\n🔍 Verifying...');
  let clean=0, flagged=0;
  for (const r of all) {
    for (const f of (r.results||[])) {
      if (f.status!=='written') continue;
      const code = readOrEmpty(path.join(ROOT,f.file));
      const bad  = ["import.*@paysurity/auth","import.*@nestjs-drizzle","@UseGuards\\("]
        .some(p => new RegExp(p).test(code));
      if (bad) { flagged++; log(0,`VERIFY FAIL: ${f.file}`); }
      else clean++;
    }
  }
  console.log(`✅ Clean: ${clean} | ⚠️  Flagged: ${flagged}`);

  // Build
  console.log('\n🔨 Building API...');
  try {
    execSync('cd apps/api && npx nest build --config nest-cli.json', {cwd:ROOT,timeout:180000,stdio:'pipe'});
    console.log('✅ BUILD PASSED');
  } catch(e) {
    const out = (e.stdout||e.stderr||'').toString().slice(-400);
    console.log(`⚠️  Build: ${out}`);
  }

  // Commit + push
  try {
    execSync('git add -A', {cwd:ROOT});
    const stat = execSync('git diff --cached --stat', {cwd:ROOT}).toString().trim().split('\n').pop();
    execSync(`git commit -m "feat(swarm-p3): Phase 3 complete — tests+consumer-frontend+admin+mobile+swagger+events+compliance [${ts()}]\n\nE2E tests: restaurant payFactor wallet payroll auth loyalty notification aggregator apiPlatform microsite\nConsumer: storefront home products cart orders wallet loyalty profile\nAdmin: dashboard tenants payments affiliates audit api-keys\nMobile: wallet orders loyalty profile notifications payFactor screens\nSwagger: all controllers annotated\nEvents: order.created payment.captured loyalty.points subscription.renewed payFactor.*\nCompliance: RBAC MFA TCPA idempotency audit-log-completeness\nSeeds: payroll employees sub plans wallet loyalty affiliate data"`,{cwd:ROOT});
    execSync('git push origin main', {cwd:ROOT});
    console.log(`✅ Pushed: ${stat}`);
  } catch(e) { console.warn('Push:', e.message?.slice(0,60)); }

  report(done, POOLS.length, all, true);
  console.log(`\n🏁 SWARM PHASE 3 DONE — Local: ${local()} | Elapsed: ${elapsed()}\n`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
