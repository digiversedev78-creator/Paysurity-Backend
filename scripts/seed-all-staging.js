const { execSync } = require('child_process');

/**
 * Runs a shell command synchronously and logs its outcome.
 * Exits the process with code 1 if the command fails.
 * @param {string} command The command to execute.
 * @param {string} description A user-friendly description of the step.
 */
function runStep(command, description) {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] [${timestamp}] Starting step: ${description}`);
    console.log(`[INFO] [${timestamp}] Command: ${command}`);

    try {
        // 'stdio: inherit' pipes the child process's stdout/stderr to the parent process's,
        // making the output of the sub-scripts directly visible.
        execSync(command, { stdio: 'inherit' });
        console.log(`[SUCCESS] [${timestamp}] Step "${description}" completed successfully.`);
        return true;
    } catch (error) {
        console.error(`[FAILURE] [${timestamp}] Step "${description}" failed.`);
        console.error(`[FAILURE] [${timestamp}] Error details:`);
        console.error(error.message);
        // Ensure to exit with a non-zero code to indicate failure
        process.exit(1);
    }
}

console.log('--- PaySurity Staging Seeding Process Started ---');
const overallStartTime = new Date();

// Run each step in sequence. If any step fails, runStep will call process.exit(1).
runStep(
    'node scripts/run-staging-migrations.js',
    'Running staging database migrations'
);

runStep(
    'node scripts/seed-hob-tenant.js',
    'Seeding data for HOB (Home Office Branch) tenant'
);

runStep(
    'node scripts/seed-aels-tenant.js',
    'Seeding data for AELS (Academic & Educational Lending Solutions) tenant'
);

runStep(
    'node scripts/seed-grocerease-tenant.js',
    'Seeding data for GrocerEase tenant'
);

const overallEndTime = new Date();
const durationMs = overallEndTime.getTime() - overallStartTime.getTime();
console.log(`--- PaySurity Staging Seeding Process Completed Successfully in ${durationMs / 1000} seconds ---`);

// Exit with code 0 on overall success
process.exit(0);