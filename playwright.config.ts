import { defineConfig, devices } from '@playwright/test'

/**
 * Optimized Playwright configuration for performance with better server handling
 * @see https://playwright.dev/docs/test-configuration
 */

// Dynamic port detection
const getBaseURL = () => {
  // Check if PORT is set in environment, otherwise default to 3000
  const port = process.env.PORT || process.env.NEXT_PORT || '3000'
  return `http://localhost:${port}`
}

export default defineConfig({
  testDir: './tests/e2e',

  // Performance optimizations
  fullyParallel: true,
  workers: process.env.CI ? 1 : 2, // Limit workers to prevent resource exhaustion
  retries: process.env.CI ? 1 : 0, // Reduce retries for faster feedback

  // Build validation
  forbidOnly: !!process.env.CI,

  // Optimized reporting
  reporter: process.env.CI ? 'github' : 'list',

  // Global test settings
  use: {
    baseURL: getBaseURL(),

    // Performance settings
    trace: 'retain-on-failure', // Only keep traces on failure
    video: 'retain-on-failure', // Only keep videos on failure
    screenshot: 'only-on-failure', // Screenshots only on failure

    // Reduce timeouts for faster tests
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  // Optimized browser projects
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Chrome-specific optimizations
        launchOptions: {
          args: ['--disable-dev-shm-usage', '--disable-extensions'],
        },
      },
    },

    // Only test Firefox on CI or when specifically needed
    ...(process.env.FULL_BROWSER_TESTING
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
          },
        ]
      : []),
  ],

  // Development server configuration - only start if not already running
  webServer: process.env.CI ? {
    command: 'npm run dev',
    url: getBaseURL(),
    reuseExistingServer: false,
    timeout: 120 * 1000, // 2 minutes max startup time
  } : undefined, // Don't auto-start server in development
})
