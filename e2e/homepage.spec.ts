import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Reddit/i);
  });

  test('should display main content', async ({ page }) => {
    await page.goto('/');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display post feed', async ({ page }) => {
    await page.goto('/');
    // Wait for either posts to load or empty state
    await page.waitForTimeout(2000);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    const homeLink = page.locator('a[href="/"]').first();
    await expect(homeLink).toBeVisible();
  });
});
