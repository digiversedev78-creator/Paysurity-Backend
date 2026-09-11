#!/usr/bin/env node
/**
 * Apply ALL migrations to Cloud SQL (ordered)
 * Skips migrations that produce errors (already applied)
 */
'use strict';

const path = require('path');
const fs   = require('fs');
const { Client } = require(path.join(__dirname, '../apps/api/node_modules/pg'));

const DB_URL = process.argv[2] || process.env.DATABASE_URL;
if (!DB_URL) {
  console.error('Usage: node scripts/apply-all-migrations.js <DATABASE_URL>');
  process.exit(1);
}

const MIGRATIONS_DIR = path.join(__dirname, '../packages/database/migrations');

async function main() {
  console.log('\n🔷 PaySurity — Full Migration Runner');
  console.log(`🗄️  DB: ${DB_URL.replace(/:[^:@]+@/, ':***@')}\n`);

  const client = new Client({
    connectionString: DB_URL,
    ssl: (DB_URL.includes('35.232') || !DB_URL.includes('localhost')) ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 20000,
  });
  await client.connect();
  console.log('✅ Connected to database\n');

  // Get all migration files sorted
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && !f.includes('meta') && !fs.statSync(path.join(MIGRATIONS_DIR, f)).isDirectory())
    .sort();

  console.log(`Found ${files.length} migration files:\n`);
  
  let applied = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    
    // Fresh connection per file to avoid transaction abort cascade
    const c = new Client({
      connectionString: DB_URL,
      ssl: (DB_URL.includes('35.232') || !DB_URL.includes('localhost')) ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 20000,
    });
    await c.connect();
    
    try {
      await c.query(sql);
      console.log(`  ✅ ${file}`);
      applied++;
    } catch (e) {
      // Try to rollback any open transaction
      try { await c.query('ROLLBACK'); } catch {}
      
      if (e.message.includes('already exists') || 
          e.message.includes('duplicate') ||
          e.message.includes('multiple primary keys') ||
          e.code === '42P07' || // relation already exists
          e.code === '42710') { // duplicate object
        console.log(`  ℹ️  ${file} — already applied`);
        skipped++;
      } else {
        console.log(`  ⚠️  ${file} — ${e.message.slice(0, 100)}`);
        failed++;
      }
    } finally {
      try { await c.end(); } catch {}
    }
  }

  await client.end();
  
  console.log(`\n📊 Summary:`);
  console.log(`   Applied:  ${applied}`);
  console.log(`   Skipped:  ${skipped} (already applied)`);
  console.log(`   Warnings: ${failed}`);
  console.log('\n✅ Migration run complete.\n');
}

main().catch(e => { console.error('❌ Fatal:', e.message); process.exit(1); });
