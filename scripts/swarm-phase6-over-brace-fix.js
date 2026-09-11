/**
 * Fix files with OVER-FIXED brace surplus (negative balance)
 * Strips trailing } until balance = 0
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'apps', 'api', 'src');

function countBraceBalance(content) {
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let inLineComment = false;
  let inBlockComment = false;
  
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    const next = content[i + 1] || '';
    
    if (inLineComment) { if (c === '\n') inLineComment = false; continue; }
    if (inBlockComment) { if (c === '*' && next === '/') { inBlockComment = false; i++; } continue; }
    if (inString) { if (c === '\\') { i++; continue; } if (c === stringChar) inString = false; continue; }
    if (c === '"' || c === "'" || c === '`') { inString = true; stringChar = c; continue; }
    if (c === '/' && next === '/') { inLineComment = true; continue; }
    if (c === '/' && next === '*') { inBlockComment = true; i++; continue; }
    if (c === '{') depth++;
    if (c === '}') depth--;
  }
  return depth;
}

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

function fixOverFixed(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const balance = countBraceBalance(content);
  
  if (balance < 0) {
    // Too many closing braces - strip them from end
    const lines = content.split('\n');
    let fixedLines = [...lines];
    let currentBalance = balance;
    
    // Work backwards through trailing } lines and remove extras
    for (let i = fixedLines.length - 1; i >= 0 && currentBalance < 0; i--) {
      const line = fixedLines[i].trim();
      if (line === '}') {
        fixedLines.splice(i, 1);
        currentBalance++;
      } else if (line === '') {
        // Skip empty lines
      } else {
        break; // Stop at first non-empty, non-} line
      }
    }
    
    const fixed = fixedLines.join('\n').trimEnd() + '\n';
    fs.writeFileSync(filePath, fixed, 'utf8');
    return Math.abs(balance);
  }
  return 0;
}

async function main() {
  console.log('🔧 Fixing over-fixed files (negative brace balance)\n');
  const files = findTsFiles(SRC_DIR);
  let fixedCount = 0;
  
  for (const file of files) {
    try {
      const removed = fixOverFixed(file);
      if (removed > 0) {
        console.log(`✅ ${path.relative(ROOT, file)}: removed ${removed} excess }`);
        fixedCount++;
      }
    } catch (e) {
      console.log(`⚠️  Error on ${path.relative(ROOT, file)}: ${e.message}`);
    }
  }
  
  console.log(`\n✅ Fixed ${fixedCount} over-fixed files`);
}

main().catch(console.error);
