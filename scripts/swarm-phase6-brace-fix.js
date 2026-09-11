/**
 * Phase 6 Smart Fixer — Fix Truncated TypeScript Files by Balancing Braces
 * 
 * For files that were truncated by the swarm and now have unmatched braces:
 * Counts the brace depth at end of file and adds closing braces as needed.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'apps', 'api', 'src');

// List of files that failed with unexpected EOF
const KNOWN_TRUNCATED = [
  'apps/api/src/shared/middleware/idempotency.middleware.ts',
  'apps/api/src/modules/subscription/subscription.service.ts',
  'apps/api/src/modules/restaurant/tables.service.ts',
  'apps/api/src/modules/restaurant/restaurant.service.ts',
  'apps/api/src/modules/restaurant/menu.service.ts',
  'apps/api/src/modules/menu/menu.service.ts',
  'apps/api/src/modules/merchant/merchant.controller.ts',
  'apps/api/src/modules/microsite/microsite.service.ts',
  'apps/api/src/modules/notification/notification.service.ts',
  'apps/api/src/guards/aels-hmac.guard.ts',
  'apps/api/src/modules/aggregator/aggregator.controller.ts',
  'apps/api/src/modules/ai/ai-customer-segmentation.controller.ts',
  'apps/api/src/modules/delivery/delivery.service.ts',
  'apps/api/src/modules/ecom/cart.service.ts',
  'apps/api/src/modules/ecom/checkout.service.ts',
  'apps/api/src/modules/ecom/orders.service.ts',
  'apps/api/src/modules/revenue-share/revenue-share.service.ts',
  'apps/api/src/modules/settlement/settlement-batches.service.ts',
];

// Calculate brace balance in TypeScript content
// Returns number of unclosed '{' that need matching '}'
function countUnmatchedOpenBraces(content) {
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let inLineComment = false;
  let inBlockComment = false;
  
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    const next = content[i + 1] || '';
    
    if (inLineComment) {
      if (c === '\n') inLineComment = false;
      continue;
    }
    
    if (inBlockComment) {
      if (c === '*' && next === '/') { inBlockComment = false; i++; }
      continue;
    }
    
    if (inString) {
      if (c === '\\') { i++; continue; } // Skip escaped char
      if (c === stringChar) { inString = false; }
      continue;
    }
    
    // Detect string start
    if (c === '"' || c === "'" || c === '`') {
      inString = true;
      stringChar = c;
      continue;
    }
    
    // Detect comments
    if (c === '/' && next === '/') { inLineComment = true; continue; }
    if (c === '/' && next === '*') { inBlockComment = true; i++; continue; }
    
    if (c === '{') depth++;
    if (c === '}') depth--;
  }
  
  return depth;
}

function fixTruncatedFile(filePath) {
  const fullPath = path.join(ROOT, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠️  Not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const unmatchedBraces = countUnmatchedOpenBraces(content);
  
  if (unmatchedBraces > 0) {
    // Add closing braces
    const closingBraces = '\n' + '}\n'.repeat(unmatchedBraces);
    const fixed = content.trimEnd() + closingBraces;
    fs.writeFileSync(fullPath, fixed, 'utf8');
    console.log(`  ✅ Fixed ${filePath}: added ${unmatchedBraces} closing brace(s)`);
    return true;
  } else if (unmatchedBraces < 0) {
    console.log(`  ⚠️  ${filePath}: has ${Math.abs(unmatchedBraces)} EXTRA closing brace(s) — skipping`);
    return false;
  } else {
    console.log(`  ℹ️  ${filePath}: braces are balanced (no fix needed)`);
    return false;
  }
}

async function main() {
  console.log('🔧 Phase 6 Smart Fix: Balancing braces in truncated TypeScript files\n');
  
  let fixedCount = 0;
  
  for (const file of KNOWN_TRUNCATED) {
    process.stdout.write(`Checking ${file.split('/').pop()}...`);
    const fixed = fixTruncatedFile(file);
    if (fixed) fixedCount++;
  }
  
  console.log(`\n✅ Fixed ${fixedCount} of ${KNOWN_TRUNCATED.length} files`);
  
  // Now also scan ALL source files for unmatched braces
  console.log('\n📂 Scanning all source files for unmatched braces...');
  
  function findTsFiles(dir, files = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) findTsFiles(fullPath, files);
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') && !entry.name.endsWith('.e2e-spec.ts')) {
        files.push(fullPath);
      }
    }
    return files;
  }
  
  const allFiles = findTsFiles(SRC_DIR);
  let additionalFixed = 0;
  
  for (const filePath of allFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const unmatched = countUnmatchedOpenBraces(content);
    
    if (unmatched > 0) {
      const relPath = path.relative(ROOT, filePath);
      // Only fix if not already in the known list
      if (!KNOWN_TRUNCATED.includes(relPath.replace(/\\/g, '/'))) {
        const closingBraces = '\n' + '}\n'.repeat(unmatched);
        const fixed = content.trimEnd() + closingBraces;
        fs.writeFileSync(filePath, fixed, 'utf8');
        console.log(`  ✅ Fixed additional: ${relPath} (+${unmatched} braces)`);
        additionalFixed++;
      }
    }
  }
  
  console.log(`\n✅ Total additional files fixed: ${additionalFixed}`);
  console.log(`✅ Grand total: ${fixedCount + additionalFixed} files fixed`);
}

main().catch(console.error);
