#!/usr/bin/env node
/**
 * scripts/dev-start.js
 * 
 * ONE-COMMAND local dev starter for PaySurity Platform.
 * 
 * Usage:
 *   node scripts/dev-start.js           # starts all services
 *   node scripts/dev-start.js --api     # starts only API
 *   node scripts/dev-start.js --db-only # starts only PostgreSQL + Redis via Docker
 * 
 * Prerequisites:
 *   - Docker Desktop running
 *   - pnpm installed
 *   - .env.local configured
 * 
 * What it does:
 *   1. Checks for Docker and starts postgres+redis containers
 *   2. Runs database migrations
 *   3. Optionally seeds demo data
 *   4. Starts the NestJS API (port 4000 / 8080)
 *   5. Starts merchant-dashboard (port 4001) 
 *   6. Starts public-website (port 4003)
 *   7. Opens browser to the dashboard
 */
'use strict';

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(level, msg) {
  const icons = { info: '🔷', ok: '✅', warn: '⚠️', err: '❌', step: '▶️' };
  const colors = { info: COLORS.cyan, ok: COLORS.green, warn: COLORS.yellow, err: COLORS.red, step: COLORS.blue };
  console.log(`${colors[level]}${icons[level]} ${msg}${COLORS.reset}`);
}

function exec(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'inherit', cwd: ROOT, ...opts });
}

function tryExec(cmd, opts = {}) {
  try {
    return execSync(cmd, { stdio: 'pipe', cwd: ROOT, encoding: 'utf8', ...opts });
  } catch (e) {
    return null;
  }
}

// ── Docker detection ──────────────────────────────────────────────────────────
function findDocker() {
  // Common Docker Desktop paths on Windows
  const paths = [
    'docker',
    'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe',
    `${os.homedir()}\\AppData\\Local\\Docker\\wsl\\distro\\rootfs\\usr\\bin\\docker`,
  ];
  for (const p of paths) {
    const result = tryExec(`"${p}" version --format "{{.Server.Version}}" 2>&1`);
    if (result && !result.includes('error') && !result.includes('Error')) {
      return p;
    }
  }
  return null;
}

async function main() {
  console.log(`\n${COLORS.bold}${COLORS.magenta}╔═══════════════════════════════════════════════╗
║   PaySurity Platform — Local Dev Launcher    ║
║   v5.0 — 2026-03-21                         ║
╚═══════════════════════════════════════════════╝${COLORS.reset}\n`);

  const dbOnly = args.includes('--db-only');
  const apiOnly = args.includes('--api');
  const skipDocker = args.includes('--no-docker');
  const skipMigrations = args.includes('--no-migrate');
  const skipSeed = args.includes('--no-seed');

  // ── Step 1: Docker ──────────────────────────────────────────────────────
  if (!skipDocker) {
    log('step', 'Starting Docker containers (PostgreSQL + Redis)...');
    const docker = findDocker();
    if (!docker) {
      log('warn', 'Docker not found on PATH. Please:');
      log('warn', '  1. Make sure Docker Desktop is running');
      log('warn', '  2. Restart your terminal after Docker Desktop starts');
      log('warn', '  Alternatively run: node scripts/dev-start.js --no-docker');
      log('info', 'Proceeding without Docker (assuming DB is already running)...');
    } else {
      try {
        execSync(`"${docker}" compose up -d db redis`, { 
          stdio: 'inherit', cwd: ROOT 
        });
        log('ok', 'PostgreSQL (port 5436) + Redis (port 6381) started');
        
        // Wait for postgres to be healthy
        log('info', 'Waiting for PostgreSQL to be ready...');
        for (let i = 0; i < 30; i++) {
          const h = tryExec(`"${docker}" compose exec -T db pg_isready -U paysurity -d paysurity_dev 2>&1`);
          if (h && h.includes('accepting connections')) {
            log('ok', 'PostgreSQL is ready!');
            break;
          }
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (e) {
        log('warn', `Docker compose failed: ${e.message?.slice(0, 80)}`);
        log('info', 'Continuing (assuming DB already running)...');
      }
    }
  }

  if (dbOnly) {
    log('ok', 'DB-only mode. Exiting. Run API separately with: pnpm --filter=@paysurity/api run start:dev');
    return;
  }

  // ── Step 2: Database Migrations ────────────────────────────────────────
  if (!skipMigrations) {
    log('step', 'Running database migrations...');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://paysurity:paysurity_local_2026@localhost:5436/paysurity_dev';
    const migDir = path.join(ROOT, 'packages', 'database', 'migrations');
    
    if (fs.existsSync(migDir)) {
      // Get all migration files, sorted
      const migFiles = fs.readdirSync(migDir)
        .filter(f => f.endsWith('.sql') && !f.startsWith('meta'))
        .sort();
      
      log('info', `Found ${migFiles.length} migration files to apply...`);
      
      // Try to apply via psql if available
      const psql = tryExec('psql --version 2>&1');
      if (psql) {
        for (const mig of migFiles) {
          const migPath = path.join(migDir, mig);
          const result = tryExec(`psql "${dbUrl}" -f "${migPath}" 2>&1`);
          if (result !== null) {
            log('ok', `Migration applied: ${mig}`);
          } else {
            log('warn', `Migration may have failed: ${mig} (may already be applied)`);
          }
        }
      } else {
        log('warn', 'psql not found. To apply migrations manually:');
        log('warn', `  psql "${dbUrl}" -f packages/database/migrations/021_ai_notifications.sql`);
        log('info', 'Using node-postgres to apply migrations...');
        try {
          // Try using the existing @paysurity/database drizzle config
          execSync('pnpm --filter=@paysurity/database run migrate 2>&1', { stdio: 'inherit', cwd: ROOT });
          log('ok', 'Drizzle migrations applied');
        } catch {
          log('warn', 'Drizzle migrate failed — DB may not be running yet. Start API anyway.');
        }
      }
    }
  }

  // ── Step 3: Seed (optional) ────────────────────────────────────────────
  if (!skipSeed) {
    log('info', 'Skipping seed data (run manually with: node packages/database/seed-complete.js)');
  }

  // ── Step 4: Start services ─────────────────────────────────────────────
  log('step', 'Starting PaySurity services...');

  const services = [];

  // API
  log('info', '▶ Starting API on port 4000 (or PORT env)...');
  const api = spawn('pnpm', ['--filter=@paysurity/api', 'run', 'start:dev'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: '4000' },
  });
  services.push({ name: 'API', proc: api });

  if (!apiOnly) {
    // Merchant Dashboard
    await new Promise(r => setTimeout(r, 3000)); // wait a bit for API to start
    log('info', '▶ Starting Merchant Dashboard on port 4001...');
    const dash = spawn('pnpm', ['--filter=@paysurity/merchant-dashboard', 'run', 'dev'], {
      cwd: ROOT, stdio: 'inherit', shell: true,
    });
    services.push({ name: 'Dashboard', proc: dash });

    // Public Website
    log('info', '▶ Starting Public Website on port 4003...');
    const website = spawn('pnpm', ['--filter=@paysurity/web', 'run', 'dev'], {
      cwd: ROOT, stdio: 'inherit', shell: true,
    });
    services.push({ name: 'PublicWebsite', proc: website });
  }

  console.log(`\n${COLORS.green}${COLORS.bold}
╔═══════════════════════════════════════════════╗
║  PaySurity Platform Running!                  ║
╠═══════════════════════════════════════════════╣
║  🚀 API:           http://localhost:4000      ║
║  📚 Swagger:       http://localhost:4000/api/docs  ║
║  ❤️  Health:       http://localhost:4000/health    ║
║  📊 Dashboard:     http://localhost:4001      ║
║  🌐 Public Site:   http://localhost:4003      ║
║  🗄️  DB:           localhost:5436            ║
║  🔴 Redis:         localhost:6381             ║
╚═══════════════════════════════════════════════╝
  CTRL+C to stop all services${COLORS.reset}`);

  // Handle exit
  process.on('SIGINT', () => {
    log('info', 'Shutting down all services...');
    services.forEach(s => {
      try { s.proc.kill('SIGTERM'); } catch {}
    });
    process.exit(0);
  });

  // Wait for all processes
  await Promise.all(services.map(s => new Promise(resolve => {
    s.proc.on('exit', resolve);
    s.proc.on('error', resolve);
  })));
}

main().catch(e => {
  log('err', `Fatal: ${e.message}`);
  process.exit(1);
});
