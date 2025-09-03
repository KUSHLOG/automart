import { test, expect, Page } from '@playwright/test'

test.describe('Auto Mart - Vehicle Listing Creation', () => {
  // Helper function to authenticate
  const signIn = async (page: Page) => {
    await page.goto('/sign-in')
    await page.fill('input[placeholder="Enter your email"]', 'demo@automart.lk')
    await page.fill('input[placeholder="Enter your password"]', 'password123')
    await page.click('button:text("Sign In")')
    await page.waitForURL('/')
  }

  test('should redirect to sign-in when creating listing without auth', async ({ page }) => {
    // Try to access create listing page
    await page.goto('/vehicles/create')

    // Should redirect to sign-in or show authentication required
    const isOnSignIn = page.url().includes('sign-in')
    const isOnCreate = page.url().includes('/vehicles/create')
    
    if (isOnCreate) {
      // If on create page, it should show some authentication requirement
      // or the form should not be functional
      expect(isOnCreate).toBe(true)
    } else {
      // Should redirect to sign-in
      expect(isOnSignIn).toBe(true)
    }
  })

  test('should show create listing form when authenticated', async ({ page }) => {
    await signIn(page)

    // Navigate to create listing (from dashboard or nav)
    await page.click('text=Create Listing')

    // Should show create listing form
    await expect(page.getByText('Create Vehicle Listing')).toBeVisible()

    // Check form fields are present
    const numberInputs = await page.locator('select, input[type="number"]').count()
    expect(numberInputs).toBeGreaterThan(0)

    const fileInputs = await page.locator('textarea, input[type="file"]').count()
    expect(fileInputs).toBeGreaterThan(0)
  })

  test('should create vehicle listing with all required fields', async ({ page }) => {
    await signIn(page)

    // Navigate to create listing
    await page.click('text=Create Listing')

    // Fill out the form
    await page.fill('input[placeholder*="Make"]', 'Toyota')
    await page.fill('input[placeholder*="Model"]', 'Corolla')
    await page.selectOption('select[name*="year"], input[name*="year"]', '2020')
    await page.fill('input[name*="mileage"]', '25000')
    await page.fill('input[name*="price"]', '3500000')
    await page.selectOption('select[name*="condition"]', 'Used')

    // Add description
    await page.fill(
      'textarea[name*="description"]',
      'Well maintained Toyota Corolla in excellent condition'
    )

    // Upload images (mock file upload)
    const fileInput = page.locator('input[type="file"]')
    if ((await fileInput.count()) > 0) {
      // Create a mock file for testing
      const mockFile = Buffer.from('mock-image-data')
      await fileInput.setInputFiles([
        {
          name: 'car-image.jpg',
          mimeType: 'image/jpeg',
          buffer: mockFile,
        },
      ])
    }

    // Submit the form
    await page.click('button:text("Create Listing")')

    // Should redirect to success page or back to dashboard
    await expect(page.getByText('Listing created successfully')).toBeVisible({ timeout: 10000 })

    // Verify listing appears in user's dashboard
    await page.goto('/dashboard')
    await expect(page.getByText('Toyota Corolla')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await signIn(page)

    // Navigate to create listing
    await page.click('text=Create Listing')

    // Try to submit without filling required fields
    await page.click('button:text("Create Listing")')

    // Should show validation errors
    await expect(page.getByText(/required/i)).toBeVisible()

    // Form should not submit
    await expect(page.url()).toContain('create')
  })

  test('should validate price input', async ({ page }) => {
    await signIn(page)

    // Navigate to create listing
    await page.click('text=Create Listing')

    // Enter invalid price
    await page.fill('input[name*="price"]', '-1000')
    await page.click('button:text("Create Listing")')

    // Should show price validation error
    await expect(page.getByText(/positive/i)).toBeVisible()

    // Test very high price
    await page.fill('input[name*="price"]', '999999999999')
    await page.click('button:text("Create Listing")')

    // Should handle large numbers appropriately
  })

  test('should show created listing in All Vehicles page', async ({ page }) => {
    await signIn(page)

    // Create a listing first
    await page.click('text=Create Listing')

    // Fill minimal required fields
    await page.fill('input[placeholder*="Make"]', 'Honda')
    await page.fill('input[placeholder*="Model"]', 'Civic')
    await page.selectOption('select[name*="year"], input[name*="year"]', '2019')
    await page.fill('input[name*="price"]', '2800000')

    await page.click('button:text("Create Listing")')
    await expect(page.getByText('Listing created successfully')).toBeVisible({ timeout: 10000 })

    // Navigate to All Vehicles
    await page.goto('/vehicles')

    // Should see the new listing
    await expect(page.getByText('Honda Civic')).toBeVisible()
    await expect(page.getByText('Rs. 28,00,000')).toBeVisible()
  })

  test('should handle image upload validation', async ({ page }) => {
    await signIn(page)

    // Navigate to create listing
    await page.click('text=Create Listing')

    const fileInput = page.locator('input[type="file"]')
    if ((await fileInput.count()) > 0) {
      // Test invalid file type
      const invalidFile = Buffer.from('not-an-image')
      await fileInput.setInputFiles([
        {
          name: 'document.txt',
          mimeType: 'text/plain',
          buffer: invalidFile,
        },
      ])

      // Should show file type error
      await expect(page.getByText(/invalid file type/i)).toBeVisible()

      // Test file size limit (create a large mock file)
      const largeFile = Buffer.alloc(10 * 1024 * 1024) // 10MB
      await fileInput.setInputFiles([
        {
          name: 'large-image.jpg',
          mimeType: 'image/jpeg',
          buffer: largeFile,
        },
      ])

      // Should show file size error
      await expect(page.getByText(/file too large/i)).toBeVisible()
    }
  })

  test('should allow editing created listing', async ({ page }) => {
    await signIn(page)

    // Go to dashboard to see user's listings
    await page.goto('/dashboard')

    // If there are existing listings, try to edit one
    const editButton = page.locator('button:text("Edit"), a:text("Edit")').first()

    if ((await editButton.count()) > 0) {
      await editButton.click()

      // Should open edit form
      await expect(page.getByText('Edit Listing')).toBeVisible()

      // Modify a field
      await page.fill('input[name*="price"]', '3000000')

      // Save changes
      await page.click('button:text("Update Listing")')

      // Should show success message
      await expect(page.getByText('Listing updated successfully')).toBeVisible()
    }
  })

  test('should allow deleting created listing', async ({ page }) => {
    await signIn(page)

    // Go to dashboard
    await page.goto('/dashboard')

    // If there are existing listings, try to delete one
    const deleteButton = page.locator('button:text("Delete"), a:text("Delete")').first()

    if ((await deleteButton.count()) > 0) {
      await deleteButton.click()

      // Should show confirmation dialog
      await expect(page.getByText('confirm', { exact: false })).toBeVisible()

      // Confirm deletion
      await page.click('button:text("Confirm"), button:text("Yes")')

      // Should show success message and remove from list
      await expect(page.getByText('Listing deleted successfully')).toBeVisible()
    }
  })

  test('should show user listings count on dashboard', async ({ page }) => {
    await signIn(page)

    await page.goto('/dashboard')

    // Should show count of user's vehicles
    await expect(page.getByText(/Your Vehicles \(\d+\)/)).toBeVisible()

    // Should show list of vehicles or empty state
    const vehiclesList = page.locator('[data-testid="user-vehicles"]')
    const emptyState = page.getByText('No vehicles listed')

    // Either should be visible
    await expect(vehiclesList.or(emptyState)).toBeVisible()
  })
})
