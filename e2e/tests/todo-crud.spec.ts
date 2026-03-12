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

  test('user can toggle a task complete and incomplete', async ({ page }) => {
    await page.goto('/');

    const todoText = `Toggle test ${Date.now()}`;
    const input = page.getByPlaceholder('add a task...');
    await input.fill(todoText);
    await input.press('Enter');
    await expect(page.getByText(todoText)).toBeVisible();

    // Click to toggle complete
    await page.getByText(todoText).click();
    await expect(page.locator('.task-item--completed').filter({ hasText: todoText })).toBeVisible();

    // Click again to toggle back
    await page.getByText(todoText).click();
    await expect(page.locator('.task-item--completed').filter({ hasText: todoText })).not.toBeVisible();
  });

  test('user can delete a task', async ({ page }) => {
    await page.goto('/');

    const todoText = `Delete test ${Date.now()}`;
    const input = page.getByPlaceholder('add a task...');
    await input.fill(todoText);
    await input.press('Enter');
    await expect(page.getByText(todoText)).toBeVisible();

    // Find the task item and click its delete button
    const taskItem = page.locator('.task-item').filter({ hasText: todoText });
    await taskItem.getByRole('button', { name: /delete/i }).click();

    await expect(page.getByText(todoText)).not.toBeVisible();
  });

  test('user can add a task via AddButton click', async ({ page }) => {
    await page.goto('/');

    const todoText = `Button test ${Date.now()}`;
    const input = page.getByPlaceholder('add a task...');
    await input.fill(todoText);

    // Click the add button
    await page.getByRole('button', { name: /add task/i }).click();

    await expect(page.getByText(todoText)).toBeVisible();
    // Verify input is cleared
    await expect(input).toHaveValue('');
  });

  test('error message displays when backend fails and user can retry', async ({ page }) => {
    await page.goto('/');

    // Add a task first (this will succeed)
    const todoText = `Error test ${Date.now()}`;
    const input = page.getByPlaceholder('add a task...');
    await input.fill(todoText);
    await input.press('Enter');
    await expect(page.getByText(todoText)).toBeVisible();

    // Intercept the next toggle request to simulate failure
    await page.route('**/api/todos/*', async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Toggle the task — should fail
    await page.getByText(todoText).click();

    // Error message should appear
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByText(/Couldn't update task/)).toBeVisible();

    // Remove the interception so retry succeeds
    await page.unroute('**/api/todos/*');

    // Retry — click the task again
    await page.getByText(todoText).click();

    // Error should clear on success
    await expect(page.getByText(/Couldn't update task/)).not.toBeVisible({ timeout: 5000 });
  });
});
