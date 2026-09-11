import { test, expect, Page } from '@playwright/test';

// --- Constants ---
const DASHBOARD_URL = 'https://merchant-dashboard.paysurity.com';
const TENANT_ID = 'house-of-biryani-chicago-2026';
const EMAIL = 'owner@houseofbiryanirestaurant.food';
const PASSWORD = 'TestPass123!';
const TEST_ITEM_NAME = 'Chicken Biryani'; // Assuming this item exists in the menu and inventory
const AUTH_FILE = 'playwright/.auth/user.json'; // Path to store auth state

// --- Page Object Models ---

class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  get tenantIdInput() { return this.page.locator('input[name="tenantId"]'); }
  get emailInput() { return this.page.locator('input[name="email"]'); }
  get passwordInput() { return this.page.locator('input[name="password"]'); }
  get loginButton() { return this.page.locator('button[type="submit"]'); }
  get dashboardHeader() { return this.page.locator('.dashboard-header'); } // Common element on dashboard after login

  async navigateTo() {
    await this.page.goto(DASHBOARD_URL);
    await expect(this.tenantIdInput).toBeVisible(); // Ensure it's the login page
  }

  async login(tenantId: string, email: string, password_str: string) {
    await this.tenantIdInput.fill(tenantId);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password_str);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle'); // Wait for dashboard to load
    await expect(this.dashboardHeader).toBeVisible(); // Assert successful navigation to dashboard
  }
}

class POSPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigators
  get posNavLink() { return this.page.locator('a[href="/pos"]'); }

  // POS elements
  get menuItemsContainer() { return this.page.locator('.menu-items-container'); }
  menuItemCard(name: string) { return this.page.locator(`.menu-item-card:has-text("${name}")`); } // Example locator for a menu item card
  get cartItemsList() { return this.page.locator('.cart-items-list'); }
  cartItem(name: string) { return this.cartItemsList.locator(`.cart-item:has-text("${name}")`); }
  get cartTotal() { return this.page.locator('.cart-total-price'); }
  get completeOrderButton() { return this.page.locator('.complete-order-button'); }
  get orderSuccessMessage() { return this.page.locator('.order-success-message'); } // Example: "Order placed successfully!"
  get orderReceiptModal() { return this.page.locator('.order-receipt-modal'); } // Modal that might appear after order
  get modalCloseButton() { return this.orderReceiptModal.locator('.close-button'); } // Button to close receipt modal

  async navigateToPOS() {
    await this.posNavLink.click();
    await this.page.waitForURL('**/pos');
    await this.page.waitForLoadState('networkidle');
    await expect(this.menuItemsContainer).toBeVisible();
  }

  async addMenuItemToCart(itemName: string) {
    await this.menuItemCard(itemName).click();
    await expect(this.cartItem(itemName)).toBeVisible();
    await this.page.waitForLoadState('networkidle'); // Wait for cart update API if any
  }

  async getCartItemCount() {
    return this.cartItemsList.locator('.cart-item').count();
  }

  async getCartTotal(): Promise<number> {
    const totalText = await this.cartTotal.innerText();
    const priceMatch = totalText.match(/(\d+\.\d{2})/); // Extract price like "12.34"
    return priceMatch ? parseFloat(priceMatch[1]) : 0;
  }

  async completeOrder() {
    // Intercept and wait for the /api/orders POST request and a successful response
    const ordersApiRequestPromise = this.page.waitForRequest(request =>
      request.url().includes('/api/orders') && request.method() === 'POST'
    );
    const ordersApiResponsePromise = this.page.waitForResponse(response =>
      response.url().includes('/api/orders') && response.request().method() === 'POST' && response.status() === 200
    );

    await this.completeOrderButton.click();

    // Wait for the API call to complete successfully
    await ordersApiRequestPromise;
    await ordersApiResponsePromise;

    // Await success message or receipt modal confirmation
    await expect(this.orderSuccessMessage.or(this.orderReceiptModal)).toBeVisible();
    if (await this.orderReceiptModal.isVisible()) {
      await this.modalCloseButton.click();
      await expect(this.orderReceiptModal).not.toBeVisible();
    }
    await this.page.waitForLoadState('networkidle');
  }
}

class OrdersPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get ordersNavLink() { return this.page.locator('a[href="/orders"]'); }
  get ordersListContainer() { return this.page.locator('.orders-list-container'); }
  orderRow(orderId: string) { return this.ordersListContainer.locator(`.order-row[data-order-id="${orderId}"]`); }
  latestOrderRow() { return this.ordersListContainer.locator('.order-row').first(); } // Assuming latest is at the top

  async navigateToOrders() {
    await this.ordersNavLink.click();
    await this.page.waitForURL('**/orders');
    await this.page.waitForLoadState('networkidle');
    await expect(this.ordersListContainer).toBeVisible();
  }

  async getLatestOrderDetails(): Promise<{ orderId: string, itemName: string } | null> {
    const latestOrder = this.latestOrderRow();
    if (await latestOrder.isVisible()) {
      const orderId = await latestOrder.getAttribute('data-order-id');
      const itemNameLocator = latestOrder.locator('.order-item-name').first(); // Assuming order item name is displayed
      const itemName = await itemNameLocator.innerText();
      if (orderId && itemName) {
        return { orderId, itemName };
      }
    }
    return null;
  }
}

class InventoryPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get inventoryNavLink() { return this.page.locator('a[href="/inventory"]'); }
  get inventoryItemsList() { return this.page.locator('.inventory-items-list'); }
  inventoryItemRow(itemName: string) { return this.inventoryItemsList.locator(`.inventory-item-row:has-text("${itemName}")`); }
  itemQuantity(itemName: string) { return this.inventoryItemRow(itemName).locator('.item-quantity'); } // Locator for quantity text

  async navigateToInventory() {
    await this.inventoryNavLink.click();
    await this.page.waitForURL('**/inventory');
    await this.page.waitForLoadState('networkidle');
    await expect(this.inventoryItemsList).toBeVisible();
  }

  async getInventoryQuantity(itemName: string): Promise<number | null> {
    const quantityText = await this.itemQuantity(itemName).innerText();
    const match = quantityText.match(/\d+/); // Extract number from "Qty: 10" or just "10"
    return match ? parseInt(match[0], 10) : null;
  }
}

// --- Test Suite ---

test.describe('POS Order Flow E2E', () => {
  // Setup: Login once and save authentication state for all tests in this describe block.
  // This approach reuses the authenticated state, speeding up the suite.
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await loginPage.login(TENANT_ID, EMAIL, PASSWORD);
    await page.context().storageState({ path: AUTH_FILE });
    await page.close();
  });

  // Each test will use the authenticated state from AUTH_FILE.
  test.use({ storageState: AUTH_FILE });

  test('load POS page and see menu items from API', async ({ page }) => {
    const posPage = new POSPage(page);
    await posPage.navigateToPOS();

    // Assert that the menu items container is visible
    await expect(posPage.menuItemsContainer).toBeVisible();
    // Assert that a specific test item is visible, indicating menu items loaded
    await expect(posPage.menuItemCard(TEST_ITEM_NAME)).toBeVisible();
  });

  test('add item to cart, verify total', async ({ page }) => {
    const posPage = new POSPage(page);
    await posPage.navigateToPOS();

    await posPage.addMenuItemToCart(TEST_ITEM_NAME);

    // Verify item count in cart
    await expect(await posPage.getCartItemCount()).toBe(1);

    // Verify cart total is positive (assuming item has a price)
    const actualTotal = await posPage.getCartTotal();
    expect(actualTotal).toBeGreaterThan(0);
    // For a more precise test, you would dynamically get the item's price from the menu card
    // and assert actualTotal.toBe(itemPrice).
  });

  test('complete order - submit to /api/orders', async ({ page }) => {
    const posPage = new POSPage(page);
    await posPage.navigateToPOS();

    await posPage.addMenuItemToCart(TEST_ITEM_NAME);
    await expect(await posPage.getCartItemCount()).toBe(1); // Ensure item is in cart

    await posPage.completeOrder();

    // Verify a success message or receipt modal appears after completing the order
    await expect(posPage.orderSuccessMessage.or(posPage.orderReceiptModal)).toBeVisible();
  });

  test('order appears in orders list', async ({ page }) => {
    const posPage = new POSPage(page);
    const ordersPage = new OrdersPage(page);

    // 1. Place an order first to ensure there's a new order to verify
    await posPage.navigateToPOS();
    await posPage.addMenuItemToCart(TEST_ITEM_NAME);
    await posPage.completeOrder();

    // 2. Navigate to the orders page
    await ordersPage.navigateToOrders();

    // 3. Verify the latest order includes the TEST_ITEM_NAME
    const latestOrderDetails = await ordersPage.getLatestOrderDetails();
    expect(latestOrderDetails).not.toBeNull();
    expect(latestOrderDetails?.itemName).toContain(TEST_ITEM_NAME);
  });

  test('inventory decrements after order', async ({ page }) => {
    const posPage = new POSPage(page);
    const inventoryPage = new InventoryPage(page);

    // 1. Get initial inventory quantity for TEST_ITEM_NAME
    await inventoryPage.navigateToInventory();
    const initialQuantity = await inventoryPage.getInventoryQuantity(TEST_ITEM_NAME);
    expect(initialQuantity).not.toBeNull();
    expect(initialQuantity).toBeGreaterThan(0); // Ensure there's stock to decrement from

    // 2. Place an order with TEST_ITEM_NAME
    await posPage.navigateToPOS();
    await posPage.addMenuItemToCart(TEST_ITEM_NAME);
    await posPage.completeOrder();

    // 3. Navigate back to inventory and get updated quantity
    await inventoryPage.navigateToInventory();
    const updatedQuantity = await inventoryPage.getInventoryQuantity(TEST_ITEM_NAME);

    // 4. Assert inventory decremented by 1
    expect(updatedQuantity).not.toBeNull();
    expect(updatedQuantity).toBe(initialQuantity! - 1);
  });
});
