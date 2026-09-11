const fs = require('fs');
const path = require('path');

const API_SRC_DIR = path.join(__dirname, '../apps/api/src');
const REPORT_PATH = path.join(__dirname, '../docs/status/banned-import-sweep.md');

// Define banned import patterns
const BANNED_IMPORTS = [
  {
    regex: /^import\s+.*from\s+['"]@paysurity\/database['"];?/,
    message: 'Banned import: @paysurity/database',
    type: 'banned-import-database',
  },
  {
    regex: /^import\s+.*from\s+['"]@paysurity\/auth['"];?/,
    message: 'Banned import: @paysurity/auth',
    type: 'banned-import-auth',
  },
  {
    regex: /^import\s+.*from\s+['"]@nestjs-drizzle\/core['"];?/,
    message: 'Banned import: @nestjs-drizzle/core',
    type: 'banned-import-nestjs-drizzle-core',
  },
];

// Regex for class-level @UseGuards() detection, including comments and whitespace
// Matches @UseGuards(...) followed by optional comments/whitespace, then @Controller(...), then optional comments/whitespace, then class SomeClass
const USE_GUARDS_CLASS_LEVEL_REGEX = /@UseGuards\([^)]*\)\s*(?:(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)\s*)*@Controller\([^)]*\)\s*(?:(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)\s*)*class\s+\w+/ms;

const violations = [];
let scannedFilesCount = 0;
let cleanFilesCount = 0;

/**
 * Recursively gets all .ts files within a directory.
 * @param {string} dir The directory to scan.
 * @returns {string[]} An array of absolute paths to .ts files.
 */
function getTsFiles(dir) {
  let tsFiles = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      tsFiles = tsFiles.concat(getTsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      tsFiles.push(fullPath);
    }
  }
  return tsFiles;
}

/**
 * Analyzes a single TypeScript file for banned imports and class-level @UseGuards().
 * @param {string} filePath The absolute path to the file.
 */
function analyzeFile(filePath) {
  scannedFilesCount++;
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');
  const fileViolations = [];

  // Check for banned imports line by line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    for (const bannedImport of BANNED_IMPORTS) {
      if (bannedImport.regex.test(line)) {
        fileViolations.push({
          filePath: filePath,
          lineNumber: lineNumber,
          message: bannedImport.message,
          offendingLine: line,
          type: bannedImport.type,
        });
      }
    }
  }

  // Check for class-level @UseGuards() using a multi-line regex
  const useGuardsMatches = [...fileContent.matchAll(USE_GUARDS_CLASS_LEVEL_REGEX)];

  for (const match of useGuardsMatches) {
    const matchedBlock = match[0];
    const startIndexInFile = match.index;

    // Calculate the line number of the start of the matched block
    const linesBeforeMatch = fileContent.substring(0, startIndexInFile);
    const startLineNumber = linesBeforeMatch.split('\n').length;

    // Find the relative line number of '@UseGuards(' within the matched block
    const useGuardsRelativeIndex = matchedBlock.indexOf('@UseGuards(');
    const useGuardsSubString = matchedBlock.substring(0, useGuardsRelativeIndex);
    const useGuardsLineOffset = useGuardsSubString.split('\n').length - 1; // Count newlines before @UseGuards
    
    const actualUseGuardsLineNumber = startLineNumber + useGuardsLineOffset;

    fileViolations.push({
      filePath: filePath,
      lineNumber: actualUseGuardsLineNumber,
      message: 'Class-level @UseGuards() is forbidden in @Controller classes',
      offendingLine: lines[actualUseGuardsLineNumber - 1],
      type: 'class-level-useguards',
    });
  }

  if (fileViolations.length > 0) {
    violations.push(...fileViolations);
  } else {
    cleanFilesCount++;
  }
}

/**
 * Generates and writes the sweep report to the specified markdown file.
 */
function generateReport() {
  const now = new Date();
  const dateString = now.toLocaleString();

  let reportContent = `# PaySurity Banned Import Sweep Report\n\n`;
  reportContent += `Date: ${dateString}\n\n`;
  reportContent += `## Summary\n`;
  reportContent += `Total files scanned: ${scannedFilesCount}\n`;
  reportContent += `Clean files: ${cleanFilesCount}\n`;
  reportContent += `Files with violations: ${new Set(violations.map(v => v.filePath)).size}\n`;
  reportContent += `Total violations found: ${violations.length}\n\n`;

  if (violations.length === 0) {
    reportContent += `All files are clean! No banned imports or class-level @UseGuards() found.\n`;
  } else {
    reportContent += `## Violations\n\n`;

    const bannedImportViolations = violations.filter(v => v.type.startsWith('banned-import'));
    const useGuardsViolations = violations.filter(v => v.type === 'class-level-useguards');

    if (bannedImportViolations.length > 0) {
      reportContent += `### 1. Banned Imports\n`;
      for (const v of bannedImportViolations) {
        const relativePath = path.relative(path.join(__dirname, '../'), v.filePath);
        reportContent += `  - \`${relativePath}:${v.lineNumber}\` - \`${v.offendingLine.trim()}\` (${v.message})\n`;
      }
      reportContent += `\n`;
    }

    if (useGuardsViolations.length > 0) {
      reportContent += `### 2. Class-level @UseGuards()\n`;
      for (const v of useGuardsViolations) {
        const relativePath = path.relative(path.join(__dirname, '../'), v.filePath);
        reportContent += `  - \`${relativePath}:${v.lineNumber}\` - \`${v.offendingLine.trim()}\` (${v.message})\n`;
      }
      reportContent += `\n`;
    }
  }

  reportContent += `## Clean Files\n`;
  reportContent += `Total clean files: ${cleanFilesCount}\n`;

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, reportContent, 'utf8');
}

/**
 * Main function to orchestrate the scanning and reporting.
 */
function main() {
  console.log(`Scanning for banned imports and class-level @UseGuards() in '${API_SRC_DIR}'...`);

  const tsFiles = getTsFiles(API_SRC_DIR);

  for (const filePath of tsFiles) {
    analyzeFile(filePath);
  }

  generateReport();

  console.log(`\n--- PaySurity Banned Import Sweep Report ---`);
  console.log(`Total files scanned: ${scannedFilesCount}`);
  console.log(`Clean files: ${cleanFilesCount}`);
  console.log(`Files with violations: ${new Set(violations.map(v => v.filePath)).size}`);
  console.log(`Total violations found: ${violations.length}`);
  console.log(`Report written to: ${REPORT_PATH}`);

  if (violations.length > 0) {
    console.error('\n🚫 Violations found! Please review the report and fix the issues.');
    process.exit(1); // Exit with code 1 if any violations were found
  } else {
    console.log('\n✅ No banned imports or class-level @UseGuards() found. All clean!');
    process.exit(0); // Exit with code 0 if no violations were found
  }
}

// Execute the main function
main();