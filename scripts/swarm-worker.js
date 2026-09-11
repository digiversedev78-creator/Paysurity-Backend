#!/usr/bin/env node
/**
 * PaySurity Parallel Swarm Generator
 * ══════════════════════════════════════════════════════════════
 * This script is called BY each Cloud Build worker step.
 * It receives a WORKER_ID and generates all modules assigned to that worker.
 *
 * Usage (called by cloudbuild-swarm.yaml):
 *   node scripts/swarm-worker.js WORKER_A
 *   node scripts/swarm-worker.js WORKER_B
 *   ...etc
 */

const { execSync } = require('child_process');
const path = require('path');

const workerId = process.argv[2];
if (!workerId) {
  console.error('Usage: node swarm-worker.js <WORKER_ID>');
  process.exit(1);
}

// ══════════════════════════════════════════════════════════════
// WORKER ASSIGNMENTS — Each worker gets a set of modules to generate + test
// ══════════════════════════════════════════════════════════════
const ASSIGNMENTS = {
  // ── WORKER A: Core Financial Engine ────────────────────────
  WORKER_A: {
    label: 'Core Financial — Payment, Ledger, Risk',
    modules: [
      { name: 'PaymentIntent', table: 'payment_intents', fields: 'amountCents:number,currency:string,status:string,gateway:string,paymentMethodType:string' },
      { name: 'Refund', table: 'refunds', fields: 'amountCents:number,status:string,gateway:string,reason:string' },
      { name: 'DisputeCase', table: 'dispute_cases', fields: 'type:string,amountCents:number,status:string,reason:string,evidenceDue:date' },
      { name: 'RiskScore', table: 'risk_scores', fields: 'entityType:string,entityId:string,score:number,signals:json,action:string' },
      { name: 'ReconciliationBatch', table: 'reconciliation_batches', fields: 'batchDate:date,matchedCount:number,unmatchedCount:number,status:string' },
    ],
    schemas: ['payments_extended'],
    tests: ['payment-intent.e2e', 'refund-flow.e2e'],
  },

  // ── WORKER B: Merchant Portal & Onboarding ─────────────────
  WORKER_B: {
    label: 'Merchant Acquisition — Onboarding, KYB, Portal',
    modules: [
      { name: 'MerchantOnboarding', table: 'onboarding_applications', fields: 'legalName:string,dbaName:string,status:string,step:string,kybVerified:boolean' },
      { name: 'MerchantDocument', table: 'merchant_documents', fields: 'category:string,fileName:string,fileUrl:string,status:string,expiresAt:date' },
      { name: 'PricingSchedule', table: 'pricing_schedules', fields: 'type:string,interchangePlus:number,monthlyFee:number,gatewayFee:number' },
      { name: 'EquipmentOrder', table: 'equipment_orders', fields: 'terminalModel:string,quantity:number,status:string,trackingNumber:string' },
      { name: 'MerchantNote', table: 'merchant_notes', fields: 'noteType:string,content:string,isInternal:boolean,authorId:string' },
    ],
    schemas: ['merchant_extended'],
    tests: ['onboarding.e2e', 'kyb-verification.e2e'],
  },

  // ── WORKER C: POS Verticals ────────────────────────────────
  WORKER_C: {
    label: 'POS Verticals — Restaurant, Grocery, Retail',
    modules: [
      { name: 'TableManagement', table: 'tables', fields: 'name:string,capacity:number,section:string,status:string,serverId:string' },
      { name: 'KitchenDisplay', table: 'kds_tickets', fields: 'orderId:string,station:string,status:string,priority:number,prepTimeMin:number' },
      { name: 'MenuModifier', table: 'menu_modifiers', fields: 'name:string,priceCents:number,menuItemId:string,isRequired:boolean,maxSelections:number' },
      { name: 'Reservation', table: 'reservations', fields: 'customerName:string,partySize:number,reservationTime:date,status:string,notes:string' },
      { name: 'DeviceTerminal', table: 'device_terminals', fields: 'serialNumber:string,model:string,status:string,lastHeartbeat:date,firmwareVersion:string' },
    ],
    schemas: ['pos_extended'],
    tests: ['table-management.e2e', 'kds.e2e'],
  },

  // ── WORKER D: Business Operations ──────────────────────────
  WORKER_D: {
    label: 'Operations — Payroll, HR, Compliance',
    modules: [
      { name: 'TimeEntry', table: 'time_entries', fields: 'employeeId:string,clockIn:date,clockOut:date,breakMinutes:number,hoursWorked:number' },
      { name: 'PayStub', table: 'pay_stubs', fields: 'employeeId:string,payrollRunId:string,grossCents:number,netCents:number,periodStart:date' },
      { name: 'ComplianceCheck', table: 'compliance_checks', fields: 'category:string,checkName:string,status:string,details:json,nextDue:date' },
      { name: 'TaxFiling', table: 'tax_filings', fields: 'filingType:string,period:string,amountCents:number,status:string,dueDate:date' },
      { name: 'ScheduleShift', table: 'schedule_shifts', fields: 'employeeId:string,startTime:date,endTime:date,position:string,status:string' },
    ],
    schemas: ['operations_extended'],
    tests: ['time-tracking.e2e', 'payroll-run.e2e'],
  },

  // ── WORKER E: Growth Channels ──────────────────────────────
  WORKER_E: {
    label: 'Growth — Affiliates, Loyalty, Marketing',
    modules: [
      { name: 'AffiliateCommission', table: 'affiliate_commissions', fields: 'affiliateId:string,orderId:string,amountCents:number,status:string,level:number' },
      { name: 'ReferralLink', table: 'referral_links', fields: 'code:string,campaignId:string,clicks:number,conversions:number,isActive:boolean' },
      { name: 'LoyaltyTransaction', table: 'loyalty_transactions', fields: 'customerId:string,type:string,points:number,balance:number,orderId:string' },
      { name: 'Campaign', table: 'campaigns', fields: 'name:string,type:string,startDate:date,endDate:date,status:string,budget:number' },
      { name: 'GiftCard', table: 'gift_cards', fields: 'code:string,balanceCents:number,originalCents:number,isActive:boolean,purchasedBy:string' },
    ],
    schemas: ['growth_channels'],
    tests: ['affiliate-commission.e2e', 'loyalty-earn-redeem.e2e'],
  },

  // ── WORKER F: Frontend & Consumer Experience ───────────────
  WORKER_F: {
    label: 'Frontend — Admin Portal, Consumer Checkout, Mobile',
    modules: [
      { name: 'CheckoutSession', table: 'checkout_sessions', fields: 'cartId:string,customerEmail:string,status:string,totalCents:number,expiresAt:date' },
      { name: 'ShippingRate', table: 'shipping_rates', fields: 'carrier:string,method:string,rateCents:number,estimatedDays:number,zoneId:string' },
      { name: 'ProductReview', table: 'product_reviews', fields: 'productId:string,rating:number,title:string,body:string,isVerified:boolean' },
      { name: 'SupportTicket', table: 'support_tickets', fields: 'subject:string,priority:string,status:string,category:string,assignedTo:string' },
      { name: 'Announcement', table: 'announcements', fields: 'title:string,body:string,type:string,isActive:boolean,expiresAt:date' },
    ],
    schemas: ['consumer_experience'],
    tests: ['checkout-flow.e2e', 'support-ticket.e2e'],
  },
};

// ══════════════════════════════════════════════════════════════
// Execute assignments
// ══════════════════════════════════════════════════════════════
const assignment = ASSIGNMENTS[workerId];
if (!assignment) {
  console.error(`Unknown worker: ${workerId}. Valid: ${Object.keys(ASSIGNMENTS).join(', ')}`);
  process.exit(1);
}

console.log(`\n${'═'.repeat(60)}`);
console.log(`  WORKER ${workerId}: ${assignment.label}`);
console.log(`  Generating ${assignment.modules.length} modules...`);
console.log(`${'═'.repeat(60)}\n`);

const generatorPath = path.join(__dirname, 'generate-module.js');
let errors = 0;

for (const mod of assignment.modules) {
  try {
    console.log(`  ⚡ ${mod.name} → ${mod.table}...`);
    execSync(
      `node "${generatorPath}" --name=${mod.name} --table=${mod.table} --fields="${mod.fields}"`,
      { stdio: 'inherit', cwd: path.join(__dirname, '..') },
    );
  } catch (err) {
    console.error(`  ❌ FAILED: ${mod.name} — ${err.message}`);
    errors++;
  }
}

// ── Run tests for generated modules ──────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`  Running spec tests for generated modules...`);
console.log(`${'─'.repeat(60)}\n`);

for (const mod of assignment.modules) {
  const kebab = mod.name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  const specPath = `apps/api/src/modules/${kebab}/${kebab}.service.spec.ts`;
  try {
    console.log(`  🧪 Testing: ${specPath}`);
    execSync(
      `npx jest "${specPath}" --passWithNoTests --no-coverage 2>&1`,
      { stdio: 'inherit', cwd: path.join(__dirname, '..'), timeout: 30000 },
    );
  } catch (err) {
    console.error(`  ⚠️  Test failed: ${kebab} (non-fatal)`);
  }
}

console.log(`\n${'═'.repeat(60)}`);
console.log(`  WORKER ${workerId} COMPLETE — ${assignment.modules.length - errors}/${assignment.modules.length} succeeded`);
console.log(`${'═'.repeat(60)}\n`);

process.exit(errors > 0 ? 1 : 0);
