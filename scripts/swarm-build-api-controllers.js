#!/usr/bin/env node
/**
 * scripts/swarm-build-api-controllers.js
 * Worker D: Generate all missing API controllers + services
 * Targets: loyalty, payroll, settlements, affiliates, analytics, reports
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT    = path.resolve(__dirname, '..');
const MODULES = path.join(ROOT, 'apps', 'api', 'src', 'modules');
const KEY     = process.env.GEMINI_API_KEY;
const MODEL   = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }
const genAI  = new GoogleGenerativeAI(KEY);
const gemini = genAI.getGenerativeModel({ model: MODEL });

// Schema context
let schema = '';
try { schema = fs.readFileSync(path.join(ROOT,'packages/database/src/schema/index.ts'),'utf8').slice(0,4000); } catch(_){}

const ENDPOINTS = [
  {
    module: 'loyalty',
    routes: [
      { method: 'GET', path: '/api/loyalty/members', desc: 'List loyalty members with points and tier for this tenant' },
      { method: 'GET', path: '/api/loyalty/me', desc: 'Current user loyalty points and tier' },
      { method: 'POST', path: '/api/loyalty/redeem', desc: 'Redeem points for reward' },
    ],
    tables: 'loyaltyPrograms, loyaltyTransactions',
  },
  {
    module: 'payroll',
    routes: [
      { method: 'GET', path: '/api/payroll/runs', desc: 'List payroll runs for this tenant' },
      { method: 'POST', path: '/api/payroll/runs', desc: 'Create a new payroll run' },
      { method: 'GET', path: '/api/payroll/runs/:id', desc: 'Get payroll run details with employee breakdown' },
    ],
    tables: 'payrollRuns, employees',
  },
  {
    module: 'settlement-batches',
    routes: [
      { method: 'GET', path: '/api/settlement-batches', desc: 'List settlement batches with totals for this tenant' },
      { method: 'GET', path: '/api/settlement-batches/:id', desc: 'Get batch details with transaction list' },
    ],
    tables: 'settlementBatches, paymentIntents',
  },
  {
    module: 'affiliates',
    routes: [
      { method: 'GET', path: '/api/affiliates', desc: 'List affiliates and their referral stats' },
      { method: 'POST', path: '/api/affiliates', desc: 'Create new affiliate' },
      { method: 'GET', path: '/api/affiliates/:id/commissions', desc: 'Get commission history for affiliate' },
    ],
    tables: 'affiliates',
  },
  {
    module: 'analytics',
    routes: [
      { method: 'GET', path: '/api/analytics/revenue', desc: 'Revenue by date range, grouped by day. Query params: from, to, granularity' },
      { method: 'GET', path: '/api/analytics/top-items', desc: 'Top selling menu items by revenue' },
      { method: 'GET', path: '/api/analytics/peak-hours', desc: 'Order count by hour of day for the last 30 days' },
    ],
    tables: 'orders, orderItems, menuItems',
  },
  {
    module: 'reports',
    routes: [
      { method: 'GET', path: '/api/reports/daily-summary', desc: 'Daily sales summary: orders, revenue, avg ticket' },
      { method: 'GET', path: '/api/reports/tax', desc: 'Tax collected report grouped by period' },
    ],
    tables: 'orders, paymentIntents',
  },
];

async function generateModule(ep) {
  const routeList = ep.routes.map(r => `${r.method} ${r.path} — ${r.desc}`).join('\n');

  const servicePrompt = `Generate a NestJS @Injectable() service for the '${ep.module}' module.
DB Tables used: ${ep.tables}
Schema context: ${schema.slice(0,2000)}

Routes to implement:
${routeList}

Rules:
- Constructor: @Inject('DATABASE') private db: NodePgDatabase<any>  
- Import schema from '@paysurity/database'
- Import drizzle-orm operators (eq, desc, and, gte, lte, sql)
- Each method returns properly typed data
- Include tenantId filtering on all queries
- Real Drizzle ORM queries, NO mock data
- Export class ${toPascalCase(ep.module)}Service

Output ONLY raw TypeScript class code.`;

  const controllerPrompt = `Generate a NestJS @Controller() for the '${ep.module}' module.
Routes:
${routeList}

Rules:
- @ApiTags('${ep.module}')
- @UseGuards(JwtAuthGuard) on the class (import from '../../auth/guards/jwt-auth.guard')
- Inject ${toPascalCase(ep.module)}Service
- Use @Query(), @Param(), @Body() decorators as appropriate
- Return service results directly
- Export class ${toPascalCase(ep.module)}Controller

Output ONLY raw TypeScript class code.`;

  const [svc, ctrl] = await Promise.all([
    gemini.generateContent(servicePrompt).then(r => r.response.text().trim()
      .replace(/^```typescript?\n?/,'').replace(/^```ts?\n?/,'').replace(/```$/,'').trim()),
    gemini.generateContent(controllerPrompt).then(r => r.response.text().trim()
      .replace(/^```typescript?\n?/,'').replace(/^```ts?\n?/,'').replace(/```$/,'').trim()),
  ]);

  return { module: ep.module, service: svc, controller: ctrl };
}

function toPascalCase(str) {
  return str.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

async function main() {
  console.log('\n=== Worker D: Building Missing API Controllers + Services ===\n');

  const results = await Promise.all(ENDPOINTS.map(generateModule));

  let written = 0;
  for (const r of results) {
    const dir = path.join(MODULES, r.module);
    fs.mkdirSync(dir, { recursive: true });
    const svcPath = path.join(dir, `${r.module}.service.ts`);
    const ctrlPath = path.join(dir, `${r.module}.controller.ts`);
    if (r.service.length > 100) { fs.writeFileSync(svcPath, r.service, 'utf8'); written++; console.log(`✅ ${r.module}.service.ts`); }
    if (r.controller.length > 100) { fs.writeFileSync(ctrlPath, r.controller, 'utf8'); written++; console.log(`✅ ${r.module}.controller.ts`); }
  }

  try {
    execSync('git add -A', { cwd: ROOT });
    execSync(`git commit -m "feat(api): worker-d generates ${written} controllers+services for loyalty/payroll/settlements/affiliates/analytics/reports"`, { cwd: ROOT });
    execSync('git push origin HEAD:main --force-with-lease', { cwd: ROOT });
    console.log('✅ Pushed');
  } catch(e) { console.warn(e.message?.slice(0,100)); }

  console.log(`\n✅ Worker D done: ${written} files written.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
