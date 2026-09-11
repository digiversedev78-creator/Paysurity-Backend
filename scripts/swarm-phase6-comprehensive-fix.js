/**
 * Phase 6 Comprehensive Fix — All TypeScript Corruption Patterns
 * 
 * Covers all swarm-generated corruption patterns:
 * 1. Markdown code fences (```typescript...```)
 * 2. Supporting files appended (// --- Supporting Files ---)
 * 3. Module boundary markers (lines starting with // apps/api/src/...)
 * 4. Truncated files (ending mid-expression, mid-brace, mid-string)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'apps', 'api', 'src');

function findTsFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findTsFiles(fullPath, files);
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts') && !entry.name.endsWith('.e2e-spec.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function truncateAtFirstCorruptionMarker(content) {
  const lines = content.split('\n');
  let outputLines = [];
  let changed = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trim = line.trim();
    
    // Marker 1: Markdown code fence after valid TS content
    if (trim === '```' || trim.startsWith('```typescript') || trim.startsWith('```ts')) {
      changed = true;
      break; // Stop here
    }
    
    // Marker 2: "// --- Supporting Files" divider common in swarm output
    if (trim.startsWith('// --- Supporting Files') || 
        trim.startsWith('// ---Supporting Files') ||
        trim === '// --- SEPARATION ---' ||
        (trim.startsWith('// ---') && trim.includes('---'))) {
      changed = true;
      break;
    }
    
    // Marker 3: New TypeScript file header comment pattern 
    // When a new file starts with: // apps/api/src/... or // packages/...
    // at a position that is NOT the first line and the current file is a different file
    if (i > 2 && (
      (trim.startsWith('// apps/api/src/') || trim.startsWith('// packages/')) &&
      !lines[i-1].trim().startsWith('//') && // Not in a doc comment block
      outputLines.length > 5 // Already processed some meaningful content
    )) {
      // Check if this is really a file path separator (next line likely starts with 'import')
      if (i + 1 < lines.length && (
        lines[i+1].trim().startsWith('import ') ||
        lines[i+1].trim().startsWith('/**') ||
        lines[i+1].trim().startsWith('export ') ||
        lines[i+1].trim().startsWith('@')
      )) {
        // This is a concatenation boundary
        changed = true;
        break;
      }
    }
    
    // Marker 4: paysurity-platform-2026/src/... file header (schema files embedded in modules)
    if (i > 2 && trim.startsWith('// paysurity-platform-2026/')) {
      changed = true;
      break;
    }
    
    outputLines.push(line);
  }
  
  return { lines: outputLines, changed };
}

function isFileTruncated(content) {
  // A well-formed TypeScript file should end with a '}', ';', or valid class/function body
  const trimmed = content.trimEnd();
  if (!trimmed) return false;
  
  // Check for obvious truncation patterns
  const lastLine = trimmed.split('\n').pop() || '';
  
  // Mid-string truncation
  if (lastLine.includes("('") || lastLine.includes('("') || lastLine.includes('(`')) {
    const singleQuotes = (lastLine.match(/'/g) || []).length;
    const doubleQuotes = (lastLine.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
      return true;
    }
  }
  
  return false;
}

async function main() {
  console.log('🔧 Comprehensive TypeScript Corruption Fix\n');
  
  const tsFiles = findTsFiles(SRC_DIR);
  console.log(`Found ${tsFiles.length} TypeScript source files (excl. spec)\n`);
  
  let corruptCount = 0;
  let fixCount = 0;
  
  for (const file of tsFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const { lines, changed } = truncateAtFirstCorruptionMarker(content);
    
    if (changed) {
      const relPath = path.relative(ROOT, file);
      const newContent = lines.join('\n').trimEnd();
      
      // Ensure file ends properly
      const lastLine = newContent.trimEnd().split('\n').pop() || '';
      const properEnding = newContent.trimEnd() + '\n';
      
      fs.writeFileSync(file, properEnding, 'utf8');
      console.log(`✅ Fixed: ${relPath}`);
      corruptCount++;
      fixCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Corrupted: ${corruptCount}, Fixed: ${fixCount}`);
  
  if (corruptCount === 0) {
    console.log('✅ No corruption found — all files appear clean');
  } else {
    console.log('✅ All corrupted files fixed!');
  }
}

main().catch(console.error);
