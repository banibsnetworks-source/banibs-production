import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration - Phase 7.1 Cycle 1.4
 * 
 * E2E tests for BANIBS Opportunities Exchange candidate and recruiter flows
 */

export default defineConfig({
  testDir: './e2e',
  
  // Maximum time one test can run for
  timeout: 60 * 1000,
  
  // Test execution settings
  fullyParallel: false, // Run tests sequentially to avoid data conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to prevent concurrent test interference
  
  // Reporter to use
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL for tests - using the preview environment
    baseURL: 'https://profile-express.preview.emergentagent.com',
    
    // Browser context options
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Extended timeout for actions
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
