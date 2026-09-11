#!/usr/bin/env node
'use strict';
const path = require('path');
const { Client } = require(path.join(__dirname, '../apps/api/node_modules/pg'));
const DB_URL = process.argv[2];
const TABLE = process.argv[3];
if (!DB_URL || !TABLE) { console.error('Usage: node scripts/describe-table.js <DB_URL> <table>'); process.exit(1); }
async function run() {
  const c = new Client({ connectionString: DB_URL, ssl: (!DB_URL.includes('localhost')) ? { rejectUnauthorized: false } : false });
  await c.connect();
  const { rows } = await c.query(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`, [TABLE]);
  console.log(`\n${TABLE} columns (${rows.length}):\n`);
  rows.forEach(r => console.log(`  ${r.column_name.padEnd(30)} ${r.data_type.padEnd(20)} ${r.is_nullable === 'YES' ? 'nullable' : 'required'}`));
  console.log();
  await c.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
