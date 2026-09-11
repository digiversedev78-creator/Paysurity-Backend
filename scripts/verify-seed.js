#!/usr/bin/env node
'use strict';
const path = require('path');
const { Client } = require(path.join(__dirname, '../apps/api/node_modules/pg'));
const DB_URL = process.argv[2];
async function run() {
  const c = new Client({ connectionString: DB_URL, ssl: (!DB_URL.includes('localhost')) ? { rejectUnauthorized: false } : false });
  await c.connect();
  
  // Menu categories
  const { rows: cats } = await c.query(`SELECT tenant_id, COUNT(*) FROM menu_categories GROUP BY tenant_id ORDER BY tenant_id`);
  const { rows: items } = await c.query(`SELECT tenant_id, COUNT(*), COUNT(*) FILTER (WHERE is_signature) AS signature FROM menu_items GROUP BY tenant_id ORDER BY tenant_id`);
  const { rows: ms } = await c.query(`SELECT tenant_id, domain, hero_color FROM microsite_settings ORDER BY tenant_id`);
  
  console.log('\n📊 Menu Data in Cloud SQL:\n');
  console.log('Categories per tenant:');
  cats.forEach(r => console.log(`  ${r.tenant_id}: ${r.count} categories`));
  console.log('\nMenu items per tenant:');
  items.forEach(r => console.log(`  ${r.tenant_id}: ${r.count} items (${r.signature} signature)`));
  console.log('\nMicrosite settings:');
  ms.forEach(m => console.log(`  ${m.tenant_id}: ${m.domain} | ${m.hero_color}`));
  console.log();
  
  await c.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
