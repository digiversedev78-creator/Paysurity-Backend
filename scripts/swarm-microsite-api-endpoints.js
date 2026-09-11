#!/usr/bin/env node
/**
 * scripts/swarm-microsite-api-endpoints.js
 * Worker Pool 2: Microsite-specific API controllers + services
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT    = path.resolve(__dirname, '..');
const MODULES = path.join(ROOT, 'apps/api/src/modules');
const KEY     = process.env.GEMINI_API_KEY;
const MODEL   = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
if (!KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }
const genAI = new GoogleGenerativeAI(KEY);
const g     = genAI.getGenerativeModel({ model: MODEL });

// Price engine logic (same as frontend)
const PRICE_ENGINE_NOTE = `
Price calculation: displayPrice = basePrice * (1 + processingFeePct) * (1 + marginPct)
Default: basePrice * 1.05 * 1.20 = basePrice * 1.26
Margin is configurable per-tenant in price_engine_config table (default 0.20).
Super admin can override via /api/admin/tenant-pricing/:tenantId
`;

const ENDPOINTS = [
  {
    module: 'microsite',
    files: ['controller', 'service', 'module'],
    description: `Tenant microsite management endpoints:
    GET  /api/microsite/settings           — get microsite config for current tenant
    PUT  /api/microsite/settings           — update microsite settings (hero color, description, etc.)
    GET  /api/microsite/menu               — get full menu with display prices calculated
    POST /api/microsite/menu-items         — create menu item (stores base_price, calculates display_price)
    PUT  /api/microsite/menu-items/:id     — update menu item
    DELETE /api/microsite/menu-items/:id   — delete menu item
    POST /api/microsite/sync-pos           — trigger POS → microsite sync
    GET  /api/microsite/analytics          — page visits, conversion stats
    
    ${PRICE_ENGINE_NOTE}
    Price calculation happens server-side on every menu item save.`,
  },
  {
    module: 'catering',
    files: ['controller', 'service', 'module'],
    description: `Catering order management:
    POST /api/catering-orders              — submit catering order inquiry
      - Validates: event_date must be >= 48h from now
      - Calculates: deposit_amount = total_display_price * 0.25
      - Sets status: 'pending'
    GET  /api/catering-orders              — list catering orders for tenant
    GET  /api/catering-orders/:id          — get order details
    PUT  /api/catering-orders/:id/confirm  — confirm order (merchant action)
    POST /api/catering-orders/:id/deposit  — record deposit payment received
    
    Special Paan rule: orders of 50+ Paans at events → same 48h notice, 25% deposit.`,
  },
  {
    module: 'price-engine',
    files: ['controller', 'service', 'module'],
    description: `Price calculation engine:
    GET  /api/price-engine/config          — get price config for current tenant (margin, fees)
    PUT  /api/admin/tenant-pricing/:id     — super admin: override margin for specific tenant
    POST /api/price-engine/calculate       — body: {basePrice, tenantId} → returns {displayPrice, breakdown}
    GET  /api/price-engine/preview         — query: basePrice → returns price preview with breakdown
    
    ${PRICE_ENGINE_NOTE}
    Config stored in price_engine_config table, falls back to defaults (0.20, 0.05).`,
  },
  {
    module: 'pos-sync',
    files: ['controller', 'service', 'module'],
    description: `POS ↔ Microsite bidirectional sync:
    POST /api/pos-sync/microsite-to-pos    — push microsite menu changes to POS
    POST /api/pos-sync/pos-to-microsite    — push POS menu changes to microsite
    GET  /api/pos-sync/status/:tenantId    — sync status, last sync timestamp, pending changes
    POST /api/pos-sync/webhook             — POS webhook endpoint (receives POS change events)
    
    Sync logic: compare menu items by name+category, upsert differences.
    Emit events via EventEmitter2 for real-time updates.`,
  },
  {
    module: 'tenant-admin',
    files: ['controller', 'service', 'module'],
    description: `Tenant admin panel API (merchant-facing):
    GET  /api/tenant-admin/dashboard       — merchant dashboard: orders, revenue, menu stats
    GET  /api/tenant-admin/menu-categories — CRUD menu categories with sort_order
    POST /api/tenant-admin/menu-categories
    PUT  /api/tenant-admin/menu-categories/:id
    DELETE /api/tenant-admin/menu-categories/:id
    POST /api/tenant-admin/menu-items/:id/image — upload/set image URL for menu item
    GET  /api/tenant-admin/order-history   — full order history with filtering
    GET  /api/tenant-admin/revenue-report  — revenue by period
    
    All endpoints require owner or manager role JWT.`,
  },
];

async function generateEndpoint(ep) {
  const tasks = ep.files.map(fileType => {
    const prompt = `Generate a complete NestJS ${fileType} for the '${ep.module}' module.

Description:
${ep.description}

Technical requirements & Anti-Error Meticulous Instructions:
1. ABSOLUTELY NO DUPLICATE IMPORTS. Consolidate all imports from '@nestjs/common' into a single line.
2. DO NOT use Drizzle ORM's 'sql' helper or schemas. Use strictly parameterized raw SQL logic. Example: await (this.db as any).execute('SELECT * FROM table WHERE id = $1', [id]);
3. Injection: use \\n  constructor(@Inject('DATABASE') private readonly db: any) {}\\n inside the Service.
4. Error Handling: Always throw standard NestJS exceptions (NotFoundException, BadRequestException) on failure.
5. CRITICAL STRICT RULE: NEVER use @UseGuards() in controllers. Protect operations internally by validating 'const tenantId = req?.user?.tenantId'.
6. Return proper JSON structures: \\n  return { success: true, data };\\n
7. No markdown fences. Output plain typescript code ONLY.
8. CRITICAL: DO NOT SKIP ANY METHODS. You MUST implement full structural logic for EVERY single described endpoint (GET, POST, PUT, DELETE). Do not output a partial class. Do not waste tokens defining dozens of DTO fields inline—focus entirely on the Service/Controller logic.

${fileType === 'module' ? `Module rules: Use @Module({ controllers: [${toPascal(ep.module)}Controller], providers: [${toPascal(ep.module)}Service], exports: [${toPascal(ep.module)}Service] }).` : ''}
${fileType === 'service' ? `Service rules: Use @Injectable(), strictly map your raw SQL to the canonical specs. DO NOT RETURN MOCK DATA. Execute real async SQL queries.` : ''}
${fileType === 'controller' ? `Controller rules: Use @Controller('${ep.module}'), apply Guards, map all HTTP verbs mapped gracefully to the Service layer.` : ''}

Output ONLY raw TypeScript. No explanation. No formatting markdown.`;

    return g.generateContent(prompt)
      .then(r => [fileType, r.response.text().trim().replace(/^```typescript?\n?/,'').replace(/^```ts?\n?/,'').replace(/```$/,'').trim()])
      .catch(e => [fileType, `// Error: ${e.message.slice(0,80)}`]);
  });

  const files = Object.fromEntries(await Promise.all(tasks));
  return { module: ep.module, files };
}

function toPascal(str) {
  return str.split(/[-_]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

async function main() {
  console.log('\n=== Worker Pool 2: Microsite API Endpoints ===\n');

  const results = await Promise.all(ENDPOINTS.map(generateEndpoint));

  let written = 0;
  for (const r of results) {
    const dir = path.join(MODULES, r.module);
    fs.mkdirSync(dir, { recursive: true });
    for (const [type, code] of Object.entries(r.files)) {
      if (code.length > 100 && !code.startsWith('// Error')) {
        const fname = `${r.module}.${type}.ts`;
        fs.writeFileSync(path.join(dir, fname), code, 'utf8');
        console.log(`✅ ${fname}`);
        written++;
      }
    }
  }

  try {
    execSync('git add -A', { cwd: ROOT });
    execSync(`git commit -m "feat(api): microsite+catering+price-engine+pos-sync+tenant-admin endpoints [worker-pool-2]"`, { cwd: ROOT });
    execSync('git push origin HEAD:main', { cwd: ROOT });
    console.log('✅ Pushed');
  } catch(e) { console.warn(e.message?.slice(0,80)); }

  console.log(`\n✅ Worker Pool 2 done: ${written} files.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
