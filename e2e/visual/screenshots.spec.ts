import { test, expect } from '@playwright/test'

/**
 * Visual regression tests using Playwright
 * These tests capture screenshots of key pages for visual comparison
 */

test.describe('Visual Regression Tests', () => {
  test.describe('Marketing Pages', () => {
    test('homepage renders correctly', async ({ page }) => {
      await page.goto('/')
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle')
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot('homepage.png', {
        fullPage: true,
        threshold: 0.2, // Allow 20% diff for dynamic content
      })
    })

    test('homepage hero section', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Screenshot just the hero section
      const hero = page.locator('section').first()
      await expect(hero).toHaveScreenshot('homepage-hero.png', {
        threshold: 0.2,
      })
    })
  })

  test.describe('Application Flow', () => {
    test('get-started page renders correctly', async ({ page }) => {
      await page.goto('/get-started')
      await page.waitForLoadState('networkidle')
      
      await expect(page).toHaveScreenshot('get-started.png', {
        fullPage: true,
        threshold: 0.2,
      })
    })
  })

  test.describe('Admin Pages', () => {
    test('admin login page renders correctly', async ({ page }) => {
      await page.goto('/admin/login')
      await page.waitForLoadState('networkidle')
      
      await expect(page).toHaveScreenshot('admin-login.png', {
        fullPage: true,
        threshold: 0.2,
      })
    })

    test('admin login form elements', async ({ page }) => {
      await page.goto('/admin/login')
      await page.waitForLoadState('networkidle')
      
      // Screenshot the login form
      const form = page.locator('form')
      await expect(form).toHaveScreenshot('admin-login-form.png', {
        threshold: 0.2,
      })
    })
  })

  test.describe('Responsive Design', () => {
    test('homepage on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
        threshold: 0.2,
      })
    })

    test('homepage on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }) // iPad
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      await expect(page).toHaveScreenshot('homepage-tablet.png', {
        fullPage: true,
        threshold: 0.2,
      })
    })

    test('admin login on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/admin/login')
      await page.waitForLoadState('networkidle')
      
      await expect(page).toHaveScreenshot('admin-login-mobile.png', {
        fullPage: true,
        threshold: 0.2,
      })
    })
  })

  test.describe('Interactive States', () => {
    test('admin login form with validation errors', async ({ page }) => {
      await page.goto('/admin/login')
      await page.waitForLoadState('networkidle')
      
      // Submit empty form to trigger validation
      await page.click('button[type="submit"]')
      
      // Wait for validation to appear
      await page.waitForTimeout(500)
      
      await expect(page).toHaveScreenshot('admin-login-validation.png', {
        fullPage: true,
        threshold: 0.3,
      })
    })

    test('admin login form focused state', async ({ page }) => {
      await page.goto('/admin/login')
      await page.waitForLoadState('networkidle')
      
      // Focus on email input
      await page.focus('input[type="email"], input[name="email"]')
      
      await expect(page).toHaveScreenshot('admin-login-focused.png', {
        fullPage: true,
        threshold: 0.3,
      })
    })
  })

  test.describe('Theme and Colors', () => {
    test('brand colors present on homepage', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Check that teal color exists somewhere on page
      const tealElements = page.locator('[class*="teal"], [class*="primary"]')
      await expect(tealElements.first()).toBeVisible()
    })

    test('button styles', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // Find primary button
      const button = page.locator('a, button').filter({ hasText: /get started|apply|sign up/i }).first()
      
      if (await button.isVisible()) {
        await expect(button).toHaveScreenshot('primary-button.png', {
          threshold: 0.2,
        })
      }
    })
  })
})
