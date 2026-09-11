#!/usr/bin/env node
'use strict';

const path = require('path');
const fs   = require('fs');
const { Client } = require(path.join(__dirname, '../apps/api/node_modules/pg'));

const DB_URL = process.argv[2] || process.env.DATABASE_URL;
const MIGRATION_FILE = process.argv[3] || path.join(__dirname, '../packages/database/migrations/022_schema_patch_microsite_tenants.sql');

if (!DB_URL) {
  console.error('Usage: node scripts/apply-specific-migration.js <DATABASE_URL> [migration_file]');
  process.exit(1);
}

async function run() {
  const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
  console.log(`\n🔷 Applying: ${path.basename(MIGRATION_FILE)}`);
  console.log(`🗄️  DB: ${DB_URL.replace(/:[^:@]+@/, ':***@')}\n`);
  
  const client = new Client({
    connectionString: DB_URL,
    ssl: (!DB_URL.includes('localhost') && !DB_URL.includes('127.0.0.1')) ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 20000,
  });
  await client.connect();
  
  try {
    await client.query(sql);
    console.log('✅ Migration applied successfully!\n');
  } catch (e) {
    if (e.message.includes('already exists') || e.code === '42P07') {
      console.log('ℹ️  Already applied (idempotent).\n');
    } else {
      console.error('❌', e.message);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
