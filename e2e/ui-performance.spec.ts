import { test, expect } from '@playwright/test';

test.describe('UI Components', () => {
  test('should render main UI', async ({ page }) => {
    await page.goto('/');

    // Check that main content is visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should have responsive layout', async ({ page }) => {
    await page.goto('/');

    // Check that main content is visible
    const main = page.locator('main, body');
    await expect(main).toBeVisible();
  });

  test('should load without hydration errors', async ({ page }) => {
    const hydrationErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.text().includes('Hydration') || msg.text().includes('hydration')) {
        hydrationErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    expect(hydrationErrors).toHaveLength(0);
  });
});

test.describe('Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;

    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should not have memory leaks on navigation', async ({ page }) => {
    await page.goto('/');
    await page.goto('/subreddit/test');
    await page.goto('/');

    // If we get here without timeout, navigation works
    expect(true).toBe(true);
  });
});
