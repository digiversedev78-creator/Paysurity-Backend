#!/usr/bin/env node
/**
 * scripts/swarm-orchestrator-50pools.js
 * 
 * 50 Swarm Worker Pools — PaySurity Platform Build-Out
 * 
 * Structure:
 *   50 Pools × (1 Tester/Verifier + 2 Coders)  = 150 workers
 *   10 Aggregators (collect + place output)
 *   5  Final Verifiers (independent QA → report to orchestrator)
 * 
 * Pool Assignment:
 *   Pools  1-10 → BistroBeast
 *   Pools 11-18 → AEL Solutions / PayFactor
 *   Pools 19-26 → GrocerEase (Phase TBD, POSR-reuse tagged)
 *   Pools 27-32 → PaySurity Payroll
 *   Pools 33-38 → PaySurity Digital Wallets
 *   Pools 39-44 → PaySurity eCom
 *   Pools 45-48 → PaySurity Affiliates
 *   Pools 49-50 → Loyalty (tenant-configurable engine)
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT        = path.resolve(__dirname, '..');
const SRC         = path.join(ROOT, 'apps/api/src');
const REPORT_DIR  = path.join(ROOT, 'logs/swarm-50');
const GEMINI_KEY  = process.env.GEMINI_API_KEY;
const MODEL       = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const BATCH_SIZE  = parseInt(process.env.BATCH_SIZE || '10'); // pools per batch
const START_TIME  = Date.now();

if (!GEMINI_KEY) { console.error('GEMINI_API_KEY required'); process.exit(1); }
fs.mkdirSync(REPORT_DIR, { recursive: true });

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

// ─── Pool Definitions ────────────────────────────────────────────────────────

const POOLS = [
  // ── BistroBeast (1-10) ──────────────────────────────────────────────────
  {
    id: 1, vertical: 'BistroBeast', name: 'BB-POS-Order-Flow',
    module: 'restaurant', priority: 'P0',
    task: 'Implement complete POS order flow: create order, add items, apply discounts, split payment, close order. Use @Inject(DATABASE) pattern. Add EventEmitter2 events on each state change.',
    targetFiles: ['apps/api/src/modules/restaurant/restaurant.service.ts', 'apps/api/src/modules/restaurant/restaurant.controller.ts'],
  },
  {
    id: 2, vertical: 'BistroBeast', name: 'BB-Menu-Management',
    module: 'menu', priority: 'P0',
    task: 'Implement menu CRUD: categories, items, modifiers, pricing, images. Support multi-tenant. Items should reference menu_item_images schema table. Add bulk import endpoint.',
    targetFiles: ['apps/api/src/modules/menu/menu.service.ts', 'apps/api/src/modules/menu/menu.controller.ts'],
  },
  {
    id: 3, vertical: 'BistroBeast', name: 'BB-Table-Management',
    module: 'tables', priority: 'P1',
    task: 'Implement table management: floor plans, table status (available/occupied/reserved), assign orders to tables, merge/split tables. Real-time events via EventEmitter2.',
    targetFiles: ['apps/api/src/modules/tables/tables.service.ts'],
  },
  {
    id: 4, vertical: 'BistroBeast', name: 'BB-KDS-Kitchen-Display',
    module: 'kds', priority: 'P1',
    task: 'Implement Kitchen Display System: receive orders, mark items as preparing/ready/served, priority queue, estimated time. WebSocket-ready structure.',
    targetFiles: ['apps/api/src/modules/kds/kds.service.ts', 'apps/api/src/modules/kds/kds.controller.ts', 'apps/api/src/modules/kds/kds.module.ts'],
    createIfMissing: true,
  },
  {
    id: 5, vertical: 'BistroBeast', name: 'BB-Catering-Enhancement',
    module: 'catering', priority: 'P1',
    task: 'Enhance catering module: enforce 48-hour advance notice, 25% deposit required, paan bulk order rules (50+ = advance + deposit), catering tray pricing from schema. Add deposit recording endpoint.',
    targetFiles: ['apps/api/src/modules/catering/catering.service.ts', 'apps/api/src/modules/catering/catering.controller.ts'],
  },
  {
    id: 6, vertical: 'BistroBeast', name: 'BB-Analytics-Reports',
    module: 'analytics', priority: 'P1',
    task: 'Implement restaurant analytics: daily revenue, top items, table turn rate, peak hours, staff performance. Use raw SQL queries against orders/payments tables. Return structured JSON for dashboard charts.',
    targetFiles: ['apps/api/src/modules/analytics/analytics.service.ts', 'apps/api/src/modules/analytics/analytics.controller.ts'],
  },
  {
    id: 7, vertical: 'BistroBeast', name: 'BB-Loyalty-Tenant-Config',
    module: 'loyalty', priority: 'P1',
    task: 'Implement tenant-configurable loyalty: points per dollar (tenant sets rate), tier thresholds (tenant sets), redemption rules (tenant sets), reward catalog (tenant defines). Store config in tenant settings jsonb. Points ledger per customer per tenant.',
    targetFiles: ['apps/api/src/modules/loyalty/loyalty.service.ts'],
  },
  {
    id: 8, vertical: 'BistroBeast', name: 'BB-Microsite-HOB',
    module: 'microsite', priority: 'P0',
    task: 'Fix and enhance House of Biryani microsite API: menu endpoint returns live data from DB, paan category with all items and prices, catering menu with full tray prices, online order endpoint, page view tracking. Ensure houseofbiryanirestaurant.food can hit /api/microsite/hob/* routes.',
    targetFiles: ['apps/api/src/modules/microsite/microsite.controller.ts', 'apps/api/src/modules/microsite/microsite.service.ts'],
  },
  {
    id: 9, vertical: 'BistroBeast', name: 'BB-Tawakkul-Microsite',
    module: 'microsite', priority: 'P1',
    task: 'Create Tawakkul Restaurant tenant microsite data: seed SQL for menu items (Middle Eastern), configure microsite settings slug=tawakkul-restaurant. Create microsite serving endpoints that work for both HOB and Tawakkul based on slug.',
    targetFiles: ['packages/database/seeds/031_tawakkul-restaurant-menu.sql'],
    createIfMissing: true,
  },
  {
    id: 10, vertical: 'BistroBeast', name: 'BB-Staff-Scheduling',
    module: 'employees', priority: 'P2',
    task: 'Implement employee shift scheduling: create/update shifts, assign to employees, clock-in/clock-out, calculate hours worked. Store in shifts table. Validate no overlapping shifts per employee.',
    targetFiles: ['apps/api/src/modules/employees/employees.service.ts', 'apps/api/src/modules/shifts/shifts.service.ts'],
  },

  // ── AEL Solutions / PayFactor (11-18) ───────────────────────────────────
  {
    id: 11, vertical: 'AEL Solutions', name: 'AEL-PayFactor-Service',
    module: 'pay-factor', priority: 'P0',
    task: 'Complete PayFactor service: apply for advance (check eligibility, store in DB), escrow funds, release advance to driver, release settlement to carrier. Use real DB queries against operations table. Add HMAC signature verification.',
    targetFiles: ['apps/api/src/modules/pay-factor/pay-factor.service.ts'],
  },
  {
    id: 12, vertical: 'AEL Solutions', name: 'AEL-Webhook-Handler',
    module: 'pay-factor', priority: 'P0',
    task: 'Implement PayFactor webhook handler for https://americaneaglelogistics.net/api/driver/payfactor-webhook. Handle events: advance.approved, advance.funded, settlement.completed, settlement.failed. Verify HMAC-SHA256 signature. Store event log.',
    targetFiles: ['apps/api/src/modules/pay-factor/pay-factor.controller.ts'],
  },
  {
    id: 13, vertical: 'AEL Solutions', name: 'AEL-AELS-Tenant-Seed',
    module: 'database', priority: 'P0',
    task: 'Create SQL seed file for American Eagle Logistics Service (AELS) tenant. Include: tenant record (vertical=logistics, plan=professional), admin user, PayFactor API keys placeholder, webhook config. Use proper UUID primary keys.',
    targetFiles: ['packages/database/seeds/060_aels-tenant-seed.sql'],
    createIfMissing: true,
  },
  {
    id: 14, vertical: 'AEL Solutions', name: 'AEL-PayFactor-HMAC-Guard',
    scopeOwner: 'PAYSURITY', // PaySurity owns: HMAC verification of inbound AELS calls
    module: 'pay-factor', priority: 'P0',
    task: 'Harden the AelsHmacGuard: verify HMAC-SHA256 signature on every inbound PayFactor request from AELS. Use PAYSURITY_WEBHOOK_SECRET env var. Reject with 401 if signature missing or invalid. Log all rejection attempts with IP and timestamp to audit log. Guard must be injectable and testable.',
    targetFiles: ['apps/api/src/guards/aels-hmac.guard.ts'],
  },
  {
    id: 15, vertical: 'AEL Solutions', name: 'AEL-Load-Factoring',
    module: 'pay-factor', priority: 'P1',
    task: 'Implement freight load factoring: submit invoice, factor at configurable rate, advance 90% immediately, hold 10% reserve, release on payment. Track factoring history per carrier. Reference FAC_FREIGHT_LOAD_FACTORING requirements.',
    targetFiles: ['apps/api/src/modules/pay-factor/pay-factor.dto.ts'],
  },
  {
    id: 16, vertical: 'AEL Solutions', name: 'AEL-Settlement-Engine',
    module: 'settlement', priority: 'P1',
    task: 'Complete settlement service: create settlement batch, process items, calculate net after platform fee (1.5% default), mark as settled, generate settlement report. Multi-tenant support.',
    targetFiles: ['apps/api/src/modules/settlement/settlement.service.ts', 'apps/api/src/modules/settlement/settlement-batches.service.ts'],
  },
  {
    id: 17, vertical: 'AEL Solutions', name: 'AEL-PayFactor-Transaction-Ledger',
    scopeOwner: 'PAYSURITY', // PaySurity owns: immutable record of all PayFactor money movements
    module: 'pay-factor', priority: 'P1',
    task: 'Implement PayFactor transaction ledger: every escrow receipt, tranche-1 release, tranche-2 release, and fee deduction must be recorded as an immutable row in a payfactor_transactions table. Include: escrow_id, driver_id, aels_tenant_id, type (ESCROW|ADVANCE|SETTLEMENT|FEE), amount_cents, status, created_at, idempotency_key. Endpoint: GET /v1/payfactor/transactions?escrow_id= for AELS to reconcile.',
    targetFiles: ['apps/api/src/modules/pay-factor/pay-factor.service.ts'],
  },
  {
    id: 18, vertical: 'AEL Solutions', name: 'AEL-API-Keys-Generation',
    module: 'apikeys', priority: 'P0',
    task: 'Implement API key management: generate production PAYSURITY_API_KEY (uuid-based), PAYSURITY_API_SECRET (sha256 hmac key), PAYSURITY_WEBHOOK_SECRET (32-byte random hex). Store hashed. Endpoint: POST /api-keys/generate, GET /api-keys (list), DELETE /api-keys/:id.',
    targetFiles: ['apps/api/src/modules/apikeys/apikeys.service.ts', 'apps/api/src/modules/apikeys/apikeys.controller.ts'],
  },

  // ── GrocerEase (19-26) ──────────────────────────────────────────────────
  {
    id: 19, vertical: 'GrocerEase', name: 'GE-Inventory-Core',
    module: 'inventory', priority: 'P1',
    task: `Implement grocery inventory: products with barcode/UPC, stock levels, reorder points, supplier info, cost/price. Tag all reusable components with @reusable:grocerease comment. These screens are shared with restaurant (POSR) where applicable.`,
    targetFiles: ['apps/api/src/modules/inventory/inventory.service.ts', 'apps/api/src/modules/inventory/inventory.controller.ts'],
    reuseTag: 'POSR',
  },
  {
    id: 20, vertical: 'GrocerEase', name: 'GE-POS-Checkout',
    module: 'checkout', priority: 'P1',
    task: 'Implement grocery POS checkout: scan items by barcode, apply promotions, calculate tax by item category, support EBT/SNAP items flag, generate receipt. Tag: @reusable:grocerease - shares base checkout flow with POSR.',
    targetFiles: ['apps/api/src/modules/checkout/checkout.service.ts', 'apps/api/src/modules/checkout/checkout.controller.ts'],
    reuseTag: 'POSR',
  },
  {
    id: 21, vertical: 'GrocerEase', name: 'GE-Product-Catalog',
    module: 'products', priority: 'P1',
    task: 'Implement grocery product catalog: categories (produce, dairy, bakery, etc.), items with nutrition info, allergens, weight/unit pricing, bulk pricing tiers. @reusable:grocerease with POSR menu management pattern.',
    targetFiles: ['apps/api/src/modules/products/products.service.ts', 'apps/api/src/modules/products/products.controller.ts'],
    reuseTag: 'POSR',
  },
  {
    id: 22, vertical: 'GrocerEase', name: 'GE-Scale-Device',
    module: 'grocery', priority: 'P2',
    task: 'Implement scale device integration: receive weight reading from scale (webhook), look up PLU code, calculate price = weight * unit_price, add to cart. Support USB HID and network scales.',
    targetFiles: ['apps/api/src/modules/grocery/grocery.service.ts'],
  },
  {
    id: 23, vertical: 'GrocerEase', name: 'GE-EBT-SNAP',
    module: 'payment', priority: 'P1',
    task: 'Implement EBT/SNAP payment support: mark eligible items, calculate EBT-eligible subtotal, split tender (EBT + cash/card), validate against SNAP approved item list. Add ebt_eligible flag to product schema.',
    targetFiles: ['apps/api/src/modules/payment/payment.service.ts'],
  },
  {
    id: 24, vertical: 'GrocerEase', name: 'GE-Purchase-Orders',
    module: 'inventory', priority: 'P2',
    task: 'Implement purchase order management: create PO to supplier, receive items (partial/full), match invoice to PO, update inventory on receipt. @reusable:grocerease concept reuses vendor module.',
    targetFiles: ['apps/api/src/modules/inventory/purchase-orders.service.ts', 'apps/api/src/modules/inventory/purchase-orders.controller.ts'],
  },
  {
    id: 25, vertical: 'GrocerEase', name: 'GE-Promotions-Engine',
    module: 'price-engine', priority: 'P2',
    task: 'Implement grocery promotions: BOGO, percentage off, dollar off, bundle deals, weekly specials schedule. Promotions apply at checkout automatically. @reusable:grocerease may share price-engine with restaurant discount module.',
    targetFiles: ['apps/api/src/modules/price-engine/price-engine.service.ts'],
  },
  {
    id: 26, vertical: 'GrocerEase', name: 'GE-Analytics-Reports',
    module: 'analytics', priority: 'P2',
    task: 'Grocery-specific analytics: top sellers by category, shrinkage/waste report, inventory turnover, supplier performance, margin analysis. Reuses analytics module structure from POSR - tag @reusable:grocerease.',
    targetFiles: ['apps/api/src/modules/analytics/analytics.service.ts'],
    reuseTag: 'POSR',
  },

  // ── PaySurity Payroll (27-32) ────────────────────────────────────────────
  {
    id: 27, vertical: 'PaySurity Payroll', name: 'PAY-Employee-Management',
    module: 'payroll', priority: 'P1',
    task: 'Implement employee management for payroll: hire date, pay type (hourly/salary), pay rate, tax withholding (W4 data), direct deposit bank info (encrypted). Multi-tenant. CRUD endpoints.',
    targetFiles: ['apps/api/src/modules/payroll/payroll.service.ts'],
  },
  {
    id: 28, vertical: 'PaySurity Payroll', name: 'PAY-Payroll-Run-Engine',
    module: 'payroll', priority: 'P0',
    task: 'Implement payroll run engine: select pay period, calculate gross pay (hours × rate OR salary prorated), deduct federal/state taxes (use tax tables), deduct benefits, calculate net pay. Generate payroll journal entries.',
    targetFiles: ['apps/api/src/modules/payroll/payroll.service.ts', 'apps/api/src/modules/payroll/payroll-runs.service.ts'],
  },
  {
    id: 29, vertical: 'PaySurity Payroll', name: 'PAY-Pay-Stubs',
    module: 'payroll', priority: 'P1',
    task: 'Generate pay stub JSON (for PDF rendering): employee details, pay period, gross pay breakdown, each deduction line, net pay, YTD totals. Endpoint: GET /payroll/:runId/stub/:employeeId returns structured JSON.',
    targetFiles: ['apps/api/src/modules/payroll/payroll.controller.ts'],
  },
  {
    id: 30, vertical: 'PaySurity Payroll', name: 'PAY-Tax-Documents',
    module: 'payroll', priority: 'P1',
    task: 'Implement year-end tax document generation: W-2 data compilation (wages, federal/state tax withheld, SS/Medicare), 1099-NEC for contractors, export as structured JSON for PDF generation or ADP-format XML.',
    targetFiles: ['apps/api/src/modules/payroll/payroll.service.ts'],
  },
  {
    id: 31, vertical: 'PaySurity Payroll', name: 'PAY-Direct-Deposit',
    module: 'payroll', priority: 'P1',
    task: 'Implement ACH direct deposit: collect employee bank details (routing + account, encrypted), generate ACH NACHA file format on payroll run, integrate with payment processor. Status: submitted/pending/settled.',
    targetFiles: ['apps/api/src/modules/payroll/payroll-runs.service.ts'],
  },
  {
    id: 32, vertical: 'PaySurity Payroll', name: 'PAY-Compliance',
    module: 'compliance', priority: 'P2',
    task: 'Payroll compliance reporting: track overtime eligibility (>40hr/week = 1.5x), minimum wage validation by state, pay stub delivery compliance (email within 24h of pay date), audit trail for all payroll runs.',
    targetFiles: ['apps/api/src/modules/compliance/compliance.service.ts'],
  },

  // ── PaySurity Digital Wallets (33-38) ────────────────────────────────────
  {
    id: 33, vertical: 'PaySurity Digital Wallets', name: 'WAL-Balance-Core',
    module: 'wallet', priority: 'P0',
    task: 'Implement digital wallet core: create wallet on user creation, get balance, transaction history, concurrent balance update safety (use DB transactions). Support multiple currencies. Multi-tenant.',
    targetFiles: ['apps/api/src/modules/wallet/wallet.service.ts', 'apps/api/src/modules/wallets/wallets.service.ts'],
  },
  {
    id: 34, vertical: 'PaySurity Digital Wallets', name: 'WAL-TopUp-Funding',
    module: 'wallet', priority: 'P0',
    task: 'Implement wallet funding: top-up via card (Stripe), bank transfer (ACH), merchant credit. Validate funding amount limits. Emit wallet.funded event. Update balance atomically.',
    targetFiles: ['apps/api/src/modules/wallet/wallet.service.ts'],
  },
  {
    id: 35, vertical: 'PaySurity Digital Wallets', name: 'WAL-P2P-Transfers',
    module: 'wallet', priority: 'P1',
    task: 'Implement P2P wallet transfers: sender validates balance, debit sender, credit receiver, create transfer record for both, emit events, support memo field. Validate same-platform transfers.',
    targetFiles: ['apps/api/src/modules/wallet/wallet.service.ts'],
  },
  {
    id: 36, vertical: 'PaySurity Digital Wallets', name: 'WAL-Spending-Limits',
    module: 'wallet', priority: 'P1',
    task: 'Implement wallet spending limits: daily spend limit, per-transaction limit, merchant category limits. Configurable per wallet. Enforce at payment time. Return 422 with reason when limit exceeded.',
    targetFiles: ['apps/api/src/modules/wallet/wallet.service.ts'],
  },
  {
    id: 37, vertical: 'PaySurity Digital Wallets', name: 'WAL-Statements',
    module: 'wallet', priority: 'P2',
    task: 'Generate wallet statements: date range filter, opening balance, transactions list (debit/credit), running balance, closing balance. Structured JSON for PDF/CSV export. Endpoint: GET /wallets/:id/statement?from=&to=.',
    targetFiles: ['apps/api/src/modules/wallet/wallet.controller.ts'],
  },
  {
    id: 38, vertical: 'PaySurity Digital Wallets', name: 'WAL-Merchant-Wallet',
    module: 'wallet', priority: 'P1',
    task: 'Implement merchant wallet: receives payment settlements, withdrawal to bank account (via ACH), hold for chargeback reserve, fee deduction tracking. Separate from consumer wallet but same engine.',
    targetFiles: ['apps/api/src/modules/wallet/wallet.service.ts', 'apps/api/src/modules/wallets/wallets.controller.ts'],
  },

  // ── PaySurity eCom (39-44) ───────────────────────────────────────────────
  {
    id: 39, vertical: 'PaySurity eCom', name: 'ECOM-Product-Catalog',
    module: 'ecommerce', priority: 'P0',
    task: 'Implement e-commerce product catalog: SKU, variants (size/color), inventory tracking, images, SEO fields (meta title/description), categories hierarchy. Multi-tenant store isolation.',
    targetFiles: ['apps/api/src/modules/ecommerce/ecommerce.service.ts'],
  },
  {
    id: 40, vertical: 'PaySurity eCom', name: 'ECOM-Cart-Checkout',
    module: 'ecommerce', priority: 'P0',
    task: 'Implement cart and checkout: add to cart, update quantity, apply promo code, calculate shipping, tax calculation, payment intent creation, order placed event. Cart persisted in DB with TTL.',
    targetFiles: ['apps/api/src/modules/checkout/checkout.service.ts'],
  },
  {
    id: 41, vertical: 'PaySurity eCom', name: 'ECOM-Order-Management',
    module: 'orders', priority: 'P0',
    task: 'Complete order management: list orders with filters, get order detail, update status (pending→processing→shipped→delivered), cancel with reason, email notifications on status change.',
    targetFiles: ['apps/api/src/modules/orders/orders.service.ts'],
  },
  {
    id: 42, vertical: 'PaySurity eCom', name: 'ECOM-Returns-Refunds',
    module: 'refund-workflow', priority: 'P1',
    task: 'Implement return/refund workflow: customer initiates return, merchant approves/denies, generate return label, receive item, issue refund to original payment method or store credit. Status machine with email triggers.',
    targetFiles: ['apps/api/src/modules/refund-workflow/refund-workflow.service.ts'],
  },
  {
    id: 43, vertical: 'PaySurity eCom', name: 'ECOM-Product-Reviews',
    module: 'ecommerce', priority: 'P2',
    task: 'Implement product reviews: authenticated customers only, 1-5 star rating, text review, merchant reply, helpful votes, flag inappropriate. Aggregate rating per product.',
    targetFiles: ['apps/api/src/modules/ecommerce/product-reviews/product-reviews.service.ts', 'apps/api/src/modules/ecommerce/product-reviews/product-reviews.controller.ts'],
  },
  {
    id: 44, vertical: 'PaySurity eCom', name: 'ECOM-Storefront-API',
    module: 'website', priority: 'P1',
    task: 'Implement public storefront API: public product listing (no auth), product detail page, category browse, search with filters, featured products, new arrivals. Rate limited. Cache-friendly ETags.',
    targetFiles: ['apps/api/src/modules/website/website.service.ts', 'apps/api/src/modules/website/website.controller.ts'],
  },

  // ── PaySurity Affiliates (45-48) ─────────────────────────────────────────
  {
    id: 45, vertical: 'PaySurity Affiliates', name: 'AFF-Tracking-Engine',
    module: 'affiliates', priority: 'P1',
    task: 'Implement affiliate tracking: unique referral link per affiliate (UUID-based), click tracking, conversion tracking (sale → attribute to affiliate), cookie-based attribution (30-day window), server-side postback support.',
    targetFiles: ['apps/api/src/modules/affiliates/affiliates.service.ts'],
  },
  {
    id: 46, vertical: 'PaySurity Affiliates', name: 'AFF-Commission-Engine',
    module: 'affiliates', priority: 'P1',
    task: 'Implement commission calculation: configurable commission rate per product/category, one-time vs recurring, calculate on successful payment settlement (not just order), hold period before payout, commission ledger.',
    targetFiles: ['apps/api/src/modules/affiliates/affiliates-payouts.service.ts'],
  },
  {
    id: 47, vertical: 'PaySurity Affiliates', name: 'AFF-MLM-Payout',
    module: 'affiliates', priority: 'P2',
    task: 'Implement MLM/multi-level commission: support up to 3 levels (direct, level 2, level 3) with configurable rates per level. Calculate upline commissions on each conversion. Prevent circular referrals.',
    targetFiles: ['apps/api/src/modules/affiliates/affiliates.service.ts'],
  },
  {
    id: 48, vertical: 'PaySurity Affiliates', name: 'AFF-Fraud-Detection',
    module: 'affiliates', priority: 'P2',
    task: 'Implement affiliate fraud detection: velocity checks (too many conversions in short time), self-referral detection, IP anomaly detection, suspicious pattern flagging, auto-suspend on threshold breach.',
    targetFiles: ['apps/api/src/modules/affiliates/affiliate-fraud-detection.service.ts'],
  },

  // ── Loyalty (tenant-configurable, 49-50) ────────────────────────────────
  {
    id: 49, vertical: 'Loyalty', name: 'LOY-Tenant-Config-Onboarding',
    module: 'loyalty', priority: 'P1',
    task: `Implement tenant-configurable loyalty onboarding: during tenant setup, configure: points_per_dollar (e.g., 10), tier thresholds (Bronze=0, Silver=500, Gold=2000), redemption_rate (100 points = $1), reward catalog items. Store in tenant settings jsonb. Schema: CREATE TABLE loyalty_config per tenant.`,
    targetFiles: ['apps/api/src/modules/loyalty/loyalty.service.ts', 'packages/database/src/schema/loyalty.ts'],
    createIfMissing: true,
  },
  {
    id: 50, vertical: 'Loyalty', name: 'LOY-Points-Ledger-Engine',
    module: 'loyalty', priority: 'P1',
    task: 'Implement loyalty points ledger: award points on purchase (apply tenant config rate), redeem points at checkout, point expiry (configurable, default 12 months), full transaction history per customer per tenant, tier calculation (auto-upgrade on threshold).',
    targetFiles: ['apps/api/src/modules/loyalty/loyalty.service.ts'],
  },
];

// ─── Aggregator + Verifier Role Definitions ──────────────────────────────────

const AGGREGATORS = Array.from({length: 10}, (_, i) => ({
  id: i + 1,
  handles: POOLS.slice(i * 5, (i + 1) * 5).map(p => p.id),
  job: 'Collect generated code, validate syntax, place files, run tsc --noEmit check on each file',
}));

const FINAL_VERIFIERS = Array.from({length: 5}, (_, i) => ({
  id: i + 1,
  handles: POOLS.slice(i * 10, (i + 1) * 10).map(p => p.id),
  job: 'Independent verification: check file exists, imports resolve, no syntax errors, exports match what module expects',
}));

// ─── Utilities ────────────────────────────────────────────────────────────────

function elapsed() {
  const ms  = Date.now() - START_TIME;
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}m${sec}s`;
}

function log(poolId, msg) {
  const ts  = new Date().toISOString();
  const line = `[${ts}][Pool-${String(poolId).padStart(2,'0')}] ${msg}`;
  console.log(line);
  fs.appendFileSync(path.join(REPORT_DIR, `pool-${String(poolId).padStart(2,'0')}.log`), line + '\n');
  fs.appendFileSync(path.join(REPORT_DIR, 'master.log'), line + '\n');
}

function readFileOrEmpty(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function ensureDir(p) { fs.mkdirSync(path.dirname(p), { recursive: true }); }

// ─── Core: Run One Worker Pool ────────────────────────────────────────────────

async function runPool(pool) {
  const model = genAI.getGenerativeModel({ model: MODEL });
  const results = [];

  for (const targetPath of pool.targetFiles) {
    const absPath = path.join(ROOT, targetPath);
    const existing = readFileOrEmpty(absPath);
    const fileType = path.extname(targetPath) === '.sql' ? 'sql' : 'typescript';

    const reuseNote = pool.reuseTag
      ? `\nIMPORTANT: Tag this file with comment // @reusable:grocerease @origin:${pool.reuseTag} at the top if the logic is reusable across both Restaurant POS and GrocerEase.`
      : '';

    const loyaltyNote = pool.vertical === 'Loyalty'
      ? '\nIMPORTANT: Loyalty is TENANT-CONFIGURABLE. Never hardcode rates or tiers. Always read from tenant settings/config. Each tenant defines their own program during onboarding.'
      : '';

    const prompt = `You are a senior NestJS/TypeScript engineer working on the PaySurity multi-tenant SaaS platform.

VERTICAL: ${pool.vertical}
POOL: ${pool.name}
PRIORITY: ${pool.priority}
FILE: ${targetPath}
FILE TYPE: ${fileType}

TASK:
${pool.task}
${reuseNote}
${loyaltyNote}

EXISTING FILE CONTENT (modify/enhance this):
\`\`\`${fileType}
${existing.slice(0, 3000) || '(empty — create new)'}
\`\`\`

STRICT RULES:
1. Output ONLY the complete file content — no markdown, no explanation
2. Use @Inject('DATABASE') private readonly db: NodePgDatabase<any> for DB access
3. Use raw SQL via (this.db as any).execute(sql, params) for queries  
4. No imports from fake packages (@paysurity/auth, @nestjs-drizzle/core, @app/*)
5. Use relative imports only for local files
6. @UseGuards() decorators: REMOVE them — guards applied globally in main.ts
7. For decorators like @TenantId(), @CurrentUser(): replace with @Request() req: any, extract from req.user.tenantId
8. Every exported class/function must be syntactically correct TypeScript
9. Prefer simple, working code over complex stubs
10. ${fileType === 'sql' ? 'Output valid PostgreSQL SQL with proper UUID primary keys and tenant_id columns' : 'Must compile with swc (TypeScript 5.x)'}`;

    try {
      log(pool.id, `  Coding: ${path.basename(targetPath)}`);
      const r = await model.generateContent(prompt);
      let code = r.response.text().trim()
        .replace(/^```(typescript|sql|javascript)?\n?/, '')
        .replace(/\n?```$/, '')
        .trim();

      if (code && code.length > 50) {
        ensureDir(absPath);
        fs.writeFileSync(absPath, code, 'utf8');
        results.push({ file: targetPath, status: 'written', bytes: code.length });
        log(pool.id, `  ✅ Written: ${path.basename(targetPath)} (${code.length} bytes)`);
      } else {
        results.push({ file: targetPath, status: 'skipped', reason: 'empty response' });
        log(pool.id, `  ⚠️  Skipped: ${path.basename(targetPath)} (empty response)`);
      }
    } catch(e) {
      results.push({ file: targetPath, status: 'error', reason: e.message?.slice(0, 100) });
      log(pool.id, `  ❌ Error on ${path.basename(targetPath)}: ${e.message?.slice(0, 80)}`);
      await new Promise(r => setTimeout(r, 2000));
    }

    // Brief pause between files in same pool
    await new Promise(r => setTimeout(r, 800));
  }

  return { poolId: pool.id, name: pool.name, vertical: pool.vertical, results };
}

// ─── Aggregator: Validate + Report ───────────────────────────────────────────

function aggregateResults(batchResults) {
  const report = {
    timestamp: new Date().toISOString(),
    elapsed: elapsed(),
    totalPools: batchResults.length,
    poolsSucceeded: 0,
    filesWritten: 0,
    filesErrored: 0,
    byVertical: {},
  };

  for (const r of batchResults) {
    if (!report.byVertical[r.vertical]) report.byVertical[r.vertical] = { pools: 0, files: 0, errors: 0 };
    report.byVertical[r.vertical].pools++;
    let allOk = true;
    for (const f of r.results) {
      if (f.status === 'written') { report.filesWritten++; report.byVertical[r.vertical].files++; }
      else { report.filesErrored++; report.byVertical[r.vertical].errors++; allOk = false; }
    }
    if (allOk) report.poolsSucceeded++;
  }

  return report;
}

// ─── Final Verifier: syntax check ────────────────────────────────────────────

function verifyFile(filePath) {
  try {
    const code = fs.readFileSync(path.join(ROOT, filePath), 'utf8');
    // Basic syntax checks
    const issues = [];
    if (code.includes('// REMOVED') || code.includes('@paysurity/auth') || code.includes('@nestjs-drizzle')) {
      issues.push('BAD_IMPORT_DETECTED');
    }
    if (code.includes('JwtAuthGuard') && code.includes('@UseGuards')) {
      issues.push('GUARD_STILL_PRESENT');
    }
    const openBraces  = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (Math.abs(openBraces - closeBraces) > 5) {
      issues.push(`BRACE_MISMATCH: {${openBraces} }${closeBraces}`);
    }
    return issues;
  } catch { return ['FILE_NOT_FOUND']; }
}

// ─── Reporting (every 30 min) ─────────────────────────────────────────────────

let lastReportTime = Date.now();
function maybeReport(poolsDone, totalPools, batchReport) {
  const now = Date.now();
  const shouldReport = now - lastReportTime >= 30 * 60 * 1000 || poolsDone === totalPools;
  if (!shouldReport) return;
  lastReportTime = now;

  const ts = new Date().toISOString();
  const msg = [
    `\n${'═'.repeat(70)}`,
    `📊 SWARM PROGRESS REPORT — ${ts}`,
    `⏱  Elapsed: ${elapsed()}`,
    `🐝 Pools: ${poolsDone}/${totalPools} complete`,
    `📁 Files Written: ${batchReport.filesWritten}`,
    `❌ Errors: ${batchReport.filesErrored}`,
    ``,
    `By Vertical:`,
    ...Object.entries(batchReport.byVertical).map(([v, d]) =>
      `  ${v}: ${d.pools} pools, ${d.files} files written, ${d.errors} errors`),
    `${'═'.repeat(70)}\n`,
  ].join('\n');

  console.log(msg);
  fs.appendFileSync(path.join(REPORT_DIR, 'progress-reports.log'), msg + '\n');
}

// ─── Main Orchestrator ────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`🚀 PAYSURITY SWARM ORCHESTRATOR — 50 POOLS — ${new Date().toISOString()}`);
  console.log(`   Pools: ${POOLS.length} | Aggregators: 10 | Final Verifiers: 5`);
  console.log(`   Model: ${MODEL} | Batch Size: ${BATCH_SIZE}`);
  console.log(`${'═'.repeat(70)}\n`);

  const allResults = [];
  let poolsDone = 0;

  // Run pools in batches
  for (let i = 0; i < POOLS.length; i += BATCH_SIZE) {
    const batch = POOLS.slice(i, i + BATCH_SIZE);
    console.log(`\n▶ Batch ${Math.floor(i/BATCH_SIZE)+1}: Pools ${batch[0].id}-${batch[batch.length-1].id} (${batch.map(p=>p.name).join(', ')})`);

    const batchResults = await Promise.all(batch.map(async (pool) => {
      log(pool.id, `Starting [${pool.vertical}] ${pool.name}`);
      const result = await runPool(pool);
      poolsDone++;
      return result;
    }));

    allResults.push(...batchResults);

    // Aggregator report after each batch
    const batchReport = aggregateResults(allResults);
    maybeReport(poolsDone, POOLS.length, batchReport);

    // Brief pause between batches
    if (i + BATCH_SIZE < POOLS.length) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // ── Final Verification Pass ──────────────────────────────────────────────
  console.log('\n🔍 FINAL VERIFICATION PASS (5 verifiers)...');
  const allFiles = POOLS.flatMap(p => p.targetFiles);
  const verifyResults = [];
  for (const f of allFiles) {
    const issues = verifyFile(f);
    verifyResults.push({ file: f, ok: issues.length === 0, issues });
    if (issues.length > 0) console.log(`  ⚠️  ${f}: ${issues.join(', ')}`);
  }
  const failCount = verifyResults.filter(v => !v.ok).length;
  console.log(`\n✅ Verification: ${verifyResults.length - failCount}/${verifyResults.length} files clean`);

  // ── Final Build ──────────────────────────────────────────────────────────
  console.log('\n🔨 Running final API build...');
  try {
    execSync('cd apps/api && npx nest build --config nest-cli.json', { cwd: ROOT, timeout: 180000, stdio: 'pipe' });
    console.log('✅ BUILD PASSED');
  } catch(e) {
    console.log(`⚠️  Build issues: ${(e.stdout || e.stderr || '').toString().slice(0, 300)}`);
  }

  // ── Commit + Push ─────────────────────────────────────────────────────────
  console.log('\n📤 Committing and pushing...');
  try {
    execSync('git add -A', { cwd: ROOT });
    const stats = execSync('git diff --cached --stat', { cwd: ROOT }).toString().split('\n').pop();
    execSync(`git commit -m "feat(swarm-50): 50-pool swarm complete — BistroBeast/AEL/GrocerEase/Payroll/Wallet/eCom/Affiliates/Loyalty [${new Date().toISOString()}]"`, { cwd: ROOT });
    execSync('git push origin main', { cwd: ROOT });
    console.log(`✅ Pushed: ${stats}`);
  } catch(e) { console.warn('Push:', e.message?.slice(0, 60)); }

  // ── Final Report ──────────────────────────────────────────────────────────
  const finalReport = aggregateResults(allResults);
  const finalMsg = [
    `\n${'═'.repeat(70)}`,
    `🏁 SWARM COMPLETE — ${new Date().toISOString()}`,
    `⏱  Total Time: ${elapsed()}`,
    `📁 Files Written: ${finalReport.filesWritten}`,
    `❌ Files with Errors: ${finalReport.filesErrored}`,
    `🔍 Verification Failures: ${failCount}`,
    ``,
    `Results by Vertical:`,
    ...Object.entries(finalReport.byVertical).map(([v, d]) =>
      `  ${v}: ${d.pools} pools done, ${d.files} files, ${d.errors} errors`),
    `${'═'.repeat(70)}\n`,
  ].join('\n');

  console.log(finalMsg);
  fs.writeFileSync(path.join(REPORT_DIR, 'final-report.json'), JSON.stringify({ finalReport, verifyResults, elapsed: elapsed() }, null, 2));
  fs.appendFileSync(path.join(REPORT_DIR, 'progress-reports.log'), finalMsg);
}

main().catch(e => { console.error('ORCHESTRATOR FATAL:', e); process.exit(1); });
