import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test('full keyboard-only flow: add, complete, delete', async ({ page }) => {
    await page.goto('/');

    const todoText = `Keyboard test ${Date.now()}`;

    // Tab to input (may need multiple tabs to pass BeeHeader interactive elements)
    const input = page.getByPlaceholder('add a task...');
    await input.focus();
    await page.keyboard.type(todoText);
    await page.keyboard.press('Enter');
    await expect(page.getByText(todoText)).toBeVisible();

    // Tab from input through AddButton (disabled, skipped) to the task toggle
    const taskItem = page.locator('.task-item').filter({ hasText: todoText });
    const taskToggle = taskItem.locator('.task-item-toggle');

    // Tab forward until we reach the task toggle
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      if (await taskToggle.evaluate(el => el === document.activeElement).catch(() => false)) break;
    }
    await expect(taskToggle).toBeFocused();

    // Space to toggle complete
    await page.keyboard.press('Space');
    await expect(taskItem).toHaveClass(/task-item--completed/);

    // Wait for toggle API to finish, then Tab to delete button
    await expect(taskItem).not.toHaveClass(/task-item--toggling/);
    await taskToggle.focus();
    await page.keyboard.press('Tab');
    const deleteButton = taskItem.getByRole('button', { name: /delete/i });
    await expect(deleteButton).toBeFocused();

    // Press Enter to delete
    await page.keyboard.press('Enter');
    await expect(page.getByText(todoText)).not.toBeVisible();
  });

  test('Escape clears input text', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('add a task...');
    await input.focus();
    await page.keyboard.type('Some text');
    await expect(input).toHaveValue('Some text');

    await page.keyboard.press('Escape');
    await expect(input).toHaveValue('');
  });

  test('Tab from task toggle goes to its delete button', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('add a task...');
    const todoText = `Tab test ${Date.now()}`;

    await input.fill(todoText);
    await input.press('Enter');
    await expect(page.getByText(todoText)).toBeVisible();

    // Focus the task's toggle
    const taskItem = page.locator('.task-item').filter({ hasText: todoText });
    const taskToggle = taskItem.locator('.task-item-toggle');
    await taskToggle.focus();
    await expect(taskToggle).toBeFocused();

    // Tab should move to the delete button within the same task
    await page.keyboard.press('Tab');
    const deleteButton = taskItem.getByRole('button', { name: /delete/i });
    await expect(deleteButton).toBeFocused();
  });
});
