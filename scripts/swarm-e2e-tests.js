#!/usr/bin/env node
/**
 * scripts/swarm-e2e-tests.js
 * Worker Pool 4: E2E Test Suite Generator
 * Generates Playwright tests for all critical user journeys
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT    = path.resolve(__dirname, '..');
const E2E_DIR = path.join(ROOT, 'e2e');
const KEY     = process.env.GEMINI_API_KEY;
const MODEL   = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paysurity-api-111328865246.us-central1.run.app';
const DASH_URL = process.env.DASHBOARD_URL || 'https://merchant-dashboard.paysurity.com';

if (!KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }
const genAI = new GoogleGenerativeAI(KEY);
const g     = genAI.getGenerativeModel({ model: MODEL });

const TEST_SUITES = [
  {
    file: 'auth.spec.ts',
    desc: `Authentication E2E tests:
    - test('merchant can login with valid credentials'): POST /api/auth/login, check JWT in response
    - test('login fails with wrong password')
    - test('merchant dashboard loads after login'): navigate to /dashboard, verify widgets visible
    - test('logout clears session')
    Seed user: owner@house-of-biryani.food / TestPassword123!
    API_BASE: ${API_URL}`,
  },
  {
    file: 'pos-order.spec.ts',
    desc: `POS order flow E2E:
    - test('load POS page and see menu items from API')
    - test('add item to cart, verify total')
    - test('complete order - submit to /api/orders')
    - test('order appears in orders list')
    - test('inventory decrements after order')
    Use page object model. DASHBOARD_URL: ${DASH_URL}`,
  },
  {
    file: 'microsite-order.spec.ts',
    desc: `Consumer microsite order flow:
    - test('House of Biryani microsite loads at domain')
    - test('browse menu, categories toggle correctly')
    - test('add Hyderabadi Goat Dum Biryani to cart')
    - test('proceed to checkout, fill customer details')
    - test('order submission succeeds, shows confirmation')
    - test('paan category shows cultural description')
    BASE_URL: https://houseofbiryanirestaurant.food`,
  },
  {
    file: 'catering-order.spec.ts',
    desc: `Catering order E2E:
    - test('catering form requires 48h advance notice: reject same-day order')
    - test('catering form accepts order with 72h notice')
    - test('deposit calculation: 25% of total shown')
    - test('paan bulk order (50+) shows advance notice warning')
    - test('confirmed catering order appears in merchant dashboard')`,
  },
  {
    file: 'admin-portal.spec.ts',
    desc: `Admin portal E2E:
    - test('super admin can login')
    - test('merchant list loads all tenants')
    - test('can update House of Biryani margin from 20% to 25%')
    - test('price recalculates after margin change')
    - test('compliance page shows PCI DSS status')`,
  },
  {
    file: 'price-engine.spec.ts',
    desc: `Price engine E2E:
    - test('GET /api/price-engine/preview?basePrice=18 returns correct displayPrice')
      Expected: 18 * 1.05 * 1.20 = 22.68
    - test('admin can change margin for tenant via PUT /api/admin/tenant-pricing/:id')
    - test('new margin reflected in menu display prices')
    - test('processing fee cannot be changed by tenant (read-only 5%)')`,
  },
  {
    file: 'api-smoke.spec.ts',
    desc: `API smoke tests (all critical endpoints respond):
    - GET /health → 200
    - GET /api/menu-items → 200 with array
    - GET /api/orders → 200
    - GET /api/customers → 200
    - GET /api/employees → 200
    - GET /api/settlement-batches → 200
    - GET /api/analytics/revenue → 200
    - GET /api/microsite/settings → 200
    - POST /api/auth/login → 200 with token
    All with auth header from test user login.`,
  },
];

async function generateTest(suite) {
  const prompt = `Generate a complete Playwright TypeScript E2E test file.

File: ${suite.file}
Test scenarios:
${suite.desc}

Requirements:
- Use @playwright/test: import { test, expect, Page } from '@playwright/test'
- Use test.beforeAll for auth setup if needed
- Page Object Model where appropriate
- Test data: tenantId='house-of-biryani-chicago-2026', email='owner@houseofbiryanirestaurant.food', password='TestPass123!'
- Include test.describe() groups
- Each test independent (no shared state between tests)
- Use proper Playwright assertions: expect(locator).toBeVisible(), toHaveText(), etc.
- waitFor network idle where needed
- Screenshot on failure (built into Playwright)

CRITICAL INSTRUCTION: Output ONLY raw TypeScript. Do not include markdown code block syntax (like \\\`\\\`\\\`typescript and \\\`\\\`\\\`). Do not include conversational filler like "Here is your E2E suite". Just the code.`;


  try {
    const r = await g.generateContent(prompt);
    const code = r.response.text().trim().replace(/^```typescript?\n?/,'').replace(/```$/,'').trim();
    return { file: suite.file, code, status: 'OK' };
  } catch(e) {
    return { file: suite.file, code: null, status: 'ERR', err: e.message };
  }
}

async function main() {
  console.log('\n=== Worker Pool 4: E2E Test Suite Generator ===\n');
  fs.mkdirSync(E2E_DIR, { recursive: true });

  // Generate playwright.config.ts
  const config = `import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 1,
  workers: 4,
  reporter: [['html', { open: 'never' }], ['json', { outputFile: 'e2e/results.json' }]],
  use: {
    baseURL: '${API_URL}',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
});`;
  fs.writeFileSync(path.join(ROOT, 'playwright.config.ts'), config, 'utf8');
  console.log('✅ playwright.config.ts');

  const results = await Promise.all(TEST_SUITES.map(generateTest));

  let written = 0;
  for (const r of results) {
    if (r.status === 'OK' && r.code && r.code.length > 100) {
      fs.writeFileSync(path.join(E2E_DIR, r.file), r.code, 'utf8');
      console.log(`✅ e2e/${r.file}`);
      written++;
    }
  }

  try {
    execSync('git add -A', { cwd: ROOT });
    execSync(`git commit -m "test(e2e): ${written} Playwright test suites — auth/pos/microsite/catering/admin/price-engine/smoke [worker-pool-4]"`, { cwd: ROOT });
    execSync('git push origin HEAD:main', { cwd: ROOT });
    console.log('✅ Pushed');
  } catch(e) { console.warn(e.message?.slice(0,80)); }

  console.log(`\n✅ Worker Pool 4 done: ${written} E2E test files.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
