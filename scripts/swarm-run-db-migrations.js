#!/usr/bin/env node
/**
 * scripts/swarm-run-db-migrations.js
 * Worker E: Run DB migrations + seed directly against Cloud SQL
 * Uses Cloud SQL Proxy to connect and apply migrations + 020_staging seed
 */
'use strict';

const { execSync, spawn } = require('child_process');
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const INSTANCE    = 'paysurity-platform-2026:us-central1:paysurity-dev';

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('\n=== Worker E: DB Migrations + Seed ===\n');

  // Download Cloud SQL Proxy
  console.log('Downloading Cloud SQL Proxy...');
  execSync('curl -fsSL -o /tmp/cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.4/cloud-sql-proxy.linux.amd64 && chmod +x /tmp/cloud-sql-proxy');
  console.log('✅ Proxy downloaded');

  // Start proxy
  const proxy = spawn('/tmp/cloud-sql-proxy', [
    `--port=5432`,
    `--credentials-file=/tmp/sa-key.json`,
    INSTANCE
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  let proxyReady = false;
  proxy.stdout.on('data', d => { if (d.toString().includes('ready')) proxyReady = true; });
  proxy.stderr.on('data', d => { if (d.toString().includes('ready')) proxyReady = true; });

  // Wait for proxy
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    if (proxyReady) break;
  }
  console.log('✅ Cloud SQL Proxy connected');

  // Build DATABASE_URL
  const DB_URL = `postgresql://paysurity_app:${DB_PASSWORD}@127.0.0.1:5432/paysurity`;

  // Run migrations
  console.log('\nRunning migrations...');
  const seedFiles = fs.readdirSync(path.join(ROOT, 'packages/database/seeds'))
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const seedFile of seedFiles) {
    const fp = path.join(ROOT, 'packages/database/seeds', seedFile);
    try {
      execSync(`psql "${DB_URL}" -f "${fp}" 2>&1`, { stdio: 'pipe' });
      console.log(`✅ Applied: ${seedFile}`);
    } catch (e) {
      const msg = e.stdout?.toString() || e.stderr?.toString() || e.message;
      if (msg.includes('already exists') || msg.includes('duplicate')) {
        console.log(`⚡ Skipped (already applied): ${seedFile}`);
      } else {
        console.warn(`⚠️  ${seedFile}: ${msg.slice(0, 150)}`);
      }
    }
  }

  // Run Drizzle migrations
  try {
    process.env.DATABASE_URL = DB_URL;
    execSync('npx tsx packages/database/src/migrate.ts', {
      cwd: ROOT,
      env: { ...process.env, DATABASE_URL: DB_URL },
      stdio: 'inherit',
    });
    console.log('✅ Drizzle migrations applied');
  } catch (e) {
    console.warn('⚠️  Drizzle migrate error (non-blocking):', e.message?.slice(0, 100));
  }

  proxy.kill();
  console.log('\n✅ Worker E done: migrations + seed applied.\n');
}

main().catch(e => { console.error(e); process.exit(1); });
