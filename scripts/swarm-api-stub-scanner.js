#!/usr/bin/env node
/**
 * scripts/swarm-api-stub-scanner.js
 * Scans all API source files for broken stubs and fixes them with Gemini
 * Targets: AUTO-STUB, FIXME-IMPORT, empty class stubs, truncated files
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT    = path.resolve(__dirname, '..');
const SRC     = path.join(ROOT, 'apps/api/src');
const KEY     = process.env.GEMINI_API_KEY;
const MODEL   = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_PAR = parseInt(process.env.MAX_PARALLEL || '20');

if (!KEY) { console.error('GEMINI_API_KEY not set'); process.exit(1); }
const genAI = new GoogleGenerativeAI(KEY);
const g     = genAI.getGenerativeModel({ model: MODEL });

// Patterns that indicate a broken/stub file
const STUB_PATTERNS = [
  /\/\/ AUTO-STUB/i,
  /FIXME-IMPORT/i,
  /export class \w+ \{\s*\}/,  // empty class
  /\/\/ TODO: implement/i,
  /placeholder.*replace with real/i,
  /throw new Error\(['"]Not implemented['"]\)/i,
];

function isStub(content) {
  return STUB_PATTERNS.some(p => p.test(content));
}

function isTruncated(content, filePath) {
  // Check if file ends mid-sentence (no closing brace or export)
  const trimmed = content.trimEnd();
  return (
    content.length < 100 ||
    (trimmed.endsWith(',') || trimmed.endsWith('(') || trimmed.endsWith('{')) ||
    (!trimmed.endsWith('}') && !trimmed.endsWith(';') && filePath.endsWith('.ts') && content.length > 100)
  );
}

function scanDir(dir, results = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!e.name.startsWith('.') && e.name !== 'node_modules' && e.name !== 'dist') {
        scanDir(full, results);
      }
    } else if (e.name.endsWith('.ts') && !e.name.endsWith('.spec.ts') && !e.name.endsWith('.d.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      if (isStub(content) || isTruncated(content, full)) {
        results.push({ path: full, content, reason: isStub(content) ? 'stub' : 'truncated' });
      }
    }
  }
  return results;
}

async function fixFile(file) {
  const rel = path.relative(ROOT, file.path);
  const fileName = path.basename(file.path, '.ts');
  const dir = path.dirname(file.path).split(path.sep).pop();

  const prompt = `Fix this broken/stub NestJS TypeScript file. It is part of the PaySurity platform API.

File: ${rel}
Issue: ${file.reason === 'stub' ? 'Contains AUTO-STUB placeholder or empty class' : 'File appears truncated/incomplete'}
Current content:
\`\`\`typescript
${file.content.slice(0, 3000)}
\`\`\`

Rules:
- If it's a service: @Injectable(), @Inject('DATABASE') private db: NodePgDatabase<any>, implement all CRUD methods with real Drizzle ORM queries
- If it's a guard: implement CanActivate properly  
- If it's a decorator: use createParamDecorator (NEVER export class as decorator)
- If it's a module: import DatabaseModule and AuditLogModule, declare providers/controllers/exports properly
- If it's a controller: @Controller with proper routes, @UseGuards(JwtAuthGuard)
- If it's a DTO: use class-validator decorators, proper TypeScript types
- Import from '@paysurity/database' for schema tables
- Keep the same class/function name and exported API
- Replace ALL stubs/placeholders with real, working implementations

Output ONLY raw TypeScript. No markdown. No explanation.`;

  try {
    const r = await g.generateContent(prompt);
    const fixed = r.response.text().trim()
      .replace(/^```typescript?\n?/, '').replace(/^```ts?\n?/, '').replace(/```$/, '').trim();
    
    if (fixed.length > file.content.length * 0.3) {
      fs.writeFileSync(file.path, fixed, 'utf8');
      return { path: rel, status: 'FIXED', before: file.content.length, after: fixed.length, reason: file.reason };
    } else {
      return { path: rel, status: 'SKIP_TOO_SHORT', reason: 'generated code too short' };
    }
  } catch(e) {
    return { path: rel, status: 'ERROR', error: e.message?.slice(0, 80) };
  }
}

async function chunked(items, size, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    results.push(...await Promise.all(batch.map(fn)));
    process.stdout.write(`  Progress: ${Math.min(i + size, items.length)}/${items.length}\r`);
  }
  return results;
}

async function main() {
  console.log('\n=== Stub Scanner & Fixer ===\n');
  console.log('Scanning for broken/stub files...');

  const stubs = scanDir(SRC);
  console.log(`Found ${stubs.length} stub/truncated files\n`);

  if (stubs.length === 0) {
    console.log('✅ No stubs found — codebase is clean!');
    return;
  }

  // Show what we found
  stubs.slice(0, 10).forEach(s => console.log(`  [${s.reason}] ${path.relative(ROOT, s.path)}`));
  if (stubs.length > 10) console.log(`  ... and ${stubs.length - 10} more`);

  console.log(`\nFixing in batches of ${MAX_PAR}...\n`);
  const results = await chunked(stubs, MAX_PAR, fixFile);

  const fixed  = results.filter(r => r.status === 'FIXED');
  const errors = results.filter(r => r.status === 'ERROR');

  console.log(`\n📊 Results:`);
  console.log(`  ✅ Fixed:   ${fixed.length}`);
  console.log(`  ❌ Errors:  ${errors.length}`);
  console.log(`  ⚡ Skipped: ${results.length - fixed.length - errors.length}`);

  fixed.slice(0, 10).forEach(r => console.log(`  ✅ ${r.path} (${r.before}→${r.after} bytes)`));
  errors.forEach(r => console.log(`  ❌ ${r.path}: ${r.error}`));

  if (fixed.length > 0) {
    try {
      execSync('git add -A', { cwd: ROOT });
      execSync(`git commit -m "fix(api): stub-scanner fixed ${fixed.length} broken/stub files [swarm-scanner]"`, { cwd: ROOT });
      execSync('git push origin main', { cwd: ROOT });
      console.log('\n✅ Pushed to GitHub');
    } catch(e) { console.warn('Push:', e.message?.slice(0, 80)); }
  }

  console.log('\n✅ Stub scanner done.\n');
}

main().catch(e => { console.error(e); process.exit(1); });
