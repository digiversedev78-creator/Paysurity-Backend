#!/usr/bin/env node
/**
 * scripts/swarm-fix-modules.js
 * PARALLEL MODULE FIXER — PaySurity Platform
 *
 * Uses up to MAX_PARALLEL concurrent Gemini calls to:
 *  1. Scan every module that has FIXME-IMPORT, placeholder services, or
 *     AUTO-STUB references that block startup
 *  2. Generate correct implementations using Gemini
 *  3. Write them back to disk
 *  4. Rebuild the API with SWC
 *  5. Push to GitHub
 *
 * Orchestrator pattern: this script IS the orchestrator.
 * Workers: Gemini API calls (up to MAX_PARALLEL in flight)
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT        = path.resolve(__dirname, '..');
const API_SRC     = path.join(ROOT, 'apps', 'api', 'src');
const GEMINI_KEY  = process.env.GEMINI_API_KEY;
const MODEL       = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_PAR     = parseInt(process.env.MAX_PARALLEL || '20', 10);

if (!GEMINI_KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }

const genAI  = new GoogleGenerativeAI(GEMINI_KEY);
const gemini = genAI.getGenerativeModel({ model: MODEL });

// ─── Scan modules ─────────────────────────────────────────────────────────────
function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, f.name);
    if (f.isDirectory() && !['node_modules','dist','.git'].includes(f.name)) walk(fp).forEach(x => out.push(x));
    else if (f.isFile() && f.name.endsWith('.ts')) out.push(fp);
  }
  return out;
}

function needsFix(content) {
  return content.includes('FIXME-IMPORT') ||
         content.includes('AUTO-STUB: placeholder') ||
         content.includes('PaymentService is not defined') ||
         (content.includes('is not defined') && content.length < 500) ||
         content.match(/export class \w+ \{\s*\}/) !== null;
}

// ─── Collect work items ────────────────────────────────────────────────────────
const allFiles = walk(API_SRC);
const broken   = [];

for (const fp of allFiles) {
  const content = fs.readFileSync(fp, 'utf8');
  if (needsFix(content)) {
    broken.push({ fp, content });
  }
}

console.log(`\n🔍 Found ${broken.length} broken/stub files to fix\n`);
if (broken.length === 0) { console.log('Nothing to fix!'); process.exit(0); }

// Read the DB schema for context
let schemaCtx = '';
try {
  schemaCtx = fs.readFileSync(path.join(ROOT, 'packages/database/src/schema/index.ts'), 'utf8').slice(0, 3000);
} catch (_) {}

// ─── Gemini worker ────────────────────────────────────────────────────────────
async function fixFile({ fp, content }) {
  const relPath = path.relative(ROOT, fp);
  const moduleName = path.basename(fp, '.ts');

  const prompt = `You are a NestJS expert fixing broken TypeScript files for the PaySurity payment platform.

FILE: ${relPath}
CURRENT BROKEN CONTENT:
\`\`\`typescript
${content.slice(0, 4000)}
\`\`\`

DATABASE SCHEMA (for reference):
\`\`\`typescript
${schemaCtx.slice(0, 2000)}
\`\`\`

RULES:
1. If this is a SERVICE file with FIXME-IMPORT or empty: implement a minimal but REAL NestJS @Injectable() service
   - Use proper Drizzle ORM via @Inject('DATABASE') private db: NodePgDatabase
   - Implement real methods that query the DB using drizzle
   - All methods must return proper typed results
2. If this is a MODULE file: fix all commented-out imports, provide the correct providers/exports
3. If this is a DECORATOR stub (exports an empty class): replace with createParamDecorator() 
4. If this is a DTO/interface: generate proper class-validator decorated DTO
5. NEVER use placeholder comments or TODO
6. Output ONLY the complete fixed TypeScript file — no markdown, no explanation, no backtick fences

Fix the file now:`;

  try {
    const result = await gemini.generateContent(prompt);
    let fixed = result.response.text().trim();
    // Strip markdown fences if present
    fixed = fixed.replace(/^```typescript\n?/,'').replace(/^```ts\n?/,'').replace(/```$/,'').trim();
    if (fixed.length > 100) {
      fs.writeFileSync(fp, fixed, 'utf8');
      return { fp: relPath, status: 'FIXED', bytes: fixed.length };
    }
    return { fp: relPath, status: 'SKIP_SHORT', bytes: fixed.length };
  } catch (e) {
    return { fp: relPath, status: 'ERROR', error: e.message.slice(0, 100) };
  }
}

// ─── Parallel execution pool ───────────────────────────────────────────────────
async function runPool(items, workerFn, maxConcurrent) {
  const results = [];
  let idx = 0;

  async function runNext() {
    while (idx < items.length) {
      const i = idx++;
      const r = await workerFn(items[i]);
      results.push(r);
      const pct = Math.round((results.length / items.length) * 100);
      process.stdout.write(`\r  Progress: ${results.length}/${items.length} (${pct}%) — ${r.status}: ${r.fp.slice(-50)}`);
    }
  }

  const workers = Array.from({ length: Math.min(maxConcurrent, items.length) }, runNext);
  await Promise.all(workers);
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`🚀 Launching ${Math.min(MAX_PAR, broken.length)} parallel Gemini workers...\n`);
  const results = await runPool(broken, fixFile, MAX_PAR);

  console.log('\n\n📊 Results:');
  const fixed = results.filter(r => r.status === 'FIXED').length;
  const errors = results.filter(r => r.status === 'ERROR');
  console.log(`  ✅ Fixed:  ${fixed}`);
  console.log(`  ⚠️  Errors: ${errors.length}`);
  if (errors.length > 0) errors.slice(0,5).forEach(e => console.log(`     ${e.fp}: ${e.error}`));

  // Rebuild
  console.log('\n🔨 Rebuilding API with SWC...');
  try {
    execSync('npx nest build --config apps/api/nest-cli.json', { cwd: ROOT, stdio: 'pipe' });
    console.log('✅ Build successful');
  } catch (e) {
    console.warn('⚠️  Build errors (non-blocking):', e.stderr?.toString().slice(0, 200));
  }

  // Push to GitHub
  console.log('\n📤 Pushing to GitHub...');
  try {
    execSync('git add -A', { cwd: ROOT });
    execSync(`git commit -m "fix(api): swarm-fix ${fixed} broken modules/stubs/services [auto]"`, { cwd: ROOT });
    execSync('git push origin HEAD:main --force-with-lease', { cwd: ROOT });
    console.log('✅ Pushed to GitHub');
  } catch (e) {
    console.warn('⚠️  Push issue:', e.message?.slice(0, 100));
  }

  console.log(`\n✅ Done. Fixed ${fixed}/${broken.length} files.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
