import * as fs from 'fs';
import * as path from 'path';

// --- Configuration ---
// Assuming scripts/verify-requirements.js is located at <project_root>/scripts/
const PROJECT_ROOT = path.resolve(__dirname, '..');
const REQUIREMENTS_DIR = path.join(PROJECT_ROOT, 'Requirements', 'Canonical');
const TEST_E2E_DIR = path.join(PROJECT_ROOT, 'test', 'e2e');
const TEST_UNIT_ROOT_DIR = path.join(PROJECT_ROOT, 'src'); // Check all .spec.ts files under src
const COVERAGE_REPORT_PATH = path.join(PROJECT_ROOT, 'docs', 'status', 'requirements-coverage.md');
const DOCS_STATUS_DIR = path.dirname(COVERAGE_REPORT_PATH); // Ensure this directory exists

// Regular expression to match requirement IDs like REQ-XXX-NNN
const REQ_ID_REGEX = /REQ-[A-Z]{3}-\d{3}/g;

// --- Helper Functions ---

/**
 * Extracts unique requirement IDs (e.g., REQ-XXX-NNN) from a given string content.
 * @param content The string content to search within.
 * @returns A Set of unique requirement IDs found.
 */
function extractRequirementIds(content: string): Set<string> {
    const ids = new Set<string>();
    let match;
    while ((match = REQ_ID_REGEX.exec(content)) !== null) {
        ids.add(match[0]);
    }
    return ids;
}

/**
 * Recursively finds all files with a given extension in a directory.
 * @param startPath The directory to start searching from.
 * @param ext The file extension to look for (e.g., '.md', '.ts').
 * @returns An array of absolute file paths.
 */
function findFilesByExtension(startPath: string, ext: string): string[] {
    const files: string[] = [];
    if (!fs.existsSync(startPath)) {
        console.warn(`Warning: Directory not found: ${startPath}`);
        return [];
    }
    const entries = fs.readdirSync(startPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(startPath, entry.name);
        if (entry.isDirectory()) {
            files.push(...findFilesByExtension(fullPath, ext));
        } else if (entry.isFile() && entry.name.endsWith(ext)) {
            files.push(fullPath);
        }
    }
    return files;
}

// --- Main Script Logic ---
function generateCoverageReport(): void {
    console.log('--- PaySurity Requirements Coverage Checker ---');
    console.log(`Scanning requirements in: ${REQUIREMENTS_DIR}`);
    console.log(`Scanning tests in: ${TEST_E2E_DIR} and recursively under ${TEST_UNIT_ROOT_DIR}`);
    console.log(`Writing report to: ${COVERAGE_REPORT_PATH}`);

    const allRequirements = new Set<string>();
    const coveredRequirementsFromTests = new Set<string>();

    // 1. Extract all unique requirement IDs from canonical documentation
    try {
        const requirementFiles = findFilesByExtension(REQUIREMENTS_DIR, '.md');
        if (requirementFiles.length === 0) {
            console.warn(`No requirement files found. Please ensure .md files exist in ${REQUIREMENTS_DIR}.`);
        }
        for (const file of requirementFiles) {
            const content = fs.readFileSync(file, 'utf8');
            extractRequirementIds(content).forEach(id => allRequirements.add(id));
        }
        console.log(`Found ${allRequirements.size} unique requirements in documentation.`);
    } catch (error) {
        console.error(`Error reading requirement files: ${(error as Error).message}`);
        process.exit(1);
    }

    // 2. Extract all unique requirement IDs from test files
    try {
        const e2eTestFiles = findFilesByExtension(TEST_E2E_DIR, '.e2e-spec.ts');
        const unitTestFiles = findFilesByExtension(TEST_UNIT_ROOT_DIR, '.spec.ts');
        const allTestFiles = [...e2eTestFiles, ...unitTestFiles];

        if (allTestFiles.length === 0) {
            console.warn('No test files found. Please ensure .e2e-spec.ts or .spec.ts files exist.');
        }

        for (const file of allTestFiles) {
            const content = fs.readFileSync(file, 'utf8');
            extractRequirementIds(content).forEach(id => coveredRequirementsFromTests.add(id));
        }
        console.log(`Found ${coveredRequirementsFromTests.size} unique requirements referenced in test files.`);
    } catch (error) {
        console.error(`Error reading test files: ${(error as Error).message}`);
        process.exit(1);
    }

    // 3. Calculate coverage
    const totalRequirements = allRequirements.size;
    let coveredCount = 0;
    const uncoveredRequirements: string[] = [];
    const extraneousCoverage: string[] = []; // Requirements found in tests but not in docs

    for (const reqId of allRequirements) {
        if (coveredRequirementsFromTests.has(reqId)) {
            coveredCount++;
        } else {
            uncoveredRequirements.push(reqId);
        }
    }

    for (const reqId of coveredRequirementsFromTests) {
        if (!allRequirements.has(reqId)) {
            extraneousCoverage.push(reqId);
        }
    }

    const coveragePercentage = totalRequirements > 0 ? (coveredCount / totalRequirements) * 100 : 100;

    // 4. Generate Markdown report
    let reportContent = `# PaySurity Requirements Coverage Report\n\n`;
    reportContent += `*Generated on: ${new Date().toLocaleString()}*\n\n`;
    reportContent += `## Summary\n\n`;
    reportContent += `- **Total Requirements:** ${totalRequirements}\n`;
    reportContent += `- **Covered Requirements:** ${coveredCount}\n`;
    reportContent += `- **Coverage Percentage:** ${coveragePercentage.toFixed(2)}%\n\n`;

    if (uncoveredRequirements.length > 0) {
        reportContent += `## Uncovered Requirements (${uncoveredRequirements.length})\n\n`;
        reportContent += `The following requirements are defined in documentation but have no corresponding test coverage:\n\n`;
        reportContent += uncoveredRequirements.sort().map(id => `- \`${id}\``).join('\n') + '\n\n';
    } else {
        reportContent += `## Uncovered Requirements\n\n`;
        reportContent += `🥳 All documented requirements have corresponding test coverage!\n\n`;
    }

    if (extraneousCoverage.length > 0) {
        reportContent += `## Extraneous Coverage (${extraneousCoverage.length})\n\n`;
        reportContent += `The following requirement IDs were found in test files but do not exist in the canonical documentation. ` +
                         `These might be typos or references to deprecated requirements:\n\n`;
        reportContent += extraneousCoverage.sort().map(id => `- \`${id}\``).join('\n') + '\n\n';
    }

    // Ensure the output directory exists
    fs.mkdirSync(DOCS_STATUS_DIR, { recursive: true });

    // Write the report to file
    try {
        fs.writeFileSync(COVERAGE_REPORT_PATH, reportContent, 'utf8');
        console.log(`\nCoverage report successfully written to: ${COVERAGE_REPORT_PATH}`);
        console.log(`Coverage: ${coveragePercentage.toFixed(2)}%`);

        if (uncoveredRequirements.length > 0) {
            console.error(`ERROR: ${uncoveredRequirements.length} requirements are UNCOVERED.`);
            process.exit(1); // Exit with error code if there are uncovered requirements
        } else {
            console.log('SUCCESS: All requirements are covered.');
            process.exit(0); // Exit with success
        }
    } catch (error) {
        console.error(`Error writing coverage report: ${(error as Error).message}`);
        process.exit(1);
    }
}

// Execute the main function
generateCoverageReport();