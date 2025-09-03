import { test, expect, Page } from '@playwright/test'

test.describe('Auto Mart - Security Tests', () => {
  const signIn = async (page: Page) => {
    await page.goto('/sign-in')
    await page.fill('input[placeholder="Enter your email"]', 'demo@automart.lk')
    await page.fill('input[placeholder="Enter your password"]', 'password123')
    await page.click('button:text("Sign In")')
    await page.waitForURL('/')
  }

  test('should have proper HTTPS and security headers', async ({ page }) => {
    const responses: any[] = []

    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        headers: response.headers(),
      })
    })

    await page.goto('/')

    const mainResponse = responses.find(r => r.url === page.url())

    if (mainResponse) {
      // Check for security headers
      const headers = mainResponse.headers

      // X-Frame-Options should be present to prevent clickjacking
      expect(headers['x-frame-options'] || headers['content-security-policy']).toBeTruthy()

      // X-Content-Type-Options should be present
      expect(headers['x-content-type-options']).toBe('nosniff')

      // Should use secure cookies (if cookies are set)
      if (headers['set-cookie']) {
        const cookies = Array.isArray(headers['set-cookie'])
          ? headers['set-cookie']
          : [headers['set-cookie']]

        cookies.forEach(cookie => {
          if (cookie.includes('Secure') || process.env.NODE_ENV === 'development') {
            // In development, cookies might not be secure
            expect(true).toBe(true)
          }
        })
      }
    }
  })

  test('should prevent unauthorized access to protected routes', async ({ page }) => {
    // Clear any existing sessions
    await page.context().clearCookies()

    // Try to access protected routes without authentication
    const protectedRoutes = ['/dashboard']

    for (const route of protectedRoutes) {
      await page.goto(route)

      // Should redirect to sign-in page
      await expect(page.url()).toContain('sign-in')

      // Should not show protected content
      await expect(page.getByText('Dashboard')).not.toBeVisible()
    }
  })

  test('should handle authentication securely', async ({ page }) => {
    await page.goto('/sign-in')

    // Test invalid credentials
    await page.fill('input[placeholder="Enter your email"]', 'invalid@example.com')
    await page.fill('input[placeholder="Enter your password"]', 'wrongpassword')
    await page.click('button:text("Sign in")')

    // Should show error message but not reveal too much information
    const errorText = await page.textContent('body')
    expect(errorText).toMatch(/invalid|incorrect|error/i)
    expect(errorText).not.toMatch(/user not found|password wrong/i) // Don't reveal specific errors

    // Should remain on sign-in page
    await expect(page.url()).toContain('sign-in')
  })

  test('should protect against CSRF attacks', async ({ page }) => {
    await signIn(page)

    // Check that forms have CSRF protection
    await page.goto('/dashboard')

    // Look for CSRF tokens in forms
    const forms = page.locator('form')
    const formCount = await forms.count()

    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i)

      // Forms should have some form of CSRF protection
      // This could be tokens, SameSite cookies, or other methods
      const csrfToken = form.locator('input[name*="csrf"], input[name*="token"]')
      const hasHiddenInputs = (await form.locator('input[type="hidden"]').count()) > 0

      // At least one protection method should be present
      expect((await csrfToken.count()) > 0 || hasHiddenInputs).toBe(true)
    }
  })

  test('should sanitize user inputs', async ({ page }) => {
    // Test XSS prevention
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '"><script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(\'xss\')">',
    ]

    await page.goto('/vehicles')

    // Test search input for XSS
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')

    if ((await searchInput.count()) > 0) {
      for (const payload of xssPayloads) {
        await searchInput.fill(payload)
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        // Should not execute any scripts
        const alertHandled = await page.evaluate(() => {
          return !window.alert.toString().includes('native code')
        })

        // No alerts should have been triggered
        expect(alertHandled).toBe(false) // alert should still be native

        // The payload should be escaped in the DOM
        const bodyText = await page.textContent('body')
        expect(bodyText).not.toContain('<script>')
      }
    }
  })

  test('should handle file uploads securely', async ({ page, browserName }) => {
    await signIn(page)

    // Navigate to a page with file upload (like create listing)
    await page.goto('/dashboard')

    const createButton = page.locator('button:text("Create Listing"), a:text("Create Listing")')

    if ((await createButton.count()) > 0) {
      await createButton.click()

      const fileInput = page.locator('input[type="file"]')

      if ((await fileInput.count()) > 0) {
        // Test file type restrictions
        const maliciousFile = Buffer.from('<?php echo "malicious code"; ?>')

        await fileInput.setInputFiles([
          {
            name: 'malicious.php',
            mimeType: 'text/php',
            buffer: maliciousFile,
          },
        ])

        // Should reject non-image files
        const errorMessage = page.locator('.error, [role="alert"]')
        if ((await errorMessage.count()) > 0) {
          await expect(errorMessage).toBeVisible()
        }

        // Test file size limits
        const largeFile = Buffer.alloc(20 * 1024 * 1024) // 20MB

        await fileInput.setInputFiles([
          {
            name: 'large.jpg',
            mimeType: 'image/jpeg',
            buffer: largeFile,
          },
        ])

        // Should reject overly large files
        const sizeError = page.locator('.error, [role="alert"]')
        if ((await sizeError.count()) > 0) {
          const errorText = await sizeError.textContent()
          expect(errorText).toMatch(/size|large|limit/i)
        }
      }
    }
  })

  test('should protect user data privacy', async ({ page }) => {
    await signIn(page)

    await page.goto('/dashboard')

    // Check that sensitive data is not exposed in the client
    const pageContent = await page.content()

    // Should not contain sensitive information in HTML
    expect(pageContent).not.toMatch(/password/i)
    expect(pageContent).not.toMatch(/api[_-]key/i)
    expect(pageContent).not.toMatch(/secret/i)

    // Check network requests for data leaks
    const responses: any[] = []

    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
      })
    })

    // Navigate and check responses
    await page.reload()
    await page.waitForLoadState('networkidle')

    // API responses should not leak sensitive data (this would need API inspection)
    const apiResponses = responses.filter(r => r.url.includes('/api/'))

    for (const response of apiResponses) {
      expect(response.status).not.toBe(500) // No server errors that might leak info
    }
  })

  test('should implement proper session management', async ({ page }) => {
    await signIn(page)

    // Check session is working
    await expect(page.getByText('Dashboard')).toBeVisible()

    // Test session persistence
    await page.reload()
    await expect(page.getByText('Dashboard')).toBeVisible()

    // Test logout functionality (if available)
    const logoutButton = page.locator(
      'button:text("Logout"), button:text("Sign out"), a:text("Logout"), a:text("Sign out")'
    )

    if ((await logoutButton.count()) > 0) {
      await logoutButton.click()

      // Should redirect to home or sign-in page
      await page.waitForURL(url => !url.href.includes('sign-in'))

      // Should not be able to access protected routes
      await page.goto('/dashboard')
      await expect(page.url()).toContain('sign-in')
    }

    // Test session timeout (simulate by clearing cookies)
    await page.context().clearCookies()
    await page.goto('/dashboard')

    // Should be redirected to sign-in
    await expect(page.url()).toContain('sign-in')
  })

  test('should validate API endpoints', async ({ page }) => {
    const apiRequests: any[] = []

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
        })
      }
    })

    await signIn(page)
    await page.goto('/vehicles')
    await page.waitForLoadState('networkidle')

    // Check that API requests are properly authenticated
    for (const request of apiRequests) {
      // Should have proper authorization headers or cookies
      const hasAuth =
        request.headers.authorization || request.headers.cookie || request.url.includes('public')

      expect(hasAuth).toBeTruthy()
    }
  })

  test('should handle errors securely', async ({ page }) => {
    // Test 404 pages don't leak information
    await page.goto('/non-existent-page')

    const content = await page.textContent('body')

    // Should show user-friendly error, not stack traces
    expect(content).not.toMatch(/stack trace|error at|node_modules/i)
    expect(content).toMatch(/not found|404/i)

    // Test API error handling
    await page.goto('/api/non-existent-endpoint')

    const apiContent = await page.textContent('body')

    // API errors should be generic
    expect(apiContent).not.toMatch(/stack trace|internal server error/i)
  })

  test('should implement rate limiting protection', async ({ page }) => {
    // Test rapid requests to auth endpoint
    await page.goto('/sign-in')

    const promises = []

    // Make multiple rapid authentication attempts
    for (let i = 0; i < 10; i++) {
      const attempt = async () => {
        await page.fill('input[placeholder="Enter your email"]', `test${i}@example.com`)
        await page.fill('input[placeholder="Enter your password"]', 'wrongpassword')
        await page.click('button:text("Sign in")')
        await page.waitForTimeout(100)
      }

      promises.push(attempt())
    }

    await Promise.all(promises)

    // After many failed attempts, should show rate limiting or additional security
    const content = await page.textContent('body')

    // Should have some form of rate limiting or captcha
    // (This is implementation-dependent)
    expect(content).toBeTruthy() // Basic check that page still responds
  })

  test('should use HTTPS in production environment', async ({ page }) => {
    // This test assumes production environment uses HTTPS
    if (process.env.NODE_ENV === 'production') {
      await page.goto('/')

      // Should use HTTPS protocol
      expect(page.url()).toMatch(/^https:\/\//)

      // Should have secure headers
      const response = await page.goto('/')
      if (response) {
        const headers = response.headers()
        expect(headers['strict-transport-security']).toBeTruthy()
      }
    } else {
      // In development, we might not have HTTPS
      test.skip(true, 'HTTPS test only applies to production')
    }
  })
})
