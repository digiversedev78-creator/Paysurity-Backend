import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { Pool } from 'pg'; // Direct PG client for database access in this runner script

// --- Interfaces ---
interface GateResult {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  durationMs: number;
}

interface Report {
  timestamp: string;
  gates: GateResult[];
  overallStatus: 'READY' | 'NOT_READY';
  readinessPercent: number;
}

interface Gate {
  id: string;
  name: string;
  run: () => Promise<{ status: 'PASS' | 'FAIL' | 'SKIP'; message: string }>;
}

// --- Helper Functions ---
/**
 * Executes a shell command and returns its stdout, stderr, and exit code.
 * @param command The command to execute.
 * @returns A promise resolving to an object with stdout, stderr, and exitCode.
 */
function runCommand(command: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    exec(command, { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => { // Increased buffer for potentially large build outputs
      resolve({ stdout, stderr, exitCode: error ? error.code || 1 : 0 });
    });
  });
}

/**
 * Fetches a URL and checks its status.
 * @param url The URL to fetch.
 * @param method The HTTP method (default: GET).
 * @param expectedStatus The expected HTTP status code (default: 200).
 * @returns A promise resolving to an object indicating PASS/FAIL and a message.
 */
async function fetchUrl(url: string, method: string = 'GET', expectedStatus: number = 200): Promise<{ status: 'PASS' | 'FAIL'; message: string }> {
  try {
    const response = await fetch(url, { method });
    if (response.status === expectedStatus) {
      return { status: 'PASS', message: `Successfully reached ${url} with status ${response.status}.` };
    } else {
      return { status: 'FAIL', message: `Failed to reach ${url}. Expected status ${expectedStatus}, got ${response.status}. Response body: ${await response.text().catch(() => 'N/A')}` };
    }
  } catch (error: any) {
    return { status: 'FAIL', message: `Error fetching ${url}: ${error.message}` };
  }
}

// Determine the base URL for HTTP checks
function getAppBaseUrl(): string {
  return process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
}

// --- Gates Definitions ---

// 1. Application Build Gate
const buildGate: Gate = {
  id: 'build',
  name: 'Application Build',
  run: async () => {
    console.log('  Running `npm run build`...');
    const { stdout, stderr, exitCode } = await runCommand('npm run build');
    if (exitCode === 0) {
      return { status: 'PASS', message: 'Application built successfully.' };
    } else {
      return { status: 'FAIL', message: `Build failed with exit code ${exitCode}:\n${stderr || stdout}` };
    }
  },
};

// 2. Banned Imports Check Gate
const bannedImportsGate: Gate = {
  id: 'banned-imports',
  name: 'Banned Imports Check',
  run: async () => {
    const bannedPatterns = [
      '@paysurity/database',
      '@paysurity/auth',
      '@nestjs-drizzle/core',
    ];
    const distPath = path.join(process.cwd(), 'dist'); // Assuming compiled output is in 'dist'
    if (!fs.existsSync(distPath)) {
      return { status: 'SKIP', message: `Dist directory not found at ${distPath}. Build step might have failed or not run.` };
    }

    let failedImports: string[] = [];

    const checkFileForBannedImports = (filePath: string) => {
      const content = fs.readFileSync(filePath, 'utf-8');
      for (const pattern of bannedPatterns) {
        if (content.includes(pattern)) {
          failedImports.push(`- ${filePath} contains '${pattern}'`);
        }
      }
    };

    const walkDir = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (filePath.endsWith('.js') || filePath.endsWith('.d.ts') || filePath.endsWith('.map')) {
          checkFileForBannedImports(filePath);
        }
      }
    };

    walkDir(distPath);

    if (failedImports.length === 0) {
      return { status: 'PASS', message: 'No banned imports found in compiled output.' };
    } else {
      return { status: 'FAIL', message: `Found banned imports in compiled files:\n${failedImports.join('\n')}` };
    }
  },
};

// 3. Environment Variables Check Gate
const envVarsGate: Gate = {
  id: 'env-vars',
  name: 'Environment Variables Check',
  run: async () => {
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'NODE_ENV',
      'PORT', // Essential for the application to run
      // Add other critical environment variables as needed, e.g., 'STRIPE_SECRET_KEY'
    ];
    const missingVars: string[] = [];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    }

    if (missingVars.length === 0) {
      return { status: 'PASS', message: 'All required environment variables are set.' };
    } else {
      return { status: 'FAIL', message: `Missing environment variables: ${missingVars.join(', ')}` };
    }
  },
};

// 4. Database Seed Check Gate
const dbSeedGate: Gate = {
  id: 'db-seed',
  name: 'Database Seed Check',
  run: async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return { status: 'SKIP', message: 'DATABASE_URL not set, skipping DB seed check.' };
    }

    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Adjust SSL for production deployments
    });

    try {
      // Check for the existence of an essential table (e.g., 'configs') and a specific seed marker.
      // This assumes 'configs' table is part of initial migrations/seeding and holds a 'initial_setup_complete' key.
      const tableExistsResult = await pool.query(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = current_schema()
          AND table_name = 'configs'
        ) AS table_exists;
      `);

      const tableExists = tableExistsResult.rows[0].table_exists;

      if (!tableExists) {
        return { status: 'FAIL', message: 'Table "configs" does not exist, implying database not migrated or seeded.' };
      }

      const seedCheckResult = await pool.query(`SELECT COUNT(*) FROM configs WHERE key = 'initial_setup_complete';`);
      if (seedCheckResult.rows[0].count > 0) {
        return { status: 'PASS', message: 'Database appears to be seeded (initial_setup_complete config found).' };
      } else {
        return { status: 'FAIL', message: 'Database not fully seeded (initial_setup_complete config not found in "configs" table).' };
      }
    } catch (error: any) {
      return { status: 'FAIL', message: `Database connection or seed check failed: ${error.message}` };
    } finally {
      await pool.end();
    }
  },
};

// 5. Health Endpoint Check Gate
const healthEndpointGate: Gate = {
  id: 'health-endpoint',
  name: 'Health Endpoint Check',
  run: async () => {
    const appBaseUrl = getAppBaseUrl();
    return fetchUrl(`${appBaseUrl}/health`);
  },
};

// 6. Smoke Test Gate
const smokeTestGate: Gate = {
  id: 'smoke-test',
  name: 'Smoke Test',
  run: async () => {
    const appBaseUrl = getAppBaseUrl();
    // A basic smoke test: hit a public API endpoint to confirm application responsiveness
    // and basic routing. For example, a version endpoint or a simple status endpoint.
    // Replace with a more specific endpoint if your app has one (e.g., /api/v1/status).
    const result = await fetchUrl(`${appBaseUrl}/api/v1/status`); // Assuming /api/v1/status exists
    if (result.status === 'PASS') {
      return { status: 'PASS', message: 'Basic API smoke test passed (GET /api/v1/status).' };
    } else {
      return { status: 'FAIL', message: `Smoke test failed: ${result.message}` };
    }
  },
};

// 7. Swagger Docs Endpoint Check Gate
const swaggerDocsGate: Gate = {
  id: 'swagger-docs',
  name: 'Swagger Docs Endpoint Check',
  run: async () => {
    const appBaseUrl = getAppBaseUrl();
    // Common paths for Swagger/OpenAPI documentation
    const swaggerPaths = ['/api-docs', '/swagger', '/docs'];
    for (const p of swaggerPaths) {
      const result = await fetchUrl(`${appBaseUrl}${p}`);
      if (result.status === 'PASS') {
        // Also check if content type is HTML, typical for Swagger UI
        const response = await fetch(`${appBaseUrl}${p}`);
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('text/html')) {
          return { status: 'PASS', message: `Swagger documentation endpoint accessible at ${appBaseUrl}${p}.` };
        } else {
          return { status: 'FAIL', message: `Swagger docs endpoint at ${appBaseUrl}${p} returned status ${response.status} but not HTML content-type (${contentType}).` };
        }
      }
    }
    return { status: 'FAIL', message: `Swagger documentation endpoint not found at common paths: ${swaggerPaths.join(', ')}.` };
  },
};

const allGates: Gate[] = [
  buildGate,
  bannedImportsGate,
  envVarsGate,
  dbSeedGate,
  healthEndpointGate,
  smokeTestGate,
  swaggerDocsGate,
];

// --- Main Runner Logic ---
async function runChecklist() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const results: GateResult[] = [];
  let passedGates = 0;
  let totalRunnableGates = 0;

  console.log('\n--- PaySurity Launch Readiness Checklist ---\n');

  for (const gate of allGates) {
    const startTime = process.hrtime.bigint();
    let status: 'PASS' | 'FAIL' | 'SKIP' = 'FAIL';
    let message: string = 'Unhandled error during gate execution.';

    try {
      const gateResult = await gate.run();
      status = gateResult.status;
      message = gateResult.message;
    } catch (error: any) {
      status = 'FAIL';
      message = `Runtime error in gate '${gate.name}': ${error.message}`;
    }

    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000; // Convert nanoseconds to milliseconds

    results.push({
      id: gate.id,
      name: gate.name,
      status,
      message,
      durationMs: parseFloat(durationMs.toFixed(2)),
    });

    if (status !== 'SKIP') {
      totalRunnableGates++;
      if (status === 'PASS') {
        passedGates++;
      }
    }

    // Live output to stdout
    const statusColor = status === 'PASS' ? '\x1b[32m' : status === 'FAIL' ? '\x1b[31m' : '\x1b[33m'; // Green, Red, Yellow
    const resetColor = '\x1b[0m';
    console.log(`${statusColor}[${status.padEnd(4)}]${resetColor} ${gate.name.padEnd(30)} - ${message.split('\n')[0]} (${durationMs.toFixed(2)}ms)`);
  }

  const readinessPercent = totalRunnableGates === 0 ? 0 : (passedGates / totalRunnableGates) * 100;
  const overallStatus = readinessPercent === 100 && totalRunnableGates === allGates.length ? 'READY' : 'NOT_READY';

  const report: Report = {
    timestamp,
    gates: results,
    overallStatus,
    readinessPercent: parseFloat(readinessPercent.toFixed(2)),
  };

  // --- Write JSON report ---
  const reportDir = path.join(process.cwd(), 'docs', 'status');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  const reportFileName = `launch-readiness-${timestamp}.json`;
  const reportFilePath = path.join(reportDir, reportFileName);
  fs.writeFileSync(reportFilePath, JSON.stringify(report, null, 2), 'utf-8');

  // --- Print pretty table to stdout ---
  console.log('\n--- Summary ---');
  console.log('---------------------------------------------------------------------------------------------------------------------------------');
  console.log(`${'STATUS'.padEnd(7)} ${'GATE NAME'.padEnd(30)} ${'MESSAGE'.padEnd(70)} ${'DURATION'.padEnd(10)}`);
  console.log('---------------------------------------------------------------------------------------------------------------------------------');
  results.forEach(res => {
    const statusColor = res.status === 'PASS' ? '\x1b[32m' : res.status === 'FAIL' ? '\x1b[31m' : '\x1b[33m';
    const resetColor = '\x1b[0m';
    const messageShort = res.message.split('\n')[0].substring(0, 67) + (res.message.split('\n')[0].length > 67 ? '...' : '');
    console.log(`${statusColor}${res.status.padEnd(7)}${resetColor} ${res.name.padEnd(30)} ${messageShort.padEnd(70)} ${`${res.durationMs.toFixed(2)}ms`.padEnd(10)}`);
  });
  console.log('---------------------------------------------------------------------------------------------------------------------------------');
  console.log(`Overall Status: ${overallStatus === 'READY' ? '\x1b[32mREADY\x1b[0m' : '\x1b[31mNOT_READY\x1b[0m'} (Readiness: ${readinessPercent.toFixed(2)}% - ${passedGates}/${totalRunnableGates} gates passed)`);
  console.log(`Report saved to: ${reportFilePath}`);
  console.log('---------------------------------------------------------------------------------------------------------------------------------');

  if (overallStatus === 'NOT_READY') {
    process.exit(1); // Indicate failure for CI/CD environments
  }
}

// Execute the checklist runner
runChecklist();