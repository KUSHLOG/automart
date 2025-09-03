import { test, expect } from '@playwright/test'

test.describe('Auto Mart - Basic Authentication', () => {
  test('should show sign-in page and form', async ({ page }) => {
    await page.goto('/sign-in')

    // Check that sign-in form is present
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(page.locator('input[placeholder="Enter your email"]')).toBeVisible()
    await expect(page.locator('input[placeholder="Enter your password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('should show different navigation for unauthenticated users', async ({ page }) => {
    await page.goto('/')

    // Should show "Sign in" link in navigation
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible()

    // Should have basic navigation
    await expect(page.getByRole('link', { name: 'Auto Mart' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'All Vehicles' })).toBeVisible()
  })

  test('should allow access to public routes without authentication', async ({ page }) => {
    // Test that public routes are accessible without auth
    await page.goto('/')
    await expect(page.url()).toBe('http://localhost:3000/')

    await page.goto('/vehicles')
    await expect(page.url()).toContain('/vehicles')

    // Should still show sign-in option
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible()
  })

  test('should show vehicle listing page', async ({ page }) => {
    await page.goto('/vehicles')

    // Should show vehicles page
    await expect(page.url()).toContain('/vehicles')
    // Page should load without errors
    await expect(page.locator('body')).toBeVisible()
  })
})
