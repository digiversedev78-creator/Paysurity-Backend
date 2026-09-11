#!/usr/bin/env node
'use strict';
/**
 * github-push.js
 * Pushes all generated module files from /workspace to GitHub
 * using the GitHub REST API (no git CLI required).
 *
 * Why: git clone with x-access-token URL fails in Cloud Build
 * node:20 containers when GITHUB_TOKEN secret is not forwarded
 * correctly to the shell environment.
 *
 * This script reads GITHUB_TOKEN from process.env and uses
 * the Octokit-compatible REST calls directly.
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

const TOKEN   = (process.env.GITHUB_TOKEN || '').trim().replace(/[\r\n]/g, '');
const OWNER   = 'americaneaglelogsvc';
const REPO    = 'PS-Platform---Copy';
const BRANCH  = 'main';
const MODULES = '/workspace/apps/api/src/modules';
const MANIFEST_FILE = process.env.MANIFEST_FILE || 'REQUIREMENTS_MASTER_MANIFEST.json';
const MANIFEST = `/workspace/${MANIFEST_FILE}`;

if (!TOKEN) { console.error('GITHUB_TOKEN not set'); process.exit(1); }

// ── GitHub API helper ──────────────────────────────────────────
function ghRequest(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}${endpoint}`,
      method,
      headers: {
        'Authorization': `token ${TOKEN}`,
        'User-Agent':    'PaySurity-Swarm-V4',
        'Accept':        'application/vnd.github.v3+json',
        'Content-Type':  'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, res => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(buf) }); }
        catch { resolve({ status: res.statusCode, body: buf }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ── Get all files recursively ──────────────────────────────────
function getAllFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  const walk = (d) => {
    fs.readdirSync(d, { withFileTypes: true }).forEach(e => {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else results.push(full);
    });
  };
  walk(dir);
  return results;
}

// ── Get current file SHA on main branch ───────────────────────
async function getFileSha(ghPath) {
  const r = await ghRequest('GET', `/contents/${ghPath}?ref=${BRANCH}`);
  if (r.status === 200 && r.body && r.body.sha) return r.body.sha;
  return null;
}

// ── Upload one file (with 409-retry) ──────────────────────────
async function uploadFile(localPath, repoBasePath) {
  const relPath = path.relative(repoBasePath, localPath).replace(/\\/g, '/');
  const ghPath  = `apps/api/src/modules/${relPath}`;
  const content = fs.readFileSync(localPath);
  const b64     = content.toString('base64');

  async function tryPut(sha) {
    const payload = {
      message: `feat(swarm-v5): ${relPath} [paysurity-platform-2026]`,
      content:  b64,
      branch:   BRANCH,
      ...(sha ? { sha } : {}),
    };
    return ghRequest('PUT', `/contents/${ghPath}`, payload);
  }

  // First attempt — pre-fetch SHA
  const existingSha = await getFileSha(ghPath);
  let r = await tryPut(existingSha);

  // 409 means file exists but SHA was stale/missing — fetch and retry once
  if (r.status === 409) {
    const freshSha = await getFileSha(ghPath);
    if (freshSha) r = await tryPut(freshSha);
  }

  if (r.status === 200 || r.status === 201) return true;
  console.error(`  FAIL ${ghPath}: HTTP ${r.status}`);
  return false;
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  console.log('=== GitHub API Push — paysurity-platform-2026 ===');

  const allFiles = getAllFiles(MODULES);
  console.log(`Files to push: ${allFiles.length}`);

  // Also include manifest
  if (fs.existsSync(MANIFEST)) allFiles.push(MANIFEST);

  let ok = 0, fail = 0;
  const CONCURRENCY = 5; // conservative — avoid secondary rate limit

  // Process in batches of CONCURRENCY
  for (let i = 0; i < allFiles.length; i += CONCURRENCY) {
    const batch = allFiles.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(f => {
      const base = f === MANIFEST ? '/workspace' : MODULES;
      return uploadFile(f, base).catch(e => {
        console.error(`  ERR ${f}: ${e.message}`);
        return false;
      });
    }));
    results.forEach(r => r ? ok++ : fail++);

    const pct = Math.round(((i + batch.length) / allFiles.length) * 100);
    if (pct % 10 === 0 || i + batch.length >= allFiles.length) {
      console.log(`  Progress: ${ok + fail}/${allFiles.length} (${pct}%) — ${ok} OK, ${fail} FAIL`);
    }

    // Small delay to respect rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('');
  console.log(`=== PUSH COMPLETE: ${ok} files pushed, ${fail} failed ===`);
  if (fail > 0) {
    console.log(`WARNING: ${fail} files failed to push`);
    process.exit(fail === allFiles.length ? 1 : 0); // non-fatal if partial
  }
  console.log('SUCCESS: ALL CODE ON GITHUB');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
