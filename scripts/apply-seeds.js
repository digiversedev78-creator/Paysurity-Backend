#!/usr/bin/env node
/**
 * Apply seed data files to Cloud SQL
 * Applies: HOB + Tawakkul + all supporting seed tables
 */
'use strict';

const path = require('path');
const fs   = require('fs');
const { Client } = require(path.join(__dirname, '../apps/api/node_modules/pg'));

const DB_URL = process.argv[2] || process.env.DATABASE_URL;
if (!DB_URL) {
  console.error('Usage: node scripts/apply-seeds.js <DATABASE_URL>');
  process.exit(1);
}

const SEEDS_DIR = path.join(__dirname, '../packages/database/seeds');

// Seeds to apply in order (skip ones that will conflict)
const SEEDS = [
  '040_loyalty_config_schema.sql',
  '041_create_microsite_settings.sql',
  '042_create_catering_orders.sql',
  '043_create_price_engine_config.sql',
  '044_create_paan_orders.sql',
  '045_create_microsite_page_visits.sql',
  '046_create_menu_item_images.sql',
  '060_aels-tenant-seed.sql',
  '030_house-of-biryani_seed.sql',
  '030_tawakkul-restaurant_seed.sql',
  '031_tawakkul-restaurant-menu.sql',
];

async function applyFile(url, file) {
  const filePath = path.join(SEEDS_DIR, file);
  if (!fs.existsSync(filePath)) {
    return '❌ Not found';
  }
  const sql = fs.readFileSync(filePath, 'utf8');
  const c = new Client({
    connectionString: url,
    ssl: (url.includes('35.232') || !url.includes('localhost')) ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 20000,
  });
  await c.connect();
  try {
    await c.query(sql);
    return `✅ Applied (${Math.round(sql.length / 1024)}KB)`;
  } catch (e) {
    if (e.message.includes('already exists') || e.code === '42P07' || e.code === '23505') {
      return `ℹ️  Already applied`;
    }
    return `⚠️  ${e.message.slice(0, 80)}`;
  } finally {
    try { await c.query('ROLLBACK'); } catch {}
    await c.end();
  }
}

async function main() {
  console.log('\n🔷 PaySurity — Seed Data Runner');
  console.log(`🗄️  DB: ${DB_URL.replace(/:[^:@]+@/, ':***@')}\n`);

  let applied = 0, skipped = 0, failed = 0;
  
  for (const file of SEEDS) {
    process.stdout.write(`  ${file.padEnd(50)}`);
    const result = await applyFile(DB_URL, file);
    console.log(result);
    if (result.startsWith('✅')) applied++;
    else if (result.startsWith('ℹ️')) skipped++;
    else failed++;
  }

  console.log(`\n📊 Summary: ${applied} applied | ${skipped} skipped | ${failed} warnings\n`);
}

main().catch(e => { console.error('❌ Fatal:', e.message); process.exit(1); });
