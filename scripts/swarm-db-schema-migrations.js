#!/usr/bin/env node
/**
 * scripts/swarm-db-schema-migrations.js
 * Worker Pool 1: DB Schema + Migration Generator
 * Generates drizzle schema + SQL migration files for missing tables
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT    = path.resolve(__dirname, '..');
const KEY     = process.env.GEMINI_API_KEY;
const MODEL   = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
if (!KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }
const genAI = new GoogleGenerativeAI(KEY);
const g     = genAI.getGenerativeModel({ model: MODEL });

const MISSING_TABLES = [
  {
    name: 'microsite_settings',
    desc: `Tenant microsite configuration: domain, hero_color, hero_image_url, description, address, phone, 
    social_links (JSON), seo_meta (JSON), paysurity_margin_pct (decimal default 0.20), 
    processing_fee_pct (decimal default 0.05), is_published, pos_sync_enabled, last_pos_sync_at.
    FK: tenant_id → tenants.id, merchant_id → merchants.id`,
  },
  {
    name: 'catering_orders',
    desc: `Catering order requests: id, tenant_id, merchant_id, customer_name, email, phone, 
    event_date, event_type, guest_count, items (JSONB array of {menu_item_id, quantity, notes}),
    total_base_price, total_display_price, deposit_amount, deposit_paid_at, status (pending/confirmed/cancelled),
    special_instructions, advance_notice_hours (must be >= 48), created_at`,
  },
  {
    name: 'price_engine_config',
    desc: `Per-tenant price configuration: tenant_id (PK), paysurity_margin_pct (default 0.20),
    processing_fee_pct (default 0.05), updated_by (user_id), updated_at.
    Super admin can override per tenant via admin dashboard.`,
  },
  {
    name: 'paan_orders',
    desc: `Special Paan orders for events: id, tenant_id, merchant_id, customer_name, email, phone,
    event_date, quantity (must be >= 50 for event orders), paan_types (JSONB),
    deposit_pct (0.25 required), deposit_amount, deposit_paid_at, status, notes, created_at`,
  },
  {
    name: 'microsite_page_visits',
    desc: `Analytics: tenant_id, merchant_id, page_path, visitor_ip_hash, referrer, 
    user_agent_hash, session_id, visited_at. For microsite traffic analytics.`,
  },
  {
    name: 'menu_item_images',
    desc: `Images for menu items: id, menu_item_id, tenant_id, url, alt_text, is_primary, 
    width, height, file_size_bytes, source (uploaded/ai_generated/stock), created_at`,
  },
];

async function generateSchema(table) {
  const prompt = `Generate a Drizzle ORM PostgreSQL schema definition for the '${table.name}' table.

Table description: ${table.desc}

Rules:
- Use drizzle-orm/pg-core imports: pgTable, uuid, text, timestamp, boolean, decimal, integer, jsonb, varchar
- id: uuid().primaryKey().defaultRandom()
- All timestamps: timestamp('created_at').defaultNow(), timestamp('updated_at').defaultNow()
- tenant_id always present as text().notNull()
- Add proper indexes for tenant_id and FK columns
- Export as: export const ${toCamel(table.name)} = pgTable('${table.name}', {...})
- Export TypeScript types: export type ${toPascal(table.name)} = typeof ${toCamel(table.name)}.$inferSelect

CRITICAL INSTRUCTION: Output ONLY raw TypeScript. Do not include markdown code block syntax (like \\\`\\\`\\\`typescript and \\\`\\\`\\\`). Do not include conversational filler like "Here is your code". Just the code.`;


  const sqlPrompt = `Generate an idempotent PostgreSQL migration SQL for the '${table.name}' table.

Table description: ${table.desc}

Rules:
- CREATE TABLE IF NOT EXISTS ${table.name} (...)
- All UUID primary keys
- Include CREATE INDEX IF NOT EXISTS for tenant_id and important FK columns
- Use ON CONFLICT DO NOTHING for idempotency
- Include a comment header with table purpose

CRITICAL INSTRUCTION: Output ONLY raw SQL code. Do not include markdown code block syntax (like \\\`\\\`\\\`sql and \\\`\\\`\\\`). Do not include conversational filler like "Here is the migration". Just the raw SQL queries.`;


  const [schemaResult, sqlResult] = await Promise.all([
    g.generateContent(prompt).then(r => r.response.text().trim().replace(/^```typescript?\n?/,'').replace(/```$/,'').trim()),
    g.generateContent(sqlPrompt).then(r => r.response.text().trim().replace(/^```sql?\n?/,'').replace(/```$/,'').trim()),
  ]);

  return { name: table.name, schema: schemaResult, sql: sqlResult };
}

function toCamel(str) { return str.replace(/_([a-z])/g, (_, l) => l.toUpperCase()); }
function toPascal(str) { const c = toCamel(str); return c.charAt(0).toUpperCase() + c.slice(1); }

async function main() {
  console.log('\n=== Worker Pool 1: DB Schema + Migration Generator ===\n');

  const results = await Promise.all(MISSING_TABLES.map(generateSchema));

  // Write schema files
  const schemaDir = path.join(ROOT, 'packages/database/src/schema');
  const seedDir   = path.join(ROOT, 'packages/database/seeds');
  fs.mkdirSync(schemaDir, { recursive: true });

  let written = 0;
  for (const r of results) {
    if (r.schema.length > 50) {
      fs.writeFileSync(path.join(schemaDir, `${r.name}.ts`), r.schema, 'utf8');
      console.log(`✅ Schema: ${r.name}.ts`);
      written++;
    }
    if (r.sql.length > 50) {
      const idx = String(written + 40).padStart(3, '0');
      fs.writeFileSync(path.join(seedDir, `${idx}_create_${r.name}.sql`), r.sql, 'utf8');
      console.log(`✅ Migration SQL: ${idx}_create_${r.name}.sql`);
    }
  }

  // Update schema/index.ts to export new tables
  const indexPath = path.join(schemaDir, 'index.ts');
  const existingIndex = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
  const newExports = results
    .filter(r => r.schema.length > 50)
    .map(r => `export * from './${r.name}';`)
    .filter(line => !existingIndex.includes(line))
    .join('\n');
  if (newExports) {
    fs.appendFileSync(indexPath, '\n' + newExports + '\n');
    console.log('✅ Updated schema/index.ts');
  }

  // Commit + push
  try {
    execSync('git add -A', { cwd: ROOT });
    execSync(`git commit -m "feat(db): add ${written} missing schema tables + migration SQLs [worker-pool-1]"`, { cwd: ROOT });
    execSync('git push origin HEAD:main', { cwd: ROOT });
    console.log('✅ Pushed');
  } catch(e) { console.warn(e.message?.slice(0,80)); }

  console.log(`\n✅ Worker Pool 1 done: ${written} tables generated.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
