/**
 * PaySurity Cloud SQL Seed Runner
 * Generates real bcrypt hashes and seeds the database with
 * tenants, merchants, users, menu items, and inventory.
 *
 * Usage: DATABASE_URL=postgres://... node run-seed.js
 */
const bcrypt = require('bcrypt');
const { Client } = require('pg');

const SALT_ROUNDS = 10;

// ► Real dev password for ALL seed users — change before prod
const DEV_PASSWORD = 'PaySurity2026!';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL env var is required');
    process.exit(1);
  }

  console.log('Generating bcrypt hash for dev password...');
  const PW = await bcrypt.hash(DEV_PASSWORD, SALT_ROUNDS);
  console.log(`Hash: ${PW.substring(0, 30)}...`);

  // Strip trailing whitespace/carriage returns that may come from Secret Manager
  const rawUrl = (process.env.DATABASE_URL || '').trim();
  console.log(`Connecting to DB (socket path mode: ${rawUrl.includes('/cloudsql/') ? 'yes' : 'no'})...`);

  // Parse the Unix socket URL for pg client
  // Format: postgresql://user:pass@/dbname?host=/cloudsql/project:region:instance
  let clientConfig;
  const socketMatch = rawUrl.match(/postgresql:\/\/([^:]+):([^@]+)@\/([^?]+)\?host=(.+)/);
  if (socketMatch) {
    clientConfig = {
      user: socketMatch[1],
      password: socketMatch[2],
      database: socketMatch[3],
      host: socketMatch[4].trim(),
      ssl: false
    };
  } else {
    clientConfig = { connectionString: rawUrl, ssl: { rejectUnauthorized: false } };
  }

  const client = new Client(clientConfig);
  await client.connect();
  console.log('✅ Connected to database');

  // Helper to run parameterized queries
  const sql = {
    unsafe: async (query, params) => client.query(query, params),
    end: async () => client.end(),
    query: async (strings, ...values) => {
      const query = strings.raw ? strings.raw.join('$' + values.map((_, i) => i + 1).join(',$')) : String(strings);
      return (await client.query(strings.join(''), values)).rows;
    }
  };

  // Tagged template literal support
  const sqlTag = async (strings, ...values) => {
    let text = strings[0];
    values.forEach((val, i) => { text += `$${i + 1}` + strings[i + 1]; });
    return (await client.query(text, values)).rows;
  };

  try {
    // ═══ TENANTS ═══════════════════════════════════════════════════════
    const tenants = [
      ['ffffffff-ffff-4fff-8fff-ffffffffffff', 'PaySurity HQ',       'paysurity-hq',       'platform',   'enterprise', 'active'],
      ['a1000000-0000-4000-8000-000000000001', 'Tawakkul Restaurant', 'tawakkul-restaurant', 'restaurant', 'professional', 'active'],
      ['a1000000-0000-4000-8000-000000000002', 'House of Biryani',    'house-of-biryani',    'restaurant', 'professional', 'active'],
      ['a1000000-0000-4000-8000-000000000003', 'Grand Tobacco Hub',   'grand-tobacco-hub',   'retail',     'professional', 'active'],
      ['a1000000-0000-4000-8000-000000000004', 'Ashiana Collection',  'ashiana-collection',  'retail',     'professional', 'active'],
    ];

    for (const t of tenants) {
      await sql.unsafe(
        `INSERT INTO tenants (id, name, slug, vertical, plan, status)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (slug) DO UPDATE SET status=$6`,
        t
      );
    }
    console.log(`✅ ${tenants.length} tenants upserted`);

    // ═══ MERCHANTS ══════════════════════════════════════════════════════
    const merchants = [
      ['b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'Tawakkul Restaurant LLC', 'BB-TWK-001', '5812', 'active'],
      ['b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000002', 'House of Biryani LLC',    'BB-HOB-001', '5812', 'active'],
      ['b1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000003', 'Grand Tobacco Hub Inc',   'PR-GTH-001', '5993', 'active'],
      ['b1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000003', 'Grand Tobacco Hub Inc',   'PE-GTH-001', '5993', 'active'],
      ['b1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000004', 'Ashiana Collection LLC',  'PR-ASH-001', '5699', 'active'],
      ['b1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000004', 'Ashiana Collection LLC',  'PE-ASH-001', '5699', 'active'],
    ];

    for (const m of merchants) {
      await sql.unsafe(
        `INSERT INTO merchants (id, tenant_id, legal_name, dba_name, mcc, status)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
        m
      );
    }
    console.log(`✅ ${merchants.length} merchants upserted`);

    // ═══ USERS (with REAL bcrypt hash) ══════════════════════════════════
    const hq = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
    const tw = 'a1000000-0000-4000-8000-000000000001'; // Tawakkul
    const hb = 'a1000000-0000-4000-8000-000000000002'; // House of Biryani
    const gt = 'a1000000-0000-4000-8000-000000000003'; // Grand Tobacco Hub
    const ac = 'a1000000-0000-4000-8000-000000000004'; // Ashiana Collection

    const users = [
      // PaySurity HQ super admin
      ['a0000000-0000-4000-8000-000000000000', hq, 'admin@paysurity.com',          PW, 'super_admin',  'PaySurity', 'Admin'],
      // Tawakkul Restaurant
      ['a0100000-0001-4000-8000-000000000001', tw, 'owner@tawakkul.com',            PW, 'tenant_admin', 'Ahmed',    'Hassan'],
      ['a0100000-0001-4000-8000-000000000002', tw, 'manager@tawakkul.com',          PW, 'manager',      'Fatima',   'Ali'],
      ['a0100000-0001-4000-8000-000000000003', tw, 'cashier@tawakkul.com',          PW, 'cashier',      'Omar',     'Khalid'],
      ['a0100000-0001-4000-8000-000000000004', tw, 'waiter1@tawakkul.com',          PW, 'staff',        'Yusuf',    'Malik'],
      ['a0100000-0001-4000-8000-000000000005', tw, 'waiter2@tawakkul.com',          PW, 'staff',        'Aisha',    'Rahman'],
      // House of Biryani
      ['a0200000-0002-4000-8000-000000000001', hb, 'owner@houseofbiryani.com',      PW, 'tenant_admin', 'Rashid',   'Khan'],
      ['a0200000-0002-4000-8000-000000000002', hb, 'manager@houseofbiryani.com',    PW, 'manager',      'Nadia',    'Begum'],
      ['a0200000-0002-4000-8000-000000000003', hb, 'cashier@houseofbiryani.com',    PW, 'cashier',      'Tariq',    'Rahim'],
      // Grand Tobacco Hub
      ['a0300000-0003-4000-8000-000000000001', gt, 'owner@grandtobaccohub.com',     PW, 'tenant_admin', 'James',    'Mitchell'],
      ['a0300000-0003-4000-8000-000000000002', gt, 'manager@grandtobaccohub.com',   PW, 'manager',      'Sarah',    'Johnson'],
      ['a0300000-0003-4000-8000-000000000003', gt, 'cashier1@grandtobaccohub.com',  PW, 'cashier',      'Marcus',   'Williams'],
      // Ashiana Collection
      ['a0400000-0004-4000-8000-000000000001', ac, 'owner@ashianacollection.com',   PW, 'tenant_admin', 'Priya',    'Patel'],
      ['a0400000-0004-4000-8000-000000000002', ac, 'manager@ashianacollection.com', PW, 'manager',      'Ravi',     'Sharma'],
      ['a0400000-0004-4000-8000-000000000003', ac, 'cashier@ashianacollection.com', PW, 'cashier',      'Deepak',   'Verma'],
    ];

    let usersCreated = 0;
    for (const u of users) {
      const result = await sql.unsafe(
        `INSERT INTO users (id, tenant_id, email, password_hash, role, first_name, last_name)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (email) DO UPDATE SET password_hash=$4, role=$5`,
        u
      );
      usersCreated++;
    }
    console.log(`✅ ${usersCreated} users upserted (password: ${DEV_PASSWORD})`);

    // ═══ MENU ITEMS ═════════════════════════════════════════════════════
    const twMerch = 'b1000000-0000-4000-8000-000000000001';
    const hbMerch = 'b1000000-0000-4000-8000-000000000002';

    const menuItems = [
      // Tawakkul
      ['b0100001-0000-4000-8000-000000000001', tw, twMerch, 'Chicken Shawarma Plate', 1499, 'mains',      'Marinated chicken with rice, salad, and garlic sauce'],
      ['b0100001-0000-4000-8000-000000000002', tw, twMerch, 'Lamb Kofta',             1699, 'mains',      'Grilled lamb kofta skewers with hummus and pita'],
      ['b0100001-0000-4000-8000-000000000003', tw, twMerch, 'Falafel Wrap',             899, 'wraps',     'Crispy falafel with tahini and pickled turnip'],
      ['b0100001-0000-4000-8000-000000000004', tw, twMerch, 'Hummus & Pita',            699, 'appetizers','Classic hummus with warm pita'],
      ['b0100001-0000-4000-8000-000000000005', tw, twMerch, 'Turkish Tea',              299, 'beverages', 'Traditional Turkish black tea'],
      ['b0100001-0000-4000-8000-000000000006', tw, twMerch, 'Baklava',                  599, 'desserts',  'Phyllo pastry with honey and pistachios'],
      // House of Biryani
      ['b0200001-0000-4000-8000-000000000001', hb, hbMerch, 'Hyderabadi Chicken Biryani', 1599, 'biryani',    'Fragrant basmati rice with tender chicken'],
      ['b0200001-0000-4000-8000-000000000002', hb, hbMerch, 'Goat Biryani',               1899, 'biryani',    'Slow-cooked goat with aromatic long-grain rice'],
      ['b0200001-0000-4000-8000-000000000003', hb, hbMerch, 'Vegetable Biryani',          1299, 'biryani',    'Mixed vegetables with saffron rice'],
      ['b0200001-0000-4000-8000-000000000004', hb, hbMerch, 'Chicken Tikka',              1199, 'appetizers', 'Charcoal-grilled marinated chicken'],
      ['b0200001-0000-4000-8000-000000000005', hb, hbMerch, 'Mango Lassi',                 499, 'beverages',  'Creamy mango yogurt drink'],
      ['b0200001-0000-4000-8000-000000000006', hb, hbMerch, 'Gulab Jamun',                 499, 'desserts',   'Warm milk dumplings in rose-cardamom syrup'],
    ];

    for (const m of menuItems) {
      await sql.unsafe(
        `INSERT INTO menu_items (id, tenant_id, merchant_id, name, price_cents, category, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
        m
      );
    }
    console.log(`✅ ${menuItems.length} menu items upserted`);

    // ═══ INVENTORY ITEMS ════════════════════════════════════════════════
    const invItems = [
      ['c0300001-0000-4000-8000-000000000001', gt, 'Marlboro Red King Size', 'cigarettes',        'pack', 240, 1099],
      ['c0300001-0000-4000-8000-000000000002', gt, 'Camel Blue 100s',        'cigarettes',        'pack', 180, 999],
      ['c0300001-0000-4000-8000-000000000003', gt, 'JUUL Starter Kit',       'vape',              'unit', 45, 3499],
      ['c0300001-0000-4000-8000-000000000004', gt, 'Zippo Classic Chrome',   'accessories',       'unit', 60, 2999],
      ['c0300001-0000-4000-8000-000000000005', gt, 'RAW Rolling Papers',     'accessories',       'pack', 500, 299],
      ['c0400001-0000-4000-8000-000000000001', ac, 'Silk Kurta - Men',       'mens-clothing',     'unit', 35, 4999],
      ['c0400001-0000-4000-8000-000000000002', ac, 'Embroidered Dupatta',    'womens-accessories','unit', 50, 2499],
      ['c0400001-0000-4000-8000-000000000003', ac, 'Pashmina Shawl',         'womens-accessories','unit', 20, 7999],
      ['c0400001-0000-4000-8000-000000000004', ac, 'Cotton Shalwar Kameez',  'womens-clothing',   'unit', 40, 3499],
      ['c0400001-0000-4000-8000-000000000005', ac, 'Leather Khussa Shoes',   'footwear',          'pair', 25, 2999],
    ];

    for (const i of invItems) {
      await sql.unsafe(
        `INSERT INTO inventory_items (id, tenant_id, name, category, unit, on_hand, cost_cents)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
        i
      );
    }
    console.log(`✅ ${invItems.length} inventory items upserted`);

    // ═══ VERIFY ══════════════════════════════════════════════════════════
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  SEED VERIFICATION');
    console.log('═══════════════════════════════════════════════════');

    const tRows = await sqlTag`SELECT name, slug, vertical FROM tenants ORDER BY name`;
    console.log(`\nTenants (${tRows.length}):`);
    tRows.forEach(r => console.log(`  [${r.vertical}] ${r.name}`));

    const mRows = await sqlTag`SELECT m.legal_name, m.dba_name, t.name as tenant FROM merchants m JOIN tenants t ON m.tenant_id = t.id ORDER BY m.dba_name`;
    console.log(`\nMerchants (${mRows.length}):`);
    mRows.forEach(r => console.log(`  [${r.dba_name}] ${r.legal_name} -> ${r.tenant}`));

    const uRows = await sqlTag`SELECT u.first_name, u.last_name, u.role, u.email FROM users u ORDER BY u.role`;
    console.log(`\nUsers (${uRows.length}):`);
    uRows.forEach(r => console.log(`  [${r.role}] ${r.first_name} ${r.last_name} <${r.email}>`));

    const miResult = await client.query('SELECT COUNT(*) as c FROM menu_items');
    const iiResult = await client.query('SELECT COUNT(*) as c FROM inventory_items');
    console.log(`\nMenu items: ${miResult.rows[0].c} | Inventory items: ${iiResult.rows[0].c}`);
    console.log('\nSeed complete! Login with any user above using password: ' + DEV_PASSWORD);

  } catch (e) {
    console.error('SEED ERROR:', e.message);
    console.error(e.stack);
  } finally {
    await client.end();
  }
}

main();
