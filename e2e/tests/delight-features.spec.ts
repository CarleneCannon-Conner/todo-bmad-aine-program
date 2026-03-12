import { test, expect } from '@playwright/test';

test.describe('Delight features', () => {
  test('completing all tasks triggers celebration, adding new task clears it', async ({ page }) => {
    await page.goto('/');

    // First, complete any pre-existing incomplete tasks
    let uncheckedBoxes = page.getByRole('checkbox').filter({ checked: false });
    let count = await uncheckedBoxes.count();
    for (let i = 0; i < count; i++) {
      // Always click the first unchecked — list re-renders after each toggle
      const box = page.getByRole('checkbox').filter({ checked: false }).first();
      await box.click();
      await expect(box).not.toBeVisible({ timeout: 5000 }).catch(() => {});
    }

    // Delete all existing tasks to get a clean state, then add our own
    let deleteCount = await page.getByRole('button', { name: /delete/i }).count();
    for (let i = 0; i < deleteCount; i++) {
      const btn = page.getByRole('button', { name: /delete/i }).first();
      await btn.click();
      await expect(btn).not.toBeVisible({ timeout: 5000 }).catch(() => {});
    }

    // Now add a fresh task
    const taskText = `Delight test ${Date.now()}`;
    const input = page.getByPlaceholder('add a task...');
    await input.fill(taskText);
    await input.press('Enter');
    await expect(page.getByText(taskText)).toBeVisible();

    // Celebration should not be visible yet
    await expect(page.getByText('all clear!')).not.toBeVisible();

    // Complete the task
    const checkbox = page.getByRole('checkbox').first();
    await checkbox.click();

    // Celebration should appear
    await expect(page.getByText('all clear!')).toBeVisible();

    // Add a new task — celebration should disappear
    const newTask = `Another task ${Date.now()}`;
    await input.fill(newTask);
    await input.press('Enter');
    await expect(page.getByText(newTask)).toBeVisible();
    await expect(page.getByText('all clear!')).not.toBeVisible();
  });

  test('clicking bee image triggers wiggle animation', async ({ page }) => {
    await page.goto('/');

    const bee = page.getByRole('button', { name: /click me for a surprise/i });
    await expect(bee).toBeVisible();

    // Click the bee
    await bee.click();

    // Wiggle class should be applied
    await expect(bee).toHaveClass(/bee-header-img--wiggle/);

    // Wait for animation to end — class should be removed
    await bee.evaluate((el) => {
      return new Promise<void>((resolve) => {
        el.addEventListener('animationend', () => resolve(), { once: true });
        // Fallback timeout in case animation is instant (reduced-motion)
        setTimeout(() => resolve(), 1000);
      });
    });
    await expect(bee).not.toHaveClass(/bee-header-img--wiggle/);
  });
});
