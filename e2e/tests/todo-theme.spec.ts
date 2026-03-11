import { test, expect } from '@playwright/test';

test.describe('Epic 3: Bee Theme & Visual Polish', () => {
  test('app displays bee header and themed layout', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('my todos');
    await expect(page.locator('img[src*="bee"]')).toBeVisible();
  });

  test('loading skeleton appears before data loads', async ({ page }) => {
    await page.route('**/api/todos', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });

    await page.goto('/');
    await expect(page.locator('.loading-skeleton')).toBeVisible();
    await expect(page.locator('.loading-skeleton')).not.toBeVisible({ timeout: 5000 });
  });
});
