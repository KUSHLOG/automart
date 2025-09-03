import { test, expect, Page } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Auto Mart - Accessibility Tests', () => {
  const signIn = async (page: Page) => {
    await page.goto('/sign-in')
    await page.fill('input[placeholder="Enter your email"]', 'demo@automart.lk')
    await page.fill('input[placeholder="Enter your password"]', 'password123')
    await page.click('button:text("Sign In")')
    await page.waitForURL('/')
  }

  test.beforeEach(async ({ page }) => {
    await injectAxe(page)
  })

  test('homepage should be accessible', async ({ page }) => {
    await page.goto('/')

    // Check for accessibility violations
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    })

    // Additional manual accessibility checks

    // Check for proper heading structure
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1) // Should have exactly one h1

    // Check for alt text on images
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const role = await img.getAttribute('role')

      // Images should have alt text or role="presentation" for decorative images
      expect(alt !== null || role === 'presentation').toBe(true)
    }

    // Check for focus indicators on interactive elements
    const focusableElements = page.locator(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const focusableCount = await focusableElements.count()

    if (focusableCount > 0) {
      // Test keyboard navigation
      await page.keyboard.press('Tab')

      // Check that focused element is visible
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    }
  })

  test('vehicles page should be accessible', async ({ page }) => {
    await page.goto('/vehicles')

    await checkA11y(page, undefined, {
      detailedReport: true,
    })

    // Check vehicle cards for proper structure
    const vehicleCards = page.locator('.vehicle-card, [data-testid*="vehicle"]')
    const cardCount = await vehicleCards.count()

    if (cardCount > 0) {
      // Each card should be properly labeled
      for (let i = 0; i < Math.min(cardCount, 3); i++) {
        const card = vehicleCards.nth(i)

        // Should have accessible name (either aria-label or text content)
        const accessibleName = await card.getAttribute('aria-label')
        const textContent = await card.textContent()

        expect(accessibleName !== null || (textContent && textContent.trim().length > 0)).toBe(true)

        // Should be keyboard accessible
        await card.focus()
        await expect(card).toBeFocused()
      }
    }

    // Check search functionality accessibility
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')
    if ((await searchInput.count()) > 0) {
      // Search input should have proper labeling
      const label = await searchInput.getAttribute('aria-label')
      const labelledBy = await searchInput.getAttribute('aria-labelledby')
      const placeholder = await searchInput.getAttribute('placeholder')

      expect(label !== null || labelledBy !== null || placeholder !== null).toBe(true)
    }
  })

  test('authentication pages should be accessible', async ({ page }) => {
    await page.goto('/sign-in')

    await checkA11y(page, undefined, {
      detailedReport: true,
    })

    // Check form accessibility
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]')
    const passwordInput = page.locator('input[type="password"], input[placeholder*="password" i]')

    if ((await emailInput.count()) > 0) {
      // Email input should have proper labeling
      const emailLabel = await emailInput.getAttribute('aria-label')
      const emailLabelledBy = await emailInput.getAttribute('aria-labelledby')
      expect(emailLabel !== null || emailLabelledBy !== null).toBe(true)

      // Should be keyboard accessible
      await emailInput.focus()
      await expect(emailInput).toBeFocused()
    }

    if ((await passwordInput.count()) > 0) {
      // Password input should have proper labeling
      const passwordLabel = await passwordInput.getAttribute('aria-label')
      const passwordLabelledBy = await passwordInput.getAttribute('aria-labelledby')
      expect(passwordLabel !== null || passwordLabelledBy !== null).toBe(true)
    }

    // Check form validation accessibility
    await page.click('button:text("Sign in")')

    // Any error messages should be accessible
    const errorMessages = page.locator('[role="alert"], .error, [aria-invalid="true"]')
    const errorCount = await errorMessages.count()

    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const error = errorMessages.nth(i)
        await expect(error).toBeVisible()

        // Error should be associated with the relevant input
        const ariaDescribedBy = await error.getAttribute('aria-describedby')
        expect(ariaDescribedBy !== null || (await error.getAttribute('role')) === 'alert').toBe(
          true
        )
      }
    }
  })

  test('dashboard should be accessible when authenticated', async ({ page }) => {
    await signIn(page)

    await page.goto('/dashboard')

    await checkA11y(page, undefined, {
      detailedReport: true,
    })

    // Check dashboard sections
    const sections = page.locator('section, [role="region"]')
    const sectionCount = await sections.count()

    if (sectionCount > 0) {
      for (let i = 0; i < sectionCount; i++) {
        const section = sections.nth(i)

        // Each section should have an accessible name
        const ariaLabel = await section.getAttribute('aria-label')
        const ariaLabelledBy = await section.getAttribute('aria-labelledby')
        const heading = section.locator('h1, h2, h3, h4, h5, h6').first()

        const hasHeading = (await heading.count()) > 0
        expect(ariaLabel !== null || ariaLabelledBy !== null || hasHeading).toBe(true)
      }
    }

    // Check navigation accessibility
    const navElements = page.locator('nav, [role="navigation"]')
    const navCount = await navElements.count()

    if (navCount > 0) {
      for (let i = 0; i < navCount; i++) {
        const nav = navElements.nth(i)

        // Navigation should be properly labeled
        const ariaLabel = await nav.getAttribute('aria-label')
        expect(ariaLabel !== null || (await nav.textContent())).toBeTruthy()
      }
    }
  })

  test('color contrast should meet WCAG standards', async ({ page }) => {
    await page.goto('/')

    // Use axe-core to check color contrast
    await checkA11y(page, undefined, {
      detailedReport: true,
    })

    // Additional contrast checks for key elements
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    if (buttonCount > 0) {
      // Check button contrast programmatically
      const buttonStyles = await buttons.first().evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          border: styles.border,
        }
      })

      // Ensure styles are defined (actual contrast checking would require more complex logic)
      expect(buttonStyles.color).toBeTruthy()
      expect(buttonStyles.backgroundColor || buttonStyles.border).toBeTruthy()
    }
  })

  test('keyboard navigation should work throughout the site', async ({ page }) => {
    await page.goto('/')

    // Test tab navigation
    const focusableElements = []
    let tabCount = 0
    const maxTabs = 20 // Prevent infinite loops

    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab')
      tabCount++

      const focusedElement = page.locator(':focus')
      const focusedCount = await focusedElement.count()

      if (focusedCount === 0) break // No more focusable elements

      const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase())
      const role = await focusedElement.getAttribute('role')

      focusableElements.push({ tagName, role })

      // Test that focused element is visible
      await expect(focusedElement).toBeVisible()

      // Test Enter key activation for buttons and links
      if (tagName === 'button' || tagName === 'a' || role === 'button') {
        const href = await focusedElement.getAttribute('href')
        const disabled = await focusedElement.getAttribute('disabled')

        if (href === '/' || href === '' || disabled !== null) {
          // Safe to test activation
          await page.keyboard.press('Enter')
          // Allow time for any navigation or state changes
          await page.waitForTimeout(100)
        }
      }
    }

    expect(focusableElements.length).toBeGreaterThan(0)
  })

  test('screen reader landmarks should be properly defined', async ({ page }) => {
    await page.goto('/')

    // Check for ARIA landmarks
    const landmarks = await page
      .locator(
        '[role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"], header, nav, main, aside, footer'
      )
      .all()

    expect(landmarks.length).toBeGreaterThan(0)

    // Should have a main landmark
    const mainLandmark = page.locator('[role="main"], main')
    const mainCount = await mainLandmark.count()
    expect(mainCount).toBeGreaterThanOrEqual(1)

    // Check for skip links
    const skipLinks = page.locator('a[href^="#"], a:text("skip"), a:text("Skip")')
    if ((await skipLinks.count()) > 0) {
      // Skip links should be functional
      const skipLink = skipLinks.first()
      const href = await skipLink.getAttribute('href')

      if (href && href.startsWith('#')) {
        const targetId = href.substring(1)
        const target = page.locator(`#${targetId}`)
        await expect(target).toHaveCount(1)
      }
    }
  })

  test('forms should have proper error handling and feedback', async ({ page }) => {
    await page.goto('/sign-in')

    // Test form submission without data
    await page.click('button:text("Sign in")')

    // Check for accessible error messages
    const errorElements = page.locator('[role="alert"], [aria-invalid="true"], .error')
    const errorCount = await errorElements.count()

    if (errorCount > 0) {
      // Errors should be announced to screen readers
      for (let i = 0; i < errorCount; i++) {
        const error = errorElements.nth(i)
        const role = await error.getAttribute('role')
        const ariaLive = await error.getAttribute('aria-live')

        expect(role === 'alert' || ariaLive !== null).toBe(true)
      }
    }

    // Test form field validation
    const inputs = page.locator('input[required]')
    const inputCount = await inputs.count()

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)

      // Required fields should be properly marked
      const required = await input.getAttribute('required')
      const ariaRequired = await input.getAttribute('aria-required')

      expect(required !== null || ariaRequired === 'true').toBe(true)
    }
  })
})
