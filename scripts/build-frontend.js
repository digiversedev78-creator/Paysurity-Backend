#!/usr/bin/env node
/**
 * scripts/build-frontend.js
 * Builds a frontend app with the real API URL injected.
 * Usage: node scripts/build-frontend.js <app-name>
 */
'use strict';

const { execSync } = require('child_process');
const path = require('path');

const app = process.argv[2];
if (!app) { console.error('Usage: build-frontend.js <app-name>'); process.exit(1); }

const WS = process.env.WORKSPACE || '/workspace';

function run(cmd, cwd = WS) {
  console.log(`> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env } });
}

async function main() {
  console.log(`\n=== Building Frontend: ${app} ===`);

  // Get the deployed Cloud Run API URL
  let apiUrl = 'http://localhost:4000';
  try {
    const url = execSync(
      'gcloud run services describe paysurity-api ' +
      '--region=us-central1 --project=paysurity-platform-2026 ' +
      '--format="value(status.url)"',
      { encoding: 'utf8' }
    ).trim();
    if (url) apiUrl = url;
    console.log(`API URL: ${apiUrl}`);
  } catch (e) {
    console.warn('Could not get API URL, using localhost fallback');
  }

  process.env.NEXT_PUBLIC_API_URL = apiUrl;

  // Map package filter names
  const filterMap = {
    'merchant-dashboard': '@paysurity/merchant-dashboard',
    'admin-portal': '@paysurity/admin-portal',
    'consumer-storefront': 'consumer-storefront',
    'public-website': '@paysurity/web',
  };

  const filter = filterMap[app] || app;

  run('corepack enable && corepack prepare pnpm@9.15.4 --activate');
  run(`pnpm --filter ${filter} build`);

  console.log(`\n${app} build complete.`);
}

main().catch(e => { console.error(e); process.exit(1); });
