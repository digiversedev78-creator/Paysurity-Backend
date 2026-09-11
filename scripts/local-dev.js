#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

/**
 * List of environment variables required for local development.
 * If any of these are missing, the script will exit with an error.
 */
const requiredEnvVars = [
    'DATABASE_URL',
    'GEMINI_API_KEY',
    'SENDGRID_API_KEY',
    'STRIPE_SECRET_KEY',
    'JWT_SECRET',
    // Add any other crucial environment variables here
];

/**
 * Checks if all required environment variables are set.
 * If not, it prints an error message and exits the process.
 */
function checkEnvVars() {
    const missingVars = [];
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missingVars.push(envVar);
        }
    }

    if (missingVars.length > 0) {
        console.error('\x1b[31m%s\x1b[0m', 'Error: The following required environment variables are not set:');
        missingVars.forEach(v => console.error(` - ${v}`));
        console.error('\x1b[31m%s\x1b[0m', 'Please set them before running the script.');
        process.exit(1);
    }
    console.log('\x1b[32m%s\x1b[0m', 'All required environment variables are set.');
}

// Resolve the absolute path to the 'apps' directory from the current script location.
// Assuming this script is in `scripts/` at the monorepo root.
const appsDir = path.resolve(__dirname, '..', 'apps');

const runningProcesses = [];

/**
 * Runs a command in a specified directory and pipes its output to the console,
 * prefixed with the given name for better readability.
 * @param {string} name - A human-readable name for the process (e.g., 'API', 'Merchant Dashboard').
 * @param {string} command - The command to execute (e.g., 'npm').
 * @param {string[]} args - An array of arguments for the command (e.g., ['run', 'start:dev']).
 * @param {string} cwd - The current working directory for the command.
 */
function runCommand(name, command, args, cwd) {
    console.log(`\n\x1b[34m%s\x1b[0m`, `Starting ${name} (${command} ${args.join(' ')} in ${cwd})...`);
    const child = spawn(command, args, {
        cwd,
        stdio: 'pipe', // Pipe stderr and stdout
        env: { ...process.env, FORCE_COLOR: 'true' } // Ensure colored output from child processes
    });

    child.stdout.on('data', (data) => {
        // Prefix output to identify the source process
        process.stdout.write(`[\x1b[32m${name}\x1b[0m] ${data.toString()}`);
    });

    child.stderr.on('data', (data) => {
        process.stderr.write(`[\x1b[31m${name}\x1b[0m] ${data.toString()}`);
    });

    child.on('close', (code) => {
        if (code !== 0) {
            console.error(`\x1b[31m%s\x1b[0m`, `${name} exited with code ${code}`);
        } else {
            console.log(`\x1b[34m%s\x1b[0m`, `${name} exited successfully.`);
        }
    });

    child.on('error', (err) => {
        console.error(`\x1b[31m%s\x1b[0m`, `Failed to start ${name}: ${err.message}`);
        // For critical app failures, it might be appropriate to exit the main script.
        // For local dev, we let it continue, but log the error clearly.
    });

    runningProcesses.push(child);
}

/**
 * Attempts to gracefully shut down all child processes.
 */
function cleanupProcesses() {
    if (runningProcesses.length > 0) {
        console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down child processes...');
        runningProcesses.forEach(p => {
            if (!p.killed) {
                p.kill('SIGINT'); // Send interrupt signal
            }
        });
    }
}

// Register cleanup handlers for various exit signals
process.on('exit', cleanupProcesses);
process.on('SIGINT', () => { // Ctrl+C
    cleanupProcesses();
    process.exit(0);
});
process.on('SIGTERM', () => { // Termination signal
    cleanupProcesses();
    process.exit(0);
});
process.on('uncaughtException', (err) => {
    console.error('\x1b[31m%s\x1b[0m', 'Uncaught exception:', err);
    cleanupProcesses();
    process.exit(1);
});

// Main execution block
(async () => {
    checkEnvVars();

    // Run applications concurrently
    runCommand('API', 'npm', ['run', 'start:dev'], path.join(appsDir, 'api'));
    runCommand('Merchant Dashboard', 'npm', ['run', 'dev'], path.join(appsDir, 'merchant-dashboard'));

    // Show health check URL after starting applications.
    // Assuming API runs on port 3000 and Merchant Dashboard on 3001 (or as logged).
    console.log('\n\x1b[36m%s\x1b[0m', '---------------------------------------------------');
    console.log('\x1b[36m%s\x1b[0m', 'PaySurity Local Development Environment Started!');
    console.log('\x1b[36m%s\x1b[0m', `API Health Check URL: \x1b[4m\x1b[36mhttp://localhost:3000/health\x1b[0m`);
    console.log('\x1b[36m%s\x1b[0m', `API Base URL:         \x1b[4m\x1b[36mhttp://localhost:3000\x1b[0m`);
    console.log('\x1b[36m%s\x1b[0m', `Merchant Dashboard:   \x1b[4m\x1b[36mhttp://localhost:3001\x1b[0m (check logs above for actual port if different)`);
    console.log('\x1b[36m%s\x1b[0m', '---------------------------------------------------');
    console.log('\x1b[33m%s\x1b[0m', 'Press Ctrl+C to stop both applications.');

    // The script will stay alive as long as child processes are running
    // due to the nature of Node.js event loop and child_process.
})();