import axios from 'axios';

// Assume the API is running on localhost:3000 or specified via environment variable
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// HOB tenant credentials - these would typically come from environment variables or a secure config
// For E2E tests, we assume these are pre-provisioned in the test environment
const HOB_USERNAME = process.env.HOB_USERNAME || 'hob_admin';
const HOB_PASSWORD = process.env.HOB_PASSWORD || 'password123';

// Global variables to share state between tests within this describe block
let hobAuthToken: string;
let menuItems: any[] = [];
let orderId: string;
// Store details of items selected for the order to verify later
let selectedOrderItems: { id: string, name: string, unit_price: number, quantity: number }[] = [];
let expectedSubtotal: number = 0;

describe('Restaurant Order Flow E2E', () => {
  // Use beforeAll to handle login once to get the auth token
  // This token will be used by all subsequent tests.
  beforeAll(async () => {
    console.log('Running beforeAll: Attempting to log in as HOB tenant...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        username: HOB_USERNAME,
        password: HOB_PASSWORD,
      });

      expect(loginResponse.status).toBe(201);
      expect(loginResponse.data).toHaveProperty('access_token');
      hobAuthToken = loginResponse.data.access_token;
      console.log('beforeAll: Login successful. Token obtained.');
    } catch (error: any) {
      console.error('Login failed in beforeAll:', error.message || error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error; // Fail the test suite if login fails
    }
  });

  it('POST /auth/login as HOB tenant', () => {
    // This test simply verifies that the 'beforeAll' login step was successful
    expect(hobAuthToken).toBeDefined();
    console.log('Test: POST /auth/login as HOB tenant - Verified token is available.');
  });

  it('GET /menu returns items', async () => {
    expect(hobAuthToken).toBeDefined(); // Ensure token is available from the login step
    console.log('Test: GET /menu returns items - Fetching menu...');

    try {
      const menuResponse = await axios.get(`${BASE_URL}/menu`, {
        headers: {
          Authorization: `Bearer ${hobAuthToken}`,
        },
      });

      expect(menuResponse.status).toBe(200);
      expect(Array.isArray(menuResponse.data)).toBe(true);
      expect(menuResponse.data.length).toBeGreaterThan(0);
      menuItems = menuResponse.data; // Store menu items for subsequent tests
      console.log(`Test: GET /menu returns items - Fetched ${menuItems.length} menu items.`);
    } catch (error: any) {
      console.error('Fetching menu failed:', error.message || error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  });

  it('POST /orders creates order with items', async () => {
    // Ensure we have menu items to create an order
    expect(menuItems.length).toBeGreaterThanOrEqual(2);
    expect(hobAuthToken).toBeDefined();

    // Select the first two available menu items for the order
    const item1 = menuItems[0];
    const item2 = menuItems[1];

    selectedOrderItems = [
      { id: item1.id, name: item1.name, unit_price: item1.price, quantity: 2 },
      { id: item2.id, name: item2.name, unit_price: item2.price, quantity: 1 },
    ];

    // Calculate the expected subtotal based on selected items and quantities
    expectedSubtotal = 
      (item1.price * selectedOrderItems[0].quantity) + 
      (item2.price * selectedOrderItems[1].quantity);

    console.log(`Test: POST /orders creates order with items - Creating order with items: ${item1.name} (x2), ${item2.name} (x1). Expected subtotal: ${expectedSubtotal}`);

    try {
      const createOrderResponse = await axios.post(`${BASE_URL}/orders`, {
        items: selectedOrderItems.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
        })),
        // Additional fields like customer_id, table_number etc. could be added if required by API
      }, {
        headers: {
          Authorization: `Bearer ${hobAuthToken}`,
        },
      });

      expect(createOrderResponse.status).toBe(201);
      expect(createOrderResponse.data).toHaveProperty('id');
      expect(createOrderResponse.data).toHaveProperty('status', 'PENDING'); // Assuming 'PENDING' is the default initial status
      orderId = createOrderResponse.data.id; // Store the newly created order ID
      console.log(`Test: Order created with ID: ${orderId}`);
    } catch (error: any) {
      console.error('Order creation failed:', error.message || error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  });

  it('PATCH /orders/:id/status updates to preparing', async () => {
    expect(orderId).toBeDefined(); // Ensure an order was created in the previous step
    expect(hobAuthToken).toBeDefined();
    console.log(`Test: PATCH /orders/:id/status updates to preparing - Updating order ${orderId} status...`);

    try {
      const updateStatusResponse = await axios.patch(`${BASE_URL}/orders/${orderId}/status`, {
        status: 'PREPARING', // New status to update to
      }, {
        headers: {
          Authorization: `Bearer ${hobAuthToken}`,
        },
      });

      expect(updateStatusResponse.status).toBe(200);
      expect(updateStatusResponse.data).toHaveProperty('id', orderId);
      expect(updateStatusResponse.data).toHaveProperty('status', 'PREPARING');
      console.log(`Test: Order ${orderId} status successfully updated to PREPARING.`);
    } catch (error: any) {
      console.error('Order status update failed:', error.message || error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  });

  it('GET /orders/:id shows correct total', async () => {
    expect(orderId).toBeDefined(); // Ensure an order ID is available
    expect(expectedSubtotal).toBeGreaterThan(0); // Ensure subtotal was calculated
    expect(hobAuthToken).toBeDefined();
    console.log(`Test: GET /orders/:id shows correct total - Fetching order ${orderId} details to verify totals...`);

    try {
      const getOrderResponse = await axios.get(`${BASE_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${hobAuthToken}`,
        },
      });

      expect(getOrderResponse.status).toBe(200);
      expect(getOrderResponse.data).toHaveProperty('id', orderId);
      expect(getOrderResponse.data).toHaveProperty('status', 'PREPARING'); // Verify updated status
      expect(getOrderResponse.data).toHaveProperty('items');
      expect(Array.isArray(getOrderResponse.data.items)).toBe(true);
      
      // Verify that the items in the fetched order match what was sent
      expect(getOrderResponse.data.items.length).toBe(selectedOrderItems.length);
      for (const orderedItem of selectedOrderItems) {
        const foundItem = getOrderResponse.data.items.find((i: any) => i.menu_item_id === orderedItem.id);
        expect(foundItem).toBeDefined();
        expect(foundItem.quantity).toBe(orderedItem.quantity);
        // Using `unit_price` which is likely how it's stored/returned in the order details
        expect(foundItem.unit_price).toBe(orderedItem.unit_price); 
      }

      // Extract total amounts from the API response
      const { subtotal_amount, tax_amount, total_amount } = getOrderResponse.data;

      // Verify the subtotal matches our client-side calculation (based on known item prices)
      // Using toBeCloseTo for floating point comparisons to avoid precision issues
      expect(subtotal_amount).toBeCloseTo(expectedSubtotal, 2); 

      // Rule #10 states loyalty/tax/promo rates are from DB, NEVER hardcoded.
      // Therefore, we verify that the API's own calculation for total amount is consistent:
      // total = subtotal + tax (assuming no promo/loyalty for this basic flow example)
      expect(total_amount).toBeCloseTo(subtotal_amount + tax_amount, 2);
      
      console.log(`Test: Order ${orderId} totals verified: Subtotal: ${subtotal_amount}, Tax: ${tax_amount}, Total: ${total_amount}`);
    } catch (error: any) {
      console.error('Fetching order details failed:', error.message || error);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  });
});