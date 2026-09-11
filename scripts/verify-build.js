#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.join(__dirname, '..', 'dist'); // Assumes scripts/verify-build.js is in project root/scripts
const EXPECTED_FILES = [
  'main.js',
  'app.module.js',
  'pay-factor.controller.js',
  'restaurant.controller.js',
  'wallet.controller.js',
];
const FORBIDDEN_IMPORT_STRING = '@paysurity/auth';

let exitCode = 0;

function log(message) {
  console.log(`[PaySurity Build Verify] ${message}`);
}

function error(message) {
  console.error(`[PaySurity Build Verify] Error: ${message}`);
  exitCode = 1;
}

async function verifyBuild() {
  log('Starting build verification...');

  // Step 1: Run nest build
  log('Running `nest build`...');
  try {
    execSync('nest build', { stdio: 'inherit' });
    log('`nest build` completed successfully.');
  } catch (err) {
    error(`'nest build' failed. Check build logs above.`);
    process.exit(exitCode);
  }

  // Step 2: Check if dist/ directory exists
  if (!fs.existsSync(DIST_DIR)) {
    error(`'${DIST_DIR}' directory not found after build.`);
    process.exit(exitCode);
  }
  log(`'${DIST_DIR}' directory found.`);

  // Step 3: Check dist/ for expected files
  log(`Verifying expected files in '${DIST_DIR}'...`);
  for (const file of EXPECTED_FILES) {
    const filePath = path.join(DIST_DIR, file);
    if (!fs.existsSync(filePath)) {
      error(`Missing expected file: '${file}'`);
    } else {
      log(`Found expected file: '${file}'`);
    }
  }

  // Step 4: Validate no @paysurity/auth imports in dist
  log(`Scanning for forbidden imports ('${FORBIDDEN_IMPORT_STRING}') in '${DIST_DIR}'...`);
  const jsFiles = fs.readdirSync(DIST_DIR).filter(file => file.endsWith('.js'));
  let forbiddenImportFound = false;

  for (const file of jsFiles) {
    const filePath = path.join(DIST_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(FORBIDDEN_IMPORT_STRING)) {
        error(`Forbidden import '${FORBIDDEN_IMPORT_STRING}' found in '${file}'`);
        forbiddenImportFound = true;
      }
    } catch (err) {
      error(`Could not read file '${file}': ${err.message}`);
    }
  }

  if (!forbiddenImportFound) {
    log(`No forbidden imports ('${FORBIDDEN_IMPORT_STRING}') found.`);
  }

  // Step 5: Report file count
  log(`Total .js files found in '${DIST_DIR}': ${jsFiles.length}`);

  // Final report
  if (exitCode === 0) {
    log('Build verification passed!');
  } else {
    error('Build verification failed!');
  }

  process.exit(exitCode);
}

verifyBuild();