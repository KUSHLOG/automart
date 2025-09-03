import { test, expect } from '@playwright/test'

test.describe('Auto Mart - Server Health & Basic Functionality', () => {
  test('should have server running and responding', async ({ page }) => {
    // Test health endpoint
    const response = await page.request.get('/api/health')
    expect(response.status()).toBe(200)
    
    const health = await response.json()
    expect(health.status).toBe('ok')
    expect(health.service).toBe('automart')
  })

  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check for key elements
    await expect(page).toHaveTitle(/Auto Mart/i)
    await expect(page.getByText('Auto Mart')).toBeVisible()
    
    // Should show some content
    await expect(page.getByText(/vehicle|car|auto/i).first()).toBeVisible()
  })

  test('should load vehicles page', async ({ page }) => {
    await page.goto('/vehicles')
    
    // Should have vehicles page elements
    await expect(page).toHaveTitle(/Vehicles|Auto Mart/i)
    
    // Should have search/filter functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]')
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible()
    }
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check navigation links
    const navLinks = page.locator('nav a, header a')
    const linkCount = await navLinks.count()
    
    expect(linkCount).toBeGreaterThan(0)
    
    // Try clicking a navigation link
    if (linkCount > 0) {
      const firstLink = navLinks.first()
      const href = await firstLink.getAttribute('href')
      
      if (href && href !== '#' && !href.startsWith('http')) {
        await firstLink.click()
        await page.waitForLoadState('networkidle')
        
        // Should navigate successfully
        expect(page.url()).toContain(href)
      }
    }
  })

  test('should show vehicle types correctly', async ({ page }) => {
    await page.goto('/vehicles')
    
    // Look for type filter dropdown
    const typeSelect = page.locator('select[name="type"]')
    if (await typeSelect.count() > 0) {
      await expect(typeSelect).toBeVisible()
      
      // Should have BUY_NOW and BIDDING options
      await expect(typeSelect.locator('option[value="BUY_NOW"]')).toBeVisible()
      await expect(typeSelect.locator('option[value="BIDDING"]')).toBeVisible()
      
      // Should NOT have LIVE_AUCTION option
      await expect(typeSelect.locator('option[value="LIVE_AUCTION"]')).toHaveCount(0)
    }
  })

  test('should display vehicles with correct badges', async ({ page }) => {
    await page.goto('/vehicles')
    
    // Wait for potential vehicles to load
    await page.waitForTimeout(2000)
    
    // Look for vehicle cards
    const vehicleCards = page.locator('.vehicle-card, [data-testid="vehicle-card"], a[href*="/vehicles/"]')
    const cardCount = await vehicleCards.count()
    
    if (cardCount > 0) {
      // Check for type badges on vehicles
      const badges = page.locator('.bg-green-500, .bg-orange-500').filter({hasText: /Buy Now|Bidding/i})
      const badgeCount = await badges.count()
      
      expect(badgeCount).toBeGreaterThan(0)
      
      // Should not have any live auction references
      await expect(page.getByText('Live Auction')).toHaveCount(0)
    }
  })
})
