/**
 * ═══════════════════════════════════════════════════════════
 * PaySurity — Phase 1 Demo Data Seeder
 * ═══════════════════════════════════════════════════════════
 *
 * Seeds ONLY the data required for UAT Phase 1:
 *   1. Super Admins (idempotent — skips if exists)
 *   2. Tenants: BistroBeast Demo Restaurant, RetailPro Demo Store
 *   3. Digital Wallet: parent + 3 child wallets (family), employer + 3 employee wallets
 *   4. ERP: Chart of Accounts + 1 balanced journal entry
 *
 * Run with:
 *   pnpm --filter @paysurity/api exec ts-node -r tsconfig-paths/register src/scripts/seed-demo-data.ts
 *
 * SAFE TO RUN MULTIPLE TIMES — every insert is idempotent (INSERT ... ON CONFLICT DO NOTHING).
 * ═══════════════════════════════════════════════════════════
 */

import * as bcrypt from 'bcrypt';
import postgres from 'postgres';

// ── Connection ────────────────────────────────────────────────────────────────
const DB_URL =
  process.env.DATABASE_URL ??
  'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev';

const sql = postgres(DB_URL, { max: 1 });

// ── Fixed UUIDs (deterministic so re-runs are truly idempotent) ──────────────
const IDS = {
  // Super Admins
  ADMIN_ASIF:   'a0000000-0000-0000-0000-000000000001',
  ADMIN_REHAN:  'a0000000-0000-0000-0000-000000000002',

  // Tenants
  TENANT_BISTRO:  'b1000000-0000-0000-0000-000000000001',
  TENANT_RETAIL:  'b1000000-0000-0000-0000-000000000002',

  // Users (belong to BistroBeast tenant)
  USER_PARENT:    'c1000000-0000-0000-0000-000000000001', // Guardian / Parent
  USER_CHILD1:    'c1000000-0000-0000-0000-000000000002', // Zara
  USER_CHILD2:    'c1000000-0000-0000-0000-000000000003', // Omar
  USER_CHILD3:    'c1000000-0000-0000-0000-000000000004', // Layla
  USER_EMPLOYER:  'c1000000-0000-0000-0000-000000000005', // Employer account
  USER_EMP1:      'c1000000-0000-0000-0000-000000000006', // Ahmed Hassan
  USER_EMP2:      'c1000000-0000-0000-0000-000000000007', // Maria Garcia
  USER_EMP3:      'c1000000-0000-0000-0000-000000000008', // James Wilson

  // Wallets
  WALLET_PARENT:   'd1000000-0000-0000-0000-000000000001',
  WALLET_CHILD1:   'd1000000-0000-0000-0000-000000000002',
  WALLET_CHILD2:   'd1000000-0000-0000-0000-000000000003',
  WALLET_CHILD3:   'd1000000-0000-0000-0000-000000000004',
  WALLET_EMPLOYER: 'd1000000-0000-0000-0000-000000000005',
  WALLET_EMP1:     'd1000000-0000-0000-0000-000000000006',
  WALLET_EMP2:     'd1000000-0000-0000-0000-000000000007',
  WALLET_EMP3:     'd1000000-0000-0000-0000-000000000008',

  // Family links
  LINK_CHILD1:  'e1000000-0000-0000-0000-000000000001',
  LINK_CHILD2:  'e1000000-0000-0000-0000-000000000002',
  LINK_CHILD3:  'e1000000-0000-0000-0000-000000000003',

  // Employer links
  LINK_EMP1:    'e1000000-0000-0000-0000-000000000004',
  LINK_EMP2:    'e1000000-0000-0000-0000-000000000005',
  LINK_EMP3:    'e1000000-0000-0000-0000-000000000006',

  // ERP Accounts
  ERP_ACCT_CASH:      'f1000000-0000-0000-0000-000000000001',
  ERP_ACCT_INVENTORY: 'f1000000-0000-0000-0000-000000000002',
  ERP_ACCT_REVENUE:   'f1000000-0000-0000-0000-000000000003',
  ERP_ACCT_COGS:      'f1000000-0000-0000-0000-000000000004',
  ERP_ACCT_AP:        'f1000000-0000-0000-0000-000000000005',

  // ERP Journal
  ERP_JOURNAL_ENTRY:  'f1000000-0000-0000-0000-000000000010',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(msg: string) { console.log(msg); }
function ok(msg: string)  { console.log(`  ✅ ${msg}`); }
function skip(msg: string){ console.log(`  ⏭️  ${msg}`); }
function err(msg: string) { console.error(`  ❌ ${msg}`); }

// ════════════════════════════════════════════════════════════════════════════════
// PHASE 1 — SEED FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════════

// ── 1. Super Admins (internal_users) ─────────────────────────────────────────
async function seedSuperAdmins() {
  log('\n📋 [1/4] Super Admins...');
  const passwordHash = await bcrypt.hash('YaAllahmadad@0997', 10);

  const admins = [
    { id: IDS.ADMIN_ASIF,  email: 'rwbchicago@gmail.com', first_name: 'Asif',       last_name: 'Khwaja',    phone: '312-719-9786', role: 'SUPER_ADMIN', password_hash: passwordHash },
    { id: IDS.ADMIN_REHAN, email: 'rullah1038@gmail.com', first_name: 'Rehanullah', last_name: 'rullah1038', phone: '773-865-4051', role: 'SUPER_ADMIN', password_hash: passwordHash },
  ];

  for (const admin of admins) {
    const existing = await sql`SELECT 1 FROM internal_users WHERE email = ${admin.email}`;
    if (existing.length === 0) {
      await sql`
        INSERT INTO internal_users (id, email, first_name, last_name, phone, role, password_hash)
        VALUES (${admin.id}, ${admin.email}, ${admin.first_name}, ${admin.last_name}, ${admin.phone}, ${admin.role}, ${admin.password_hash})
        ON CONFLICT (id) DO NOTHING
      `;
      ok(`Super Admin created: ${admin.email}`);
    } else {
      skip(`Super Admin already exists: ${admin.email}`);
    }
  }
}

// ── 2. Tenants ────────────────────────────────────────────────────────────────
async function seedTenants() {
  log('\n🏢 [2/4] Tenants...');

  const tenants = [
    {
      id: IDS.TENANT_BISTRO,
      name: 'BistroBeast Demo Restaurant',
      subdomain: 'bistrobeast-demo',
      plan: 'ENTERPRISE',
      industry: 'RESTAURANT',
      status: 'ACTIVE',
      city: 'Chicago',
      state: 'IL',
      country: 'US',
      timezone: 'America/Chicago',
      currency: 'USD',
    },
    {
      id: IDS.TENANT_RETAIL,
      name: 'RetailPro Demo Store',
      subdomain: 'retailpro-demo',
      plan: 'PROFESSIONAL',
      industry: 'RETAIL',
      status: 'ACTIVE',
      city: 'Chicago',
      state: 'IL',
      country: 'US',
      timezone: 'America/Chicago',
      currency: 'USD',
    },
  ];

  for (const t of tenants) {
    await sql`
      INSERT INTO tenants (id, name, subdomain, plan, industry, status, city, state, country, timezone, currency, created_at, updated_at)
      VALUES (
        ${t.id}::uuid, ${t.name}, ${t.subdomain}, ${t.plan}, ${t.industry},
        ${t.status}, ${t.city}, ${t.state}, ${t.country}, ${t.timezone}, ${t.currency},
        NOW(), NOW()
      )
      ON CONFLICT (id) DO NOTHING
    `;
    ok(`Tenant: "${t.name}" (${t.id})`);
  }
}

// ── 3. Users ──────────────────────────────────────────────────────────────────
async function seedUsers() {
  log('\n👤 [3a] Demo Users (BistroBeast tenant)...');
  const passwordHash = await bcrypt.hash('Demo@Paysurity2026!', 10);

  const users = [
    // Family
    { id: IDS.USER_PARENT,   phone: '+13127199786', email: 'parent@bistrodemo.com',   first_name: 'Asif',   last_name: 'Parent',  role: 'CONSUMER', hourly_rate_cents: null },
    { id: IDS.USER_CHILD1,   phone: '+15552223333', email: 'zara@bistrodemo.com',     first_name: 'Zara',   last_name: 'Child',   role: 'CONSUMER', hourly_rate_cents: null },
    { id: IDS.USER_CHILD2,   phone: '+15554445555', email: 'omar@bistrodemo.com',     first_name: 'Omar',   last_name: 'Child',   role: 'CONSUMER', hourly_rate_cents: null },
    { id: IDS.USER_CHILD3,   phone: '+15556667777', email: 'layla@bistrodemo.com',    first_name: 'Layla',  last_name: 'Child',   role: 'CONSUMER', hourly_rate_cents: null },
    // Employer + Employees
    { id: IDS.USER_EMPLOYER, phone: '+13125550100', email: 'employer@bistrodemo.com', first_name: 'BistroBeast', last_name: 'Corp', role: 'ADMIN',    hourly_rate_cents: null },
    { id: IDS.USER_EMP1,     phone: '+15551234567', email: 'ahmed@bistrodemo.com',    first_name: 'Ahmed',  last_name: 'Hassan',  role: 'EMPLOYEE', hourly_rate_cents: 2200 }, // $22.00/hr
    { id: IDS.USER_EMP2,     phone: '+15559876543', email: 'maria@bistrodemo.com',    first_name: 'Maria',  last_name: 'Garcia',  role: 'EMPLOYEE', hourly_rate_cents: 1800 }, // $18.00/hr
    { id: IDS.USER_EMP3,     phone: '+15555551234', email: 'james@bistrodemo.com',    first_name: 'James',  last_name: 'Wilson',  role: 'EMPLOYEE', hourly_rate_cents: 2000 }, // $20.00/hr
  ];

  for (const u of users) {
    await sql`
      INSERT INTO users (id, tenant_id, phone_number, email, first_name, last_name, role, hourly_rate_cents, password_hash, status, created_at, updated_at)
      VALUES (
        ${u.id}::uuid, ${IDS.TENANT_BISTRO}::uuid, ${u.phone}, ${u.email},
        ${u.first_name}, ${u.last_name}, ${u.role}, ${u.hourly_rate_cents},
        ${passwordHash}, 'ACTIVE', NOW(), NOW()
      )
      ON CONFLICT (id) DO NOTHING
    `;
    ok(`User: ${u.first_name} ${u.last_name} (${u.role})`);
  }
}

// ── 4. Digital Wallets ────────────────────────────────────────────────────────
async function seedWallets() {
  log('\n💳 [3b] Digital Wallets...');

  const wallets = [
    // Family wallets
    { id: IDS.WALLET_PARENT,   consumer_id: IDS.USER_PARENT,   wallet_type: 'CONSUMER',             currency: 'USD', balance_cents: 250000,  status: 'ACTIVE',   kyc_level: 'STANDARD', label: 'Parent Guardian Wallet' },
    { id: IDS.WALLET_CHILD1,   consumer_id: IDS.USER_CHILD1,   wallet_type: 'CONSUMER',             currency: 'USD', balance_cents: 4500,    status: 'ACTIVE',   kyc_level: 'MINOR',    label: 'Zara (Age 14)' },
    { id: IDS.WALLET_CHILD2,   consumer_id: IDS.USER_CHILD2,   wallet_type: 'CONSUMER',             currency: 'USD', balance_cents: 2000,    status: 'ACTIVE',   kyc_level: 'MINOR',    label: 'Omar (Age 11)' },
    { id: IDS.WALLET_CHILD3,   consumer_id: IDS.USER_CHILD3,   wallet_type: 'CONSUMER',             currency: 'USD', balance_cents: 750,     status: 'SUSPENDED', kyc_level: 'MINOR',   label: 'Layla (Age 8)' },
    // Employer & employee wallets
    { id: IDS.WALLET_EMPLOYER, consumer_id: IDS.USER_EMPLOYER, wallet_type: 'PAYROLL_DISBURSEMENT', currency: 'USD', balance_cents: 1500000, status: 'ACTIVE',   kyc_level: 'BUSINESS', label: 'BistroBeast Payroll Fund' },
    { id: IDS.WALLET_EMP1,     consumer_id: IDS.USER_EMP1,     wallet_type: 'CONSUMER',             currency: 'USD', balance_cents: 350000,  status: 'ACTIVE',   kyc_level: 'STANDARD', label: 'Ahmed Hassan' },
    { id: IDS.WALLET_EMP2,     consumer_id: IDS.USER_EMP2,     wallet_type: 'CONSUMER',             currency: 'USD', balance_cents: 288000,  status: 'ACTIVE',   kyc_level: 'STANDARD', label: 'Maria Garcia' },
    { id: IDS.WALLET_EMP3,     consumer_id: IDS.USER_EMP3,     wallet_type: 'CONSUMER',             currency: 'USD', balance_cents: 320000,  status: 'ACTIVE',   kyc_level: 'STANDARD', label: 'James Wilson' },
  ];

  for (const w of wallets) {
    await sql`
      INSERT INTO digital_wallets (id, tenant_id, consumer_id, wallet_type, currency, balance_cents, reserved_cents, status, kyc_level, label, created_at, updated_at)
      VALUES (
        ${w.id}::uuid, ${IDS.TENANT_BISTRO}::uuid, ${w.consumer_id}::uuid,
        ${w.wallet_type}, ${w.currency}, ${w.balance_cents}, 0,
        ${w.status}, ${w.kyc_level}, ${w.label}, NOW(), NOW()
      )
      ON CONFLICT (id) DO NOTHING
    `;
    ok(`Wallet: "${w.label}" → $${(w.balance_cents / 100).toFixed(2)}`);
  }
}

// ── 5. Family Links (wallet_family_links) ─────────────────────────────────────
async function seedFamilyLinks() {
  log('\n👨‍👩‍👧‍👦 [3c] Family Links & Spend Limits...');

  const links = [
    {
      id: IDS.LINK_CHILD1,
      guardian_wallet_id: IDS.WALLET_PARENT, dependent_wallet_id: IDS.WALLET_CHILD1,
      label: 'Zara', status: 'ACTIVE',
      daily_spend_limit_cents:   2000,  // $20/day
      weekly_spend_limit_cents:  10000, // $100/week
      monthly_spend_limit_cents: 30000, // $300/month
    },
    {
      id: IDS.LINK_CHILD2,
      guardian_wallet_id: IDS.WALLET_PARENT, dependent_wallet_id: IDS.WALLET_CHILD2,
      label: 'Omar', status: 'ACTIVE',
      daily_spend_limit_cents:   1000,  // $10/day
      weekly_spend_limit_cents:  5000,  // $50/week
      monthly_spend_limit_cents: 15000, // $150/month
    },
    {
      id: IDS.LINK_CHILD3,
      guardian_wallet_id: IDS.WALLET_PARENT, dependent_wallet_id: IDS.WALLET_CHILD3,
      label: 'Layla', status: 'SUSPENDED',
      daily_spend_limit_cents:   500,   // $5/day
      weekly_spend_limit_cents:  2500,  // $25/week
      monthly_spend_limit_cents: 7500,  // $75/month
    },
  ];

  for (const link of links) {
    await sql`
      INSERT INTO wallet_family_links (
        id, guardian_wallet_id, dependent_wallet_id, label, status,
        daily_spend_limit_cents, weekly_spend_limit_cents, monthly_spend_limit_cents,
        created_at, updated_at
      ) VALUES (
        ${link.id}::uuid, ${link.guardian_wallet_id}::uuid, ${link.dependent_wallet_id}::uuid,
        ${link.label}, ${link.status},
        ${link.daily_spend_limit_cents}, ${link.weekly_spend_limit_cents}, ${link.monthly_spend_limit_cents},
        NOW(), NOW()
      )
      ON CONFLICT (id) DO NOTHING
    `;
    ok(`Family link: Parent → ${link.label} (${link.status}, daily $${(link.daily_spend_limit_cents / 100).toFixed(0)})`);
  }
}

// ── 6. Employer Links (wallet_employer_links) ─────────────────────────────────
async function seedEmployerLinks() {
  log('\n🏢 [3d] Employer Links (Payroll)...');

  const links = [
    { id: IDS.LINK_EMP1, wallet_id: IDS.WALLET_EMP1, name: 'Ahmed Hassan', role: 'Kitchen Manager' },
    { id: IDS.LINK_EMP2, wallet_id: IDS.WALLET_EMP2, name: 'Maria Garcia',  role: 'Server' },
    { id: IDS.LINK_EMP3, wallet_id: IDS.WALLET_EMP3, name: 'James Wilson',  role: 'Line Cook' },
  ];

  for (const link of links) {
    await sql`
      INSERT INTO wallet_employer_links (id, employer_wallet_id, employee_wallet_id, employee_name, employee_role, status, created_at, updated_at)
      VALUES (
        ${link.id}::uuid, ${IDS.WALLET_EMPLOYER}::uuid, ${link.wallet_id}::uuid,
        ${link.name}, ${link.role}, 'ACTIVE', NOW(), NOW()
      )
      ON CONFLICT (id) DO NOTHING
    `;
    ok(`Employer link: ${link.name} (${link.role})`);
  }
}

// ── 7. Wallet Ledger — Opening Balances ───────────────────────────────────────
async function seedLedgerOpeningBalances() {
  log('\n📒 [3e] Wallet Ledger — Opening Balance entries...');

  // Each wallet gets a single "OPENING_BALANCE" credit entry so the ledger is non-empty
  const entries = [
    { wallet_id: IDS.WALLET_PARENT,   amount_cents: 250000,  desc: 'Opening balance — Guardian wallet' },
    { wallet_id: IDS.WALLET_CHILD1,   amount_cents: 4500,    desc: 'Opening allowance — Zara' },
    { wallet_id: IDS.WALLET_CHILD2,   amount_cents: 2000,    desc: 'Opening allowance — Omar' },
    { wallet_id: IDS.WALLET_CHILD3,   amount_cents: 750,     desc: 'Opening allowance — Layla' },
    { wallet_id: IDS.WALLET_EMPLOYER, amount_cents: 1500000, desc: 'Opening balance — Payroll fund' },
    { wallet_id: IDS.WALLET_EMP1,     amount_cents: 350000,  desc: 'Opening balance — Ahmed Hassan' },
    { wallet_id: IDS.WALLET_EMP2,     amount_cents: 288000,  desc: 'Opening balance — Maria Garcia' },
    { wallet_id: IDS.WALLET_EMP3,     amount_cents: 320000,  desc: 'Opening balance — James Wilson' },
  ];

  for (const e of entries) {
    await sql`
      INSERT INTO wallet_ledger (
        id, tenant_id, wallet_id, transaction_type, direction,
        amount_cents, balance_after_cents, description,
        idempotency_key, status, created_at
      )
      VALUES (
        gen_random_uuid(), ${IDS.TENANT_BISTRO}::uuid, ${e.wallet_id}::uuid,
        'OPENING_BALANCE', 'C',
        ${e.amount_cents}, ${e.amount_cents}, ${e.desc},
        ${'OPEN_BAL_' + e.wallet_id}, 'COMPLETED', NOW()
      )
      ON CONFLICT (idempotency_key) DO NOTHING
    `;
    ok(`Ledger entry: "${e.desc}" → $${(e.amount_cents / 100).toFixed(2)}`);
  }
}

// ── 8. ERP — Chart of Accounts ────────────────────────────────────────────────
async function seedErpChartOfAccounts() {
  log('\n📊 [4a] ERP — Chart of Accounts (BistroBeast)...');

  const accounts = [
    { id: IDS.ERP_ACCT_CASH,      code: '1000', name: 'Cash / Bank',            account_type: 'ASSET',     reconcilable: true,  is_active: true },
    { id: IDS.ERP_ACCT_INVENTORY, code: '1200', name: 'Inventory Asset',        account_type: 'ASSET',     reconcilable: false, is_active: true },
    { id: IDS.ERP_ACCT_REVENUE,   code: '4000', name: 'Product Sales Revenue',  account_type: 'INCOME',    reconcilable: false, is_active: true },
    { id: IDS.ERP_ACCT_COGS,      code: '5000', name: 'Cost of Goods Sold',     account_type: 'COGS',      reconcilable: false, is_active: true },
    { id: IDS.ERP_ACCT_AP,        code: '2000', name: 'Accounts Payable',       account_type: 'LIABILITY', reconcilable: true,  is_active: true },
  ];

  for (const acct of accounts) {
    await sql`
      INSERT INTO erp_accounts (id, tenant_id, code, name, account_type, reconcilable, is_active, created_at, updated_at)
      VALUES (
        ${acct.id}::uuid, ${IDS.TENANT_BISTRO}::uuid,
        ${acct.code}, ${acct.name}, ${acct.account_type},
        ${acct.reconcilable}, ${acct.is_active}, NOW(), NOW()
      )
      ON CONFLICT (id) DO NOTHING
    `;
    ok(`Account: ${acct.code} — ${acct.name} (${acct.account_type})`);
  }
}

// ── 9. ERP — Balanced Journal Entry ──────────────────────────────────────────
async function seedErpJournalEntry() {
  log('\n📒 [4b] ERP — Balanced Journal Entry (POS Sale simulation)...');

  // Simulate a $500 dinner service sale with $200 COGS
  // Debits:  Cash $500, COGS $200  = $700
  // Credits: Revenue $500, Inventory $200 = $700  ← BALANCED

  await sql`
    INSERT INTO erp_journal_entries (id, tenant_id, journal_type, ref, date, status, created_at, updated_at)
    VALUES (
      ${IDS.ERP_JOURNAL_ENTRY}::uuid, ${IDS.TENANT_BISTRO}::uuid,
      'SALES', 'DEMO-POS-0001', CURRENT_DATE, 'POSTED', NOW(), NOW()
    )
    ON CONFLICT (id) DO NOTHING
  `;
  ok('Journal entry: DEMO-POS-0001 (POSTED)');

  const items = [
    { account_id: IDS.ERP_ACCT_CASH,      name: 'Cash received from customers', debit_cents: 50000, credit_cents: 0     },
    { account_id: IDS.ERP_ACCT_REVENUE,   name: 'Dinner service revenue',        debit_cents: 0,     credit_cents: 50000 },
    { account_id: IDS.ERP_ACCT_COGS,      name: 'Cost of food served',           debit_cents: 20000, credit_cents: 0     },
    { account_id: IDS.ERP_ACCT_INVENTORY, name: 'Inventory consumed',            debit_cents: 0,     credit_cents: 20000 },
  ];

  for (const item of items) {
    await sql`
      INSERT INTO erp_journal_items (
        id, tenant_id, entry_id, account_id, name, debit_cents, credit_cents, reconciled, created_at
      )
      VALUES (
        gen_random_uuid(), ${IDS.TENANT_BISTRO}::uuid, ${IDS.ERP_JOURNAL_ENTRY}::uuid,
        ${item.account_id}::uuid, ${item.name}, ${item.debit_cents}, ${item.credit_cents},
        FALSE, NOW()
      )
      ON CONFLICT DO NOTHING
    `;
    const side = item.debit_cents > 0 ? `DR $${(item.debit_cents / 100).toFixed(2)}` : `CR $${(item.credit_cents / 100).toFixed(2)}`;
    ok(`  Journal item: "${item.name}" → ${side}`);
  }

  // Verify balance
  const balance = await sql<{ total_debit: number; total_credit: number }[]>`
    SELECT
      COALESCE(SUM(debit_cents), 0)  AS total_debit,
      COALESCE(SUM(credit_cents), 0) AS total_credit
    FROM erp_journal_items
    WHERE entry_id = ${IDS.ERP_JOURNAL_ENTRY}::uuid
  `;
  const { total_debit, total_credit } = balance[0];
  const balanced = total_debit === total_credit;
  log(`\n  ⚖️  Journal balance check: DR $${(total_debit / 100).toFixed(2)} = CR $${(total_credit / 100).toFixed(2)} → ${balanced ? '✅ BALANCED' : '❌ UNBALANCED — CHECK DATA'}`);
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN RUNNER
// ════════════════════════════════════════════════════════════════════════════════
async function seed() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   PaySurity — Phase 1 Demo Data Seeder                    ║');
  console.log(`║   DB: ${DB_URL.replace(/:[^:@]+@/, ':***@').padEnd(52)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝');

  try {
    await seedSuperAdmins();
    await seedTenants();
    await seedUsers();
    await seedWallets();
    await seedFamilyLinks();
    await seedEmployerLinks();
    await seedLedgerOpeningBalances();
    await seedErpChartOfAccounts();
    await seedErpJournalEntry();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   ✅ Phase 1 Demo Seed Complete                           ║');
    console.log('║                                                           ║');
    console.log('║   Tenants:     BistroBeast, RetailPro                    ║');
    console.log('║   Wallets:     8 (parent + 3 children + employer + 3 emp)║');
    console.log('║   ERP Accts:   5 | Journal: 1 balanced entry             ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
  } catch (e: any) {
    err(`Seed failed: ${e.message}`);
    console.error(e);
    throw new Error("System guardrail exit");
  } finally {
    await sql.end();
  }
}

seed();
