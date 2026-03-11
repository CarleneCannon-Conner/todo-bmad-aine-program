import { test, expect } from '@playwright/test';

test.describe('Todo CRUD', () => {
  test('user sees the todo interface', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByPlaceholder('add a task...')).toBeVisible();
  });

  test('user can add a todo via Enter and see it in the list', async ({ page }) => {
    await page.goto('/');

    // Use unique text to avoid false positives from stale DB entries
    const todoText = `Buy groceries ${Date.now()}`;
    const input = page.getByPlaceholder('add a task...');
    await input.fill(todoText);
    await input.press('Enter');

    await expect(page.getByText(todoText)).toBeVisible();
  });
});
