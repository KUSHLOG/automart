import { test, expect } from '@playwright/test'

test.describe('Auto Mart - Core Buyer Flow', () => {
  test('should complete search → view car → buy now flow', async ({ page }) => {
    // Start at homepage
    await page.goto('/')

    // Verify homepage loads with search form and featured cars
    await expect(page.getByText('Auto Mart')).toBeVisible()
    await expect(page.getByText('Featured cars (most viewed)')).toBeVisible()

    // Perform search
    await page.fill('input[name="make"]', 'Toyota')
    await page.fill('input[name="model"]', 'Corolla')
    await page.click('button:text("Search")')

    // Should redirect to vehicles page with results
    await expect(page.url()).toContain('/vehicles')
    await expect(page.url()).toContain('make=Toyota')
    await expect(page.url()).toContain('model=Corolla')

    // Verify search results show Toyota Corolla
    await expect(page.getByText('Toyota Corolla')).toBeVisible()

    // Click on a vehicle card
    await page.locator('a[href*="/vehicles/"]').first().click()

    // Should be on vehicle detail page
    await expect(page.url()).toMatch(/\/vehicles\/[\w-]+$/)

    // Verify vehicle details are displayed
    await expect(page.getByText('Toyota')).toBeVisible()
    await expect(page.getByText('Corolla')).toBeVisible()
    await expect(page.getByText(/LKR \d{1,3}(,\d{3})*/)).toBeVisible() // Price
    await expect(page.getByText(/Mileage: \d{1,3}(,\d{3})* km/)).toBeVisible()

    // Verify specs section shows air conditioner info
    await expect(page.getByText('Specifications')).toBeVisible()
    await expect(page.getByText(/Air conditioner:/)).toBeVisible()

    // For Buy Now type vehicles, should not show bidding form
    const biddingForm = page.locator('form:has(input[name="amount"])')
    await expect(biddingForm).not.toBeVisible()
  })

  test('should handle empty search results gracefully', async ({ page }) => {
    await page.goto('/vehicles')

    // Search for non-existent vehicle
    await page.fill('input[name="make"]', 'NonExistentBrand')
    await page.click('button:text("Filter")')

    // Should show no results state or empty grid
    const vehicleCards = page.locator('a[href*="/vehicles/"]')
    await expect(vehicleCards).toHaveCount(0)
  })

  test('should filter vehicles by type', async ({ page }) => {
    await page.goto('/vehicles')

    // Filter by Buy Now type
    await page.selectOption('select[name="type"]', 'BUY_NOW')
    await page.click('button:text("Filter")')

    await expect(page.url()).toContain('type=BUY_NOW')

    // All visible vehicles should be Buy Now type
    const vehicleCards = page.locator('a[href*="/vehicles/"]')
    const count = await vehicleCards.count()

    if (count > 0) {
      // Click first vehicle to verify it's Buy Now type
      await vehicleCards.first().click()
      // Buy Now vehicles should not have bidding form
      await expect(page.locator('form:has(input[name="amount"])')).not.toBeVisible()
    }
  })

  test('should track views when visiting vehicle details', async ({ page }) => {
    await page.goto('/vehicles')

    // Get first vehicle link
    const firstVehicle = page.locator('a[href*="/vehicles/"]').first()
    await firstVehicle.click()

    // Page should load successfully (view tracking happens in background)
    await expect(page.getByText(/\d{4} \w+ \w+/)).toBeVisible() // Year Make Model

    // Check that tracking script is present (even if invisible)
    const trackingScript = page.locator('script:has-text("track/view")')
    await expect(trackingScript).toBeAttached()
  })

  test('should show featured vehicles on homepage', async ({ page }) => {
    await page.goto('/')

    // Featured section should be visible
    await expect(page.getByText('Featured cars (most viewed)')).toBeVisible()

    // Should have at least one featured vehicle
    const featuredVehicles = page.locator('.grid a[href*="/vehicles/"]')
    await expect(featuredVehicles.first()).toBeVisible()

    // Browse all vehicles link should work
    await page.click('text=Browse all vehicles')
    await expect(page.url()).toContain('/vehicles')
  })

  test('should preserve search state in URL', async ({ page }) => {
    await page.goto('/vehicles')

    // Fill multiple filters
    await page.fill('input[name="make"]', 'Honda')
    await page.fill('input[name="year"]', '2019')
    await page.selectOption('select[name="type"]', 'BIDDING')
    await page.click('button:text("Filter")')

    // URL should contain all parameters
    await expect(page.url()).toContain('make=Honda')
    await expect(page.url()).toContain('year=2019')
    await expect(page.url()).toContain('type=BIDDING')

    // Refresh page - filters should persist
    await page.reload()

    await expect(page.locator('input[name="make"]')).toHaveValue('Honda')
    await expect(page.locator('input[name="year"]')).toHaveValue('2019')
    await expect(page.locator('select[name="type"]')).toHaveValue('BIDDING')
  })

  test('should display vehicle specifications correctly', async ({ page }) => {
    await page.goto('/vehicles')

    // Click on first vehicle
    await page.locator('a[href*="/vehicles/"]').first().click()

    // Specifications section should be visible
    await expect(page.getByText('Specifications')).toBeVisible()

    // Air conditioner status should be displayed
    const airConditionerStatus = page.locator('text=/Air conditioner: (true|false)/')
    await expect(airConditionerStatus).toBeVisible()

    // Should show additional specs in structured format
    await expect(page.locator('pre')).toBeVisible() // JSON specs display
  })
})
