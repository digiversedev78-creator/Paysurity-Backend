import { test, expect, Page } from '@playwright/test';

// --- Constants ---
// Assume this is the base URL for the admin portal. Adjust if different.
const BASE_URL = 'http://localhost:3000';
const SUPER_ADMIN_EMAIL = 'owner@houseofbiryanirestaurant.food';
const SUPER_ADMIN_PASSWORD = 'TestPass123!';
const HOUSE_OF_BIRYANI_TENANT_ID = 'house-of-biryani-chicago-2026';

// --- Page Object Models ---

class LoginPage {
  readonly page: Page;
  readonly emailInput: string = '[data-test-id="email-input"]';
  readonly passwordInput: string = '[data-test-id="password-input"]';
  readonly loginButton: string = '[data-test-id="login-button"]';
  readonly errorMessage: string = '[data-test-id="login-error-message"]';

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto(`${BASE_URL}/login`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async login(email: string, password: string) {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
    // Wait for navigation and potential data loading after login
    await this.page.waitForLoadState('networkidle'); 
  }
}

class AdminDashboardPage {
  readonly page: Page;
  readonly welcomeMessage: string = '[data-test-id="welcome-message"]';
  readonly merchantListLink: string = '[data-test-id="nav-merchants"]';
  readonly complianceLink: string = '[data-test-id="nav-compliance"]';

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto(`${BASE_URL}/dashboard`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async gotoMerchants() {
    await this.page.click(this.merchantListLink);
    await this.page.waitForURL(`${BASE_URL}/admin/merchants`);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoCompliance() {
    await this.page.click(this.complianceLink);
    await this.page.waitForURL(`${BASE_URL}/admin/compliance`);
    await this.page.waitForLoadState('networkidle');
  }
}

class MerchantListPage {
  readonly page: Page;
  readonly searchInput: string = '[data-test-id="merchant-search-input"]';
  readonly merchantRow: (tenantId: string) => string = (tenantId) => `[data-test-id="merchant-row-${tenantId}"]`;
  readonly editMerchantButton: (tenantId: string) => string = (tenantId) => `[data-test-id="merchant-edit-${tenantId}"]`;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto(`${BASE_URL}/admin/merchants`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async searchMerchant(query: string) {
    await this.page.fill(this.searchInput, query);
    // Wait for search results to load, typically after an input change or debounce
    await this.page.waitForLoadState('networkidle'); 
  }

  async gotoMerchantDetails(tenantId: string) {
    await this.page.click(this.editMerchantButton(tenantId));
    await this.page.waitForURL(`${BASE_URL}/admin/merchants/${tenantId}/details`);
    await this.page.waitForLoadState('networkidle');
  }
}

class TenantDetailsPage {
  readonly page: Page;
  readonly marginInput: string = '[data-test-id="tenant-margin-input"]';
  readonly originalPriceDisplay: string = '[data-test-id="original-price-display"]';
  readonly calculatedPriceDisplay: string = '[data-test-id="calculated-price-display"]';
  readonly saveButton: string = '[data-test-id="save-tenant-details-button"]';
  readonly successMessage: string = '[data-test-id="success-message"]';

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(tenantId: string) {
    await this.page.goto(`${BASE_URL}/admin/merchants/${tenantId}/details`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async setMargin(margin: number) {
    // Clear and fill ensures we don't append to existing value
    await this.page.fill(this.marginInput, margin.toString());
  }

  async saveChanges() {
    await this.page.click(this.saveButton);
    // Wait for save operation to complete and potential UI update/toast message
    await this.page.waitForLoadState('networkidle'); 
    await expect(this.page.locator(this.successMessage)).toBeVisible();
  }

  async getOriginalPrice(): Promise<number> {
    const text = await this.page.locator(this.originalPriceDisplay).textContent();
    // Assuming price format like "$12.34" or "12.34". Remove non-numeric except decimal.
    return parseFloat(text!.replace(/[^\d.]/g, '')); 
  }

  async getCalculatedPrice(): Promise<number> {
    const text = await this.page.locator(this.calculatedPriceDisplay).textContent();
    return parseFloat(text!.replace(/[^\d.]/g, ''));
  }

  async getMarginValue(): Promise<number> {
    const value = await this.page.locator(this.marginInput).inputValue();
    return parseFloat(value);
  }
}

class CompliancePage {
  readonly page: Page;
  readonly pciDssStatus: string = '[data-test-id="pci-dss-status"]';
  readonly pciDssDescription: string = '[data-test-id="pci-dss-description"]';

  constructor(page: Page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto(`${BASE_URL}/admin/compliance`);
    await this.page.waitForLoadState('domcontentloaded');
  }
}

// --- Test Suite ---

test.describe('Admin Portal E2E', () => {
  let page: Page;
  let loginPage: LoginPage;
  let adminDashboardPage: AdminDashboardPage;
  let merchantListPage: MerchantListPage;
  let tenantDetailsPage: TenantDetailsPage;
  let compliancePage: CompliancePage;

  // Perform login once for the entire test describe block to save time
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    loginPage = new LoginPage(page);
    adminDashboardPage = new AdminDashboardPage(page);
    merchantListPage = new MerchantListPage(page);
    tenantDetailsPage = new TenantDetailsPage(page);
    compliancePage = new CompliancePage(page);

    await loginPage.navigate();
    await loginPage.login(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
    // Expect to be on dashboard or a page that indicates successful login
    await expect(page.locator(adminDashboardPage.welcomeMessage)).toBeVisible();
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });

  // Ensure each test starts from a clean, known state (e.g., dashboard) after login
  test.beforeEach(async () => {
    await adminDashboardPage.navigate();
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('super admin can login', async () => {
    // This test implicitly covers the login performed in beforeAll.
    // We re-verify the expected state after successful login.
    await expect(page.locator(adminDashboardPage.welcomeMessage)).toBeVisible();
    await expect(page.locator(adminDashboardPage.welcomeMessage)).toHaveText(/Welcome, Admin/i);
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });

  test('merchant list loads all tenants', async () => {
    await adminDashboardPage.gotoMerchants();

    // Verify search input is visible
    await expect(page.locator(merchantListPage.searchInput)).toBeVisible();

    // Verify that the specific test tenant is visible in the list
    await expect(page.locator(merchantListPage.merchantRow(HOUSE_OF_BIRYANI_TENANT_ID))).toBeVisible();
    
    // Optionally, verify that the list contains more than one tenant, implying a "list" loaded
    const allMerchantRows = page.locator('[data-test-id^="merchant-row-"]');
    await expect(allMerchantRows).not.toHaveCount(0); // Ensure at least one row is present
  });

  test('can update House of Biryani margin from 20% to 25%', async () => {
    await adminDashboardPage.gotoMerchants();
    await merchantListPage.searchMerchant(HOUSE_OF_BIRYANI_TENANT_ID);
    await merchantListPage.gotoMerchantDetails(HOUSE_OF_BIRYANI_TENANT_ID);

    // CRITICAL for test independence: Ensure a known starting state.
    // First, set the margin to 20% and save to guarantee our baseline.
    await tenantDetailsPage.setMargin(20);
    await tenantDetailsPage.saveChanges();
    await expect(page.locator(tenantDetailsPage.marginInput)).toHaveValue('20');

    // Now, update the margin to the target value (25%)
    await tenantDetailsPage.setMargin(25);
    await tenantDetailsPage.saveChanges();

    // Verify the update
    await expect(page.locator(tenantDetailsPage.marginInput)).toHaveValue('25');
  });

  test('price recalculates after margin change', async () => {
    await adminDashboardPage.gotoMerchants();
    await merchantListPage.searchMerchant(HOUSE_OF_BIRYANI_TENANT_ID);
    await merchantListPage.gotoMerchantDetails(HOUSE_OF_BIRYANI_TENANT_ID);

    // CRITICAL for test independence: Establish a known baseline margin (e.g., 20%)
    await tenantDetailsPage.setMargin(20);
    await tenantDetailsPage.saveChanges();
    
    // Get initial original price (should remain constant)
    const initialOriginalPrice = await tenantDetailsPage.getOriginalPrice();
    // Get initial calculated price with 20% margin
    const initialCalculatedPrice = await tenantDetailsPage.getCalculatedPrice();

    // Assert initial calculation based on 20% margin
    const expectedInitialCalculatedPrice = initialOriginalPrice * (1 + 20 / 100);
    // Use toBeCloseTo for floating point comparisons to avoid precision issues
    expect(initialCalculatedPrice).toBeCloseTo(expectedInitialCalculatedPrice, 2); 

    // Change margin to 25%
    await tenantDetailsPage.setMargin(25);
    await tenantDetailsPage.saveChanges();
    // Wait briefly if recalculation is done client-side after save and might take a moment to reflect
    await page.waitForTimeout(500); 

    // Get the new calculated price
    const newCalculatedPrice = await tenantDetailsPage.getCalculatedPrice();

    // Verify price recalculation based on 25% margin
    const expectedNewCalculatedPrice = initialOriginalPrice * (1 + 25 / 100);
    expect(newCalculatedPrice).toBeCloseTo(expectedNewCalculatedPrice, 2);

    // Optional: Reset margin back to original 20% to keep data consistent for manual checks or other tests
    await tenantDetailsPage.setMargin(20);
    await tenantDetailsPage.saveChanges();
  });

  test('compliance page shows PCI DSS status', async () => {
    await adminDashboardPage.gotoCompliance();

    await expect(page.locator(compliancePage.pciDssStatus)).toBeVisible();
    await expect(page.locator(compliancePage.pciDssStatus)).toHaveText(/Compliant/i); // Expect a specific status text
    
    await expect(page.locator(compliancePage.pciDssDescription)).toBeVisible();
    // Check for a part of the descriptive text to ensure content loads
    await expect(page.locator(compliancePage.pciDssDescription)).toHaveText(/PCI DSS (Data Security Standard) ensures/i); 
  });
});
