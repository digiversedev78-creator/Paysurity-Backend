const fs = require('fs');
const path = require('path');

// Define directory paths relative to the script's location
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const REQUIREMENTS_DIR = path.join(PROJECT_ROOT, 'Requirements', 'Canonical');
const E2E_TEST_DIR = path.join(PROJECT_ROOT, 'test', 'e2e');
const UNIT_TEST_DIR = path.join(PROJECT_ROOT, 'test', 'unit');
const REPORT_FILE = path.join(PROJECT_ROOT, 'docs', 'status', 'requirements-coverage.md');

// Regular expression to find requirement IDs (e.g., REQ-ABC-123)
const REQ_ID_REGEX = /REQ-[A-Z]{3}-\d{3}/g;

/**
 * Recursively collects file paths from a given directory.
 * @param {string} dir - The directory to scan.
 * @returns {Promise<string[]>} An array of absolute file paths.
 */
async function collectFiles(dir) {
    let files = [];
    try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files = files.concat(await collectFiles(fullPath));
            } else if (entry.isFile()) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        // If directory doesn't exist, treat as no files found
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
    return files;
}

/**
 * Extracts all unique requirement IDs from the content of multiple files.
 * @param {string[]} filePaths - An array of file paths to read.
 * @returns {Promise<Set<string>>} A Set of unique requirement IDs.
 */
async function extractRequirementIdsFromFileContents(filePaths) {
    const ids = new Set();
    for (const file of filePaths) {
        try {
            const content = await fs.promises.readFile(file, 'utf-8');
            let match;
            while ((match = REQ_ID_REGEX.exec(content)) !== null) {
                ids.add(match[0]);
            }
        } catch (error) {
            console.error(`Error reading file ${file}:`, error.message);
            // Continue processing other files
        }
    }
    return ids;
}

/**
 * Main function to verify requirements coverage and generate a report.
 */
async function verifyRequirementsCoverage() {
    const allRequirementIds = new Set();
    const coveredRequirementIds = new Set();

    // 1. Collect all requirement IDs from documentation files
    const reqFiles = (await collectFiles(REQUIREMENTS_DIR)).filter(file => file.endsWith('.md'));
    const extractedAllReqIds = await extractRequirementIdsFromFileContents(reqFiles);
    extractedAllReqIds.forEach(id => allRequirementIds.add(id));

    // 2. Collect requirement IDs covered by test files
    const e2eTestFiles = (await collectFiles(E2E_TEST_DIR)).filter(file => file.endsWith('.e2e-spec.ts'));
    const unitTestFiles = (await collectFiles(UNIT_TEST_DIR)).filter(file => file.endsWith('.spec.ts'));
    const testFiles = [...e2eTestFiles, ...unitTestFiles];

    const extractedCoveredReqIds = await extractRequirementIdsFromFileContents(testFiles);
    extractedCoveredReqIds.forEach(id => coveredRequirementIds.add(id));

    // Determine covered and uncovered requirements
    const covered = new Set();
    const uncovered = new Set();

    allRequirementIds.forEach(reqId => {
        if (coveredRequirementIds.has(reqId)) {
            covered.add(reqId);
        } else {
            uncovered.add(reqId);
        }
    });

    const totalRequirements = allRequirementIds.size;
    const coveredCount = covered.size;
    const uncoveredCount = uncovered.size;
    const coveragePercentage = totalRequirements === 0 ? 100 : (coveredCount / totalRequirements) * 100;

    // 3. Generate report content
    let reportContent = `# Requirements Coverage Report\n\n`;
    reportContent += `This report shows the coverage of defined requirements by automated tests.\n\n`;
    reportContent += `**Generated On:** ${new Date().toLocaleString()}\n\n`;
    reportContent += `---\n\n`;
    reportContent += `## Summary\n\n`;
    reportContent += `- **Total Requirements Defined:** ${totalRequirements}\n`;
    reportContent += `- **Requirements Covered by Tests:** ${coveredCount}\n`;
    reportContent += `- **Requirements Uncovered by Tests:** ${uncoveredCount}\n`;
    reportContent += `- **Coverage Percentage:** **${coveragePercentage.toFixed(2)}%**\n\n`;

    if (uncoveredCount > 0) {
        reportContent += `## Uncovered Requirements (${uncoveredCount})\n\n`;
        reportContent += `The following requirements have been defined but do not appear to have corresponding test coverage:\n\n`;
        Array.from(uncovered).sort().forEach(reqId => {
            reportContent += `- ${reqId}\n`;
        });
        reportContent += `\n`;
    } else {
        reportContent += `## All Requirements Covered!\n\n`;
        reportContent += `Great job! All ${totalRequirements} defined requirements have corresponding test coverage.\n\n`;
    }

    if (coveredCount > 0 && uncoveredCount > 0) {
        reportContent += `## Covered Requirements (${coveredCount})\n\n`;
        reportContent += `The following requirements have been found to have test coverage:\n\n`;
        Array.from(covered).sort().forEach(reqId => {
            reportContent += `- ${reqId}\n`;
        });
        reportContent += `\n`;
    }


    // 4. Write report to file
    try {
        await fs.promises.mkdir(path.dirname(REPORT_FILE), { recursive: true });
        await fs.promises.writeFile(REPORT_FILE, reportContent, 'utf-8');
        console.log(`✅ Requirements coverage report generated successfully at ${REPORT_FILE}`);
        console.log(`Total: ${totalRequirements}, Covered: ${coveredCount}, Uncovered: ${uncoveredCount}, Coverage: ${coveragePercentage.toFixed(2)}%`);
        if (uncoveredCount > 0) {
            console.warn(`⚠️ There are ${uncoveredCount} uncovered requirements. See report for details.`);
            process.exit(1); // Exit with a non-zero code to indicate a warning/failure for CI
        }
    } catch (error) {
        console.error(`❌ Error writing coverage report to ${REPORT_FILE}:`, error);
        process.exit(1);
    }
}

// Execute the main function
verifyRequirementsCoverage().catch(error => {
    console.error("An unexpected error occurred:", error);
    process.exit(1);
});
