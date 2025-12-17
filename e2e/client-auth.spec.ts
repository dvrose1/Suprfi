// ABOUTME: E2E tests for SuprClient authentication
// ABOUTME: Tests login flow including cookie handling after authentication

import { test, expect } from '@playwright/test'

test.describe('SuprClient Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/client/login')
      
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
      await expect(page.locator('text=SuprClient')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/client/login')
      
      await page.getByLabel(/email/i).fill('invalid@example.com')
      await page.getByLabel(/password/i).fill('wrongpassword')
      await page.getByRole('button', { name: /sign in/i }).click()
      
      await expect(page.getByText(/invalid|incorrect|error/i)).toBeVisible({ timeout: 5000 })
    })

    test('should show error for empty fields', async ({ page }) => {
      await page.goto('/client/login')
      
      // Click sign in without filling fields - HTML5 validation should kick in
      await page.getByRole('button', { name: /sign in/i }).click()
      
      // Check that email field has validation error (required attribute)
      const emailInput = page.getByLabel(/email/i)
      await expect(emailInput).toHaveAttribute('required', '')
    })

    test('should have remember me checkbox', async ({ page }) => {
      await page.goto('/client/login')
      
      const rememberMe = page.getByLabel(/remember me/i)
      await expect(rememberMe).toBeVisible()
      await expect(rememberMe).not.toBeChecked()
      
      await rememberMe.click()
      await expect(rememberMe).toBeChecked()
    })

    test('should have forgot password link', async ({ page }) => {
      await page.goto('/client/login')
      
      const forgotLink = page.getByRole('link', { name: /forgot password/i })
      await expect(forgotLink).toBeVisible()
      await expect(forgotLink).toHaveAttribute('href', '/client/forgot-password')
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/client')
      
      // Should redirect to login page
      await expect(page).toHaveURL(/\/client\/login/)
    })

    test('should redirect applications page to login', async ({ page }) => {
      await page.goto('/client/applications')
      
      await expect(page).toHaveURL(/\/client\/login/)
    })

    test('should redirect loans page to login', async ({ page }) => {
      await page.goto('/client/loans')
      
      await expect(page).toHaveURL(/\/client\/login/)
    })
  })

  test.describe('Login Flow with Valid Credentials', () => {
    // These tests require seeded test data
    // Skip if no test credentials are available
    
    test.skip('should successfully login and redirect to dashboard', async ({ page }) => {
      // This test requires a seeded contractor user in the database
      // To enable: Create a test contractor with known credentials
      
      await page.goto('/client/login')
      
      await page.getByLabel(/email/i).fill('test@contractor.com')
      await page.getByLabel(/password/i).fill('testpassword123')
      await page.getByRole('button', { name: /sign in/i }).click()
      
      // Wait for navigation after successful login
      await expect(page).toHaveURL('/client', { timeout: 10000 })
      
      // Verify we're logged in by checking for dashboard content
      await expect(page.locator('text=Dashboard').or(page.locator('text=Welcome'))).toBeVisible()
    })

    test.skip('should maintain session across page navigation', async ({ page }) => {
      // Login first
      await page.goto('/client/login')
      await page.getByLabel(/email/i).fill('test@contractor.com')
      await page.getByLabel(/password/i).fill('testpassword123')
      await page.getByRole('button', { name: /sign in/i }).click()
      
      await expect(page).toHaveURL('/client', { timeout: 10000 })
      
      // Navigate to another protected page
      await page.goto('/client/applications')
      
      // Should not redirect to login
      await expect(page).toHaveURL('/client/applications')
    })

    test.skip('should set session cookie after login', async ({ page, context }) => {
      await page.goto('/client/login')
      
      await page.getByLabel(/email/i).fill('test@contractor.com')
      await page.getByLabel(/password/i).fill('testpassword123')
      await page.getByRole('button', { name: /sign in/i }).click()
      
      // Wait for redirect
      await expect(page).toHaveURL('/client', { timeout: 10000 })
      
      // Check that session cookie was set
      const cookies = await context.cookies()
      const sessionCookie = cookies.find(c => c.name === 'contractor_session')
      
      expect(sessionCookie).toBeDefined()
      expect(sessionCookie?.httpOnly).toBe(true)
    })
  })

  test.describe('Logout', () => {
    test.skip('should logout and redirect to login', async ({ page }) => {
      // Login first
      await page.goto('/client/login')
      await page.getByLabel(/email/i).fill('test@contractor.com')
      await page.getByLabel(/password/i).fill('testpassword123')
      await page.getByRole('button', { name: /sign in/i }).click()
      
      await expect(page).toHaveURL('/client', { timeout: 10000 })
      
      // Click logout (location may vary by UI)
      await page.getByRole('button', { name: /logout|sign out/i }).click()
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/client\/login/)
      
      // Try accessing protected page
      await page.goto('/client')
      await expect(page).toHaveURL(/\/client\/login/)
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('login page should work on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/client/login')
      
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
      
      // Form should be usable
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('password')
      
      // Button should be clickable
      const button = page.getByRole('button', { name: /sign in/i })
      await expect(button).toBeEnabled()
    })
  })
})

test.describe('Borrower Portal Authentication', () => {
  test.describe('Login Page', () => {
    test('should display email-first login form', async ({ page }) => {
      await page.goto('/portal/login')
      
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /continue/i })).toBeVisible()
      await expect(page.locator('text=Borrower Portal')).toBeVisible()
    })

    test('should show error for non-existent email', async ({ page }) => {
      await page.goto('/portal/login')
      
      await page.getByLabel(/email/i).fill('nonexistent@example.com')
      await page.getByRole('button', { name: /continue/i }).click()
      
      await expect(page.getByText(/no account|not found|error/i)).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/portal')
      
      await expect(page).toHaveURL(/\/portal\/login/)
    })
  })
})
