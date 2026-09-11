import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https'; // Use https for secure connections

// --- Configuration ---
const LOG_DIR = 'logs';
const LOG_FILE = path.join(LOG_DIR, 'staging-deploy.log');

// Cloud Run specific configuration
// In a real-world scenario, these would likely come from environment variables
// or a dedicated configuration file/CI/CD secret manager.
// For this script, we assume these environment variables are set or have sensible defaults.
const CLOUD_RUN_SERVICE_NAME = process.env.CLOUD_RUN_SERVICE_NAME || 'paysurity-staging-api';
const CLOUD_RUN_REGION = process.env.CLOUD_RUN_REGION || 'us-central1'; // Example region

// Polling intervals and timeouts
const HEALTH_CHECK_POLL_INTERVAL_MS = 10 * 1000; // 10 seconds
const HEALTH_CHECK_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

const CLOUD_RUN_URL_POLL_INTERVAL_MS = 10 * 1000; // 10 seconds
const CLOUD_RUN_URL_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes (enough time for service to appear after build)


// --- Utility Functions ---
function ensureLogDirectory() {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
}

function log(message: string, isError: boolean = false) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage); // Always log to console
    try {
        fs.appendFileSync(LOG_FILE, logMessage + '\n'); // Append to log file
    } catch (e) {
        console.error(`Failed to write to log file: ${e}`); // Report log file write errors
    }
    if (isError) {
        // Optionally, log to stderr as well for immediate visibility in CI
        // This is already covered by console.log above, but if console.log was redirected
        // to only stdout, this would ensure critical errors go to stderr.
        // For simplicity, sticking with console.log for both stdout/stderr default behavior.
    }
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to fetch the health endpoint using Node.js 'https' module
async function fetchHealth(url: string): Promise<boolean> {
    return new Promise(resolve => {
        const req = https.get(url, { timeout: 5000 }, (res) => { // 5s timeout for individual health check request
            if (res.statusCode === 200) {
                resolve(true);
            } else {
                // Consume response data to free up memory, even if not needed
                res.resume();
                resolve(false);
            }
        });

        req.on('error', (e: Error) => {
            log(`Health check request failed for ${url}: ${e.message}`, true);
            resolve(false);
        });

        req.on('timeout', () => {
            req.destroy(); // Destroy the request to prevent it from hanging
            log(`Health check request timed out for ${url}`, true);
            resolve(false);
        });
    });
}

// --- Main Deployment Orchestrator ---
async function main() {
    ensureLogDirectory();
    log('--- Starting PaySurity Staging Deployment Orchestrator ---');

    let deployUrl: string | null = null;
    let healthStatus: boolean = false;
    let smokeTestResult: string | null = null;
    let deploymentFailed: boolean = false; // Flag to track overall deployment status
    const startTime = Date.now();

    try {
        // 1. Run nest build
        log('STEP 1: Running `nest build`...');
        try {
            // stdio: 'pipe' allows capturing output, which is then logged.
            const buildOutput = execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
            log('`nest build` completed successfully.');
            // Limit logging verbose output if it's too much, or log to debug level
            // For now, logging fully.
            log(`Build Output:\n${buildOutput.substring(0, 1000)}${buildOutput.length > 1000 ? '...\n(truncated)' : ''}`);
        } catch (error: any) {
            log(`ERROR: \`nest build\` failed.`, true);
            log(`Error Output:\n${error.stdout || error.message}`, true);
            deploymentFailed = true;
            process.exit(1); // Fail fast
        }

        // 2. Run node scripts/sweep-banned-imports.js
        log('STEP 2: Running `node scripts/sweep-banned-imports.js`...');
        try {
            const sweepOutput = execSync('node scripts/sweep-banned-imports.js', { encoding: 'utf8', stdio: 'pipe' });
            log('`sweep-banned-imports.js` completed successfully.');
            log(`Sweep Output:\n${sweepOutput}`);
        } catch (error: any) {
            log(`ERROR: \`sweep-banned-imports.js\` failed due to violations.`, true);
            log(`Error Output:\n${error.stdout || error.message}`, true);
            deploymentFailed = true;
            process.exit(1); // Fail fast
        }

        // 3. Run gcloud builds submit with cloudbuild-full-deploy.yaml
        log('STEP 3: Submitting GCloud build with `cloudbuild-full-deploy.yaml`...');
        try {
            // Using 'inherit' to show GCloud build logs directly in the console,
            // as they can be very verbose and useful for debugging GCloud build itself.
            execSync('gcloud builds submit --config cloudbuild-full-deploy.yaml', { stdio: 'inherit' });
            log('GCloud build submitted successfully. Waiting for Cloud Run service deployment...');
        } catch (error: any) {
            log(`ERROR: \`gcloud builds submit\` failed. This typically means the Cloud Build itself failed to start or complete.`, true);
            log(`Error Output:\n${error.message}`, true);
            deploymentFailed = true;
            process.exit(1); // Fail fast
        }

        // Poll for Cloud Run service URL after build submission
        log(`Polling for Cloud Run service URL for service "${CLOUD_RUN_SERVICE_NAME}" in region "${CLOUD_RUN_REGION}"...`);
        const urlPollStartTime = Date.now();
        let urlAttempts = 0;
        while (!deployUrl && (Date.now() - urlPollStartTime < CLOUD_RUN_URL_TIMEOUT_MS)) {
            urlAttempts++;
            try {
                // gcloud run services describe command returns the URL
                const serviceUrl = execSync(
                    `gcloud run services describe ${CLOUD_RUN_SERVICE_NAME} --platform managed --region ${CLOUD_RUN_REGION} --format "value(status.url)"`,
                    { encoding: 'utf8', stdio: 'pipe' }
                ).trim();

                if (serviceUrl) {
                    deployUrl = serviceUrl;
                    log(`Cloud Run service URL found: ${deployUrl}`);
                    break;
                } else {
                    log(`Attempt ${urlAttempts}: Cloud Run service URL not yet available or empty. Retrying in ${CLOUD_RUN_URL_POLL_INTERVAL_MS / 1000}s...`);
                    await sleep(CLOUD_RUN_URL_POLL_INTERVAL_MS);
                }
            } catch (error: any) {
                // It's common for the service not to exist immediately after a new deployment via Cloud Build,
                // or for the gcloud command to fail if it's still provisioning/service name is incorrect.
                log(`Attempt ${urlAttempts}: Failed to get Cloud Run service URL. Error: "${error.message}". Retrying in ${CLOUD_RUN_URL_POLL_INTERVAL_MS / 1000}s...`);
                await sleep(CLOUD_RUN_URL_POLL_INTERVAL_MS);
            }
        }

        if (!deployUrl) {
            log(`ERROR: Failed to retrieve Cloud Run service URL for "${CLOUD_RUN_SERVICE_NAME}" within ${CLOUD_RUN_URL_TIMEOUT_MS / (60 * 1000)} minutes. Aborting deployment.`, true);
            deploymentFailed = true;
            process.exit(1); // Fail fast
        }

        // 4. Poll Cloud Run service URL /health
        log(`STEP 4: Polling Cloud Run service health at ${deployUrl}/health for ${HEALTH_CHECK_TIMEOUT_MS / (60 * 1000)} minutes...`);
        const healthCheckStartTime = Date.now();
        let healthAttempts = 0;
        while (!healthStatus && (Date.now() - healthCheckStartTime < HEALTH_CHECK_TIMEOUT_MS)) {
            healthAttempts++;
            log(`Health check attempt ${healthAttempts} of max ${Math.ceil(HEALTH_CHECK_TIMEOUT_MS / HEALTH_CHECK_POLL_INTERVAL_MS)}...`);
            const isHealthy = await fetchHealth(`${deployUrl}/health`);
            if (isHealthy) {
                healthStatus = true;
                log('Health check passed successfully!');
                break;
            } else {
                log(`Health check failed. Retrying in ${HEALTH_CHECK_POLL_INTERVAL_MS / 1000}s...`);
                await sleep(HEALTH_CHECK_POLL_INTERVAL_MS);
            }
        }

        if (!healthStatus) {
            log(`ERROR: Health check failed after ${HEALTH_CHECK_TIMEOUT_MS / (60 * 1000)} minutes. Service is not healthy.`, true);
            deploymentFailed = true; // Mark as failed, but continue to report
        }

        // 5. On health OK: run node scripts/smoke-test.js
        if (healthStatus) {
            log('STEP 5: Running `node scripts/smoke-test.js`...');
            try {
                // Pass the deployed URL as an environment variable to the smoke test script
                const smokeTestEnv = { ...process.env, DEPLOY_URL: deployUrl };
                const smokeTestOutput = execSync('node scripts/smoke-test.js', {
                    encoding: 'utf8',
                    stdio: 'pipe', // Capture output
                    env: smokeTestEnv // Pass environment variables
                });
                smokeTestResult = smokeTestOutput.trim();
                log('`smoke-test.js` completed successfully.');
                log(`Smoke Test Output:\n${smokeTestResult}`);

                // Check for explicit failure messages in smoke test output (if script reports that)
                if (smokeTestResult.includes('FAILED') || smokeTestResult.includes('ERROR')) {
                    deploymentFailed = true;
                }

            } catch (error: any) {
                log(`ERROR: \`smoke-test.js\` failed.`, true);
                log(`Error Output:\n${error.stdout || error.message}`, true);
                smokeTestResult = `FAILED: ${error.stdout || error.message}`;
                deploymentFailed = true; // Mark as failed, but continue to report
            }
        } else {
            log('Skipping `smoke-test.js` because health check failed.');
            smokeTestResult = 'SKIPPED (Health check failed)';
            // deploymentFailed is already true if healthStatus is false, so no change needed here.
        }

    } catch (criticalError: any) {
        // Catch any unexpected errors that might occur outside of specific step try/catch blocks
        log(`CRITICAL UNHANDLED DEPLOYMENT FAILURE: ${criticalError.message}`, true);
        smokeTestResult = smokeTestResult || `CRITICAL FAILURE: ${criticalError.message}`;
        deploymentFailed = true;
        process.exit(1); // Ensure exit on any critical, unhandled error
    } finally {
        // 6. Report
        log('\n----- DEPLOYMENT REPORT -----');
        log(`Deployment URL: ${deployUrl || 'N/A'}`);
        log(`Health Status: ${healthStatus ? 'OK' : 'FAILED'}`);
        log(`Smoke Test Results:\n${smokeTestResult || 'N/A'}`);
        log(`Total Duration: ${((Date.now() - startTime) / 1000).toFixed(2)} seconds`);
        log('-----------------------------\n');

        // Final exit status based on the `deploymentFailed` flag
        if (deploymentFailed) {
            log('Deployment finished with FAILED status.', true);
            process.exit(1);
        } else {
            log('Deployment finished with SUCCESS status.');
            process.exit(0);
        }
    }
}

// Execute the main function
main();