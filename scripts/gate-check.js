#!/usr/bin/env node

import { spawnSync } from 'child_process';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

// --- Configuration ---
const STAGING_URL = process.env.STAGING_URL || 'http://localhost:3000'; // Default for local testing if not set
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SENDGRID_API_KEY',
  'STAGING_URL', // Ensure STAGING_URL itself is considered
];

// --- Helper Functions ---

interface CommandResult {
  success: boolean;
  message: string;
}

/**
 * Executes a shell command and returns its success status and message.
 * Outputs command's stdio directly to console.
 */
function execCommand(command: string, args: string[], description: string): CommandResult {
  console.log(`\n--- Running: ${description} (${command} ${args.join(' ')}) ---`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true }); // 'inherit' pipes stdio
  if (result.status === 0) {
    console.log(`--- ${description} SUCCEEDED ---`);
    return { success: true, message: `${description} succeeded.` };
  } else {
    const errorMessage = result.error ? result.error.message : `Command exited with code ${result.status}`;
    console.error(`--- ${description} FAILED: ${errorMessage} ---`);
    return { success: false, message: `${description} failed: ${errorMessage}` };
  }
}

interface HttpGetResult {
  statusCode: number | undefined;
  body: string;
  error: Error | undefined;
}

/**
 * Performs an HTTP/HTTPS GET request and returns the status code, body, and any error.
 * Handles both http:// and https:// protocols.
 */
async function httpGet(targetUrl: string): Promise<HttpGetResult> {
  const parsedUrl = new URL(targetUrl);
  const protocolModule = parsedUrl.protocol === 'https:' ? https : (parsedUrl.protocol === 'http:' ? http : null);

  if (!protocolModule) {
    return { statusCode: undefined, body: '', error: new Error(`Unsupported protocol: ${parsedUrl.protocol}`) };
  }

  const options: https.RequestOptions = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname + parsedUrl.search,
    method: 'GET',
    rejectUnauthorized: false, // Important for staging environments that might use self-signed certificates
  };

  return new Promise((resolve) => {
    const req = protocolModule.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data, error: undefined });
      });
    });

    req.on('error', (e: Error) => {
      resolve({ statusCode: undefined, body: '', error: e });
    });
  });
}

// --- Gate Functions ---

async function gate1_nestBuild(): Promise<CommandResult> {
  return execCommand('npm', ['run', 'build'], 'GATE 1: NestJS Build');
}

async function gate2_sweepBannedImports(): Promise<CommandResult> {
  return execCommand('node', ['scripts/sweep-banned-imports.js'], 'GATE 2: Banned Imports Check');
}

async function gate3_verifyStagingSeedData(): Promise<CommandResult> {
  return execCommand('node', ['scripts/verify-staging.js'], 'GATE 3: DB Seed Data Verification');
}

async function gate4_healthCheck(): Promise<CommandResult> {
  console.log(`\n--- Running: GATE 4: Health Check (${STAGING_URL}/health) ---`);
  try {
    const result = await httpGet(`${STAGING_URL}/health`);
    if (result.error) {
      const msg = `Health Check failed: ${result.error.message}`;
      console.error(`--- GATE 4: Health Check FAILED: ${msg} ---`);
      return { success: false, message: msg };
    }
    if (result.statusCode !== 200) {
      const msg = `Health Check failed: HTTP Status ${result.statusCode}`;
      console.error(`--- GATE 4: Health Check FAILED: ${msg} ---`);
      return { success: false, message: msg };
    }
    const jsonBody = JSON.parse(result.body);
    if (jsonBody.status === 'ok') {
      console.log(`--- GATE 4: Health Check SUCCEEDED ---`);
      return { success: true, message: 'Health Check returned {"status":"ok"}' };
    } else {
      const msg = `Health Check returned unexpected status: ${result.body}`;
      console.error(`--- GATE 4: Health Check FAILED: ${msg} ---`);
      return { success: false, message: msg };
    }
  } catch (e: any) {
    const msg = `Health Check failed due to parsing or network error: ${e.message}`;
    console.error(`--- GATE 4: Health Check FAILED: ${msg} ---`);
    return { success: false, message: msg };
  }
}

async function gate5_apiDocs(): Promise<CommandResult> {
  console.log(`\n--- Running: GATE 5: API Docs Check (${STAGING_URL}/api/docs) ---`);
  try {
    const result = await httpGet(`${STAGING_URL}/api/docs`);
    if (result.error) {
      const msg = `API Docs Check failed: ${result.error.message}`;
      console.error(`--- GATE 5: API Docs Check FAILED: ${msg} ---`);
      return { success: false, message: msg };
    }
    if (result.statusCode === 200) {
      console.log(`--- GATE 5: API Docs Check SUCCEEDED ---`);
      return { success: true, message: 'API Docs returned HTTP 200' };
    } else {
      const msg = `API Docs Check failed: HTTP Status ${result.statusCode}`;
      console.error(`--- GATE 5: API Docs Check FAILED: ${msg} ---`);
      return { success: false, message: msg };
    }
  } catch (e: any) {
    const msg = `API Docs Check failed due to network error: ${e.message}`;
    console.error(`--- GATE 5: API Docs Check FAILED: ${msg} ---`);
    return { success: false, message: msg };
  }
}

async function gate6_smokeTest(): Promise<CommandResult> {
  return execCommand('node', ['scripts/smoke-test.js'], 'GATE 6: Smoke Test');
}

async function gate7_envVars(): Promise<CommandResult> {
  console.log(`\n--- Running: GATE 7: Environment Variables Check ---`);
  let allPresent = true;
  const missingVars: string[] = [];
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      console.error(`- Environment variable ${varName} is NOT set.`);
      missingVars.push(varName);
      allPresent = false;
    } else {
      console.log(`- Environment variable ${varName} is set.`);
    }
  }

  if (allPresent) {
    console.log(`--- GATE 7: Environment Variables Check SUCCEEDED ---`);
    return { success: true, message: 'All required environment variables are set.' };
  } else {
    const message = `Missing environment variables: ${missingVars.join(', ')}`;
    console.error(`--- GATE 7: Environment Variables Check FAILED: ${message} ---`);
    return { success: false, message: message };
  }
}

// --- Main Runner ---

async function runGateChecks() {
  console.log(`\n=== PaySurity Staging Readiness Checker ===`);
  console.log(`Targeting STAGING_URL: ${STAGING_URL}`);

  const results: { gate: string; status: 'PASS' | 'FAIL'; message: string }[] = [];
  let overallReady = true;

  const gates = [
    { name: 'GATE 1: Nest Build', func: gate1_nestBuild },
    { name: 'GATE 2: Banned Imports', func: gate2_sweepBannedImports },
    { name: 'GATE 3: DB Seed Data', func: gate3_verifyStagingSeedData },
    { name: 'GATE 4: Health Check', func: gate4_healthCheck },
    { name: 'GATE 5: API Docs', func: gate5_apiDocs },
    { name: 'GATE 6: Smoke Test', func: gate6_smokeTest },
    { name: 'GATE 7: Env Vars', func: gate7_envVars },
  ];

  for (const gate of gates) {
    const result = await gate.func();
    const status = result.success ? 'PASS' : 'FAIL';
    results.push({ gate: gate.name, status, message: result.message });
    if (!result.success) {
      overallReady = false;
    }
  }

  console.log(`\n=== Gated Report ===`);
  for (const res of results) {
    const color = res.status === 'PASS' ? '\x1b[32m' : '\x1b[31m'; // Green for PASS, Red for FAIL
    const resetColor = '\x1b[0m'; // Reset color
    console.log(`${res.gate}: ${color}${res.status}${resetColor} - ${res.message}`);
  }

  console.log(`\n=== Overall Staging Readiness ===`);
  if (overallReady) {
    console.log('\x1b[32mSTAGING READY\x1b[0m');
    process.exit(0);
  } else {
    console.log('\x1b[31mSTAGING NOT READY\x1b[0m');
    process.exit(1);
  }
}

// Execute the gate checks
runGateChecks();