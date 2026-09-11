import { test, expect, Page, APIRequestContext } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs'; // For fs.promises.rm

// --- Configuration and Test Data ---
const ADMIN_EMAIL = 'admin@example.com'; // Placeholder: Replace with actual admin email
const ADMIN_PASSWORD = 'AdminPassword123!'; // Placeholder: Replace with actual admin password
const TENANT_EMAIL = 'owner@houseofbiryanirestaurant.food';
const TENANT_PASSWORD = 'TestPass123!';
const TENANT_ID = 'house-of-biryani-chicago-2026';

const AUTH_DIR = path.join(__dirname, 'playwright-auth');
const ADMIN_STORAGE_STATE_PATH = path.join(AUTH_DIR, 'admin.json');
const TENANT_STORAGE_STATE_PATH = path.join(AUTH_DIR, 'tenant.json');

// --- Page Object Models ---

class LoginPage {
    readonly page: Page;
    readonly emailInput: string = 'input[name="email"]';
    readonly passwordInput: string = 'input[name="password"]';
    readonly loginButton: string = 'button[type="submit"]';

    constructor(page: Page) {
        this.page = page;
    }

    async goto() {
        // Assuming a generic login path for both admin and tenant
        await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
    }

    async login(email: string, password: string) {
        await this.page.fill(this.emailInput, email);
        await this.page.fill(this.passwordInput, password);
        await this.page.click(this.loginButton);
        // Wait for redirection to dashboard or main app page
        await this.page.waitForURL('**/dashboard**', { waitUntil: 'networkidle' });
    }
}

class AdminTenantPricingPage {
    readonly page: Page;
    readonly tenantId: string;
    readonly marginInput: string = 'input[name="margin"]';
    readonly processingFeeInput: string = 'input[name="processingFee"]';
    readonly saveButton: string = 'button:has-text("Save Changes")';
    readonly successMessage: string = '.toast-success'; // Selector for a success notification

    constructor(page: Page, tenantId: string) {
        this.page = page;
        this.tenantId = tenantId;
    }

    async goto() {
        await this.page.goto(`/admin/tenant-pricing/${this.tenantId}`, { waitUntil: 'networkidle' });
    }

    async setMargin(margin: number) {
        await this.page.fill(this.marginInput, String(margin));
    }

    async getMargin(): Promise<number> {
        return parseFloat(await this.page.inputValue(this.marginInput));
    }

    async getProcessingFee(): Promise<number> {
        return parseFloat(await this.page.inputValue(this.processingFeeInput));
    }

    async saveChanges() {
        await this.page.click(this.saveButton);
        await this.page.waitForSelector(this.successMessage, { state: 'visible' });
    }
}

class TenantMenuPage {
    readonly page: Page;
    readonly tenantId: string;
    // Assuming a tenant has a settings page or a specific section for pricing where they *might* see a processing fee
    // If not, this selector would be for a read-only display, or the test might need to pivot to API.
    readonly processingFeeInput: string = 'input[name="tenantProcessingFeeSetting"]'; // Placeholder selector
    readonly saveButton: string = 'button:has-text("Save Settings")'; // Placeholder save button for tenant settings

    constructor(page: Page, tenantId: string) {
        this.page = page;
        this.tenantId = tenantId;
    }

    async goto() {
        // Assuming a tenant accesses their menu/pricing info via a URL like /tenant/:id/menu
        await this.page.goto(`/tenant/${this.tenantId}/menu`, { waitUntil: 'networkidle' });
    }

    async getItemDisplayPrice(itemName: string): Promise<number> {
        // This selector assumes a structure like: <div class="menu-item"><span>Item Name</span> <span class="display-price">$22.68</span></div>
        const priceLocator = this.page.locator(`.menu-item:has-text("${itemName}") .display-price`);
        await expect(priceLocator).toBeVisible();
        const priceText = await priceLocator.textContent();
        if (!priceText) {
            throw new Error(`Could not find display price for item: ${itemName}`);
        }
        // Clean the price text to parse it as a number (e.g., remove currency symbols)
        return parseFloat(priceText.replace(/[^0-9.]/g, ''));
    }

    async getProcessingFeeField() {
        // Returns the Playwright Locator for the processing fee field from the tenant's perspective
        await expect(this.page.locator(this.processingFeeInput)).toBeVisible();
        return this.page.locator(this.processingFeeInput);
    }
}


// --- Global Setup for Authentication ---
test.describe('Price Engine E2E Tests', () => {
    // Set a base URL for all tests
    test.use({
        baseURL: 'http://localhost:3000', // CRITICAL: Replace with your actual application's base URL
    });

    test.beforeAll(async ({ browser, request }) => {
        // Ensure the auth directory exists
        await fs.promises.mkdir(AUTH_DIR, { recursive: true });

        // --- Admin Login and Store State ---
        console.log('Attempting Admin login and storing state...');
        const adminPage = await browser.newPage();
        const adminLoginPage = new LoginPage(adminPage);
        await adminLoginPage.goto();
        await adminLoginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
        await adminPage.context().storageState({ path: ADMIN_STORAGE_STATE_PATH });
        await adminPage.close();
        console.log('Admin login state saved.');

        // --- Tenant Login and Store State ---
        console.log('Attempting Tenant login and storing state...');
        const tenantPage = await browser.newPage();
        const tenantLoginPage = new LoginPage(tenantPage);
        await tenantLoginPage.goto();
        await tenantLoginPage.login(TENANT_EMAIL, TENANT_PASSWORD);
        await tenantPage.context().storageState({ path: TENANT_STORAGE_STATE_PATH });
        await tenantPage.close();
        console.log('Tenant login state saved.');
    });

    test.afterAll(async () => {
        // Clean up the stored state files after all tests are done
        try {
            if (fs.existsSync(ADMIN_STORAGE_STATE_PATH)) {
                await fs.promises.rm(ADMIN_STORAGE_STATE_PATH);
                console.log('Admin storage state file removed.');
            }
            if (fs.existsSync(TENANT_STORAGE_STATE_PATH)) {
                await fs.promises.rm(TENANT_STORAGE_STATE_PATH);
                console.log('Tenant storage state file removed.');
            }
            if ((await fs.promises.readdir(AUTH_DIR)).length === 0) {
                 await fs.promises.rmdir(AUTH_DIR); // Remove directory if empty
                 console.log('Auth directory removed.');
            }
        } catch (error) {
            console.error('Error during storage state file cleanup:', error);
        }
    });

    // --- Test Scenarios ---

    test('GET /api/price-engine/preview?basePrice=18 returns correct displayPrice', async ({ request }) => {
        // This test uses the default `request` fixture, which is not authenticated by default.
        // It assumes the preview endpoint is publicly accessible or requires different, more basic auth.
        const basePrice = 18;
        const defaultMargin = 0.05; // 5% margin
        const defaultProcessingFee = 0.20; // 20% processing fee
        const expectedDisplayPrice = basePrice * (1 + defaultMargin) * (1 + defaultProcessingFee);

        const response = await request.get(`/api/price-engine/preview?basePrice=${basePrice}`);
        await expect(response.ok()).toBeTruthy(); // Ensure the request was successful

        const data = await response.json();
        expect(data).toHaveProperty('displayPrice');
        expect(data.displayPrice).toBeCloseTo(expectedDisplayPrice, 2); // Assert with 2 decimal places precision
        expect(data).toHaveProperty('basePrice', basePrice);
        expect(data).toHaveProperty('margin', defaultMargin);
        expect(data).toHaveProperty('processingFee', defaultProcessingFee);
    });


    test.describe('Admin and Tenant Pricing Management', () => {

        const NEW_MARGIN = 0.10; // 10% new margin for testing
        const ORIGINAL_MARGIN = 0.05; // 5% original margin (to revert to)
        const TEST_ITEM_NAME = 'Chicken Biryani'; // Placeholder for a menu item name
        const TEST_ITEM_BASE_PRICE = 15.00; // Placeholder base price for the menu item
        const FIXED_PROCESSING_FEE = 0.20; // 20% processing fee, which tenant cannot change

        test('admin can change margin for tenant via PUT /api/admin/tenant-pricing/:id', async ({ }) => {
            // Create a new API context specifically for admin, using the stored state.
            const adminRequest = await test.request.newContext({ storageState: ADMIN_STORAGE_STATE_PATH });

            // 1. Change the margin
            const putResponse = await adminRequest.put(`/api/admin/tenant-pricing/${TENANT_ID}`, {
                data: {
                    margin: NEW_MARGIN,
                },
            });
            await expect(putResponse.ok()).toBeTruthy(); // Expect a successful update

            // 2. Verify the change by fetching the tenant pricing settings
            const getResponse = await adminRequest.get(`/api/admin/tenant-pricing/${TENANT_ID}`);
            await expect(getResponse.ok()).toBeTruthy();
            const data = await getResponse.json();
            expect(data).toHaveProperty('margin', NEW_MARGIN);

            // CRITICAL: Cleanup - Revert margin to original value to ensure test independence
            await adminRequest.put(`/api/admin/tenant-pricing/${TENANT_ID}`, {
                data: {
                    margin: ORIGINAL_MARGIN,
                },
            });
            // Dispose the context when done to release resources
            await adminRequest.dispose();
        });


        test('new margin reflected in menu display prices', async ({ page }) => {
            // Create an API context for admin actions within this test
            const adminRequest = await test.request.newContext({ storageState: ADMIN_STORAGE_STATE_PATH });

            // 1. Admin sets a new margin via API
            await adminRequest.put(`/api/admin/tenant-pricing/${TENANT_ID}`, {
                data: {
                    margin: NEW_MARGIN,
                },
            });
            // Confirm margin was set (optional, but good for robustness)
            const adminGetResponse = await adminRequest.get(`/api/admin/tenant-pricing/${TENANT_ID}`);
            await expect(adminGetResponse.json()).resolves.toHaveProperty('margin', NEW_MARGIN);

            // 2. Tenant logs in (using the pre-authenticated state via `test.use` or by creating a new page with state)
            // For UI tests, it's typical to create a new page for the tenant with their stored state.
            const tenantPage = await page.context().newPage({ storageState: TENANT_STORAGE_STATE_PATH }); // Use the context to create a new page with tenant auth
            const tenantMenuPage = new TenantMenuPage(tenantPage, TENANT_ID);
            await tenantMenuPage.goto();

            // Expected price calculation: basePrice * (1 + newMargin) * (1 + fixedProcessingFee)
            const expectedDisplayPrice = TEST_ITEM_BASE_PRICE * (1 + NEW_MARGIN) * (1 + FIXED_PROCESSING_FEE);

            // 3. Tenant checks the menu display price for a specific item
            const actualDisplayPrice = await tenantMenuPage.getItemDisplayPrice(TEST_ITEM_NAME);
            expect(actualDisplayPrice).toBeCloseTo(expectedDisplayPrice, 2); // Assert with 2 decimal places

            await tenantPage.close(); // Close the tenant page
            // CRITICAL: Cleanup - Revert margin to original value using admin context
            await adminRequest.put(`/api/admin/tenant-pricing/${TENANT_ID}`, {
                data: {
                    margin: ORIGINAL_MARGIN,
                },
            });
            await adminRequest.dispose();
        });

        test('processing fee cannot be changed by tenant (read-only 5%)', async ({ page }) => {
            // Create a new page for the tenant, using the pre-authenticated state.
            const tenantPage = await page.context().newPage({ storageState: TENANT_STORAGE_STATE_PATH });
            const tenantMenuPage = new TenantMenuPage(tenantPage, TENANT_ID);
            // Navigate to the tenant's settings/menu page where pricing info might be displayed
            await tenantMenuPage.goto();

            const processingFeeField = await tenantMenuPage.getProcessingFeeField();

            // 1. Assert that the processing fee input field is read-only or disabled.
            // Playwright's `toBeDisabled()` or `not.toBeEditable()` are good assertions.
            await expect(processingFeeField).toBeDisabled();
            // Alternatively, check for attributes if `toBeDisabled` doesn't match your UI's implementation:
            // await expect(processingFeeField).toHaveAttribute('readonly', '');
            // await expect(processingFeeField).not.toBeEditable(); // Asserts it cannot be typed into

            // 2. Assert its current displayed value is the fixed 5% (0.05)
            const processingFeeValueText = await processingFeeField.inputValue();
            // Assuming the input value is a decimal like "0.05"
            expect(parseFloat(processingFeeValueText)).toBeCloseTo(0.05, 2);

            // 3. Attempt to change it (even if disabled, some frameworks might allow interaction internally)
            // This step primarily confirms that even if a user tries to bypass client-side restrictions,
            // the value doesn't change or server-side validation prevents it.
            // As the field is disabled, `fill` might not work. `evaluate` can sometimes force it,
            // but the primary assertion is `toBeDisabled`.
            // If the field was merely read-only (not disabled), we'd try `fill` and then `expect().toHaveValue(original)`.
            // For a disabled field, `inputValue` will show its current value, which should remain 0.05.

            // If there's a save button on this page, try clicking it and asserting no change or error.
            // This is a robust check if the field itself is disabled but the form can still be submitted.
            if (await tenantMenuPage.saveButton.isVisible()) {
                await tenantPage.click(tenantMenuPage.saveButton);
                // Wait for any network requests related to saving
                await tenantPage.waitForLoadState('networkidle');

                // Expect no success message and potentially an error message if the server validates
                await expect(tenantPage.locator('.toast-success')).not.toBeVisible({ timeout: 2000 });
                // If there's an error message for "read-only fields", you could assert its visibility:
                // await expect(tenantPage.locator('.toast-error:has-text("Cannot change processing fee")')).toBeVisible();

                // Re-assert the value after a potential "save" attempt
                await expect(processingFeeField).toHaveValue(processingFeeValueText); // Should still be the original value
            }

            // Final check that the value remains 0.05
            expect(parseFloat(await processingFeeField.inputValue())).toBeCloseTo(0.05, 2);

            await tenantPage.close();
        });
    });
});
