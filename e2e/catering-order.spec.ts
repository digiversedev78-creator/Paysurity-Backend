import { test, expect, Page } from '@playwright/test';

// --- Constants ---
// Replace with your actual application's base URL
const BASE_URL = 'http://localhost:3000'; 
const TENANT_ID = 'house-of-biryani-chicago-2026';
const OWNER_EMAIL = 'owner@houseofbiryanirestaurant.food';
const OWNER_PASSWORD = 'TestPass123!';

// --- Page Object Models ---

class CateringOrderPage {
    private page: Page;
    private tenantId: string;

    constructor(page: Page, tenantId: string) {
        this.page = page;
        this.tenantId = tenantId;
    }

    async goto() {
        await this.page.goto(`${BASE_URL}/${this.tenantId}/catering`);
        await this.page.waitForLoadState('networkidle');
    }

    async selectDate(date: Date) {
        // Assume a date picker input that opens a calendar or allows direct input
        // Format date to 'YYYY-MM-DD' for direct input (common for type='date')
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        // Fill the date input directly. If it's a complex calendar,
        // more intricate interactions (clicking prev/next month, then day) would be needed.
        await this.page.locator('[data-test-id="catering-date-input"]').fill(formattedDate);
        await this.page.keyboard.press('Escape'); // Close date picker if it's a pop-up
    }

    async selectTime(time: string) {
        // Assume time is selected from a dropdown or similar input
        await this.page.locator('[data-test-id="catering-time-select"]').selectOption(time);
    }

    async enterContactInfo(name: string, email: string, phone: string) {
        await this.page.locator('[data-test-id="contact-name-input"]').fill(name);
        await this.page.locator('[data-test-id="contact-email-input"]').fill(email);
        await this.page.locator('[data-test-id="contact-phone-input"]').fill(phone);
    }

    async addMenuItem(item: string, quantity: number) {
        // Assume each menu item has a quantity input identifiable by its name
        await this.page.locator(`[data-test-id="menu-item-${item.toLowerCase().replace(/\s/g, '-')}-quantity-input"]`).fill(String(quantity));
        // Trigger blur event to ensure calculations update
        await this.page.locator(`[data-test-id="menu-item-${item.toLowerCase().replace(/\s/g, '-')}-quantity-input"]`).blur();
    }

    async getTotalAmount(): Promise<number> {
        await this.page.waitForSelector('[data-test-id="catering-total-amount"]', { state: 'visible' });
        const totalText = await this.page.locator('[data-test-id="catering-total-amount"]').textContent();
        return parseFloat(totalText?.replace(/[^0-9.]/g, '') || '0'); // Remove currency symbols and parse
    }

    async getDepositAmount(): Promise<number> {
        await this.page.waitForSelector('[data-test-id="catering-deposit-amount"]', { state: 'visible' });
        const depositText = await this.page.locator('[data-test-id="catering-deposit-amount"]').textContent();
        return parseFloat(depositText?.replace(/[^0-9.]/g, '') || '0'); // Remove currency symbols and parse
    }

    async getWarningMessage(): Promise<string | null> {
        const locator = this.page.locator('[data-test-id="catering-warning-message"]');
        // Wait briefly for the message to appear if it's dynamic
        await locator.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
        if (await locator.isVisible()) {
            return locator.textContent();
        }
        return null;
    }

    async getDateErrorMessage(): Promise<string | null> {
        const locator = this.page.locator('[data-test-id="catering-date-error-message"]');
        await locator.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
        if (await locator.isVisible()) {
            return locator.textContent();
        }
        return null;
    }

    async submitOrder() {
        await this.page.locator('[data-test-id="submit-catering-order-button"]').click();
        await this.page.waitForLoadState('networkidle'); // Wait for form submission and potential redirect
    }

    async getOrderConfirmationMessage(): Promise<string | null> {
        const locator = this.page.locator('[data-test-id="order-confirmation-message"]');
        await locator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}); // Wait for confirmation page elements
        if (await locator.isVisible()) {
            return locator.textContent();
        }
        return null;
    }

    async getOrderIdFromConfirmation(): Promise<string | null> {
        const locator = this.page.locator('[data-test-id="order-confirmation-id"]');
        await locator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        if (await locator.isVisible()) {
            return locator.textContent();
        }
        return null;
    }
}

class LoginPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto(tenantId: string) {
        await this.page.goto(`${BASE_URL}/${tenantId}/login`);
        await this.page.waitForLoadState('networkidle');
    }

    async login(email: string, password: string) {
        await this.page.locator('[data-test-id="email-input"]').fill(email);
        await this.page.locator('[data-test-id="password-input"]').fill(password);
        await this.page.locator('[data-test-id="login-button"]').click();
        await this.page.waitForLoadState('networkidle');
        // Expect to be redirected to dashboard or home, not login page
        await expect(this.page).not.toHaveURL(/.*login/, { timeout: 10000 });
    }
}

class MerchantDashboardPage {
    private page: Page;
    private tenantId: string;

    constructor(page: Page, tenantId: string) {
        this.page = page;
        this.tenantId = tenantId;
    }

    async goto() {
        await this.page.goto(`${BASE_URL}/${this.tenantId}/dashboard`);
        await this.page.waitForLoadState('networkidle');
    }

    async findOrder(orderId: string, customerName: string, expectedTotal: number) {
        // Assume orders are listed and each has a data-test-id for easy lookup
        const orderRow = this.page.locator(`[data-test-id="order-list-item-${orderId}"]`);
        await expect(orderRow).toBeVisible({ timeout: 10000 }); // Wait for the order to appear

        await expect(orderRow.locator('[data-test-id="order-customer-name"]')).toHaveText(customerName);
        // Assuming total is displayed with 2 decimal places and a '$'
        await expect(orderRow.locator('[data-test-id="order-total-amount"]')).toHaveText(`$${expectedTotal.toFixed(2)}`);
    }

    async getOrderStatus(orderId: string): Promise<string | null> {
        const orderRow = this.page.locator(`[data-test-id="order-list-item-${orderId}"]`);
        return orderRow.locator('[data-test-id="order-status"]').textContent();
    }
}


// --- Test Suite ---

test.describe('Catering Order E2E Tests', () => {
    let cateringPage: CateringOrderPage;
    let loginPage: LoginPage;
    let dashboardPage: MerchantDashboardPage;

    // Initialize page objects before each test for a fresh state
    test.beforeEach(async ({ page }) => {
        cateringPage = new CateringOrderPage(page, TENANT_ID);
        loginPage = new LoginPage(page);
        dashboardPage = new MerchantDashboardPage(page, TENANT_ID);
    });

    test('catering form requires 48h advance notice: reject same-day order', async ({ page }) => {
        await cateringPage.goto();

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Set date to tomorrow

        await cateringPage.selectDate(tomorrow);
        await cateringPage.selectTime('12:00 PM'); // Select a time
        await cateringPage.addMenuItem('Chicken Biryani', 10); // Add some items
        await cateringPage.enterContactInfo('John Doe', 'john.doe@example.com', '555-123-4567');

        await cateringPage.submitOrder();

        // Expect an error message related to advance notice to be visible
        const errorMessage = await cateringPage.getDateErrorMessage();
        expect(errorMessage).toContain('48 hours advance notice is required');
        await expect(page).toHaveURL(/.*catering/, { timeout: 5000 }); // Should stay on the catering page
    });

    test('catering form accepts order with 72h notice', async ({ page }) => {
        await cateringPage.goto();

        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3); // Order 3 days from now
        threeDaysFromNow.setHours(12, 0, 0, 0); // Standardize time for order to ensure 72h is met

        await cateringPage.selectDate(threeDaysFromNow);
        await cateringPage.selectTime('03:00 PM');
        await cateringPage.addMenuItem('Goat Curry', 5);
        await cateringPage.enterContactInfo('Jane Smith', 'jane.smith@example.com', '555-987-6543');

        await cateringPage.submitOrder();

        const confirmationMessage = await cateringPage.getOrderConfirmationMessage();
        expect(confirmationMessage).toContain('Your catering order has been placed successfully!');
        await expect(page).toHaveURL(/.*confirmation/, { timeout: 5000 }); // Should redirect to confirmation page
    });

    test('deposit calculation: 25% of total shown', async ({ page }) => {
        await cateringPage.goto();

        const fourDaysFromNow = new Date();
        fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4);
        fourDaysFromNow.setHours(12, 0, 0, 0);

        await cateringPage.selectDate(fourDaysFromNow);
        await cateringPage.selectTime('06:00 PM');
        await cateringPage.addMenuItem('Vegetable Samosa', 20); // Assume item price $2.50 -> $50
        await cateringPage.addMenuItem('Chicken Biryani', 15);  // Assume item price $10.00 -> $150
                                                              // Total = $200

        // Allow UI to recalculate and display values after adding items
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Small buffer for UI updates

        const totalAmount = await cateringPage.getTotalAmount();
        const depositAmount = await cateringPage.getDepositAmount();

        expect(totalAmount).toBeGreaterThan(0); // Ensure items were added and priced
        expect(depositAmount).toBeCloseTo(totalAmount * 0.25, 2); // Check deposit is 25% of total
    });

    test('paan bulk order (50+) shows advance notice warning', async ({ page }) => {
        await cateringPage.goto();

        const fiveDaysFromNow = new Date();
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
        fiveDaysFromNow.setHours(12, 0, 0, 0);

        await cateringPage.selectDate(fiveDaysFromNow);
        await cateringPage.selectTime('01:00 PM');
        await cateringPage.addMenuItem('Paan', 55); // Bulk quantity

        // Allow UI to display the warning message
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // Small buffer for UI updates

        const warningMessage = await cateringPage.getWarningMessage();
        expect(warningMessage).not.toBeNull();
        expect(warningMessage).toContain('For bulk orders of Paan (50+), please allow additional advance notice');
        expect(warningMessage).toContain('contact us directly'); // Specific phrasing expected
    });

    test('confirmed catering order appears in merchant dashboard', async ({ page }) => {
        // --- 1. Place the order as a customer ---
        await cateringPage.goto();

        const sixDaysFromNow = new Date();
        sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 6);
        sixDaysFromNow.setHours(12, 0, 0, 0); // Standardize time for order

        const customerName = `Test Customer ${Date.now()}`; // Unique name for easy identification
        const customerEmail = `customer-${Date.now()}@example.com`;
        const customerPhone = '555-000-0000';

        // Assume item prices for calculating expected total
        // Chicken Biryani: $10.00, Goat Curry: $20.00
        const item1Quantity = 15;
        const item1Price = 10.00;
        const item2Quantity = 5;
        const item2Price = 20.00;
        const expectedOrderTotal = (item1Quantity * item1Price) + (item2Quantity * item2Price); // 15*10 + 5*20 = 150 + 100 = 250

        await cateringPage.selectDate(sixDaysFromNow);
        await cateringPage.selectTime('04:00 PM');
        await cateringPage.addMenuItem('Chicken Biryani', item1Quantity);
        await cateringPage.addMenuItem('Goat Curry', item2Quantity);
        await cateringPage.enterContactInfo(customerName, customerEmail, customerPhone);

        // Allow UI to update calculated total before submission
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        const actualUITotal = await cateringPage.getTotalAmount();
        expect(actualUITotal).toBeCloseTo(expectedOrderTotal, 2); // Sanity check UI calculation

        await cateringPage.submitOrder();

        const confirmationMessage = await cateringPage.getOrderConfirmationMessage();
        expect(confirmationMessage).toContain('Your catering order has been placed successfully!');

        const orderId = await cateringPage.getOrderIdFromConfirmation();
        expect(orderId).not.toBeNull();
        expect(orderId).toMatch(/^\d+$/); // Assuming order ID is a number

        // --- 2. Login as Merchant and verify the order ---
        await loginPage.goto(TENANT_ID);
        await loginPage.login(OWNER_EMAIL, OWNER_PASSWORD);

        await dashboardPage.goto();
        // The order should now be visible on the dashboard list
        await dashboardPage.findOrder(orderId!, customerName, expectedOrderTotal);
        const orderStatus = await dashboardPage.getOrderStatus(orderId!);
        expect(orderStatus).toBe('Pending'); // Assuming initial status for new orders
    });
});
