import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audit', () => {
  test('empty state has no critical or serious accessibility violations', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.task-input');

    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(critical).toEqual([]);
  });

  test('page with tasks has no critical or serious accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Add a few tasks
    const input = page.getByPlaceholder('add a task...');
    await input.fill(`A11y test task ${Date.now()}`);
    await input.press('Enter');
    await page.waitForSelector('.task-item');

    await input.fill(`Second a11y task ${Date.now()}`);
    await input.press('Enter');

    // Wait for at least 2 tasks to appear
    await expect(page.locator('.task-item').first()).toBeVisible();
    await expect(page.locator('.task-item').nth(1)).toBeVisible({ timeout: 5000 });

    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(critical).toEqual([]);
  });

  test('page with completed task has no critical or serious accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Add and complete a task
    const todoText = `Complete me ${Date.now()}`;
    const input = page.getByPlaceholder('add a task...');
    await input.fill(todoText);
    await input.press('Enter');
    await expect(page.getByText(todoText)).toBeVisible();

    // Toggle it complete
    await page.getByText(todoText).click();
    await expect(page.locator('.task-item--completed').filter({ hasText: todoText })).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(critical).toEqual([]);
  });
});
