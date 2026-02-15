import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should handle authentication UI', async ({ page }) => {
    await page.goto('/');

    // Page should load successfully
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle NextAuth routes', async ({ page }) => {
    const response = await page.goto('/api/auth/providers');
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe('Routing', () => {
  test('should handle subreddit routes', async ({ page }) => {
    await page.goto('/subreddit/test');
    await expect(page).toHaveURL(/\/subreddit\/test/);
  });

  test('should handle 404 for invalid routes', async ({ page }) => {
    const response = await page.goto('/invalid-route-12345');
    // Next.js should handle this gracefully
    expect(response?.status()).toBeLessThan(500);
  });
});
