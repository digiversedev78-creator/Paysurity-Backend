import { test as base, expect, Page } from '@playwright/test';
import { APIRequestContext } from '@playwright/test';

// Configuration constants for the API tests
// IMPORTANT: Replace 'https://api.example.com' with your actual API base URL.
const BASE_URL = 'https://api.example.com';
const TENANT_ID = 'house-of-biryani-chicago-2026';
const USER_EMAIL = 'owner@houseofbiryanirestaurant.food';
const USER_PASSWORD = 'TestPass123!';

/**
 * Defines custom Playwright test fixtures to manage authentication and provide
 * an authenticated APIRequestContext for all tests.
 * This approach centralizes the authentication logic and optimizes test execution
 * by performing the login only once per worker.
 */
type MyFixtures = {
  authToken: string; // Holds the JWT token obtained after successful login
  api: APIRequestContext; // An APIRequestContext pre-configured with auth headers
};

const test = base.extend<MyFixtures>({
  // authToken fixture: Handles the login process and stores the obtained JWT token.
  // This runs once per worker before any tests in that worker.
  authToken: [async ({ request }, use) => {
    console.log('Attempting API login to obtain auth token...');
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: USER_EMAIL,
        password: USER_PASSWORD,
        tenantId: TENANT_ID,
      },
      // Ensure the request doesn't follow redirects automatically, though typically not an issue for POST.
      maxRedirects: 0, 
    });

    // Assert that the login API call was successful (HTTP 200 OK).
    // If login fails, this will throw an error and prevent subsequent tests from running with invalid auth.
    expect(loginResponse.ok(), `API Login failed: Status ${loginResponse.status()} - ${await loginResponse.text()}`).toBeTruthy();
    
    const loginResponseBody = await loginResponse.json();
    // Assert that the response body contains a 'token' property, which is expected for successful login.
    expect(loginResponseBody).toHaveProperty('token');
    
    const token = loginResponseBody.token;
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
    console.log('Auth token successfully obtained and verified.');

    // Provide the obtained token to any subsequent fixtures or tests that depend on 'authToken'.
    await use(token); 
  }, { scope: 'worker' }], // 'worker' scope ensures this fixture runs only once per test worker.

  // api fixture: Creates and provides an APIRequestContext pre-configured with authentication headers.
  // This fixture depends on 'authToken' to get the necessary token.
  api: [async ({ authToken, request }, use) => {
    // Create a new APIRequestContext with the base URL and default headers.
    // The Authorization header includes the 'authToken' obtained from the login.
    // The 'X-Tenant-Id' header is also added as per requirements.
    const authenticatedRequest = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-Tenant-Id': TENANT_ID,
      },
    });
    // Provide the authenticated API context to tests.
    await use(authenticatedRequest);
    // Dispose of the APIRequestContext after all tests in the worker that used it have completed.
    await authenticatedRequest.dispose();
  }, { scope: 'worker' }], // 'worker' scope ensures this context is created once per worker.
});

test.describe('API Smoke Tests - Critical Endpoint Health Check', () => {

  // Test scenario: Verify the POST /api/auth/login endpoint itself works
  // and returns a token. This implicitly validates the setup of the 'authToken' fixture.
  test('POST /api/auth/login - should successfully authenticate and return a token', async ({ authToken }) => {
    // The 'authToken' fixture has already executed the login and performed assertions.
    // This test confirms that the token was successfully produced and is available.
    expect(authToken).toBeDefined();
    expect(typeof authToken).toBe('string');
    expect(authToken.length).toBeGreaterThan(0);
    console.log('Test Confirmation: POST /api/auth/login successfully returns a valid token.');
  });

  // Test scenario: GET /health endpoint - checks basic service availability.
  test('GET /health - should return 200 OK', async ({ api }) => {
    const response = await api.get('/health');
    expect(response.status()).toBe(200);
    console.log('GET /health: OK (Status 200)');
  });

  // Test scenario: GET /api/menu-items endpoint - checks data retrieval for menu items.
  test('GET /api/menu-items - should return 200 OK with an array body', async ({ api }) => {
    const response = await api.get('/api/menu-items');
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(Array.isArray(responseBody)).toBeTruthy();
    console.log('GET /api/menu-items: OK (Status 200, response body is an array)');
  });

  // Test scenario: GET /api/orders endpoint - checks data retrieval for orders.
  test('GET /api/orders - should return 200 OK', async ({ api }) => {
    const response = await api.get('/api/orders');
    expect(response.status()).toBe(200);
    console.log('GET /api/orders: OK (Status 200)');
  });

  // Test scenario: GET /api/customers endpoint - checks data retrieval for customers.
  test('GET /api/customers - should return 200 OK', async ({ api }) => {
    const response = await api.get('/api/customers');
    expect(response.status()).toBe(200);
    console.log('GET /api/customers: OK (Status 200)');
  });

  // Test scenario: GET /api/employees endpoint - checks data retrieval for employees.
  test('GET /api/employees - should return 200 OK', async ({ api }) => {
    const response = await api.get('/api/employees');
    expect(response.status()).toBe(200);
    console.log('GET /api/employees: OK (Status 200)');
  });

  // Test scenario: GET /api/settlement-batches endpoint - checks data retrieval for settlement batches.
  test('GET /api/settlement-batches - should return 200 OK', async ({ api }) => {
    const response = await api.get('/api/settlement-batches');
    expect(response.status()).toBe(200);
    console.log('GET /api/settlement-batches: OK (Status 200)');
  });

  // Test scenario: GET /api/analytics/revenue endpoint - checks data retrieval for revenue analytics.
  test('GET /api/analytics/revenue - should return 200 OK', async ({ api }) => {
    const response = await api.get('/api/analytics/revenue');
    expect(response.status()).toBe(200);
    console.log('GET /api/analytics/revenue: OK (Status 200)');
  });

  // Test scenario: GET /api/microsite/settings endpoint - checks data retrieval for microsite settings.
  test('GET /api/microsite/settings - should return 200 OK', async ({ api }) => {
    const response = await api.get('/api/microsite/settings');
    expect(response.status()).toBe(200);
    console.log('GET /api/microsite/settings: OK (Status 200)');
  });
});
