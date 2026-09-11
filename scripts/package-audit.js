#!/usr/bin/env node
/**
 * Package audit: find all npm packages imported in apps/api/src that are
 * missing from package.staging.json dependencies.
 */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'apps', 'api', 'src');
const stagingPkgPath = path.join(__dirname, '..', 'apps', 'api', 'package.staging.json');

const stagingPkg = JSON.parse(fs.readFileSync(stagingPkgPath, 'utf8'));
const installed = new Set([
  ...Object.keys(stagingPkg.dependencies || {}),
  ...Object.keys(stagingPkg.devDependencies || {}),
]);

const builtins = new Set([
  'fs', 'path', 'os', 'crypto', 'http', 'https', 'url', 'stream', 'events', 'util',
  'assert', 'child_process', 'net', 'tls', 'dns', 'zlib', 'buffer', 'querystring',
  'timers', 'vm', 'worker_threads', 'perf_hooks', 'readline', 'cluster', 'dgram',
  'v8', 'module', 'console', 'string_decoder', 'process', 'punycode', 'domain',
]);

const missing = {};

function scanDir(dir) {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const it of items) {
      const full = path.join(dir, it.name);
      if (it.isDirectory() && !['node_modules', 'dist', '_paysurity-database'].includes(it.name)) {
        scanDir(full);
      } else if (
        it.isFile() &&
        it.name.endsWith('.ts') &&
        !it.name.includes('.spec.') &&
        !it.name.includes('.e2e-spec.')
      ) {
        const content = fs.readFileSync(full, 'utf8');
        // Match: from 'pkg' or from '@scope/pkg'
        const regex = /from '((?:@[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+)|(?:[a-zA-Z][a-zA-Z0-9_.-]*))/g;
        let m;
        while ((m = regex.exec(content)) !== null) {
          const imp = m[1];
          const pkg = imp.startsWith('@')
            ? imp.split('/').slice(0, 2).join('/')
            : imp.split('/')[0];
          if (!pkg.startsWith('.') && !builtins.has(pkg) && !installed.has(pkg)) {
            missing[pkg] = (missing[pkg] || 0) + 1;
          }
        }
      }
    }
  } catch (e) {
    // skip unreadable dirs
  }
}

scanDir(srcDir);

const sorted = Object.entries(missing).sort((a, b) => b[1] - a[1]);
if (sorted.length === 0) {
  console.log('✅ No missing packages — all imports accounted for in package.staging.json');
} else {
  console.log(`Missing packages (${sorted.length}):`);
  sorted.forEach(([k, v]) => console.log(`  ${k} [${v}x]`));
  console.log('\nJSON for package.staging.json:');
  const asJson = {};
  sorted.forEach(([k]) => (asJson[k] = '*'));
  console.log(JSON.stringify(asJson, null, 2));
}
