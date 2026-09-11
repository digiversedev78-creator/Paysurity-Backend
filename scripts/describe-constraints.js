#!/usr/bin/env node
'use strict';
const path = require('path');
const { Client } = require(path.join(__dirname, '../apps/api/node_modules/pg'));
const DB_URL = process.argv[2];
const TABLE  = process.argv[3];
async function run() {
  const c = new Client({ connectionString: DB_URL, ssl: (!DB_URL.includes('localhost')) ? { rejectUnauthorized: false } : false });
  await c.connect();
  const { rows } = await c.query(`
    SELECT conname AS constraint_name, contype AS type,
           pg_get_constraintdef(oid) AS definition
    FROM pg_constraint
    WHERE conrelid = $1::regclass
    ORDER BY contype, conname
  `, [TABLE]);
  console.log(`\n${TABLE} constraints:\n`);
  rows.forEach(r => console.log(`  [${r.type}] ${r.constraint_name}: ${r.definition}`));
  console.log();
  await c.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
