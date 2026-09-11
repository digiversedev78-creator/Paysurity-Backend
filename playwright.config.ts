import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 1,
  workers: 4,
  reporter: [['html', { open: 'never' }], ['json', { outputFile: 'e2e/results.json' }]],
  use: {
    baseURL: 'https://paysurity-api-111328865246.us-central1.run.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
});