#!/usr/bin/env node
'use strict';
const path = require('path');
const { Client } = require(path.join(__dirname, '../apps/api/node_modules/pg'));
const DB_URL = process.argv[2];
async function run() {
  const c = new Client({ connectionString: DB_URL, ssl: (!DB_URL.includes('localhost')) ? { rejectUnauthorized: false } : false });
  await c.connect();
  const { rows } = await c.query(`SELECT enumtypid::regtype AS type, enumlabel AS value FROM pg_enum ORDER BY type, enumsortorder`);
  const grouped = {};
  rows.forEach(r => { if (!grouped[r.type]) grouped[r.type] = []; grouped[r.type].push(r.value); });
  console.log('\n📊 Enum Types in Cloud SQL:\n');
  Object.entries(grouped).forEach(([type, vals]) => console.log(`  ${type}: ${vals.join(', ')}`));
  console.log();
  await c.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
