#!/usr/bin/env node
/**
 * scripts/staging-migrate-seed.js
 * Runs DB migrations + seed via Cloud SQL Proxy inside Cloud Build.
 * Called with: node scripts/staging-migrate-seed.js [migrate|seed]
 * Env: DATABASE_URL (injected via secretEnv → process.env)
 */
'use strict';

const { execSync } = require('child_process');
const path = require('path');

const action = process.argv[2] || 'migrate';
const WS = process.env.WORKSPACE || '/workspace';

function run(cmd, cwd = WS) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env } });
}

async function main() {
  console.log(`\n=== Staging ${action.toUpperCase()} via Cloud SQL Proxy ===`);

  const DB_PASS = process.env.DB_PASSWORD;
  if (!DB_PASS) { console.error('DB_PASSWORD not set'); process.exit(1); }

  const DB_URL = `postgresql://paysurity:${DB_PASS}@127.0.0.1:5432/paysurity_dev`;
  process.env.DATABASE_URL = DB_URL;

  // Start Cloud SQL proxy
  run(
    'curl -fsSL -o /usr/local/bin/cloud-sql-proxy ' +
    'https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.4/cloud-sql-proxy.linux.amd64 && ' +
    'chmod +x /usr/local/bin/cloud-sql-proxy',
    '/tmp'
  );

  // Start proxy as background process via a wrapper script
  require('fs').writeFileSync('/tmp/start-proxy.sh',
    '#!/bin/bash\ncloud-sql-proxy paysurity-platform-2026:us-central1:paysurity-dev --port=5432 &\necho $! > /tmp/proxy.pid\nsleep 6\n'
  );
  run('chmod +x /tmp/start-proxy.sh && /tmp/start-proxy.sh', '/tmp');
  console.log('Cloud SQL Proxy started');

  // Run action
  const dbDir = path.join(WS, 'packages', 'database');
  if (action === 'migrate') {
    run('npx tsx src/migrate.ts', dbDir);
    console.log('Migrations complete');
  } else if (action === 'seed') {
    process.env.NODE_ENV = 'staging';
    run('npx tsx src/seed.ts', dbDir);
    console.log('Seed complete');
  }

  // Stop proxy
  try {
    const pid = require('fs').readFileSync('/tmp/proxy.pid', 'utf8').trim();
    process.kill(parseInt(pid), 'SIGTERM');
    console.log(`Proxy stopped (pid ${pid})`);
  } catch (_) {}
}

main().catch(e => { console.error(e); process.exit(1); });
