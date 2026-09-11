/**
 * Phase 6 Swarm — Fix Markdown Code Fence Corruption in TypeScript Source Files
 * 
 * The Phase 4/5 swarm concatenated multiple TypeScript files with markdown
 * code fences (```typescript ... ```) in swarm output. These need to be
 * stripped and split into separate files.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'apps', 'api', 'src');

// Find all .ts files
function findTsFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findTsFiles(fullPath, files);
    } else if (entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Check if file contains markdown code fences
function hasCodeFenceCorruption(content) {
  return content.includes('```') || content.includes('```typescript') || content.includes('```ts');
}

// Fix a file by:
// 1. If it has ``` fences: truncate at first ``` and save
// 2. Also write any embedded files found after the fences
function fixFile(filePath, content) {
  const lines = content.split('\n');
  let outputLines = [];
  let foundFence = false;
  let embeddedFiles = [];
  
  // Track if we're in an embedded file context
  let currentEmbeddedPath = null;
  let currentEmbeddedLines = [];
  let inCodeBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect start of embedded file code block: ```typescript or ```ts
    if (!foundFence && (line.trim() === '```' || line.trim().startsWith('```typescript') || line.trim().startsWith('```ts'))) {
      // The valid TS content ends here
      foundFence = true;
      
      // Check if the previous "comment" line indicates a file path
      if (i > 0 && (lines[i-1].trim().startsWith('// apps/') || lines[i-1].trim().startsWith('// packages/'))) {
        currentEmbeddedPath = lines[i-1].trim().replace('// ', '').trim();
        outputLines.pop(); // Remove the comment line from the current file
      }
      inCodeBlock = true;
      continue;
    }
    
    if (!foundFence) {
      outputLines.push(line);
    } else {
      // Inside an embedded code block
      if (line.trim() === '```') {
        // End of code block
        if (currentEmbeddedPath && currentEmbeddedLines.length > 0) {
          embeddedFiles.push({ path: currentEmbeddedPath, content: currentEmbeddedLines.join('\n') });
        }
        currentEmbeddedPath = null;
        currentEmbeddedLines = [];
        inCodeBlock = false;
      } else if (inCodeBlock) {
        // Check for next file header inside the block
        if ((line.trim().startsWith('// apps/') || line.trim().startsWith('// packages/')) && 
            i + 1 < lines.length && (lines[i+1].trim() === '```typescript' || lines[i+1].trim() === '```ts' || lines[i+1].trim() === '```')) {
          // Save current embedded file if any
          if (currentEmbeddedPath && currentEmbeddedLines.length > 0) {
            embeddedFiles.push({ path: currentEmbeddedPath, content: currentEmbeddedLines.join('\n') });
          }
          currentEmbeddedPath = line.trim().replace('// ', '').trim();
          currentEmbeddedLines = [];
        } else {
          currentEmbeddedLines.push(line);
        }
      } else {
        // Between code blocks — check for next file header
        if (line.trim().startsWith('// apps/') || line.trim().startsWith('// packages/')) {
          currentEmbeddedPath = line.trim().replace('// ', '').trim();
          currentEmbeddedLines = [];
        } else if (line.trim().startsWith('```typescript') || line.trim().startsWith('```ts') || line.trim() === '```') {
          inCodeBlock = true;
        }
      }
    }
  }
  
  // The current file gets truncated content
  const fixedContent = outputLines.join('\n').trimEnd() + '\n';
  fs.writeFileSync(filePath, fixedContent, 'utf8');
  
  // Write any embedded files discovered
  for (const embedded of embeddedFiles) {
    const embeddedPath = path.join(ROOT, embedded.path);
    const embeddedDir = path.dirname(embeddedPath);
    if (!fs.existsSync(embeddedDir)) {
      fs.mkdirSync(embeddedDir, { recursive: true });
    }
    // Only write if it doesn't already exist as a proper file (not corrupted)
    if (!fs.existsSync(embeddedPath)) {
      fs.writeFileSync(embeddedPath, embedded.content.trim() + '\n', 'utf8');
      console.log(`  📄 Created embedded file: ${embedded.path}`);
    }
  }
  
  return foundFence;
}

async function main() {
  console.log('🔧 Phase 6 Fix: Scanning TypeScript files for markdown code fence corruption...\n');
  
  const tsFiles = findTsFiles(SRC_DIR);
  console.log(`Found ${tsFiles.length} TypeScript files\n`);
  
  let corruptedCount = 0;
  let fixedCount = 0;
  
  for (const file of tsFiles) {
    const content = fs.readFileSync(file, 'utf8');
    
    if (hasCodeFenceCorruption(content)) {
      const relPath = path.relative(ROOT, file);
      console.log(`\n🔴 Corrupted: ${relPath}`);
      corruptedCount++;
      
      const fixed = fixFile(file, content);
      if (fixed) {
        fixedCount++;
        console.log(`   ✅ Fixed (truncated at markdown fence)`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Results:`);
  console.log(`   Files with corruption: ${corruptedCount}`);
  console.log(`   Files fixed: ${fixedCount}`);
  
  if (corruptedCount === 0) {
    console.log('\n✅ No corrupted files found!');
  } else {
    console.log('\n✅ Phase 6 Fix complete! Run nest build to verify.');
  }
}

main().catch(console.error);
