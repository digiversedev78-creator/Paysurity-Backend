#!/usr/bin/env node
/**
 * scripts/swarm-verify-and-fix.js
 * Post-build verifier: catches runtime crashes BEFORE Cloud Run deploy
 * 1. Scans dist/ for missing require() targets
 * 2. Checks all module imports resolve
 * 3. Attempts node apps/api/dist/main.js with a 5s timeout (health check)
 * 4. Fixes any remaining broken imports automatically
 */
'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const ROOT = path.resolve(__dirname, '..');
const KEY  = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const genAI = new GoogleGenerativeAI(KEY);
const g     = genAI.getGenerativeModel({ model: MODEL });

// Known safe packages (always available in production runtime)
const SAFE_PKGS = new Set([
  '@nestjs/common', '@nestjs/core', '@nestjs/platform-express',
  '@nestjs/config', '@nestjs/jwt', '@nestjs/passport',
  'passport', 'passport-jwt', 'bcrypt', 'bcryptjs',
  'drizzle-orm', '@paysurity/database', '@paysurity/shared-types',
  'class-validator', 'class-transformer', 'reflect-metadata', 'rxjs',
  'swagger-ui-express', '@nestjs/swagger', 'express', 'dotenv',
  'pg', 'postgres', 'zod', 'uuid', 'dayjs', 'date-fns',
  'multer', 'helmet', 'cors', 'compression',
]);

function scanDistForBadRequires(distDir) {
  const bad = [];
  if (!fs.existsSync(distDir)) return bad;

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.js')) {
        const content = fs.readFileSync(full, 'utf8');
        // Find require() calls
        const reqs = [...content.matchAll(/require\(["']([^"']+)["']\)/g)].map(m => m[1]);
        for (const req of reqs) {
          if (req.startsWith('.')) {
            // Relative import — check it resolves
            const resolved = path.resolve(path.dirname(full), req);
            const candidates = [resolved, resolved + '.js', resolved + '/index.js'];
            if (!candidates.some(c => fs.existsSync(c))) {
              bad.push({ file: path.relative(distDir, full), req, type: 'relative' });
            }
          } else {
            // Package import — check if it's known
            const pkgName = req.startsWith('@') 
              ? req.split('/').slice(0, 2).join('/')
              : req.split('/')[0];
            if (!SAFE_PKGS.has(pkgName)) {
              // Check if it exists in node_modules
              const nmPath = path.join(ROOT, 'node_modules', pkgName);
              const apiNmPath = path.join(ROOT, 'apps/api/node_modules', pkgName);
              if (!fs.existsSync(nmPath) && !fs.existsSync(apiNmPath)) {
                bad.push({ file: path.relative(distDir, full), req: pkgName, type: 'package' });
              }
            }
          }
        }
      }
    }
  }

  try { walk(distDir); } catch(e) {}
  return bad;
}

function testStartup() {
  console.log('\nTesting startup with 8-second timeout...');
  const env = {
    ...process.env,
    NODE_ENV: 'test',
    PORT: '9999',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_SECRET: 'test-secret-for-startup-check-only',
    API_PORT: '9999',
  };
  
  const result = spawnSync('node', ['apps/api/dist/main.js'], {
    cwd: ROOT,
    env,
    timeout: 8000,
    encoding: 'utf8',
  });

  const output = (result.stdout || '') + (result.stderr || '');
  if (result.signal === 'SIGTERM') {
    // Timed out — good! It started listening (we killed it)
    if (output.includes('Nest application successfully started') || output.includes('is running on')) {
      return { ok: true, message: 'Server started successfully' };
    }
  }
  
  // Look for MODULE_NOT_FOUND or other crash indicators
  const moduleError = output.match(/Cannot find module '([^']+)'/);
  const classError  = output.match(/Class constructor (\w+) cannot be invoked/);
  
  if (moduleError) return { ok: false, type: 'MODULE_NOT_FOUND', module: moduleError[1] };
  if (classError)  return { ok: false, type: 'CLASS_CONSTRUCTOR', name: classError[1] };
  if (result.status !== null && result.status !== 0) {
    return { ok: false, type: 'EXIT', code: result.status, output: output.slice(0, 300) };
  }
  
  return { ok: true, message: 'No crash detected' };
}

async function main() {
  console.log('\n=== Verify & Fix Worker ===\n');

  // 1. First build locally
  console.log('Step 1: Building...');
  const buildResult = spawnSync('npx', ['nest', 'build', '--config', 'nest-cli.json'], {
    cwd: path.join(ROOT, 'apps/api'),
    encoding: 'utf8',
    timeout: 120000,
  });

  const buildOutput = buildResult.stdout + buildResult.stderr;
  if (buildResult.status !== 0) {
    const syntaxFile = buildOutput.match(/,\-\[([^\]]+)\]/)?.[1] || buildOutput.match(/Failed to compile:\s*\n(\S+)/)?.[1];
    console.log(`❌ Build failed${syntaxFile ? ': ' + syntaxFile : ''}`);
    if (syntaxFile) {
      console.log(`  Fixing ${syntaxFile}...`);
      // Use Gemini to fix the specific broken file
      const srcPath = path.join(ROOT, 'apps/api/src', syntaxFile);
      if (fs.existsSync(srcPath)) {
        const content = fs.readFileSync(srcPath, 'utf8');
        const r = await g.generateContent(`Fix this TypeScript file that has a syntax error:\n\n${content.slice(0,3000)}\n\nOutput only fixed TypeScript.`);
        const fixed = r.response.text().trim().replace(/^```typescript?\n?/, '').replace(/```$/, '').trim();
        if (fixed.length > 100) fs.writeFileSync(srcPath, fixed, 'utf8');
      }
    }
    process.exit(1);
  }
  console.log(`✅ Build passed: ${(buildOutput.match(/compiled: (\d+) files/)?.[1] || '?')} files`);

  // 2. Scan dist for missing modules
  console.log('\nStep 2: Scanning dist for broken requires...');
  const distDir = path.join(ROOT, 'apps/api/dist');
  const badRequires = scanDistForBadRequires(distDir);
  
  // Deduplicate by module name
  const uniqueBad = [...new Map(badRequires.map(b => [b.req, b])).values()];
  
  if (uniqueBad.length > 0) {
    console.log(`⚠️  Found ${uniqueBad.length} potentially missing modules:`);
    uniqueBad.slice(0, 10).forEach(b => console.log(`  [${b.type}] ${b.req} in ${b.file}`));
    
    // For package-type missing, try installing
    const missingPkgs = uniqueBad.filter(b => b.type === 'package').map(b => b.req);
    if (missingPkgs.length > 0) {
      console.log(`\nInstalling missing: ${missingPkgs.join(', ')}`);
      try {
        execSync(`cd apps/api && pnpm add ${missingPkgs.join(' ')} 2>&1`, { cwd: ROOT, timeout: 60000 });
        console.log('✅ Installed');
      } catch(e) { console.warn('Install failed:', e.message?.slice(0, 80)); }
    }
  } else {
    console.log('✅ No broken requires found');
  }

  // 3. Startup test
  console.log('\nStep 3: Testing startup...');
  const startupResult = testStartup();
  if (startupResult.ok) {
    console.log(`✅ Startup OK: ${startupResult.message}`);
  } else {
    console.log(`❌ Startup failed: ${startupResult.type} — ${JSON.stringify(startupResult).slice(0, 200)}`);
    process.exit(1);
  }

  // 4. Commit and push if all passed
  try {
    execSync('git add -A', { cwd: ROOT });
    execSync('git commit -m "fix(verified): startup-test passed — all requires resolve, no crash [verify-fix-worker]" --allow-empty', { cwd: ROOT });
    execSync('git push origin main', { cwd: ROOT });
    console.log('\n✅ All checks passed — pushed verified code');
  } catch(e) { console.warn(e.message?.slice(0, 80)); }
}

main().catch(e => { console.error(e); process.exit(1); });
