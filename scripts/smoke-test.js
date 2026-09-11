const https = require('https');
const http = require('http');
const url = require('url');

// Base URL for the staging environment.
// Defaults to http://localhost:3000 for local testing if STAGING_URL is not set.
const BASE = process.env.STAGING_URL || 'http://localhost:3000';

// Parse the base URL to extract protocol, hostname, and port.
const parsedBase = url.parse(BASE);
const protocolModule = parsedBase.protocol === 'https:' ? https : http;

// Seeded credentials for the /auth/login test.
// In a real-world scenario, these might come from environment variables
// or a secrets manager, but for a simple smoke test, hardcoding is often
// acceptable for a dedicated staging test user.
const SEEDED_CREDS = {
  email: 'smoke@paysurity.com',
  password: 'SmokeTestPassword123!',
};

let overallStatus = true; // Tracks if all tests have passed
const results = []; // Stores individual test results

/**
 * Runs a single smoke test, measuring its execution time and reporting status.
 * @param {string} name The name of the test.
 * @param {Function} callback An async function containing the test logic.
 */
async function runTest(name, callback) {
  console.log(`\n--- Running test: ${name} ---`);
  const startTime = process.hrtime.bigint();
  let status = 'FAIL';
  let errorMessage = '';

  try {
    await callback();
    status = 'PASS';
  } catch (error) {
    errorMessage = error.message;
    console.error(`ERROR in ${name}:`, errorMessage);
    overallStatus = false;
  } finally {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000; // Convert nanoseconds to milliseconds
    results.push({ name, status, durationMs: durationMs.toFixed(2), errorMessage });
    console.log(`Test ${name}: ${status} (${durationMs.toFixed(2)} ms)`);
  }
}

/**
 * Makes an HTTP/HTTPS request and returns a Promise resolving with the response.
 * @param {'GET' | 'POST'} method The HTTP method.
 * @param {string} path The endpoint path (e.g., '/health').
 * @param {object | null} body The request body for POST requests, will be JSON.
 * @param {object} headers Additional headers to send.
 * @returns {Promise<{statusCode: number, headers: object, body: any}>}
 */
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: parsedBase.hostname,
      port: parsedBase.port || (parsedBase.protocol === 'https:' ? 443 : 80), // Use default ports if not specified
      path: path,
      method: method,
      headers: {
        'User-Agent': 'PaySurity/SmokeTest', // Identify requests from the smoke test
        ...headers,
      },
    };

    let postData = '';
    if (body) {
      postData = JSON.stringify(body);
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = protocolModule.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          // Attempt to parse response as JSON. If it fails, return raw data.
          const responseBody = data ? JSON.parse(data) : {};
          resolve({ statusCode: res.statusCode, headers: res.headers, body: responseBody });
        } catch (e) {
          // Non-JSON response (e.g., HTML for /api/docs)
          resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`Request to ${method} ${path} failed: ${e.message}`));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

/**
 * Main function to execute all smoke tests.
 */
async function main() {
  console.log(`\nStarting PaySurity Smoke Tests against: ${BASE}`);

  let accessToken = ''; // Variable to store accessToken if needed for subsequent authenticated requests

  // --- Test 1: GET /health ---
  await runTest('GET /health', async () => {
    const response = await makeRequest('GET', '/health');
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, but got ${response.statusCode}. Response: ${JSON.stringify(response.body)}`);
    }
    if (typeof response.body !== 'object' || response.body.status !== 'ok') {
      throw new Error(`Expected response body.status to be 'ok', but got '${response.body.status}'`);
    }
    console.log('Health check successful: status "ok".');
  });

  // --- Test 2: POST /auth/login ---
  await runTest('POST /auth/login', async () => {
    const response = await makeRequest('POST', '/auth/login', SEEDED_CREDS);
    // Assuming 200 OK or 201 Created for a successful login, adjust if API differs
    if (response.statusCode !== 200 && response.statusCode !== 201) {
      throw new Error(`Expected status 200 or 201, but got ${response.statusCode}. Response: ${JSON.stringify(response.body)}`);
    }
    if (typeof response.body !== 'object' || !response.body.accessToken) {
      throw new Error(`Expected 'accessToken' in response body, but not found. Response: ${JSON.stringify(response.body)}`);
    }
    accessToken = response.body.accessToken; // Store accessToken
    console.log('Login successful. Access Token received.');
    // console.log('Received Access Token (first 30 chars):', accessToken.substring(0, 30) + '...'); // For debugging
  });

  // --- Test 3: GET /api/docs ---
  await runTest('GET /api/docs', async () => {
    const response = await makeRequest('GET', '/api/docs');
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, but got ${response.statusCode}. Response: ${JSON.stringify(response.body)}`);
    }
    // For /api/docs, just checking for a 200 OK is sufficient for a smoke test
    // to confirm the documentation endpoint is active and serving content.
    console.log('API Docs endpoint reachable and returned 200 OK.');
  });

  // --- Final Report ---
  console.log('\n--- PaySurity Smoke Test Summary ---');
  results.forEach(res => {
    console.log(`${res.status.padEnd(4)}: ${res.name.padEnd(20)} (${res.durationMs} ms)${res.errorMessage ? ' - ' + res.errorMessage : ''}`);
  });

  if (overallStatus) {
    console.log('\nAll PaySurity smoke tests passed successfully!');
    process.exit(0);
  } else {
    console.error('\n!!! Some PaySurity smoke tests failed. Please investigate. !!!');
    process.exit(1);
  }
}

// Execute the main test function and catch any unhandled errors
main().catch(error => {
  console.error('\nAn unhandled error occurred during test execution:', error);
  process.exit(1);
});