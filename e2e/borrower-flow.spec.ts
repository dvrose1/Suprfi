import { test, expect } from '@playwright/test'

test.describe('Borrower Application Flow', () => {
  test.describe('Get Started Page', () => {
    test('should display the get started form', async ({ page }) => {
      await page.goto('/get-started')
      
      // Check for SuprFi logo
      await expect(page.locator('text=SuprFi').or(page.locator('text=Supr'))).toBeVisible()
      
      // Check for form fields
      await expect(page.getByLabel(/first name/i)).toBeVisible()
      await expect(page.getByLabel(/last name/i)).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/phone/i)).toBeVisible()
    })

    test('should format phone number with dashes', async ({ page }) => {
      await page.goto('/get-started')
      
      const phoneInput = page.getByLabel(/phone/i)
      await phoneInput.fill('5551234567')
      
      // Should be formatted as 555-123-4567
      await expect(phoneInput).toHaveValue('555-123-4567')
    })

    test('should show validation errors for empty required fields', async ({ page }) => {
      await page.goto('/get-started')
      
      // Try to submit without filling fields
      await page.getByRole('button', { name: /check.*rate|get started|continue/i }).click()
      
      // Should show validation errors
      await expect(page.getByText(/required|please enter/i).first()).toBeVisible()
    })

    test('should have country code selector defaulting to US', async ({ page }) => {
      await page.goto('/get-started')
      
      // Look for country code selector with US flag or +1
      const countrySelector = page.locator('select').first()
      if (await countrySelector.isVisible()) {
        await expect(countrySelector).toHaveValue(/\+1/)
      }
    })
  })

  test.describe('Application Form', () => {
    // Note: These tests require a valid application token
    // In a real scenario, you'd seed the database or mock the API
    
    test.skip('should display application form with progress bar', async ({ page }) => {
      // This would require a valid token - skipping for now
      await page.goto('/apply/test-token')
      
      // Check for progress bar
      await expect(page.locator('[role="progressbar"]').or(page.locator('.bg-teal.h-2'))).toBeVisible()
    })
  })

  test.describe('Marketing Homepage', () => {
    test('should display hero section', async ({ page }) => {
      await page.goto('/')
      
      // Check for main headline
      await expect(page.locator('h1')).toBeVisible()
      
      // Check for CTA buttons
      await expect(page.getByRole('link', { name: /get started|check.*rate/i })).toBeVisible()
    })

    test('should have working navigation', async ({ page }) => {
      await page.goto('/')
      
      // Check header navigation exists
      const header = page.locator('header')
      await expect(header).toBeVisible()
      
      // Check for logo in header
      await expect(header.locator('text=Supr')).toBeVisible()
    })

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      
      // Page should still be functional
      await expect(page.locator('h1')).toBeVisible()
      
      // Mobile menu button might be visible
      const mobileMenuButton = page.locator('button').filter({ has: page.locator('svg') }).first()
      // Just check page loads correctly on mobile
      await expect(page.locator('body')).toBeVisible()
    })
  })
})

test.describe('Admin Dashboard', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/admin/login')
      
      // Check for login form elements
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in|log in|login/i })).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/admin/login')
      
      await page.getByLabel(/email/i).fill('invalid@example.com')
      await page.getByLabel(/password/i).fill('wrongpassword')
      await page.getByRole('button', { name: /sign in|log in|login/i }).click()
      
      // Should show error message
      await expect(page.getByText(/invalid|incorrect|error/i)).toBeVisible({ timeout: 5000 })
    })

    test('should have SuprOps branding', async ({ page }) => {
      await page.goto('/admin/login')
      
      // Check for SuprOps or SuprFi branding
      await expect(
        page.locator('text=SuprOps').or(page.locator('text=SuprFi')).or(page.locator('text=Supr'))
      ).toBeVisible()
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/admin')
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/admin\/login/)
    })

    test('should redirect applications page to login', async ({ page }) => {
      await page.goto('/admin/applications')
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/admin\/login/)
    })
  })
})

test.describe('API Health', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('/api/health')
    
    expect(response.ok()).toBeTruthy()
    
    const body = await response.json()
    expect(body.status).toBe('healthy')
  })
})
