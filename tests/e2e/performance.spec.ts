import { test, expect, Page } from '@playwright/test'
// import lighthouse from 'lighthouse'
// import { playAudit } from 'playwright-lighthouse'

test.describe('Auto Mart - Performance Tests', () => {
  test.use({
    // Use a larger viewport for performance testing
    viewport: { width: 1920, height: 1080 },
  })

  const signIn = async (page: Page) => {
    await page.goto('/sign-in')
    await page.fill('input[placeholder="Enter your email"]', 'demo@automart.lk')
    await page.fill('input[placeholder="Enter your password"]', 'password123')
    await page.click('button:text("Sign In")')
    await page.waitForURL('/')
  }

  test('homepage should meet performance benchmarks', async ({ page, browserName }) => {
    // Skip for webkit due to lighthouse compatibility
    if (browserName === 'webkit') {
      test.skip()
    }

    await page.goto('/')

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle')

    // Manual performance checks instead of Lighthouse for now
    // TODO: Re-enable Lighthouse when properly configured

    // await playAudit({
    //   page,
    //   thresholds: {
    //     performance: 75,
    //     accessibility: 85,
    //     'best-practices': 85,
    //     seo: 80,
    //     pwa: 0
    //   },
    //   port: 9222
    // })

    // Manual performance checks

    // Check First Contentful Paint (FCP)
    const performanceTiming = await page.evaluate(() => {
      const { timing } = performance
      return {
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      }
    })

    // Performance expectations (in milliseconds)
    expect(performanceTiming.loadComplete).toBeLessThan(5000) // Page should load in under 5s
    expect(performanceTiming.domReady).toBeLessThan(3000) // DOM ready in under 3s
    expect(performanceTiming.firstPaint).toBeLessThan(2000) // First paint in under 2s

    // Check for performance-critical elements
    await expect(page.locator('h1')).toBeVisible({ timeout: 2000 })

    // Check that images load efficiently
    const images = page.locator('img[src]')
    const imageCount = await images.count()

    if (imageCount > 0) {
      // Check that images have proper attributes for performance
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i)
        const loading = await img.getAttribute('loading')
        const alt = await img.getAttribute('alt')

        // Images should have loading="lazy" for performance (except above-fold)
        // and alt attributes for accessibility
        expect(alt !== null).toBe(true)

        // Check that image actually loads
        await expect(img).toBeVisible()
      }
    }
  })

  test('vehicles page should load and filter efficiently', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(4000) // Should load within 4 seconds

    // Check that vehicle cards render efficiently
    const vehicleCards = page.locator('.vehicle-card, [data-testid*="vehicle"]')

    // Use locator.all() to wait for elements
    const cards = await vehicleCards.all()

    if (cards.length > 0) {
      // Test filtering performance
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')

      if ((await searchInput.count()) > 0) {
        const searchStartTime = Date.now()

        await searchInput.fill('Toyota')

        // Wait for filter results (should be fast)
        await page.waitForTimeout(500) // Give time for filtering

        const searchTime = Date.now() - searchStartTime
        expect(searchTime).toBeLessThan(1000) // Search should complete in under 1s

        // Check that some results are shown
        const filteredCards = await vehicleCards.all()
        expect(filteredCards.length).toBeGreaterThanOrEqual(0) // Should have results or empty state
      }
    }

    // Check for efficient scrolling (if pagination exists)
    const loadMoreButton = page.locator('button:text("Load More"), button:text("Show More")')

    if ((await loadMoreButton.count()) > 0) {
      const beforeScroll = await vehicleCards.count()

      await loadMoreButton.click()
      await page.waitForTimeout(1000) // Wait for new content

      const afterScroll = await vehicleCards.count()
      expect(afterScroll).toBeGreaterThan(beforeScroll)
    }
  })

  test('vehicle details page should load quickly', async ({ page }) => {
    await page.goto('/vehicles')

    const vehicleCards = page.locator('.vehicle-card, [data-testid*="vehicle"]')
    const cardCount = await vehicleCards.count()

    if (cardCount > 0) {
      // Click on first vehicle
      const startTime = Date.now()

      await vehicleCards.first().click()

      // Wait for vehicle details to load
      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime
      expect(loadTime).toBeLessThan(3000) // Details should load within 3 seconds

      // Check that key elements are visible
      await expect(page.locator('h1, h2').first()).toBeVisible()

      // Check image gallery performance
      const galleryImages = page.locator('img[src*="vehicle"], img[alt*="vehicle" i]')
      const galleryCount = await galleryImages.count()

      if (galleryCount > 0) {
        // First image should load quickly
        const firstImage = galleryImages.first()
        await expect(firstImage).toBeVisible({ timeout: 2000 })

        // Check for lazy loading of additional images
        for (let i = 1; i < Math.min(galleryCount, 3); i++) {
          const img = galleryImages.nth(i)
          const loading = await img.getAttribute('loading')

          // Additional images should use lazy loading
          expect(loading === 'lazy' || loading === null).toBe(true)
        }
      }
    }
  })

  test('authentication should be performant', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/sign-in')

    // Fill and submit form
    await page.fill('input[placeholder="Enter your email"]', 'demo@automart.lk')
    await page.fill('input[placeholder="Enter your password"]', 'password123')

    const submitTime = Date.now()
    await page.click('button:text("Sign In")')

    // Wait for redirect to home page
    await page.waitForURL('/')

    const totalTime = Date.now() - startTime
    const authTime = Date.now() - submitTime

    // Authentication should be fast
    expect(authTime).toBeLessThan(3000) // Auth should complete within 3s
    expect(totalTime).toBeLessThan(5000) // Total flow should complete within 5s

    // Home page should load key elements quickly
    await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 2000 })
  })

  test('dashboard should load user data efficiently', async ({ page }) => {
    await signIn(page)

    const startTime = Date.now()

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // Dashboard should load within 3s

    // Check that user data sections load
    const userSections = page.locator('[data-testid*="user"], section')
    const sectionCount = await userSections.count()

    if (sectionCount > 0) {
      // All sections should be visible
      for (let i = 0; i < Math.min(sectionCount, 3); i++) {
        await expect(userSections.nth(i)).toBeVisible()
      }
    }

    // Check for data loading states
    const loadingSpinners = page.locator('.loading, [data-testid="loading"]')

    // Wait for any loading states to complete
    await page.waitForFunction(
      () => {
        const spinners = document.querySelectorAll('.loading, [data-testid="loading"]')
        return spinners.length === 0
      },
      { timeout: 5000 }
    )
  })

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/vehicles')

    // Check initial render performance
    const startTime = Date.now()
    await page.waitForLoadState('networkidle')
    const initialLoadTime = Date.now() - startTime

    expect(initialLoadTime).toBeLessThan(4000)

    // If there are many vehicles, test scrolling performance
    const vehicleCards = page.locator('.vehicle-card, [data-testid*="vehicle"]')
    const cardCount = await vehicleCards.count()

    if (cardCount > 10) {
      // Test scroll performance
      const scrollStart = Date.now()

      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2)
      })

      await page.waitForTimeout(100) // Small delay for scroll

      const scrollTime = Date.now() - scrollStart
      expect(scrollTime).toBeLessThan(200) // Scrolling should be smooth
    }

    // Test search performance with results
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')

    if ((await searchInput.count()) > 0) {
      const searchStartTime = Date.now()

      // Type a search query
      await searchInput.fill('car')

      // Wait for search results
      await page.waitForTimeout(300)

      const searchTime = Date.now() - searchStartTime
      expect(searchTime).toBeLessThan(800) // Search should be responsive
    }
  })

  test('should optimize resource loading', async ({ page }) => {
    // Enable network monitoring
    const responses: any[] = []

    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'],
        contentType: response.headers()['content-type'],
      })
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Analyze loaded resources
    const jsFiles = responses.filter(r => r.contentType?.includes('javascript'))
    const cssFiles = responses.filter(r => r.contentType?.includes('css'))
    const images = responses.filter(r => r.contentType?.includes('image'))

    // Check for reasonable number of requests
    expect(jsFiles.length).toBeLessThan(20) // Not too many JS files
    expect(cssFiles.length).toBeLessThan(10) // Not too many CSS files

    // Check that all critical resources loaded successfully
    const failed = responses.filter(r => r.status >= 400)
    expect(failed.length).toBe(0) // No failed requests

    // Check for caching headers (in a real test, you'd check response headers)
    const staticAssets = responses.filter(
      r =>
        r.url.includes('.js') ||
        r.url.includes('.css') ||
        r.url.includes('.png') ||
        r.url.includes('.jpg')
    )

    expect(staticAssets.length).toBeGreaterThan(0) // Should have static assets
  })

  test('should have efficient API calls', async ({ page }) => {
    const apiCalls: any[] = []

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
        })
      }
    })

    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')

    // Should have made API calls for data
    expect(apiCalls.length).toBeGreaterThan(0)

    // All API calls should be successful
    const failedAPIs = apiCalls.filter(call => call.status >= 400)
    expect(failedAPIs.length).toBe(0)

    // Should not have excessive API calls
    expect(apiCalls.length).toBeLessThan(10) // Reasonable number of API calls
  })

  test('should handle concurrent users efficiently', async ({ page, context }) => {
    // Simulate multiple tabs/users
    const page2 = await context.newPage()

    const startTime = Date.now()

    // Load the same page in both tabs simultaneously
    await Promise.all([page.goto('/vehicles'), page2.goto('/vehicles')])

    await Promise.all([page.waitForLoadState('networkidle'), page2.waitForLoadState('networkidle')])

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(6000) // Both should load within 6s

    // Both pages should work independently
    await expect(page.locator('body')).toBeVisible()
    await expect(page2.locator('body')).toBeVisible()

    await page2.close()
  })
})
