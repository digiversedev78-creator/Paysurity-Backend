import { test, expect, Page, Locator } from '@playwright/test';

// Base URL for the microsite
const BASE_URL = 'https://houseofbiryanirestaurant.food';

// Test data for customer details (for checkout)
const TEST_CUSTOMER_NAME = 'John Doe';
const TEST_CUSTOMER_EMAIL = 'john.doe@example.com'; // Using a generic email for consumer flow
const TEST_CUSTOMER_PHONE = '5551234567';
const TEST_CUSTOMER_ADDRESS = '123 Test St, Test City, 12345';

// NOTE: tenantId='house-of-biryani-chicago-2026', email='owner@houseofbiryanirestaurant.food', password='TestPass123!'
// These credentials appear to be for an admin/owner login. As the scenarios describe a *consumer* microsite order flow
// which typically does not require login to browse and checkout, these credentials are not used in this suite.
// If a consumer login step were required, test.beforeAll would be used to handle authentication.

// --- Page Object Model (POM) Classes ---

class MicrositeHomePage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigate() {
        await this.page.goto(BASE_URL);
        // Wait for network to be idle, suggesting primary content has loaded
        await this.page.waitForLoadState('networkidle');
    }

    getStoreName(): Locator {
        // Assuming the store name is prominently displayed, e.g., in an H1 tag
        return this.page.locator('h1:has-text("House of Biryani Restaurant")');
    }

    getCategoryLink(categoryName: string): Locator {
        // Assuming navigation links for categories, possibly within a nav element
        return this.page.locator(`nav a:has-text("${categoryName}")`);
    }

    getMenuItemCard(itemName: string): Locator {
        // Assuming each menu item is within a card-like element identified by a data-test-id
        return this.page.locator(`[data-test-id="menu-item-card"]:has-text("${itemName}")`);
    }

    getMenuItemAddToCartButton(itemName: string): Locator {
        // Find the 'Add to Cart' button specifically within the menu item's card
        return this.getMenuItemCard(itemName).locator('button:has-text("Add to Cart")');
    }

    getCartIcon(): Locator {
        // Assuming a shopping cart icon, possibly with a data-test-id
        return this.page.locator('[data-test-id="cart-icon"]');
    }

    getCartItemCount(): Locator {
        // Assuming a badge or text displaying the number of items in the cart
        return this.page.locator('[data-test-id="cart-item-count"]');
    }

    getProceedToCheckoutButton(): Locator {
        return this.page.locator('button:has-text("Proceed to Checkout")');
    }

    getCategoryDescription(categoryName: string): Locator {
        // Locates a description element that follows a category title
        // This selector is an example and might need adjustment based on actual DOM structure.
        return this.page.locator(`h2:has-text("${categoryName}") + p, div:has-text("${categoryName}") + div.description`);
    }

    async addItemToCart(itemName: string) {
        // Clicks the 'Add to Cart' button for the specified item
        await this.getMenuItemAddToCartButton(itemName).click();
        // A small delay to allow UI updates, could be replaced by waiting for cart count to change
        await this.page.waitForTimeout(500);
    }

    async getMenuItem(itemName: string): Locator {
        // Generic locator to check if an item is visible on the page (e.g., after category toggle)
        return this.page.locator(`[data-test-id="menu-item-card"]:has-text("${itemName}")`);
    }
}

class CheckoutPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    getCustomerNameInput(): Locator {
        return this.page.locator('input[name="customerName"]');
    }

    getCustomerEmailInput(): Locator {
        return this.page.locator('input[name="customerEmail"]');
    }

    getCustomerPhoneInput(): Locator {
        return this.page.locator('input[name="customerPhone"]');
    }

    getCustomerAddressInput(): Locator {
        return this.page.locator('textarea[name="customerAddress"]');
    }

    getSubmitOrderButton(): Locator {
        return this.page.locator('button:has-text("Place Order")');
    }

    getConfirmationMessage(): Locator {
        // Assuming a specific element with a data-test-id for the order confirmation message
        return this.page.locator('[data-test-id="order-confirmation-message"]');
    }

    async fillCustomerDetails(name: string, email: string, phone: string, address: string) {
        await this.getCustomerNameInput().fill(name);
        await this.getCustomerEmailInput().fill(email);
        await this.getCustomerPhoneInput().fill(phone);
        await this.getCustomerAddressInput().fill(address);
    }

    async submitOrder() {
        await this.getSubmitOrderButton().click();
        // Wait for navigation or network to settle after form submission
        await this.page.waitForLoadState('networkidle');
    }
}

// --- Test Suite ---

test.describe('Consumer Microsite Order Flow', () => {
    let homePage: MicrositeHomePage;
    let checkoutPage: CheckoutPage;

    // Use test.beforeEach to ensure a clean slate for each test, navigating to the base URL
    test.beforeEach(async ({ page }) => {
        homePage = new MicrositeHomePage(page);
        checkoutPage = new CheckoutPage(page);
        await homePage.navigate();
    });

    test('House of Biryani microsite loads at domain', async () => {
        await expect(homePage.getStoreName()).toBeVisible();
        await expect(homePage.page).toHaveURL(BASE_URL);
    });

    test('browse menu, categories toggle correctly', async () => {
        // Initially, ensure Biryanis category is active (or click it if not default)
        await homePage.getCategoryLink('Biryanis').click();
        await expect(homePage.getMenuItem('Hyderabadi Goat Dum Biryani')).toBeVisible();
        await expect(homePage.getMenuItem('Samosa')).not.toBeVisible(); // Assuming Samosa is in Appetizers

        // Switch to Appetizers category
        await homePage.getCategoryLink('Appetizers').click();
        await expect(homePage.getMenuItem('Samosa')).toBeVisible();
        await expect(homePage.getMenuItem('Hyderabadi Goat Dum Biryani')).not.toBeVisible(); // Should now be hidden
    });

    test('add Hyderabadi Goat Dum Biryani to cart', async () => {
        await homePage.getCategoryLink('Biryanis').click(); // Ensure Biryanis category is active
        await homePage.addItemToCart('Hyderabadi Goat Dum Biryani');
        
        await expect(homePage.getCartItemCount()).toBeVisible();
        await expect(homePage.getCartItemCount()).toHaveText('1');
        await expect(homePage.getCartIcon()).toBeVisible();
    });

    test('proceed to checkout, fill customer details', async ({ page }) => {
        // Pre-requisite: Add an item to the cart to enable the checkout button
        await homePage.getCategoryLink('Biryanis').click();
        await homePage.addItemToCart('Hyderabadi Goat Dum Biryani');
        await expect(homePage.getCartItemCount()).toHaveText('1'); // Verify item added

        await homePage.getProceedToCheckoutButton().click();
        // Wait for the URL to change to the checkout page
        await page.waitForURL(/.*\/checkout/);

        // Verify customer detail input fields are visible and fill them
        await expect(checkoutPage.getCustomerNameInput()).toBeVisible();
        await checkoutPage.fillCustomerDetails(
            TEST_CUSTOMER_NAME,
            TEST_CUSTOMER_EMAIL,
            TEST_CUSTOMER_PHONE,
            TEST_CUSTOMER_ADDRESS
        );

        // Assert that the fields are filled correctly
        await expect(checkoutPage.getCustomerNameInput()).toHaveValue(TEST_CUSTOMER_NAME);
        await expect(checkoutPage.getCustomerEmailInput()).toHaveValue(TEST_CUSTOMER_EMAIL);
        await expect(checkoutPage.getCustomerPhoneInput()).toHaveValue(TEST_CUSTOMER_PHONE);
        await expect(checkoutPage.getCustomerAddressInput()).toHaveValue(TEST_CUSTOMER_ADDRESS);
    });

    test('order submission succeeds, shows confirmation', async ({ page }) => {
        // Pre-requisite: Add an item to the cart and proceed to checkout
        await homePage.getCategoryLink('Biryanis').click();
        await homePage.addItemToCart('Hyderabadi Goat Dum Biryani');
        await expect(homePage.getCartItemCount()).toHaveText('1');

        await homePage.getProceedToCheckoutButton().click();
        await page.waitForURL(/.*\/checkout/);

        // Fill customer details
        await checkoutPage.fillCustomerDetails(
            TEST_CUSTOMER_NAME,
            TEST_CUSTOMER_EMAIL,
            TEST_CUSTOMER_PHONE,
            TEST_CUSTOMER_ADDRESS
        );

        // Submit the order
        await checkoutPage.submitOrder();

        // Verify that a confirmation message is displayed
        await expect(checkoutPage.getConfirmationMessage()).toBeVisible();
        // Expect a message like "Order #12345 Confirmed" (using regex for dynamic order ID)
        await expect(checkoutPage.getConfirmationMessage()).toHaveText(/Order #\d+ Confirmed/i);
    });

    test('paan category shows cultural description', async () => {
        await homePage.getCategoryLink('Paan').click();
        
        await expect(homePage.getCategoryDescription('Paan')).toBeVisible();
        // Verify the text content of the cultural description for Paan
        await expect(homePage.getCategoryDescription('Paan')).toHaveText(/Paan is a traditional Indian after-meal digestive/i);
    });
});
