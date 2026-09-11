import { test, expect } from '@playwright/test';

test.describe('PaySurity Multi-Tenant Stores E2E Proof of Work', () => {

  // Test 1: House of Biryani
  test('House of Biryani - Checkout', async ({ page }) => {
    await page.goto('http://localhost:3004/?sandbox=true');
    await page.waitForTimeout(2000); // let animations settle

    // Add exactly one item
    await page.locator('.hob-item-card button').first().click();
    
    // Open Cart implicitly, click Checkout
    await page.locator('button:has-text("Checkout securely with PaySurity")').click();

    // Modal
    await page.waitForSelector('text=Secure Checkout', { state: 'visible' });
    const modal = page.locator('.bg-white.rounded-3xl.max-w-md'); // House of Biryani uses rounded-3xl
    await modal.locator('input[placeholder="0000 0000 0000 0000"]').fill('4111111111111111');
    await modal.locator('input[placeholder="MM/YY"]').fill('12/30');
    await modal.locator('input[placeholder="123"]').fill('123');
    await modal.locator('input[placeholder="12345"]').fill('90210');
    
    // Pay button
    await modal.locator('button', { hasText: 'Pay $' }).click();
    
    // Wait for Confirmation
    await page.waitForSelector('text=Payment Confirmed!', { state: 'visible' });
    await page.screenshot({ path: 'QA_Proof_Screenshots/01_HouseOfBiryani.png', fullPage: true });
  });

  // Test 2: Tawakkul
  test('Tawakkul Wholesale - Checkout', async ({ page }) => {
    await page.goto('http://localhost:3004/?sandbox=true');
    // For Tawakkul, we need to click the grid pill then find the catalog and click addToCart
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(2000); // wait for menu fetch
    await page.locator('button:has-text("Add")').first().click();

    await page.locator('button:has-text("Checkout (PaySurity)")').click();

    await page.waitForSelector('text=Secure Checkout', { state: 'visible' });
    const modal = page.locator('.bg-white.rounded-3xl'); // Tawakkul modal
    await modal.locator('input[placeholder="0000 0000 0000 0000"]').fill('4111111111111111');
    await modal.locator('input[placeholder="MM/YY"]').fill('12/30');
    await modal.locator('input[placeholder="123"]').fill('123');
    await modal.locator('input[placeholder="12345"]').fill('90210');
    
    await modal.locator('button', { hasText: 'Pay $' }).click();
    
    await page.waitForSelector('text=Order Confirmed!', { state: 'visible' });
    await page.screenshot({ path: 'QA_Proof_Screenshots/02_Tawakkul.png', fullPage: true });
  });

  // Test 3: Ashiana
  test('Ashiana Bridal - Checkout', async ({ page }) => {
    await page.goto('http://localhost:3004/?sandbox=true');
    await page.waitForTimeout(2500); // let loading settle

    await page.evaluate(() => window.scrollTo(0, 2500));
    // Click checkout on a bridal item
    await page.locator('button:has-text("Checkout / Pay Via PaySurity")').first().click();

    await page.waitForSelector('text=Secure Ledger', { state: 'visible' });
    const modal = page.locator('.bg-\\[\\#111\\]'); // Ashiana uses #111 modal background
    await modal.locator('input[placeholder="0000 0000 0000 0000"]').fill('4111111111111111');
    await modal.locator('input[placeholder="MM/YY"]').fill('12/30');
    await modal.locator('input[placeholder="123"]').fill('123');
    await modal.locator('input[placeholder="12345"]').fill('90210');
    
    await modal.locator('button', { hasText: 'Pay $' }).click();
    
    await page.waitForSelector('text=Execution Complete.', { state: 'visible' });
    await page.screenshot({ path: 'QA_Proof_Screenshots/03_Ashiana.png', fullPage: true });
  });

  // Test 4: Grand Tobacco
  test('Grand Tobacco - Checkout', async ({ page }) => {
    await page.goto('http://localhost:3004/?sandbox=true');
    
    // Need to bypass age gate first
    await page.waitForSelector('text=I AM 21 OR OLDER', { state: 'visible' });
    await page.locator('button:has-text("I AM 21 OR OLDER")').click();
    await page.waitForTimeout(2000); // let loading settle
    
    // Add to specific checkout
    await page.locator('button:has-text("Instant Transfer (PaySurity Native)")').first().click();

    await page.waitForSelector('text=Vault Authorization', { state: 'visible' });
    const modal = page.locator('.bg-\\[\\#09090b\\]'); // GrandTobacco red/dark mod
    await modal.locator('input[placeholder="0000 0000 0000 0000"]').fill('4111111111111111');
    await modal.locator('input[placeholder="MM/YY"]').fill('12/30');
    await modal.locator('input[placeholder="123"]').fill('123');
    await modal.locator('input[placeholder="12345"]').fill('90210');
    
    await modal.locator('button', { hasText: 'Execute $' }).click();
    
    await page.waitForSelector('text=Acquisition Complete.', { state: 'visible' });
    await page.screenshot({ path: 'QA_Proof_Screenshots/04_GrandTobacco.png', fullPage: true });
  });
});
