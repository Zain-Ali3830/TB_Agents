import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: ['.env', '.env.secrets'], quiet: true });

export default defineConfig({
  testDir: './data/outputs/4-automation',
  outputDir: './data/outputs/4-automation/.results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'data/outputs/4-automation/.report', open: 'never' }]],
  use: {
    baseURL: process.env.APP_URL,
    testIdAttribute: 'data-testid',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
