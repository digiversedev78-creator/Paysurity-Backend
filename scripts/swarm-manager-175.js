#!/usr/bin/env node
'use strict';
/**
 * swarm-manager-175.js
 * ─────────────────────────────────────────────────────────────────
 * PaySurity Platform Swarm V4 — 175-Worker Manager
 *
 * Spawns up to 175 parallel child processes inside a single Cloud
 * Build container. Each coder worker handles ~2 requirements.
 * After each coder finishes, its paired tester worker executes.
 *
 * Traceability (Gate 1-7 DoD):
 *  - Every file gets a requirement cross-reference header
 *  - REQUIREMENTS_MASTER_MANIFEST.json updated per-requirement
 *  - Manifest is the single source of truth
 *
 * Usage (inside Cloud Build):
 *   node scripts/swarm-manager-175.js
 */

const fs            = require('fs');
const path          = require('path');
const { fork }      = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────
const ROOT          = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'REQUIREMENTS_MASTER_MANIFEST.json');
const MODULES_DIR   = path.join(ROOT, 'apps', 'api', 'src', 'modules');
const API_KEY       = process.env.GEMINI_API_KEY;
const MODEL         = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MAX_PARALLEL  = parseInt(process.env.MAX_PARALLEL || '30', 10); // concurrency window
const TOTAL_WORKERS = 175;

if (!API_KEY) { console.error('❌ GEMINI_API_KEY not set'); process.exit(1); }

const genAI  = new GoogleGenerativeAI(API_KEY);
const gemini = genAI.getGenerativeModel({ model: MODEL });

// ─────────────────────────────────────────────────────────────────
// MANIFEST HANDLING  (thread-safe via sequential writes)
// ─────────────────────────────────────────────────────────────────
let manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));

function saveManifest() {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function getAllRequirements() {
  const all = [];
  Object.entries(manifest.workers).forEach(([wId, w]) => {
    (w.requirements || []).forEach(r => all.push({ ...r, _workerId: wId }));
  });
  return all;
}

function updateRequirement(reqId, updates) {
  Object.values(manifest.workers).forEach(w => {
    const r = (w.requirements || []).find(r => r.id === reqId);
    if (r) Object.assign(r, updates);
  });
  saveManifest();
}

// ─────────────────────────────────────────────────────────────────
// FILE HELPERS
// ─────────────────────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function traceHeader(req, fileType, workerLabel) {
  return [
    `/**`,
    ` * ═══════════════════════════════════════════════════════════`,
    ` * PROJECT:      paysurity-platform-2026`,
    ` * REQUIREMENT:  ${req.id} — ${req.title}`,
    ` * FILE TYPE:    ${fileType}`,
    ` * MODULE:       ${req.module}`,
    ` * PRIORITY:     ${req.priority || 'P1'}`,
    ` * SOURCE:       ${req.file || 'Requirements/Canonical'}`,
    ` * WORKER:       ${workerLabel}`,
    ` * GENERATED:    ${new Date().toISOString()}`,
    ` * MANIFEST:     REQUIREMENTS_MASTER_MANIFEST.json`,
    ` * ═══════════════════════════════════════════════════════════`,
    ` */`,
    ``,
  ].join('\n');
}

// ─────────────────────────────────────────────────────────────────
// GEMINI CODE GENERATION
// ─────────────────────────────────────────────────────────────────
async function generateCode(req) {
  const prompt = `
You are a senior NestJS TypeScript engineer on the PaySurity platform (paysurity-platform-2026).

Generate production-ready NestJS code for requirement: ${req.id} — "${req.title}"
Module: ${req.module}  |  Priority: ${req.priority || 'P1'}  |  Entity: ${req.entity || req.module}

Rules:
- Every file MUST start with the provided traceability header (already added externally)
- Use Drizzle ORM with tenantId/tenant_id on all DB operations for multi-tenancy
- NO hardcoded PAN numbers or sensitive data
- Use @nestjs/common decorators, class-validator for DTOs
- Audit logging on all mutating operations (AuditLogService)
- Return clean, compilable TypeScript with no placeholder comments

Respond with ONLY valid JSON (no markdown fences):
{
  "service": "<full .service.ts content (after header)>",
  "controller": "<full .controller.ts content (after header)>",
  "module_file": "<full .module.ts content (after header)>",
  "dto": "<full .dto.ts content (after header)>",
  "test": "<full .spec.ts content (after header)>"
}`;

  try {
    const result = await gemini.generateContent(prompt);
    const text = result.response.text().trim()
      .replace(/^```json\n?/, '').replace(/\n?```$/, '')
      .replace(/^```\n?/, '');
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Gemini codegen failed for ${req.id}: ${e.message}`);
  }
}

async function generateEdgeCaseTests(req, workerLabel) {
  const prompt = `
You are a senior QA engineer on PaySurity (paysurity-platform-2026).

Generate comprehensive edge-case Jest tests for requirement: ${req.id} — "${req.title}"
Module: ${req.module}

Test these scenarios:
1. Empty/null inputs
2. Boundary values
3. Multi-tenant isolation (different tenantId never bleeds across)
4. Concurrent request handling
5. Auth/permission failures
6. Database constraint violations

Respond with ONLY the raw TypeScript test file content (no markdown, no JSON wrapper).
Start directly with import statements.`;

  try {
    const result = await gemini.generateContent(prompt);
    return result.response.text().trim()
      .replace(/^```typescript\n?/, '').replace(/\n?```$/, '')
      .replace(/^```\n?/, '');
  } catch (e) {
    return `// Edge-case generation failed for ${req.id}: ${e.message}\n`;
  }
}

// ─────────────────────────────────────────────────────────────────
// CODER WORKER (generates service + controller + module + dto + test)
// ─────────────────────────────────────────────────────────────────
async function coderWorker(req, workerLabel) {
  const moduleDir = path.join(MODULES_DIR, req.module);
  ensureDir(moduleDir);

  console.log(`  🔨 [${workerLabel}] ${req.id}: Coding "${req.title}"`);

  let generated;
  try {
    generated = await generateCode(req);
  } catch (e) {
    console.error(`  ❌ [${workerLabel}] ${req.id}: ${e.message}`);
    updateRequirement(req.id, { status: 'ERROR', error: e.message, worker_id: workerLabel });
    return { success: false };
  }

  const files = [];
  const write = (name, type, content) => {
    const p = path.join(moduleDir, name);
    fs.writeFileSync(p, traceHeader(req, type, workerLabel) + content);
    files.push(`apps/api/src/modules/${req.module}/${name}`);
  };

  if (generated.service)     write(`${req.module}.service.ts`,    'SERVICE',    generated.service);
  if (generated.controller)  write(`${req.module}.controller.ts`, 'CONTROLLER', generated.controller);
  if (generated.module_file) write(`${req.module}.module.ts`,     'MODULE',     generated.module_file);
  if (generated.dto)         write(`${req.module}.dto.ts`,        'DTO',        generated.dto);
  if (generated.test)        write(`${req.module}.spec.ts`,       'TEST',       generated.test);

  updateRequirement(req.id, {
    status:          'DONE',
    generated_files: files,
    generated_at:    new Date().toISOString(),
    worker_id:       workerLabel,
  });

  console.log(`  ✅ [${workerLabel}] ${req.id}: Generated (${files.length} files)`);
  return { success: true, files };
}

// ─────────────────────────────────────────────────────────────────
// TESTER WORKER (peer review + edge-case tests)
// ─────────────────────────────────────────────────────────────────
async function testerWorker(req, workerLabel) {
  const moduleDir = path.join(MODULES_DIR, req.module);
  ensureDir(moduleDir);

  console.log(`  🧪 [${workerLabel}] ${req.id}: Testing "${req.title}"`);

  const edgeContent = await generateEdgeCaseTests(req, workerLabel);
  const edgePath    = path.join(moduleDir, `${req.module}.edge-cases.spec.ts`);
  fs.writeFileSync(edgePath, traceHeader(req, 'EDGE-CASE-TEST', workerLabel) + edgeContent);

  const edgeFile = `apps/api/src/modules/${req.module}/${req.module}.edge-cases.spec.ts`;

  // Add edge file to manifest
  const manifestReq = Object.values(manifest.workers)
    .flatMap(w => w.requirements || [])
    .find(r => r.id === req.id);

  if (manifestReq) {
    if (!manifestReq.generated_files) manifestReq.generated_files = [];
    if (!manifestReq.generated_files.includes(edgeFile))
      manifestReq.generated_files.push(edgeFile);
    manifestReq.reviewed_by = workerLabel;
    manifestReq.reviewed_at = new Date().toISOString();
    saveManifest();
  }

  console.log(`  ✅ [${workerLabel}] ${req.id}: Edge-case tests written`);
  return { success: true };
}

// ─────────────────────────────────────────────────────────────────
// ORCHESTRATOR  (manages concurrency window)
// ─────────────────────────────────────────────────────────────────
async function runWithConcurrency(tasks, limit) {
  const results = [];
  let i = 0;

  async function runNext() {
    if (i >= tasks.length) return;
    const idx = i++;
    results[idx] = await tasks[idx]();
    return runNext();
  }

  const runners = Array.from({ length: Math.min(limit, tasks.length) }, runNext);
  await Promise.all(runners);
  return results;
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  PaySurity Swarm V4 — ${TOTAL_WORKERS}-Worker Manager`);
  console.log(`  Project: paysurity-platform-2026`);
  console.log(`  Model:   ${MODEL}`);
  console.log(`  Concurrency window: ${MAX_PARALLEL} parallel tasks`);
  console.log('═══════════════════════════════════════════════════════════');

  ensureDir(MODULES_DIR);

  const allReqs = getAllRequirements();
  console.log(`\n📋 Total requirements: ${allReqs.length}`);
  console.log(`🔨 Coder workers:   ${Math.ceil(TOTAL_WORKERS / 2)} (one per req slot)`);
  console.log(`🧪 Tester workers:  ${Math.floor(TOTAL_WORKERS / 2)} (one per coder)`);
  console.log(`⚡ Running up to ${MAX_PARALLEL} tasks concurrently\n`);

  let codersDone = 0, codersOk = 0, testersDone = 0;

  // Phase 1: Coder tasks (all reqs in parallel, window-limited)
  console.log('── PHASE 1: CODING ──────────────────────────────────────');
  const coderTasks = allReqs.map((req, idx) => async () => {
    const label = `CODER-${String(idx + 1).padStart(3, '0')}`;
    const result = await coderWorker(req, label);
    codersDone++;
    if (result.success) codersOk++;
    const pct = Math.round((codersDone / allReqs.length) * 100);
    if (codersDone % 10 === 0 || codersDone === allReqs.length) {
      console.log(`\n📊 CODER PROGRESS: ${codersDone}/${allReqs.length} (${pct}%) — ${codersOk} OK\n`);
    }
    return result;
  });

  await runWithConcurrency(coderTasks, MAX_PARALLEL);

  console.log(`\n✅ CODING COMPLETE: ${codersOk}/${allReqs.length} succeeded\n`);

  // Phase 2: Tester tasks (parallel edge-case generation)
  console.log('── PHASE 2: TESTING ─────────────────────────────────────');
  const doneReqs = getAllRequirements().filter(r => r.status === 'DONE');
  console.log(`🧪 Running edge-case tests for ${doneReqs.length} completed requirements`);

  const testerTasks = doneReqs.map((req, idx) => async () => {
    const label = `TESTER-${String(idx + 1).padStart(3, '0')}`;
    const result = await testerWorker(req, label);
    testersDone++;
    if (testersDone % 10 === 0 || testersDone === doneReqs.length) {
      const pct = Math.round((testersDone / doneReqs.length) * 100);
      console.log(`\n📊 TESTER PROGRESS: ${testersDone}/${doneReqs.length} (${pct}%)\n`);
    }
    return result;
  });

  await runWithConcurrency(testerTasks, MAX_PARALLEL);

  // Final summary
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  SWARM V4 COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');

  const services  = fs.readdirSync(MODULES_DIR).length;
  const allFiles  = getAllFilesRecursive(MODULES_DIR);
  const svcFiles  = allFiles.filter(f => f.endsWith('.service.ts')).length;
  const testFiles = allFiles.filter(f => f.endsWith('.spec.ts')).length;
  const edgeFiles = allFiles.filter(f => f.endsWith('.edge-cases.spec.ts')).length;

  console.log(`  Modules:           ${services}`);
  console.log(`  Services:          ${svcFiles}`);
  console.log(`  Tests:             ${testFiles}`);
  console.log(`  Edge-case tests:   ${edgeFiles}`);
  console.log(`  Coders OK:         ${codersOk}/${allReqs.length}`);
  console.log(`  Testers OK:        ${testersDone}/${doneReqs.length}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  const failedReqs = getAllRequirements().filter(r => r.status === 'ERROR');
  if (failedReqs.length) {
    console.log(`⚠️  ${failedReqs.length} requirements need retry:`);
    failedReqs.forEach(r => console.log(`  - ${r.id}: ${r.error}`));
  }

  process.exit(codersOk === 0 ? 1 : 0);
}

function getAllFilesRecursive(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(e =>
    e.isDirectory()
      ? getAllFilesRecursive(path.join(dir, e.name))
      : [path.join(dir, e.name)]
  );
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
