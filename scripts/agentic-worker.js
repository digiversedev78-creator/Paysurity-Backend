#!/usr/bin/env node
/**
 * PaySurity Agentic Worker — Gemini-Powered Code Generator
 * 
 * Reads requirements from REQUIREMENTS_MASTER_MANIFEST.json,
 * calls Vertex AI Gemini 2.0 Flash to generate service + controller + test,
 * and saves files to the correct module directories.
 * 
 * Usage:
 *   WORKER_ID=A MODE=codegen node scripts/agentic-worker.js
 *   WORKER_ID=B MODE=peer_review REVIEW_TARGET=A node scripts/agentic-worker.js
 */

const fs = require('fs');
const path = require('path');

let GoogleGenerativeAI;
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
} catch (e) {
  console.error('❌ FATAL: @google/generative-ai not installed. Run: npm install @google/generative-ai');
  console.error(e.message);
  process.exit(1);
}

const WORKER_ID = process.env.WORKER_ID || 'A';
const MODE = process.env.MODE || 'codegen'; // codegen | peer_review
const REVIEW_TARGET = process.env.REVIEW_TARGET || '';
const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

if (!API_KEY) {
  console.error('❌ FATAL: GEMINI_API_KEY environment variable not set');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'REQUIREMENTS_MASTER_MANIFEST.json');
const MODULES_DIR = path.join(ROOT, 'apps', 'api', 'src', 'modules');
const SCHEMA_DIR = path.join(ROOT, 'packages', 'database', 'src', 'schema');

// ── Initialize Google Generative AI ───────────────────────────
const genAI = new GoogleGenerativeAI(API_KEY);
const gemini = genAI.getGenerativeModel({ model: MODEL });

// ── Load manifest ─────────────────────────────────────────────
function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

// ── Load requirement file content ─────────────────────────────
function loadRequirementFile(filePath) {
  const full = path.join(ROOT, filePath);
  if (fs.existsSync(full)) return fs.readFileSync(full, 'utf-8');
  return `[File not found: ${filePath}]`;
}

// ── Load Drizzle schema for entity ────────────────────────────
function loadSchema(entity) {
  if (!entity) return 'No specific entity schema.';
  const schemaFile = path.join(SCHEMA_DIR, `${entity}.ts`);
  if (fs.existsSync(schemaFile)) return fs.readFileSync(schemaFile, 'utf-8');
  // Try index
  const indexFile = path.join(SCHEMA_DIR, 'index.ts');
  if (fs.existsSync(indexFile)) {
    const content = fs.readFileSync(indexFile, 'utf-8');
    const regex = new RegExp(`export.*${entity}`, 'i');
    if (regex.test(content)) return content;
  }
  return `Schema for '${entity}' not found — create new table as needed.`;
}

// ── Ensure module directory exists ────────────────────────────
function ensureModuleDir(moduleName) {
  const dir = path.join(MODULES_DIR, moduleName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ── Build traceability header for generated files ─────────────
function buildTraceHeader(req, fileType) {
  const ts = new Date().toISOString();
  return [
    `/**`,
    ` * ═══════════════════════════════════════════════════════════`,
    ` * REQUIREMENT: ${req.id} — ${req.title}`,
    ` * PRIORITY:    ${req.priority || 'P1'}`,
    ` * MODULE:      ${req.module}`,
    ` * ENTITY:      ${req.entity || 'N/A'}`,
    ` * SOURCE:      ${req.file}`,
    ` * FILE TYPE:   ${fileType}`,
    ` * GENERATED:   ${ts}`,
    ` * WORKER:      ${WORKER_ID} (${MODE})`,
    ` * MODEL:       ${MODEL}`,
    ` * ═══════════════════════════════════════════════════════════`,
    ` */`,
    ``,
  ].join('\n');
}

// ── Code Generation Mode ──────────────────────────────────────
async function runCodegen() {
  const manifest = loadManifest();
  const worker = manifest.workers[WORKER_ID];
  if (!worker) { console.error(`Worker ${WORKER_ID} not found in manifest`); process.exit(1); }

  const requirements = worker.requirements || [];
  console.log(`\n🤖 Worker ${WORKER_ID} (${worker.name}) — ${MODE} mode`);
  console.log(`   ${requirements.length} requirements to process\n`);

  let success = 0, failed = 0;

  for (const req of requirements) {
    if (req.status === 'DONE') { console.log(`  ⏭️  ${req.id} already DONE, skipping`); continue; }

    console.log(`  🔨 ${req.id}: ${req.title}...`);
    req.status = 'IN_PROGRESS';

    try {
      const reqContent = loadRequirementFile(req.file);
      const schemaContent = loadSchema(req.entity);

      const prompt = buildCodegenPrompt(req, reqContent, schemaContent);
      const result = await gemini.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON output from Gemini
      const generated = parseGeneratedCode(text);
      if (!generated) {
        console.log(`  ⚠️  ${req.id}: Could not parse Gemini output`);
        req.status = 'PARSE_ERROR';
        failed++;
        continue;
      }

      // Save files with traceability headers
      const moduleDir = ensureModuleDir(req.module);
      const generatedFiles = [];

      if (generated.service) {
        const filePath = path.join(moduleDir, `${req.module}.service.ts`);
        fs.writeFileSync(filePath, buildTraceHeader(req, 'SERVICE') + generated.service);
        generatedFiles.push(`apps/api/src/modules/${req.module}/${req.module}.service.ts`);
      }
      if (generated.controller) {
        const filePath = path.join(moduleDir, `${req.module}.controller.ts`);
        fs.writeFileSync(filePath, buildTraceHeader(req, 'CONTROLLER') + generated.controller);
        generatedFiles.push(`apps/api/src/modules/${req.module}/${req.module}.controller.ts`);
      }
      if (generated.module_file) {
        const filePath = path.join(moduleDir, `${req.module}.module.ts`);
        fs.writeFileSync(filePath, buildTraceHeader(req, 'MODULE') + generated.module_file);
        generatedFiles.push(`apps/api/src/modules/${req.module}/${req.module}.module.ts`);
      }
      if (generated.test) {
        const filePath = path.join(moduleDir, `${req.module}.spec.ts`);
        fs.writeFileSync(filePath, buildTraceHeader(req, 'TEST') + generated.test);
        generatedFiles.push(`apps/api/src/modules/${req.module}/${req.module}.spec.ts`);
      }

      // Cross-reference: update requirement with generated file paths
      req.status = 'CODEGEN_DONE';
      req.generated_files = generatedFiles;
      req.generated_at = new Date().toISOString();
      req.worker_id = WORKER_ID;
      success++;
      console.log(`  ✅ ${req.id}: Generated (service + controller + test)`);

    } catch (err) {
      console.error(`  ❌ ${req.id}: ${err.message}`);
      req.status = 'ERROR';
      req.error = err.message.slice(0, 200);
      failed++;
    }

    // Save progress after each requirement (manifest tracks status + file paths)
    saveManifest(manifest);
  }

  console.log(`\n📊 Worker ${WORKER_ID} complete: ${success} ✅, ${failed} ❌\n`);
  if (success === 0 && requirements.length > 0) {
    console.error('❌ FATAL: Zero requirements completed successfully');
    process.exit(1);
  }
}

// ── Peer Review Mode ──────────────────────────────────────────
async function runPeerReview() {
  const manifest = loadManifest();
  const targetWorker = manifest.workers[REVIEW_TARGET];
  if (!targetWorker) { console.error(`Review target ${REVIEW_TARGET} not found`); process.exit(1); }

  const requirements = (targetWorker.requirements || []).filter(r => r.status === 'CODEGEN_DONE');
  console.log(`\n🔍 Worker ${WORKER_ID} — PEER REVIEWING Worker ${REVIEW_TARGET}'s code`);
  console.log(`   ${requirements.length} requirements to review\n`);

  let reviewed = 0;

  for (const req of requirements) {
    console.log(`  🔍 Reviewing ${req.id}: ${req.title}...`);

    try {
      const moduleDir = path.join(MODULES_DIR, req.module);
      const serviceFile = path.join(moduleDir, `${req.module}.service.ts`);
      const controllerFile = path.join(moduleDir, `${req.module}.controller.ts`);

      if (!fs.existsSync(serviceFile)) { console.log(`  ⏭️  No service file for ${req.id}`); continue; }

      const serviceCode = fs.readFileSync(serviceFile, 'utf-8');
      const controllerCode = fs.existsSync(controllerFile) ? fs.readFileSync(controllerFile, 'utf-8') : '';
      const reqContent = loadRequirementFile(req.file);

      const prompt = buildPeerReviewPrompt(req, serviceCode, controllerCode, reqContent);
      const result = await gemini.generateContent(prompt);
      const text = result.response.text();

      const edgeCaseTests = parseGeneratedCode(text);
      if (edgeCaseTests && edgeCaseTests.test) {
        const edgeCaseFile = path.join(moduleDir, `${req.module}.edge-cases.spec.ts`);
        const edgeHeader = buildTraceHeader(
          { ...req, title: `${req.title} — EDGE CASE TESTS` },
          'EDGE_CASE_TEST'
        );
        fs.writeFileSync(edgeCaseFile, edgeHeader + edgeCaseTests.test);
        // Cross-reference: add edge-case file to requirement
        if (!req.generated_files) req.generated_files = [];
        req.generated_files.push(`apps/api/src/modules/${req.module}/${req.module}.edge-cases.spec.ts`);
        console.log(`  ✅ ${req.id}: Edge-case tests written`);
      }

      req.status = 'PEER_REVIEWED';
      req.reviewed_by = WORKER_ID;
      req.reviewed_at = new Date().toISOString();
      reviewed++;

    } catch (err) {
      console.error(`  ❌ ${req.id} review failed: ${err.message}`);
    }

    saveManifest(manifest);
  }

  console.log(`\n📊 Peer review complete: ${reviewed} reviewed\n`);
}

// ── Prompt Builders ───────────────────────────────────────────
function buildCodegenPrompt(req, reqContent, schemaContent) {
  return `You are a senior NestJS developer building the PaySurity payment platform.

CRITICAL RULES:
- Database: PostgreSQL via Drizzle ORM (import from '@ps/database')
- Framework: NestJS with TypeScript strict mode
- Auth: JWT with tenant isolation — EVERY query MUST filter by tenant_id
- Audit: EVERY state-changing operation MUST log to audit_events table
- Tracing: X-Trace-Id header propagated on every request
- Money: ALWAYS use integer cents (never floating point dollars)
- Errors: Use PaySurity error codes (e.g., PAYMENT_DECLINED, TENANT_NOT_FOUND)
- No raw PAN (card numbers) EVER in any code, log, or response

REQUIREMENT ID: ${req.id}
REQUIREMENT TITLE: ${req.title}
MODULE: ${req.module}
DATABASE ENTITY: ${req.entity || 'none'}

REQUIREMENT DOCUMENT (extract relevant section for ${req.id}):
${reqContent.slice(0, 6000)}

DATABASE SCHEMA:
${schemaContent.slice(0, 3000)}

GENERATE EXACTLY 4 files as a JSON object:
{
  "service": "// Complete ${req.module}.service.ts — all methods implementing acceptance criteria",
  "controller": "// Complete ${req.module}.controller.ts — REST endpoints with JWT guards, RBAC, Swagger docs",
  "module_file": "// Complete ${req.module}.module.ts — NestJS module wiring",
  "test": "// Complete ${req.module}.spec.ts — ${req.test_scenarios} test scenarios covering HAPPY, ALT, EXCEPT, GUARD paths"
}

Return ONLY valid JSON. No markdown fences. No explanation text.`;
}

function buildPeerReviewPrompt(req, serviceCode, controllerCode, reqContent) {
  return `You are a senior QA engineer. Your mission: BREAK this code by finding edge cases.

CODE UNDER REVIEW — ${req.id}: ${req.title}

SERVICE:
${serviceCode.slice(0, 8000)}

CONTROLLER:
${controllerCode.slice(0, 4000)}

ORIGINAL REQUIREMENT:
${reqContent.slice(0, 4000)}

Write ADVERSARIAL test cases that attempt to:
1. Pass null/undefined for required parameters
2. Send requests with WRONG tenant_id (data isolation breach)
3. Hit race conditions (concurrent identical requests)
4. Exceed limits (negative amounts, integer overflow, empty strings)
5. Inject SQL via string parameters
6. Access without authentication
7. Access with wrong role (RBAC bypass)
8. Send malformed UUIDs, future dates, past dates
9. Test boundary values (0, -1, MAX_INT, extremely long strings)

Return as JSON:
{
  "test": "// Complete edge-case test file with adversarial tests"
}

Return ONLY valid JSON. No markdown fences.`;
}

// ── Parse Gemini Output ───────────────────────────────────────
function parseGeneratedCode(text) {
  try {
    // Try direct JSON parse
    return JSON.parse(text);
  } catch {
    // Try extracting JSON from markdown fences
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[1]); } catch { /* continue */ }
    }
    // Try finding { ... } block
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try { return JSON.parse(braceMatch[0]); } catch { /* continue */ }
    }
    return null;
  }
}

// ── Main ──────────────────────────────────────────────────────
(async () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  PaySurity Agentic Worker — ${WORKER_ID} — ${MODE}`);
  console.log('═══════════════════════════════════════════════════════');

  try {
    if (MODE === 'codegen') {
      await runCodegen();
    } else if (MODE === 'peer_review') {
      await runPeerReview();
    } else {
      console.error(`Unknown mode: ${MODE}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('═══ UNHANDLED ERROR ═══');
    console.error(err.stack || err.message || err);
    process.exit(1);
  }
})();

process.on('unhandledRejection', (err) => {
  console.error('═══ UNHANDLED REJECTION ═══');
  console.error(err);
  process.exit(1);
});
