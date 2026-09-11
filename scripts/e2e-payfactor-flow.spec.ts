import { test, expect, APIRequestContext } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto'; // Required for HMAC generation for valid signature later

// Base URL for the PaySurity API.
// In a real Playwright setup, this would typically be configured in playwright.config.ts
// or pulled from environment variables.
const API_BASE_URL = process.env.PAY_SURITY_API_URL || 'http://localhost:3000';

// Shared state variables to pass data between dependent tests in the flow
let tenantId: string;
let driverUserId: string;
let authToken: string; // Authentication token for a test user (e.g., tenant admin or driver)
let payfactorApplicationId: string;
let escrowId: string;
let loadId: string; // Represents a specific load's identifier
let driverNetValue: number; // The net payout value for the driver on a specific load

// Placeholder function to obtain an authentication token for E2E tests.
// In a production E2E suite, this would involve a realistic login process
// or a dedicated test-user creation/token minting endpoint.
async function getAuthToken(request: APIRequestContext): Promise<{ token: string; tenantId: string; userId: string }> {
  // For simplicity, we'll generate unique IDs for tenant and user for each test run
  // and use a static placeholder token. Replace with actual token generation logic.
  const newTenantId = uuidv4();
  const newUserId = uuidv4();
  console.warn(`E2E: Using dummy auth token. Implement actual token generation for a valid JWT.`);
  console.warn(`E2E: Simulated Tenant ID: ${newTenantId}, User ID: ${newUserId}`);

  // In a real scenario, you might make a request like:
  // const loginResponse = await request.post(`${API_BASE_URL}/v1/auth/login`, { data: { email: 'test@paysurity.com', password: 'password' } });
  // const loginBody = await loginResponse.json();
  // return { token: loginBody.accessToken, tenantId: loginBody.tenantId, userId: loginBody.userId };

  return {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0X3VzZXJfaWQiLCJ0ZW5hbnRJZCI6ImR1bW15X3RlbmFudF9pZCIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', // A dummy JWT, won't be valid in a real system unless configured.
    tenantId: newTenantId,
    userId: newUserId,
  };
}

// Helper to generate a valid HMAC signature for webhook validation (for testing the *valid* case if needed, but primarily for understanding the mechanism)
function generateHmacSignature(secret: string, payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

test.describe('PayFactor E2E Flow', () => {
  // Before all tests, set up a tenant, user, and obtain an auth token.
  // This ensures a clean slate and valid credentials for the API calls.
  test.beforeAll(async ({ request }) => {
    const auth = await getAuthToken(request);
    authToken = auth.token;
    tenantId = auth.tenantId;
    driverUserId = auth.userId;

    // Simulate creation of a load for the driver to associate with an escrow
    loadId = uuidv4();
    driverNetValue = 1250.75; // Example net value for a load for the driver

    console.log(`E2E Test Setup Complete: Tenant: ${tenantId}, Driver: ${driverUserId}, Load: ${loadId}`);
  });

  test('POST /v1/payfactor/apply with CDL validates KYC', async ({ request }) => {
    // Generate unique driver application data
    const cdlNumber = `CDL-${uuidv4().substring(0, 10).toUpperCase()}`;
    const firstName = 'Evelyn';
    const lastName = 'Rodriguez';
    const dateOfBirth = '1990-03-20'; // YYYY-MM-DD

    const response = await request.post(`${API_BASE_URL}/v1/payfactor/apply`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-Id': tenantId, // Important for multi-tenancy
        'Content-Type': 'application/json',
      },
      data: {
        driverUserId, // The ID of the driver user in PaySurity
        cdlNumber,
        firstName,
        lastName,
        dateOfBirth,
        // Include other KYC fields as per the PayFactor integration API spec
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '90210',
        email: `driver-${driverUserId.substring(0, 8)}@example.com`,
      },
    });

    expect(response.status()).toBe(200); // Expect a successful application initiation
    const responseBody = await response.json();
    console.log('Apply Response:', responseBody);

    expect(responseBody).toHaveProperty('payfactorApplicationId');
    expect(typeof responseBody.payfactorApplicationId).toBe('string');
    payfactorApplicationId = responseBody.payfactorApplicationId; // Store for subsequent tests

    // Assert initial status, e.g., PENDING, REVIEW, or APPROVED if KYC is instant
    expect(responseBody.status).toBe('PENDING_KYC'); // Or 'APPROVED', depending on mock/integration behavior
    expect(responseBody.driverUserId).toBe(driverUserId);
  });

  test('POST /v1/payfactor/escrow creates escrow for load', async ({ request }) => {
    // Ensure the application was successful from the previous test
    expect(payfactorApplicationId).toBeDefined();

    const response = await request.post(`${API_BASE_URL}/v1/payfactor/escrow`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-Id': tenantId,
        'Content-Type': 'application/json',
      },
      data: {
        payfactorApplicationId,
        loadId, // The ID of the specific load for which escrow is being created
        driverUserId,
        driverNetValue, // The total net value of the load for the driver
        // Additional load details could be included here
        currency: 'USD',
        origin: 'Atlanta, GA',
        destination: 'Miami, FL',
        deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      },
    });

    expect(response.status()).toBe(201); // Expect 201 Created for a new resource
    const responseBody = await response.json();
    console.log('Escrow Create Response:', responseBody);

    expect(responseBody).toHaveProperty('escrowId');
    expect(typeof responseBody.escrowId).toBe('string');
    escrowId = responseBody.escrowId; // Store for subsequent tests

    expect(responseBody.status).toBe('ESCROW_CREATED'); // Initial status of the escrow
    expect(responseBody.payfactorApplicationId).toBe(payfactorApplicationId);
    expect(responseBody.loadId).toBe(loadId);
  });

  test('GET /v1/payfactor/status/:id returns escrow state', async ({ request }) => {
    // Ensure an escrow has been created
    expect(escrowId).toBeDefined();

    const response = await request.get(`${API_BASE_URL}/v1/payfactor/status/${escrowId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-Id': tenantId,
      },
    });

    expect(response.status()).toBe(200); // Expect a successful retrieval
    const responseBody = await response.json();
    console.log('Escrow Status Response:', responseBody);

    expect(responseBody).toHaveProperty('escrowId', escrowId);
    expect(responseBody).toHaveProperty('status');
    // Ensure the status is one of the expected states for an active escrow
    expect(['ESCROW_CREATED', 'PENDING_ADVANCE', 'ADVANCED', 'COMPLETED', 'CANCELED']).toContain(responseBody.status);
    expect(responseBody).toHaveProperty('driverNetValue', driverNetValue);
  });

  test('POST /v1/payfactor/advance releases 25% of driver net', async ({ request }) => {
    // Ensure an escrow is available and has a defined net value
    expect(escrowId).toBeDefined();
    expect(driverNetValue).toBeDefined();

    const advancePercentage = 0.25; // As per requirement: 25%
    const requestedAdvanceAmount = driverNetValue * advancePercentage;

    // In a full E2E, we might ensure the escrow status is 'APPROVED' or 'READY_FOR_ADVANCE'
    // via a direct DB update or another API call before proceeding.
    // For this example, we assume the system allows advance requests on ESCROW_CREATED.

    const response = await request.post(`${API_BASE_URL}/v1/payfactor/advance`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-Id': tenantId,
        'Content-Type': 'application/json',
      },
      data: {
        escrowId,
        // The API might accept an explicit amount or calculate it based on a policy.
        // We'll send the calculated amount here.
        advanceAmount: requestedAdvanceAmount,
      },
    });

    expect(response.status()).toBe(200); // Expect a successful advance
    const responseBody = await response.json();
    console.log('Advance Response:', responseBody);

    expect(responseBody).toHaveProperty('advanceId');
    expect(typeof responseBody.advanceId).toBe('string');
    expect(responseBody).toHaveProperty('escrowId', escrowId);
    expect(responseBody).toHaveProperty('advancedAmount');
    // Use toBeCloseTo for floating point comparisons to account for precision issues
    expect(responseBody.advancedAmount).toBeCloseTo(requestedAdvanceAmount);
    expect(responseBody.status).toBe('ADVANCED'); // Or 'ADVANCE_PENDING_TRANSFER', etc.
  });

  test('Webhook HMAC validation rejects invalid signature', async ({ request }) => {
    // This test simulates an incoming webhook from PayFactor to PaySurity.
    // We expect PaySurity to validate the HMAC signature for security.
    const webhookEndpoint = `${API_BASE_URL}/v1/payfactor/webhook`;

    // A sample payload that PayFactor would send
    const webhookPayload = {
      eventId: uuidv4(),
      eventType: 'ESCROW_STATUS_UPDATE',
      data: {
        escrowId: uuidv4(), // Use a new escrow ID for this mock webhook event
        status: 'COMPLETED',
        details: 'Payment successfully processed by PayFactor',
        transactionId: uuidv4(),
      },
      timestamp: new Date().toISOString(),
      tenantId: tenantId, // Webhooks might include the tenant ID in the payload
    };

    const payloadString = JSON.stringify(webhookPayload);

    // Provide an *invalid* HMAC signature.
    // In a real scenario, this would be generated with a shared secret, but here we provide a wrong one.
    const invalidHmacSignature = 'sha256=invalid-signature-deliberately-wrong-12345';

    const response = await request.post(webhookEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        // The header name where PayFactor sends its signature (e.g., X-PayFactor-Signature)
        'X-PayFactor-Signature': invalidHmacSignature,
        // Webhooks might also pass tenant information in headers
        'X-Tenant-Id': tenantId,
      },
      data: payloadString,
      // For E2E, we explicitly send the stringified payload as it mimics how webhooks send raw body
    });

    // Expect a 401 Unauthorized or 403 Forbidden status code for signature validation failure
    expect(response.status()).toBe(401); // 401 is common for authentication/signature failures

    const responseBody = await response.json();
    console.log('Webhook Invalid Signature Response:', responseBody);
    expect(responseBody).toHaveProperty('message');
    expect(responseBody.message).toContain('Invalid HMAC signature'); // Or similar error message
  });
});