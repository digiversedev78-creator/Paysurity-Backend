const { test, expect } = require('@playwright/test');

const DASHBOARD_URL = 'https://paysurity-dashboard-111328865246.us-central1.run.app';
const API_URL = 'https://paysurity-api-111328865246.us-central1.run.app';

test.describe('Launch Day QA: Phase 8 Wiring', () => {
  test('Dashboard loads and executes 307 redirect to Auth', async ({ page }) => {
    const response = await page.goto(DASHBOARD_URL);
    expect(response.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/.*auth.*/);
  });

  test('CORS Policy allows Dashboard to fetch from API', async ({ page }) => {
    await page.goto(DASHBOARD_URL);
    const apiResponse = await page.evaluate(async (url) => {
      try {
        const res = await fetch(${url}/health);
        return res.status;
      } catch (e) {
        return 500;
      }
    }, API_URL);
    expect(apiResponse).toBe(200);
  });
});
