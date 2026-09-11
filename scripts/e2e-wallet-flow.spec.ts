import { test, expect, APIResponse } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Base URL for the PaySurity API
// It's good practice to make this configurable via environment variables
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

test.describe('Wallet Flow E2E', () => {
  let currentTenantId: string;
  let currentUserId: string;

  // Helper function to generate authentication headers for a specific tenant and user.
  // In a real application, this would typically involve a Bearer token obtained from a login endpoint.
  const getAuthHeaders = (tenantId: string, userId: string) => ({
    'x-tenant-id': tenantId, // Simulates the tenant context often extracted from a JWT payload
    'x-user-id': userId,     // Simulates the user context, also typically from a JWT
    'Content-Type': 'application/json',
    // 'Authorization': `Bearer ${process.env.AUTH_TOKEN}`, // Example for a real token scenario
  });

  // Ensure each test runs with a fresh tenant and user ID for isolation
  test.beforeEach(async () => {
    currentTenantId = uuidv4();
    currentUserId = uuidv4();
  });

  test('POST /wallets creates wallet for tenant', async ({ request }) => {
    const headers = getAuthHeaders(currentTenantId, currentUserId);

    const createWalletResponse = await request.post(`${API_BASE_URL}/wallets`, {
      headers: headers,
      data: {
        currency: 'USD', // Assuming 'USD' as a default or required currency
      },
    });

    expect(createWalletResponse.status()).toBe(201); // HTTP 201 Created
    const wallet = await createWalletResponse.json();

    expect(wallet).toHaveProperty('id');
    expect(typeof wallet.id).toBe('string');
    expect(wallet).toHaveProperty('tenantId', currentTenantId);
    expect(wallet).toHaveProperty('ownerId', currentUserId); // Assuming the creating user is the owner
    expect(wallet).toHaveProperty('currency', 'USD');
    expect(wallet).toHaveProperty('balance', 0); // New wallets should have an initial balance of 0
  });

  test('POST /wallets/topup adds balance', async ({ request }) => {
    const headers = getAuthHeaders(currentTenantId, currentUserId);
    const topupAmount = 10000; // $100.00 (assuming amounts are in minor units like cents)

    // First, create a wallet to top up
    const createWalletResponse = await request.post(`${API_BASE_URL}/wallets`, {
      headers: headers,
      data: { currency: 'USD' },
    });
    expect(createWalletResponse.status()).toBe(201);
    const wallet = await createWalletResponse.json();
    const walletId = wallet.id;

    // Then, perform the top-up
    const topupResponse = await request.post(`${API_BASE_URL}/wallets/topup`, {
      headers: headers,
      data: {
        walletId: walletId,
        amount: topupAmount,
        currency: 'USD',
        source: 'external_bank', // Assuming a source of funds is required
      },
    });

    expect(topupResponse.status()).toBe(200); // Or 201 if a new transaction record is created
    const topupResult = await topupResponse.json();

    expect(topupResult).toHaveProperty('status', 'completed'); // Assuming a transaction status is returned
    expect(topupResult).toHaveProperty('newBalance', topupAmount); // Verify the updated balance
    expect(topupResult).toHaveProperty('walletId', walletId);
  });

  test('GET /wallets/balance shows updated balance', async ({ request }) => {
    const headers = getAuthHeaders(currentTenantId, currentUserId);
    const initialTopupAmount = 7500; // $75.00

    // 1. Create a wallet
    const createWalletResponse = await request.post(`${API_BASE_URL}/wallets`, {
      headers: headers,
      data: { currency: 'USD' },
    });
    expect(createWalletResponse.status()).toBe(201);
    const wallet = await createWalletResponse.json();
    const walletId = wallet.id;

    // 2. Top up the newly created wallet
    const topupResponse = await request.post(`${API_BASE_URL}/wallets/topup`, {
      headers: headers,
      data: {
        walletId: walletId,
        amount: initialTopupAmount,
        currency: 'USD',
        source: 'external_bank',
      },
    });
    expect(topupResponse.status()).toBe(200);

    // 3. Retrieve the balance for the wallet
    const balanceResponse = await request.get(`${API_BASE_URL}/wallets/${walletId}/balance`, {
      headers: headers,
    });

    expect(balanceResponse.status()).toBe(200); // HTTP 200 OK
    const balanceInfo = await balanceResponse.json();

    expect(balanceInfo).toHaveProperty('walletId', walletId);
    expect(balanceInfo).toHaveProperty('balance', initialTopupAmount);
    expect(balanceInfo).toHaveProperty('currency', 'USD');
  });

  test('POST /wallets/transfer deducts from sender adds to receiver', async ({ request }) => {
    const senderUserId = uuidv4();
    const receiverUserId = uuidv4();
    const senderHeaders = getAuthHeaders(currentTenantId, senderUserId);
    const receiverHeaders = getAuthHeaders(currentTenantId, receiverUserId);

    const transferAmount = 2500; // $25.00
    const senderInitialTopup = 5000; // $50.00

    // 1. Create sender wallet
    const createSenderWalletResponse = await request.post(`${API_BASE_URL}/wallets`, {
      headers: senderHeaders,
      data: { currency: 'USD' },
    });
    expect(createSenderWalletResponse.status()).toBe(201);
    const senderWallet = await createSenderWalletResponse.json();
    const senderWalletId = senderWallet.id;

    // 2. Create receiver wallet
    const createReceiverWalletResponse = await request.post(`${API_BASE_URL}/wallets`, {
      headers: receiverHeaders,
      data: { currency: 'USD' },
    });
    expect(createReceiverWalletResponse.status()).toBe(201);
    const receiverWallet = await createReceiverWalletResponse.json();
    const receiverWalletId = receiverWallet.id;

    // 3. Top up sender wallet with sufficient funds
    const topupSenderResponse = await request.post(`${API_BASE_URL}/wallets/topup`, {
      headers: senderHeaders,
      data: {
        walletId: senderWalletId,
        amount: senderInitialTopup,
        currency: 'USD',
        source: 'initial_funding',
      },
    });
    expect(topupSenderResponse.status()).toBe(200);

    // 4. Perform the transfer from sender to receiver
    const transferResponse = await request.post(`${API_BASE_URL}/wallets/transfer`, {
      headers: senderHeaders, // Sender initiates the transfer
      data: {
        senderWalletId: senderWalletId,
        receiverWalletId: receiverWalletId,
        amount: transferAmount,
        currency: 'USD',
      },
    });

    expect(transferResponse.status()).toBe(200); // Or 201
    const transferResult = await transferResponse.json();
    expect(transferResult).toHaveProperty('status', 'completed'); // Expect transfer to complete successfully

    // 5. Verify sender's new balance
    const senderBalanceResponse = await request.get(`${API_BASE_URL}/wallets/${senderWalletId}/balance`, {
      headers: senderHeaders,
    });
    expect(senderBalanceResponse.status()).toBe(200);
    const senderBalance = await senderBalanceResponse.json();
    expect(senderBalance).toHaveProperty('balance', senderInitialTopup - transferAmount);

    // 6. Verify receiver's new balance
    const receiverBalanceResponse = await request.get(`${API_BASE_URL}/wallets/${receiverWalletId}/balance`, {
      headers: receiverHeaders,
    });
    expect(receiverBalanceResponse.status()).toBe(200);
    const receiverBalance = await receiverBalanceResponse.json();
    expect(receiverBalance).toHaveProperty('balance', transferAmount); // Receiver started with 0 balance
  });

  test('POST /wallets/topup fails with insufficient limit', async ({ request }) => {
    const headers = getAuthHeaders(currentTenantId, currentUserId);
    // Assume an extremely large amount that will exceed any reasonable configured top-up limit
    const excessiveTopupAmount = 1_000_000_000_000; // $10 Billion (in cents)

    // First, create a wallet
    const createWalletResponse = await request.post(`${API_BASE_URL}/wallets`, {
      headers: headers,
      data: { currency: 'USD' },
    });
    expect(createWalletResponse.status()).toBe(201);
    const wallet = await createWalletResponse.json();
    const walletId = wallet.id;

    // Attempt to top up with an amount exceeding the limit
    const topupResponse = await request.post(`${API_BASE_URL}/wallets/topup`, {
      headers: headers,
      data: {
        walletId: walletId,
        amount: excessiveTopupAmount,
        currency: 'USD',
        source: 'test_limit_exceeded',
      },
    });

    // Expect a client error status code (e.g., 400 Bad Request, 403 Forbidden, or 422 Unprocessable Entity)
    expect(topupResponse.status()).toBe(400);
    const errorBody = await topupResponse.json();

    // Verify the error message indicates a limit issue
    expect(errorBody).toHaveProperty('message');
    expect(errorBody.message).toMatch(/limit|exceed|maximum amount/i); // Case-insensitive check for common phrases
    expect(errorBody).toHaveProperty('statusCode', 400); // Assuming standard NestJS error structure
  });
});