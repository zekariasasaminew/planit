import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});

