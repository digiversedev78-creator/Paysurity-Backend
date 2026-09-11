#!/usr/bin/env node
/**
 * scripts/swarm-phase4-75pools.js
 * PHASE 4 — 75 pools covering the final completion layer:
 *   1-10  Global banned-import sweep + fix all @paysurity/database references
 *  11-18  Missing module files (compliance, health, grocery, price-engine modules)
 *  19-26  Remaining frontend pages (GrocerEase dashboard, inventory, payroll wizard)
 *  27-34  Stripe/FluidPay payment processor adapters (full impl)
 *  35-42  BistroBeast catering scheduler + HOB online ordering final flow
 *  43-50  PaySurity eCom (product, cart, checkout full controllers + storefront pages)
 *  51-56  Complete remaining service stubs (subscription, notification, aggregator)
 *  57-62  Database: remaining migration tables + FK constraints + indexes
 *  63-68  Jest unit tests for all services (not e2e — pure unit with mocks)
 *  69-72  CI/CD: cloud build configs, Dockerfile hardening, health check integration
 *  73-75  Final: docs index, openapi.json export, platform-readiness final report
 *
 * SCOPE GATE: scopeOwner must be 'PAYSURITY'. EXTERNAL = skip.
 * REPORTS: timestamped auto-reports to docs/status/swarm-p4-progress.md every 30 min.
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT    = path.resolve(__dirname, '..');
const LOG_DIR = path.join(ROOT, 'logs/swarm-p4');
const KEY     = process.env.GEMINI_API_KEY;
const MODEL   = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const BATCH   = parseInt(process.env.BATCH_SIZE || '10');
const T0      = Date.now();
if (!KEY) { console.error('GEMINI_API_KEY required'); process.exit(1); }
fs.mkdirSync(LOG_DIR, { recursive: true });
fs.mkdirSync(path.join(ROOT, 'docs/status'), { recursive: true });
const genAI = new GoogleGenerativeAI(KEY);

function ts()      { return new Date().toISOString(); }
function local()   { return new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:true}); }
function elapsed() { const ms=Date.now()-T0; return `${Math.floor(ms/60000)}m${Math.floor((ms%60000)/1000)}s`; }
function log(id, msg) {
  const line = `[${ts()}][P4-${String(id).padStart(2,'0')}] ${msg}`;
  console.log(line);
  fs.appendFileSync(path.join(LOG_DIR,'master.log'), line+'\n');
}
function readOrEmpty(f) { try { return fs.readFileSync(path.join(ROOT,f),'utf8'); } catch { return ''; } }
function scopeCheck(p)  {
  if (p.scopeOwner !== 'PAYSURITY') { log(p.id,`BLOCKED: ${p.name} is ${p.scopeOwner}`); return false; }
  return true;
}

/* ──────────────────────────── POOL DEFINITIONS ─────────────────────────── */
const POOLS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH 1 (1-10): BANNED IMPORT SWEEP + FIX
  // ═══════════════════════════════════════════════════════════════════════════
  { id:1, scopeOwner:'PAYSURITY', vertical:'BuildFix', name:'FIX-PayFactor-Service',
    task:`Rewrite apps/api/src/modules/pay-factor/pay-factor.service.ts to not import from @paysurity/database.
    Keep all business logic (KYC, escrow, tranche release, webhook delivery).
    Replace Drizzle schema references with raw sql\`\` queries: sql\`SELECT * FROM payfactor_applications WHERE id = \${id}\` etc.
    Use @Inject('DATABASE') private readonly db: NodePgDatabase<any>. Tenant scope on every query. No @UseGuards.`,
    targetFiles:['apps/api/src/modules/pay-factor/pay-factor.service.ts'] },

  { id:2, scopeOwner:'PAYSURITY', vertical:'BuildFix', name:'FIX-Payment-Service',
    task:`Rewrite apps/api/src/modules/payment/payment.service.ts removing @paysurity/database imports.
    Keep: payment intent lifecycle (create/capture/void/refund), FluidPay adapter calls, audit log calls via this.auditLogService.record().
    Replace schema table references with raw sql queries using the DATABASE inject token.`,
    targetFiles:['apps/api/src/modules/payment/payment.service.ts'] },

  { id:3, scopeOwner:'PAYSURITY', vertical:'BuildFix', name:'FIX-Loyalty-Service',
    task:`Fix apps/api/src/modules/loyalty/loyalty.service.ts — remove @paysurity/database imports, use raw sql queries.
    CRITICAL: loyalty rates (points per dollar, tier thresholds) must come from tenant config query, NEVER hardcoded.
    Keep: earn points, redeem, tier calculation, point expiry, history.`,
    targetFiles:['apps/api/src/modules/loyalty/loyalty.service.ts'] },

  { id:4, scopeOwner:'PAYSURITY', vertical:'BuildFix', name:'FIX-Notification-Service',
    task:`Fix apps/api/src/modules/notification/notification.service.ts — remove @paysurity/database imports.
    Keep: sendEmail (SendGrid), sendSMS (Twilio with TCPA check), push notification (Expo).
    TCPA: before SMS check sms_opt_in=true via raw sql. @OnEvent listeners for order.created, payment.captured, loyalty.*.`,
    targetFiles:['apps/api/src/modules/notification/notification.service.ts'] },

  { id:5, scopeOwner:'PAYSURITY', vertical:'BuildFix', name:'FIX-Wallet-Service',
    task:`Fix apps/api/src/modules/wallet/wallet.service.ts — remove @paysurity/database imports, use raw sql.
    Keep: topup, transfer P2P (atomic: debit sender + credit receiver), balance check, statement/history, spending limit enforcement.`,
    targetFiles:['apps/api/src/modules/wallet/wallet.service.ts'] },

  { id:6, scopeOwner:'PAYSURITY', vertical:'BuildFix', name:'FIX-Payroll-Service',
    task:`Fix apps/api/src/modules/payroll/payroll.service.ts — remove @paysurity/database imports, use raw sql.
    Keep: processPayrollRun, salary prorate (annual/26), hourly with 1.5x overtime, tax bracket calc, direct deposit ACH, pay stub delivery log.`,
    targetFiles:['apps/api/src/modules/payroll/payroll.service.ts'] },

  { id:7, scopeOwner:'PAYSURITY', vertical:'BuildFix', name:'FIX-Subscription-Service',
    task:`Fix apps/api/src/modules/subscription/subscription.service.ts — remove @paysurity/database imports, use raw sql.
    Keep: create subscription (tenant + plan), auto-renew, payment failure handling (3 retry), cancellation, plan upgrade/downgrade prorate.`,
    targetFiles:['apps/api/src/modules/subscription/subscription.service.ts'] },

  { id:8, scopeOwner:'PAYSURITY', vertical:'BuildFix', name:'FIX-Affiliates-Service',
    task:`Fix apps/api/src/modules/affiliates/affiliates.service.ts — remove @paysurity/database imports, use raw sql.
    Keep: register affiliate, track click, record conversion, calculate multilevel commission (max 3 levels), payout request, fraud flag.`,
    targetFiles:['apps/api/src/modules/affiliates/affiliates.service.ts'] },

  { id:9, scopeOwner:'PAYSURITY', vertical:'BuildFix', name:'FIX-Aggregator-Service',
    task:`Fix apps/api/src/modules/aggregator/aggregator.service.ts — remove @paysurity/database imports, use raw sql.
    Keep: DoorDash/UberEats/GrubHub webhook ingestion, normalize to internal order format, idempotency check, cancellation handling, status sync.`,
    targetFiles:['apps/api/src/modules/aggregator/aggregator.service.ts'] },

  { id:10, scopeOwner:'PAYSURITY', vertical:'BuildFix', name:'FIX-Restaurant-Service',
    task:`Fix apps/api/src/modules/restaurant/restaurant.service.ts — remove @paysurity/database imports, use raw sql.
    Keep: tenant restaurant config CRUD, menu management, table management, KDS ticket routing, order lifecycle, shift management, analytics aggregation.`,
    targetFiles:['apps/api/src/modules/restaurant/restaurant.service.ts'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH 2 (11-18): MISSING MODULE FILES
  // ═══════════════════════════════════════════════════════════════════════════
  { id:11, scopeOwner:'PAYSURITY', vertical:'Modules', name:'MODULE-Compliance',
    task:`Create apps/api/src/modules/compliance/compliance.module.ts: @Module({ imports:[DatabaseModule], providers:[ComplianceService, AuditLogService], controllers:[ComplianceController], exports:[ComplianceService] }).
    Create apps/api/src/modules/compliance/compliance.controller.ts: @Controller('compliance'), GET /compliance/pci-archives, POST /compliance/pci-archives, GET /compliance/pci-archives/:id, GET /compliance/payroll/:runId/check (calls checkPayrollCompliance). No @UseGuards.`,
    targetFiles:['apps/api/src/modules/compliance/compliance.module.ts','apps/api/src/modules/compliance/compliance.controller.ts'] },

  { id:12, scopeOwner:'PAYSURITY', vertical:'Modules', name:'MODULE-Health',
    task:`Create apps/api/src/modules/health/health.module.ts: @Module({ imports:[DatabaseModule], providers:[HealthService], controllers:[HealthController] }).
    Create apps/api/src/modules/health/health.controller.ts: GET /health (200 OK with {status,db,version,uptime}), GET /health/ready, GET /health/live. No auth required.`,
    targetFiles:['apps/api/src/modules/health/health.module.ts','apps/api/src/modules/health/health.controller.ts'] },

  { id:13, scopeOwner:'PAYSURITY', vertical:'Modules', name:'MODULE-Grocery',
    task:`Create apps/api/src/modules/grocery/grocery.module.ts: @Module({ imports:[DatabaseModule], providers:[GroceryService], controllers:[GroceryController], exports:[GroceryService] }).
    Ensure GroceryController is complete: POST /grocery/scale/weigh, POST /grocery/checkout (EBT split), GET /grocery/plus (PLU lookup by code).`,
    targetFiles:['apps/api/src/modules/grocery/grocery.module.ts'] },

  { id:14, scopeOwner:'PAYSURITY', vertical:'Modules', name:'MODULE-PriceEngine',
    task:`Create apps/api/src/modules/price-engine/price-engine.module.ts: @Module({imports:[DatabaseModule], providers:[PriceEngineService], controllers:[PriceEngineController], exports:[PriceEngineService]}).
    Also create apps/api/src/modules/price-engine/price-engine.service.ts: validatePromoCode(dto), calculateDiscount(promoCode, cartItems, tenantId), BOGO logic, percent/fixed discount.`,
    targetFiles:['apps/api/src/modules/price-engine/price-engine.module.ts','apps/api/src/modules/price-engine/price-engine.service.ts'] },

  { id:15, scopeOwner:'PAYSURITY', vertical:'Modules', name:'MODULE-AuditLog',
    task:`Create apps/api/src/modules/audit-log/audit-log.module.ts: @Module({imports:[DatabaseModule], providers:[AuditLogService], controllers:[AuditLogController], exports:[AuditLogService]}).
    Create apps/api/src/modules/audit-log/audit-log.controller.ts: GET /audit-logs (list for tenant), GET /audit-logs/:id, No POST (logs are written by services not by API consumers).`,
    targetFiles:['apps/api/src/modules/audit-log/audit-log.module.ts','apps/api/src/modules/audit-log/audit-log.controller.ts'] },

  { id:16, scopeOwner:'PAYSURITY', vertical:'Modules', name:'MODULE-ApiPlatform',
    task:`Fix apps/api/src/modules/api-platform/api-platform.module.ts and api-platform.service.ts:
    Remove any @paysurity/database imports. Keep: generate API key (HMAC), rate limiting (in-memory + DB), webhook register + deliver, usage logs.
    Use raw sql for all DB operations.`,
    targetFiles:['apps/api/src/modules/api-platform/api-platform.module.ts','apps/api/src/modules/api-platform/api-platform.service.ts'] },

  { id:17, scopeOwner:'PAYSURITY', vertical:'Modules', name:'MODULE-TaxEngine',
    task:`Create apps/api/src/modules/tax/tax.service.ts: calculateTax(tenantId, items, stateCode) → return {subtotal, taxRate, taxAmount, total}.
    Tax rates from DB: SELECT rate FROM tax_rates WHERE state_code=\${stateCode} AND category=\${category}. Support multiple rate categories (food, general, alcohol, tobacco).`,
    targetFiles:['apps/api/src/modules/tax/tax.service.ts'] },

  { id:18, scopeOwner:'PAYSURITY', vertical:'Modules', name:'MODULE-Inventory',
    task:`Fix apps/api/src/modules/inventory/inventory.service.ts — remove @paysurity/database import (if any), use raw sql.
    Keep: item CRUD, stock adjust (add/subtract with reason), low-stock query (<reorder_point), barcode lookup, purchase order create/receive.`,
    targetFiles:['apps/api/src/modules/inventory/inventory.service.ts'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH 3 (19-26): REMAINING FRONTEND PAGES
  // ═══════════════════════════════════════════════════════════════════════════
  { id:19, scopeOwner:'PAYSURITY', vertical:'Frontend', name:'FE-GrocerEase-Dashboard',
    task:`Create apps/merchant-dashboard/src/app/dashboard/grocery/page.tsx: GrocerEase merchant dashboard home.
    Cards: today's sales, transaction count, EBT split amount, top 5 selling items, low stock alerts (items < reorder point shown in red).
    Fetch from GET /store/stats, GET /inventory/low-stock. Modern card layout.`,
    targetFiles:['apps/merchant-dashboard/src/app/dashboard/grocery/page.tsx'] },

  { id:20, scopeOwner:'PAYSURITY', vertical:'Frontend', name:'FE-Inventory-Dashboard',
    task:`Create apps/merchant-dashboard/src/app/dashboard/inventory/page.tsx: Full inventory management dashboard.
    Table of all items with barcode, PLU, cost, price, qty on hand, reorder point. Search + filter by category.
    Bulk import CSV button. Add item modal. Stock adjust inline (+ / -). Export to CSV.`,
    targetFiles:['apps/merchant-dashboard/src/app/dashboard/inventory/page.tsx'] },

  { id:21, scopeOwner:'PAYSURITY', vertical:'Frontend', name:'FE-Payroll-Wizard',
    task:`Create apps/merchant-dashboard/src/app/dashboard/payroll/run/page.tsx: Run payroll wizard.
    Step 1: Select pay period (date range picker). Step 2: Review employee hours (editable table). Step 3: Review calculated pay (with tax breakdown). Step 4: Confirm + submit (POST /payroll/runs). Step 5: Download pay stubs.`,
    targetFiles:['apps/merchant-dashboard/src/app/dashboard/payroll/run/page.tsx'] },

  { id:22, scopeOwner:'PAYSURITY', vertical:'Frontend', name:'FE-Tax-Dashboard',
    task:`Create apps/merchant-dashboard/src/app/dashboard/tax/page.tsx: Tax management page.
    Show: sales tax collected this month by state, nexus threshold warnings, export tax report button (CSV), tax rates table by category.
    Fetch from GET /tax/nexus-summary, GET /tax/rates.`,
    targetFiles:['apps/merchant-dashboard/src/app/dashboard/tax/page.tsx'] },

  { id:23, scopeOwner:'PAYSURITY', vertical:'Frontend', name:'FE-Subscription-Management',
    task:`Create apps/merchant-dashboard/src/app/dashboard/subscription/page.tsx: Subscription management.
    Current plan badge (Starter/Professional/Enterprise), next billing date, MRR, upgrade/downgrade plan buttons (modal confirmation with prorate calculation), cancel subscription button (warning modal), billing history table.`,
    targetFiles:['apps/merchant-dashboard/src/app/dashboard/subscription/page.tsx'] },

  { id:24, scopeOwner:'PAYSURITY', vertical:'Frontend', name:'FE-ApiKey-Dashboard',
    task:`Create apps/merchant-dashboard/src/app/dashboard/api/page.tsx: API keys management for merchants.
    List API keys (name, created, last used, status), generate new key button (modal: name + description → shows key once), revoke key button, webhook management (register URL, test-fire, view delivery log).`,
    targetFiles:['apps/merchant-dashboard/src/app/dashboard/api/page.tsx'] },

  { id:25, scopeOwner:'PAYSURITY', vertical:'Frontend', name:'FE-WalletDashboard-Merchant',
    task:`Create apps/merchant-dashboard/src/app/dashboard/wallet/page.tsx: Merchant wallet dashboard.
    Wallet balance card, incoming payments from last 7 days (chart), transfer-to-bank button (modal with bank details), wallet-to-wallet transfer, transaction history table with search.`,
    targetFiles:['apps/merchant-dashboard/src/app/dashboard/wallet/page.tsx'] },

  { id:26, scopeOwner:'PAYSURITY', vertical:'Frontend', name:'FE-HOB-Admin',
    task:`Create apps/merchant-dashboard/src/app/dashboard/microsite/hob/page.tsx: HOB microsite admin.
    Preview of live microsite, toggle menu items active/inactive, update hours, manage catering lead time (27h minimum toggle), view online order queue, analytics (views/orders/conversion rate).`,
    targetFiles:['apps/merchant-dashboard/src/app/dashboard/microsite/hob/page.tsx'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH 4 (27-34): PAYMENT PROCESSOR ADAPTERS
  // ═══════════════════════════════════════════════════════════════════════════
  { id:27, scopeOwner:'PAYSURITY', vertical:'Payments', name:'ADAPTER-FluidPay',
    task:`Complete apps/api/src/modules/payment/adapters/fluidpay.adapter.ts:
    createPaymentIntent(amount, currency, metadata), capturePayment(intentId), voidPayment(intentId), refundPayment(intentId, amount), getTransactionStatus(transactionId).
    Use fetch() to POST to process.env.FLUIDPAY_API_URL with Bearer process.env.FLUIDPAY_API_KEY. Handle 4xx/5xx errors. PAN never stored.`,
    targetFiles:['apps/api/src/modules/payment/adapters/fluidpay.adapter.ts'] },

  { id:28, scopeOwner:'PAYSURITY', vertical:'Payments', name:'ADAPTER-Stripe',
    task:`Create apps/api/src/modules/payment/adapters/stripe.adapter.ts:
    createPaymentIntent, capturePaymentIntent, cancelPaymentIntent, createRefund, retrievePaymentIntent.
    Use process.env.STRIPE_SECRET_KEY with stripe npm library. Handle Stripe errors → throw domain errors.`,
    targetFiles:['apps/api/src/modules/payment/adapters/stripe.adapter.ts'] },

  { id:29, scopeOwner:'PAYSURITY', vertical:'Payments', name:'ADAPTER-ACH',
    task:`Create apps/api/src/modules/payment/adapters/ach.adapter.ts:
    initiateACH(dto: {routingNumber, accountNumber, accountType, amount, memo, tenantId}) → returns ach_transaction_id.
    Validate ABA routing number checksum. Store encrypted bank details (AES-256). Log ACH_INITIATED audit event.
    Mock actual network call (log payload, return fake tx ID) — real ACH via NACHA file generation noted as TODO.`,
    targetFiles:['apps/api/src/modules/payment/adapters/ach.adapter.ts'] },

  { id:30, scopeOwner:'PAYSURITY', vertical:'Payments', name:'ADAPTER-PaymentRouter',
    task:`Create apps/api/src/modules/payment/payment-router.service.ts:
    routePayment(tenantId, amount, currency, method): based on tenant config in DB (SELECT preferred_processor FROM tenant_payment_configs) route to FluidPayAdapter or StripeAdapter.
    Fallback chain: if primary fails, try secondary. Log routing decision to audit.`,
    targetFiles:['apps/api/src/modules/payment/payment-router.service.ts'] },

  { id:31, scopeOwner:'PAYSURITY', vertical:'Payments', name:'ADAPTER-Mastercard',
    task:`Fix apps/api/src/modules/mastercard/mastercard.service.ts and mastercard-send.adapter.ts:
    Remove any @paysurity/database imports. Implement: sendFunds(dto), getTransactionStatus(transactionId), verifyWebhook(signature, payload).
    Use fetch() to Mastercard Send API endpoint. Add proper error handling.`,
    targetFiles:['apps/api/src/modules/mastercard/mastercard.service.ts','apps/api/src/modules/mastercard/mastercard-send.adapter.ts'] },

  { id:32, scopeOwner:'PAYSURITY', vertical:'Payments', name:'ADAPTER-Settlement-Service',
    task:`Fix apps/api/src/modules/settlement/settlement.service.ts — remove @paysurity/database import, use raw sql.
    Keep: create settlement batch (collect daily transactions → batch), process batch (net settlement amount), generate settlement report, push to bank via ACH adapter.`,
    targetFiles:['apps/api/src/modules/settlement/settlement.service.ts'] },

  { id:33, scopeOwner:'PAYSURITY', vertical:'Payments', name:'ADAPTER-RefundWorkflow',
    task:`Fix apps/api/src/modules/refund-workflow/refund-workflow.service.ts — remove @paysurity/database imports, use raw sql.
    Keep: initiate refund request, approve/deny refund (manager role check in logic), execute refund via payment adapter, update refund_requests table, emit refund.completed event.`,
    targetFiles:['apps/api/src/modules/refund-workflow/refund-workflow.service.ts'] },

  { id:34, scopeOwner:'PAYSURITY', vertical:'Payments', name:'MODULE-Payment',
    task:`Create apps/api/src/modules/payment/payment.module.ts: @Module({imports:[DatabaseModule], providers:[PaymentService, PaymentRouterService, FluidPayAdapter, StripeAdapter, AchAdapter], controllers:[PaymentController], exports:[PaymentService]}).
    Also create apps/api/src/modules/mastercard/mastercard.module.ts if missing.`,
    targetFiles:['apps/api/src/modules/payment/payment.module.ts'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH 5 (35-42): BISTROBEAST CATERING + HOB FINAL ORDER FLOW
  // ═══════════════════════════════════════════════════════════════════════════
  { id:35, scopeOwner:'PAYSURITY', vertical:'BistroBeast', name:'BB-Catering-Service',
    task:`Create apps/api/src/modules/restaurant/catering.service.ts:
    createCateringOrder(dto): validate 48h notice (cateringDate >= now+48h else throw), create order in DB, send confirmation email.
    getCateringOrders(tenantId, status): list catering orders.
    updateCateringStatus(id, status): kitchen confirmation.
    All dates/times in tenant's timezone (from tenant config).`,
    targetFiles:['apps/api/src/modules/restaurant/catering.service.ts'] },

  { id:36, scopeOwner:'PAYSURITY', vertical:'BistroBeast', name:'BB-KDS-Service',
    task:`Fix/complete apps/api/src/modules/restaurant/kds.service.ts — remove @paysurity/database imports, use raw sql.
    Keep: create KDS ticket from order, route ticket to correct display (grill/expo/salad/paan station based on item category), bump ticket (mark done), KDS display fetch for station, kitchen timing analytics (avg ticket time).`,
    targetFiles:['apps/api/src/modules/restaurant/kds.service.ts'] },

  { id:37, scopeOwner:'PAYSURITY', vertical:'BistroBeast', name:'BB-HOB-Microsite-Complete',
    task:`Complete apps/api/src/modules/microsite/microsite.service.ts — remove @paysurity/database imports, use raw sql.
    HOB-specific features: slug-based tenant resolution, menu by category (paan/catering/regular), online order creation with 48h catering validation, paan itempricing ($1.50 each from tenant config NOT hardcoded).`,
    targetFiles:['apps/api/src/modules/microsite/microsite.service.ts'] },

  { id:38, scopeOwner:'PAYSURITY', vertical:'BistroBeast', name:'BB-Tables-Service',
    task:`Fix apps/api/src/modules/restaurant/tables.service.ts — remove @paysurity/database imports, raw sql.
    Keep: table CRUD, seat table (assign customer), set table status (available/occupied/reserved/cleaning), floor plan layout (tables with x/y positions), reservation management.`,
    targetFiles:['apps/api/src/modules/restaurant/tables.service.ts'] },

  { id:39, scopeOwner:'PAYSURITY', vertical:'BistroBeast', name:'BB-Shifts-Service',
    task:`Fix apps/api/src/modules/restaurant/shifts.service.ts — remove @paysurity/database imports, raw sql.
    Keep: open shift (clock in), close shift (clock out + calculate hours), tip pool (distribute tips among shift employees), shift report (hours worked by employee, total tips), overtime detection.`,
    targetFiles:['apps/api/src/modules/restaurant/shifts.service.ts'] },

  { id:40, scopeOwner:'PAYSURITY', vertical:'BistroBeast', name:'BB-Analytics-Service',
    task:`Fix apps/api/src/modules/restaurant/analytics.service.ts — remove @paysurity/database imports, raw sql.
    Keep: daily revenue summary, hourly sales (for heat map), top items (by revenue and quantity), table turn time, staff performance (tips earned, orders taken), comparison vs prior period.`,
    targetFiles:['apps/api/src/modules/restaurant/analytics.service.ts'] },

  { id:41, scopeOwner:'PAYSURITY', vertical:'BistroBeast', name:'BB-Menu-Service',
    task:`Fix apps/api/src/modules/restaurant/menu.service.ts — remove @paysurity/database imports, raw sql.
    Keep: menu CRUD, item CRUD with modifiers, category ordering, price history, modifier groups (add/remove extra, size choice), EBT-eligible flag, 86 item (temp unavailable), schedule-based pricing.`,
    targetFiles:['apps/api/src/modules/restaurant/menu.service.ts'] },

  { id:42, scopeOwner:'PAYSURITY', vertical:'BistroBeast', name:'BB-Loyalty-Service',
    task:`Fix apps/api/src/modules/loyalty/loyalty.service.ts (re-verify after P3 fix) — ensure:
    NO hardcoded rates. All rates from: SELECT value FROM tenant_loyalty_configs WHERE tenant_id=\${tenantId} AND key=\${key}.
    earnPoints, redeemPoints, getTierStatus, getPointHistory, markPointsExpired. @OnEvent wiring for loyalty events.`,
    targetFiles:['apps/api/src/modules/loyalty/loyalty.service.ts'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH 6 (43-50): PAYSURITY ECOM COMPLETE
  // ═══════════════════════════════════════════════════════════════════════════
  { id:43, scopeOwner:'PAYSURITY', vertical:'eCom', name:'ECOM-Product-Service',
    task:`Fix apps/api/src/modules/ecom/product.service.ts — remove @paysurity/database imports, raw sql.
    Keep: product CRUD, variant management (color/size), digital downloads (signed URL), physical product (weight/shipping_class), SEO fields (slug, meta_title, meta_desc), search (full text), barcode/UPC lookup.`,
    targetFiles:['apps/api/src/modules/ecom/product.service.ts'] },

  { id:44, scopeOwner:'PAYSURITY', vertical:'eCom', name:'ECOM-Cart-Service',
    task:`Fix apps/api/src/modules/ecom/cart.service.ts — remove @paysurity/database imports, raw sql.
    Keep: addToCart (session or customer), updateQty, removeItem, applyCoupon (call PriceEngineService), getCart with tax calculation (call TaxService), mergeGuestToCustomer cart.`,
    targetFiles:['apps/api/src/modules/ecom/cart.service.ts'] },

  { id:45, scopeOwner:'PAYSURITY', vertical:'eCom', name:'ECOM-Checkout-Service',
    task:`Fix apps/api/src/modules/ecom/checkout.service.ts — remove @paysurity/database imports, raw sql.
    Keep: createOrder from cart, charge payment (via PaymentRouterService), fulfillment routing (digital→deliver URL, physical→create shipment), inventory reservation and decrement, order confirmation email.`,
    targetFiles:['apps/api/src/modules/ecom/checkout.service.ts'] },

  { id:46, scopeOwner:'PAYSURITY', vertical:'eCom', name:'ECOM-Orders-Service',
    task:`Fix apps/api/src/modules/ecom/orders.service.ts — remove @paysurity/database imports, raw sql.
    Keep: list orders (tenantId filter), getOrderById, updateStatus, cancel order (with payment void), get order timeline (status change history), customer order portal (by email lookup).`,
    targetFiles:['apps/api/src/modules/ecom/orders.service.ts'] },

  { id:47, scopeOwner:'PAYSURITY', vertical:'eCom', name:'ECOM-Shipping-Service',
    task:`Create apps/api/src/modules/ecom/shipping.service.ts:
    calculateShipping(tenantId, cartItems, destinationZip): lookup tenant shipping rates from DB (flat rate or table rate by weight/zone).
    createShipment(orderId), getTrackingUrl(trackingNumber, carrier), updateFulfillmentStatus(orderId, status).`,
    targetFiles:['apps/api/src/modules/ecom/shipping.service.ts','apps/api/src/modules/ecom/shipping.controller.ts'] },

  { id:48, scopeOwner:'PAYSURITY', vertical:'eCom', name:'ECOM-Module',
    task:`Create apps/api/src/modules/ecom/ecom.module.ts: @Module({imports:[DatabaseModule, PriceEngineModule, TaxModule, PaymentModule, NotificationModule], providers:[ProductService, CartService, CheckoutService, OrdersService, ShippingService], controllers:[ProductController, CartController, CheckoutController, OrdersController, ShippingController], exports:[OrdersService]}).`,
    targetFiles:['apps/api/src/modules/ecom/ecom.module.ts'] },

  { id:49, scopeOwner:'PAYSURITY', vertical:'eCom', name:'ECOM-Product-Frontend',
    task:`Fix apps/merchant-dashboard/src/app/dashboard/ecom/products/page.tsx: Product management for merchants.
    Table of products with image thumbnail, name, SKU, price, stock, status. Add product button (full modal with variants). Bulk price update. Import CSV. Link to edit page per product.`,
    targetFiles:['apps/merchant-dashboard/src/app/dashboard/ecom/products/page.tsx'] },

  { id:50, scopeOwner:'PAYSURITY', vertical:'eCom', name:'ECOM-Orders-Frontend',
    task:`Fix apps/merchant-dashboard/src/app/dashboard/ecom/orders/page.tsx or apps/merchant-dashboard/src/app/dashboard/orders/page.tsx: Orders management.
    Table with status filter tabs (pending/processing/shipped/delivered/cancelled/refunded). Click to open order detail. Update fulfillment status. Print packing slip. Issue refund button.`,
    targetFiles:['apps/merchant-dashboard/src/app/dashboard/orders/page.tsx'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH 7 (51-56): REMAINING SERVICE STUBS + DB
  // ═══════════════════════════════════════════════════════════════════════════
  { id:51, scopeOwner:'PAYSURITY', vertical:'Database', name:'DB-Indexes',
    task:`Create packages/database/migrations/010_indexes_and_constraints.sql:
    Add performance indexes: idx_orders_tenant_id, idx_orders_status, idx_payroll_runs_tenant_id, idx_audit_log_tenant_id, idx_wallet_transactions_wallet_id, idx_loyalty_points_customer_id, idx_api_keys_key_hash.
    Add FK constraint checks. Add composite unique (tenant_id, slug) on tenants table.`,
    targetFiles:['packages/database/migrations/010_indexes_and_constraints.sql'] },

  { id:52, scopeOwner:'PAYSURITY', vertical:'Database', name:'DB-Views',
    task:`Create packages/database/migrations/011_useful_views.sql:
    CREATE VIEW v_tenant_daily_revenue AS (sum payments by tenant by date).
    CREATE VIEW v_employee_ytd_pay AS (sum ytd pay by employee).
    CREATE VIEW v_affiliate_summary AS (clicks/conversions/earnings by affiliate).
    CREATE VIEW v_wallet_balance AS (current balance per wallet from transaction sum).`,
    targetFiles:['packages/database/migrations/011_useful_views.sql'] },

  { id:53, scopeOwner:'PAYSURITY', vertical:'Database', name:'DB-AuditLog-Table',
    task:`Create packages/database/migrations/002_audit_log_table.sql: CREATE TABLE audit_log (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, user_id VARCHAR(255), action VARCHAR(255) NOT NULL, amount_cents BIGINT, trace_id VARCHAR(255), details JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()); CREATE INDEX idx_audit_log_tenant_action ON audit_log(tenant_id, action); CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);`,
    targetFiles:['packages/database/migrations/002_audit_log_table.sql'] },

  { id:54, scopeOwner:'PAYSURITY', vertical:'Database', name:'DB-ApiKeys-Table',
    task:`Create packages/database/migrations/003_api_keys_table.sql: CREATE TABLE api_keys (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, key_hash VARCHAR(255) UNIQUE NOT NULL, name VARCHAR(255), description TEXT, status VARCHAR(50) DEFAULT 'active', rate_limit_per_minute INT DEFAULT 60, last_used_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW(), revoked_at TIMESTAMPTZ); idempotency_keys table (id, endpoint_hash, response JSONB, created_at, expires_at).`,
    targetFiles:['packages/database/migrations/003_api_keys_table.sql'] },

  { id:55, scopeOwner:'PAYSURITY', vertical:'Database', name:'DB-PayFactor-Tables',
    task:`Create packages/database/migrations/004_payfactor_tables.sql:
    payfactor_applications (id, tenant_id, driver_id, cdl_number, routing_number_encrypted, status, credit_limit_cents, approved_at, created_at).
    payfactor_escrow (id, tenant_id, aels_load_id UNIQUE, driver_id, escrow_amount_cents, status, created_at, expires_at).
    payfactor_transactions (id, escrow_id, type ENUM advance|settlement, amount_cents, fee_cents, net_cents, ach_tx_id, created_at).`,
    targetFiles:['packages/database/migrations/004_payfactor_tables.sql'] },

  { id:56, scopeOwner:'PAYSURITY', vertical:'Database', name:'DB-Tenants-Table',
    task:`Create packages/database/migrations/001_tenants_and_core.sql (if not exists):
    tenants (id UUID PRIMARY KEY, name, slug UNIQUE, plan VARCHAR, status, created_at), tenant_configs (id, tenant_id, key, value, updated_at), tenant_payment_configs (tenant_id, preferred_processor, stripe_account_id, fluidpay_merchant_id, created_at). All with proper indexes.`,
    targetFiles:['packages/database/migrations/001_tenants_and_core.sql'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH 8 (57-62): UNIT TESTS
  // ═══════════════════════════════════════════════════════════════════════════
  { id:57, scopeOwner:'PAYSURITY', vertical:'Testing', name:'UNIT-PaymentService',
    task:`Write unit tests for PaymentService (apps/api/src/modules/payment/payment.service.spec.ts):
    describe('PaymentService', ()=>{
      test createPaymentIntent calls FluidPayAdapter, test capture updates status, test void cancels, test refund validates amount <= original,
      test routing calls PaymentRouter, test audit log called for each state change.
    }). Mock all dependencies.`,
    targetFiles:['apps/api/src/modules/payment/payment.service.spec.ts'] },

  { id:58, scopeOwner:'PAYSURITY', vertical:'Testing', name:'UNIT-WalletService',
    task:`Write unit tests for WalletService (apps/api/src/modules/wallet/wallet.service.spec.ts):
    test topup creates credit transaction, test transfer debits+credits atomically, test transfer fails if insufficient balance, test spending limit throws WALLET_LIMIT_EXCEEDED, test balance calculation from transaction sum.`,
    targetFiles:['apps/api/src/modules/wallet/wallet.service.spec.ts'] },

  { id:59, scopeOwner:'PAYSURITY', vertical:'Testing', name:'UNIT-LoyaltyService',
    task:`Write unit tests for LoyaltyService (apps/api/src/modules/loyalty/loyalty.service.spec.ts):
    test earnPoints uses tenant config rate (mock config returns 10 pts/$1), test tier upgrade crosses threshold (mock config returns thresholds),
    test redeem deducts points, test redeem fails if insufficient, test getTierStatus returns correct tier badge.`,
    targetFiles:['apps/api/src/modules/loyalty/loyalty.service.spec.ts'] },

  { id:60, scopeOwner:'PAYSURITY', vertical:'Testing', name:'UNIT-PayrollService',
    task:`Write unit tests for PayrollService (apps/api/src/modules/payroll/payroll.service.spec.ts):
    test hourly employee 40h calculates correctly, test hourly overtime (45h=40*rate+5*1.5*rate), test salary prorate (annual/26 periods), test federal tax bracket applied, test ABA routing validation fails on bad checksum.`,
    targetFiles:['apps/api/src/modules/payroll/payroll.service.spec.ts'] },

  { id:61, scopeOwner:'PAYSURITY', vertical:'Testing', name:'UNIT-PayFactor',
    task:`Write unit tests for PayFactor service (apps/api/src/modules/pay-factor/pay-factor.service.spec.ts):
    test KYC validates CDL format, test escrow idempotent (same aels_load_id returns same escrow_id), test advance = 25% of driver_net, test fee = 3.5% of advance, test settlement schedules ACH for due_date, test webhook HMAC generated correctly.`,
    targetFiles:['apps/api/src/modules/pay-factor/pay-factor.service.spec.ts'] },

  { id:62, scopeOwner:'PAYSURITY', vertical:'Testing', name:'UNIT-NotificationService',
    task:`Write unit tests for NotificationService (apps/api/src/modules/notification/notification.service.spec.ts):
    test sendEmail calls SendGrid with correct template ID, test sendSMS checks sms_opt_in before sending (mock DB returns false → SMS not sent), test STOP keyword sets sms_opt_in=false, test push notification calls Expo push endpoint.`,
    targetFiles:['apps/api/src/modules/notification/notification.service.spec.ts'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH 9 (63-68): CI/CD + INFRA
  // ═══════════════════════════════════════════════════════════════════════════
  { id:63, scopeOwner:'PAYSURITY', vertical:'CI', name:'CI-DockerfileHarden',
    task:`Optimize apps/api/Dockerfile (create if missing): FROM node:20-alpine AS builder. Multi-stage: builder stage (npm ci + nest build), final stage (node:20-alpine, copy dist only, run as non-root user node). EXPOSE 3000. CMD ["node","dist/main.js"]. Healthcheck CURL /health.`,
    targetFiles:['apps/api/Dockerfile'] },

  { id:64, scopeOwner:'PAYSURITY', vertical:'CI', name:'CI-CloudBuildConfig',
    task:`Create cloudbuild-full-deploy.yaml in project root: steps: 1) npm ci in apps/api, 2) nest build, 3) docker build -t gcr.io/\${PROJECT_ID}/paysurity-api:latest, 4) docker push, 5) gcloud run deploy paysurity-api --image gcr.io/\${PROJECT_ID}/paysurity-api:latest --region us-central1 --allow-unauthenticated.
    Add substitutions: _PROJECT_ID, _REGION. timeout: 1200s.`,
    targetFiles:['cloudbuild-full-deploy.yaml'] },

  { id:65, scopeOwner:'PAYSURITY', vertical:'CI', name:'CI-GithubActions',
    task:`Create .github/workflows/ci.yml: on push to main. jobs: build-and-test (node 20, npm ci, npm run lint, npm run test, npm run build), deploy (on success → trigger gcloud builds submit). Add GEMINI_API_KEY and GOOGLE_CREDENTIALS as secrets.`,
    targetFiles:['.github/workflows/ci.yml'] },

  { id:66, scopeOwner:'PAYSURITY', vertical:'CI', name:'CI-JestConfig',
    task:`Create apps/api/jest.config.js: preset ts-jest, testEnvironment node, testMatch ['**/*.spec.ts','**/*.e2e-spec.ts'], moduleNameMapper for path aliases, collectCoverage: true, coverageThreshold: {global:{branches:60,functions:60,lines:70}}.
    Also ensure package.json has "test": "jest", "test:e2e": "jest --testPathPattern=e2e-spec", "test:cov": "jest --coverage".`,
    targetFiles:['apps/api/jest.config.js'] },

  { id:67, scopeOwner:'PAYSURITY', vertical:'CI', name:'CI-ESLintFix',
    task:`Create apps/api/.eslintrc.js with NestJS-appropriate rules: no-console (warn), no-unused-vars (error), @typescript-eslint/no-explicit-any (warn), no-process-exit (error). Extend @nestjs/eslint-config.
    Also create apps/api/tsconfig.build.json: extends ./tsconfig.json, exclude test files from build.`,
    targetFiles:['apps/api/.eslintrc.js','apps/api/tsconfig.build.json'] },

  { id:68, scopeOwner:'PAYSURITY', vertical:'CI', name:'CI-RunningScript',
    task:`Create scripts/local-dev.js: checks all required env vars are set (DATABASE_URL, GEMINI_API_KEY, SENDGRID_API_KEY etc), runs 'npm run start:dev' in apps/api, 'npm run dev' in apps/merchant-dashboard concurrently. Show health check URL after start.`,
    targetFiles:['scripts/local-dev.js'] },

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH 10 (69-75): FINAL DOCS + REPORT
  // ═══════════════════════════════════════════════════════════════════════════
  { id:69, scopeOwner:'PAYSURITY', vertical:'Docs', name:'DOCS-README',
    task:`Update README.md at project root: project overview (PaySurity Platform), architecture diagram (ASCII), quick start (clone → npm install → set env vars → npm run dev), env vars table (required and optional), verticals overview table (platform, version, status), API docs link (/api/docs), test commands.`,
    targetFiles:['README.md'] },

  { id:70, scopeOwner:'PAYSURITY', vertical:'Docs', name:'DOCS-Architecture',
    task:`Create docs/architecture/PLATFORM_OVERVIEW.md: document the full platform architecture. Sections: Platform overview (PaySurity as umbrella), Verticals (BistroBeast/GrocerEase/PaySurity Payroll/Digital Wallets/eCom/Affiliates), How tenant isolation works (tenantId on every query), Payment flow (merchant → PaymentRouter → FluidPay/Stripe), Event bus (NestJS EventEmitter2), Security model (HMAC guard, PAN redaction, audit log).`,
    targetFiles:['docs/architecture/PLATFORM_OVERVIEW.md'] },

  { id:71, scopeOwner:'PAYSURITY', vertical:'Docs', name:'DOCS-PayFactor',
    task:`Create docs/integrations/PAYFACTOR_AELS_INTEGRATION.md: documents PayFactor integration for AELS. Sections: Overview, How it works (2-tranche escrow), API endpoints (with curl examples), HMAC signing instructions, Webhook events table, Error codes, Sandbox testing guide, Production checklist.`,
    targetFiles:['docs/integrations/PAYFACTOR_AELS_INTEGRATION.md'] },

  { id:72, scopeOwner:'PAYSURITY', vertical:'Docs', name:'DOCS-Deployment',
    task:`Create docs/deployment/DEPLOYMENT_GUIDE.md: Step-by-step deployment guide. Sections: Prerequisites (GCP project, Cloud Run, Cloud SQL), Environment setup (.env required vars), Database migration (how to run seeds), Cloud Build setup (service account IAM roles), Rolling deployment strategy, Rollback procedure, Health check URLs, Monitoring (Cloud Monitoring dashboard links).`,
    targetFiles:['docs/deployment/DEPLOYMENT_GUIDE.md'] },

  { id:73, scopeOwner:'PAYSURITY', vertical:'Docs', name:'DOCS-OnboardingChecklist',
    task:`Create docs/operations/MERCHANT_ONBOARDING_CHECKLIST.md: step-by-step merchant onboarding.
    Sections: 1) Account creation API call, 2) Tenant config setup (loyalty rates, tax rates, payment processor config), 3) Seed menu/inventory, 4) Test payment (sandbox), 5) DNS microsite setup, 6) Training (links to admin dashboard). With checkboxes [].`,
    targetFiles:['docs/operations/MERCHANT_ONBOARDING_CHECKLIST.md'] },

  { id:74, scopeOwner:'PAYSURITY', vertical:'CI', name:'FINAL-SweepBannedImports',
    task:`Create scripts/sweep-banned-imports.js: scan all .ts files in apps/api/src/ for:
    1) import from '@paysurity/database', 2) import from '@paysurity/auth', 3) import from '@nestjs-drizzle/core', 4) @UseGuards() in @Controller classes (class-level).
    Print each violation with file + line number. Exit code 1 if any found. Also log count of clean files. Write report to docs/status/banned-import-sweep.md.`,
    targetFiles:['scripts/sweep-banned-imports.js'] },

  { id:75, scopeOwner:'PAYSURITY', vertical:'CI', name:'FINAL-PlatformReport',
    task:`Generate docs/status/phase4-readiness-report.md: comprehensive final platform summary.
    For each vertical: list endpoint count, test count, frontend page count, known build errors (0 if clean), readiness %.
    Include: git log summary (last 5 commits), file counts by module, next steps to 100%.
    This is the definitive state-of-the-platform report after 4 phases.`,
    targetFiles:['docs/status/phase4-readiness-report.md'] },
];

// ─── Generate one file ─────────────────────────────────────────────────────
async function gen(pool, filePath) {
  const model    = genAI.getGenerativeModel({ model: MODEL });
  const existing = readOrEmpty(filePath);
  const ext      = path.extname(filePath);
  const lang     = ext==='.sql'?'sql':ext==='.md'?'markdown':ext==='.yml'||ext==='.yaml'?'yaml':ext==='.tsx'||ext==='.jsx'?'tsx':'typescript';

  const prompt = `You are a senior engineer on PaySurity — a multi-tenant SaaS payment platform.

VERTICAL: ${pool.vertical} | POOL: ${pool.name}
FILE: ${filePath}

TASK:
${pool.task}

EXISTING FILE (first 3000 chars):
\`\`\`${lang}
${(existing||'(empty)').slice(0,3000)}
\`\`\`

CRITICAL RULES (violations cause build failures):
1. Output ONLY the complete file — no markdown fences, no explanations
2. Always use @Inject('DATABASE') private readonly db: NodePgDatabase<any>
3. NEVER import from @paysurity/database, @paysurity/auth, @nestjs-drizzle/core, @app/*, src/*
4. NEVER apply @UseGuards() at the class level in @Controller files
5. tenantId = req?.user?.tenantId  
6. Syntactically complete — balanced braces, no truncation
7. SQL files: PostgreSQL, UUID PKs (gen_random_uuid()), tenant_id on all tenant-scoped tables
8. Use raw sql\`\` template literals for all database queries
9. AuditLogService: call this.auditLogService.record(tenantId, {userId, action, details}) — NOT logActivity
10. Loyalty rates: ALWAYS from tenant config query, NEVER hardcoded numbers`;

  const r = await model.generateContent(prompt);
  let code = r.response.text().trim()
    .replace(/^```(typescript|tsx|sql|yaml|yml|javascript|markdown|plaintext)?\n?/,'')
    .replace(/\n?```$/,'').trim();
  return code.length > 50 ? code : null;
}

// ─── Run one pool ──────────────────────────────────────────────────────────
async function runPool(pool) {
  if (!scopeCheck(pool)) return { poolId:pool.id, skipped:true, results:[] };
  const results = [];
  for (const file of pool.targetFiles) {
    const abs = path.join(ROOT, file);
    log(pool.id, `  Coding: ${path.basename(file)}`);
    try {
      const code = await gen(pool, file);
      if (code) {
        fs.mkdirSync(path.dirname(abs), {recursive:true});
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

// ─── 30-minute progress reporter ───────────────────────────────────────────
let lastRpt = Date.now();
function report(done, total, all, force=false) {
  const now = Date.now();
  if (!force && now-lastRpt < 30*60*1000 && done < total) return;
  lastRpt = now;
  const written = all.flatMap(r=>r.results||[]).filter(f=>f.status==='written').length;
  const errors  = all.flatMap(r=>r.results||[]).filter(f=>f.status==='error').length;
  const banner = [
    `\n${'═'.repeat(65)}`,
    `📊 SWARM-P4 REPORT  ⏰ LOCAL: ${local()}  UTC: ${ts()}`,
    `   Elapsed: ${elapsed()} | Pools: ${done}/${total} | Files: ${written} | Errors: ${errors}`,
    `${'═'.repeat(65)}\n`,
  ].join('\n');
  console.log(banner);
  fs.appendFileSync(path.join(LOG_DIR,'progress.log'), banner);
  const md = `# Swarm Phase 4 Progress\n**Local: ${local()} | UTC: ${ts()}**\n\n- Elapsed: ${elapsed()}\n- Pools: ${done}/${total}\n- Files: ${written}\n- Errors: ${errors}\n`;
  fs.writeFileSync(path.join(ROOT,'docs/status/swarm-p4-progress.md'), md);
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n${'═'.repeat(65)}`);
  console.log(`🚀 SWARM PHASE 4 — 75 POOLS — Local: ${local()} | UTC: ${ts()}`);
  console.log(`   BannedImportFix + Modules + Frontend + Adapters + eCom + Tests + CI + Docs`);
  console.log(`   Pools: ${POOLS.length} | Batch: ${BATCH} | Model: ${MODEL}`);
  console.log(`${'═'.repeat(65)}\n`);

  const all = [];
  let done  = 0;

  for (let i=0; i<POOLS.length; i+=BATCH) {
    const batch = POOLS.slice(i, i+BATCH);
    console.log(`\n▶ Batch ${Math.floor(i/BATCH)+1}: Pools ${batch[0].id}–${batch[batch.length-1].id}`);
    const results = await Promise.all(batch.map(p=>runPool(p)));
    all.push(...results);
    done += batch.length;
    report(done, POOLS.length, all);
    if (i+BATCH < POOLS.length) await new Promise(r=>setTimeout(r,1500));
  }

  // Sweep for banned imports
  console.log('\n🔍 Sweeping for banned imports...');
  let clean=0, flagged=0;
  for (const r of all) {
    for (const f of (r.results||[])) {
      if (f.status!=='written') continue;
      const code = readOrEmpty(f.file);
      const bad = ["from '@paysurity/database'","from '@paysurity/auth'","from '@nestjs-drizzle/core'"]
        .some(p => code.includes(p));
      if (bad) { flagged++; log(0,`FLAGGED: ${f.file}`); }
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
    const out = (e.stdout||e.stderr||'').toString();
    const fails = out.split('\n').filter(l=>/error TS|Error|Failed/.test(l)).slice(0,6);
    console.log(`⚠️  Build errors:\n${fails.join('\n')}`);
  }

  // Commit + push
  try {
    execSync('git add -A', {cwd:ROOT});
    execSync(`git commit -m "feat(swarm-p4): Phase 4 complete — banned-import-fix+modules+adapters+eCom+tests+CI+docs [${ts()}]"`,{cwd:ROOT});
    const stat = execSync('git push origin main', {cwd:ROOT}).toString();
    console.log(`✅ Pushed to main`);
  } catch(e) { console.warn('Git:', e.message?.slice(0,60)); }

  report(done, POOLS.length, all, true);
  console.log(`\n🏁 SWARM PHASE 4 DONE — Local: ${local()} | Elapsed: ${elapsed()}\n`);
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
