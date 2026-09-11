import { test, expect, Page, Locator, APIRequestContext } from '@playwright/test';

// --- Constants ---
const API_BASE_URL = 'https://paysurity-api-111328865246.us-central1.run.app';
const TENANT_ID = 'house-of-biryani-chicago-2026';
const VALID_EMAIL = 'owner@houseofbiryanirestaurant.food';
const VALID_PASSWORD = 'TestPass123!';
const WRONG_PASSWORD = 'WrongPassword123!';

// --- Page Object Model ---

/**
 * Represents the Login Page of the application.
 */
class LoginPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator('input[name="email"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.loginButton = page.locator('button[type="submit"]');
        // Assuming a data-test attribute for the error message for robustness
        this.errorMessage = page.locator('[data-test="error-message"]');
    }

    /**
     * Navigates to the login page.
     */
    async goto() {
        await this.page.goto(`${API_BASE_URL}/login`);
        await this.page.waitForLoadState('domcontentloaded');
    }

    /**
     * Fills the login form and clicks the login button.
     * @param email - The user's email.
     * @param password - The user's password.
     */
    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
        // Wait for network requests to settle after login attempt
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Retrieves the text content of the error message element.
     * @returns The error message text, or null if not visible.
     */
    async getErrorMessage(): Promise<string | null> {
        if (await this.errorMessage.isVisible()) {
            return await this.errorMessage.textContent();
        }
        return null;
    }
}

/**
 * Represents the Dashboard Page of the application.
 */
class DashboardPage {
    readonly page: Page;
    readonly welcomeMessage: Locator;
    readonly salesWidget: Locator;
    readonly ordersWidget: Locator;
    readonly logoutButton: Locator;

    constructor(page: Page) {
        this.page = page;
        // Assuming data-test attributes for key dashboard elements
        this.welcomeMessage = page.locator('[data-test="dashboard-welcome-message"]');
        this.salesWidget = page.locator('[data-test="sales-widget"]');
        this.ordersWidget = page.locator('[data-test="orders-widget"]');
        this.logoutButton = page.locator('[data-test="logout-button"]');
    }

    /**
     * Checks if the dashboard page is loaded and key elements are visible.
     * @returns True if the dashboard is loaded, false otherwise.
     */
    async isLoaded(): Promise<boolean> {
        // Wait for the URL to change to the dashboard path
        await this.page.waitForURL(`${API_BASE_URL}/dashboard`);
        // Check if a prominent element on the dashboard is visible
        return await this.welcomeMessage.isVisible();
    }

    /**
     * Clicks the logout button and waits for redirection.
     */
    async logout() {
        await this.logoutButton.click();
        // Wait for the page to redirect back to the login URL after logout
        await this.page.waitForURL(`${API_BASE_URL}/login`);
    }
}

// --- Test Suite ---

test.describe('Authentication E2E tests', () => {

    test('merchant can login with valid credentials (API check)', async ({ request }) => {
        const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
            data: {
                tenantId: TENANT_ID,
                email: VALID_EMAIL,
                password: VALID_PASSWORD
            }
        });

        // Assert that the API call was successful (status 2xx)
        expect(response.ok(), `API call failed with status ${response.status()}: ${await response.text()}`).toBeTruthy();
        
        const json = await response.json();
        // Assert that a JWT token is present in the response
        expect(json.token).toBeDefined();
        expect(typeof json.token).toBe('string');
        expect(json.token.length).toBeGreaterThan(10); // Basic length check for a JWT
    });

    test('login fails with wrong password (API check)', async ({ request }) => {
        const response = await request.post(`${API_BASE_URL}/api/auth/login`, {
            data: {
                tenantId: TENANT_ID,
                email: VALID_EMAIL,
                password: WRONG_PASSWORD // Use an incorrect password
            }
        });

        // Assert that the API call returns an unauthorized status code
        expect(response.status()).toBe(401); // Common status code for unauthorized/invalid credentials
        
        const json = await response.json();
        // Assert that an error message indicating invalid credentials is returned
        expect(json.message).toBeDefined();
        expect(json.message).toContain('Invalid credentials'); // Example error message
    });

    test('merchant dashboard loads after login (UI check)', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(VALID_EMAIL, VALID_PASSWORD);

        const dashboardPage = new DashboardPage(page);
        
        // Assert that the dashboard page is loaded
        expect(await dashboardPage.isLoaded()).toBeTruthy();
        
        // Verify key elements on the dashboard are visible and contain expected text
        await expect(dashboardPage.welcomeMessage).toBeVisible();
        await expect(dashboardPage.welcomeMessage).toHaveText(/Welcome, .*owner/i); // Case-insensitive match for 'owner'
        await expect(dashboardPage.salesWidget).toBeVisible();
        await expect(dashboardPage.ordersWidget).toBeVisible();
        
        // Ensure all dynamic content has settled
        await page.waitForLoadState('networkidle'); 
    });

    test('logout clears session (UI check)', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(VALID_EMAIL, VALID_PASSWORD);

        const dashboardPage = new DashboardPage(page);
        
        // First, verify successful login by checking a dashboard element
        await expect(dashboardPage.welcomeMessage).toBeVisible(); 

        // Perform the logout action
        await dashboardPage.logout();

        // After logout, assert that the user is redirected to the login page
        await expect(page).toHaveURL(`${API_BASE_URL}/login`); 
        await expect(loginPage.loginButton).toBeVisible(); // Check for presence of login form elements
        await expect(loginPage.emailInput).toBeVisible();

        // Attempt to navigate directly to the dashboard to confirm session invalidation
        await page.goto(`${API_BASE_URL}/dashboard`);
        await page.waitForLoadState('domcontentloaded');
        
        // Expect to be redirected back to the login page, indicating session was cleared
        await expect(page).toHaveURL(`${API_BASE_URL}/login`);
        await expect(loginPage.loginButton).toBeVisible(); // Login elements should still be visible
    });
});
