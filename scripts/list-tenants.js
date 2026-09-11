#!/usr/bin/env node
'use strict';
const path = require('path');
const { Client } = require(path.join(__dirname, '../apps/api/node_modules/pg'));
const DB_URL = process.argv[2];
async function run() {
  const c = new Client({ connectionString: DB_URL, ssl: (!DB_URL.includes('localhost')) ? { rejectUnauthorized: false } : false });
  await c.connect();
  const { rows: tenants } = await c.query(`SELECT id, name, slug, plan, status FROM tenants ORDER BY created_at`);
  console.log('\n📊 Tenants in Cloud SQL:\n');
  tenants.forEach(t => console.log(`  ${t.id} | ${t.slug.padEnd(30)} | ${t.plan} | ${t.status}`));
  console.log(`\n  Total: ${tenants.length}\n`);
  const { rows: merchants } = await c.query(`SELECT id, tenant_id, legal_name, dba_name, status FROM merchants ORDER BY created_at`);
  console.log(`📊 Merchants (${merchants.length}):\n`);
  merchants.forEach(m => console.log(`  ${m.id} | ${(m.dba_name || m.legal_name).padEnd(30)} | ${m.status}`));
  console.log();
  await c.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
