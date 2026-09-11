#!/usr/bin/env node
'use strict';

const path = require('path');
const { Client } = require(path.join(__dirname, '../apps/api/node_modules/pg'));

const DB_URL = process.argv[2] || process.env.DATABASE_URL;
if (!DB_URL) { console.error('Usage: node scripts/list-tables.js <DB_URL>'); process.exit(1); }

async function run() {
  const client = new Client({
    connectionString: DB_URL,
    ssl: (!DB_URL.includes('localhost') && !DB_URL.includes('127.0.0.1')) ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
  });
  await client.connect();
  
  const { rows } = await client.query(`
    SELECT table_name, pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  
  console.log(`\n📊 Tables in Cloud SQL paysurity_dev (${rows.length} total):\n`);
  rows.forEach(r => console.log(`  ${r.table_name.padEnd(45)} ${r.size}`));
  console.log();
  
  await client.end();
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
