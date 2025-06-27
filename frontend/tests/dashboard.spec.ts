import { test, expect } from '@playwright/test';

test('dashboard loads', async ({ page }) => {
  await page.goto('http://localhost:3000/org/1/dashboard');
  await expect(page.locator('text=CO₂ avoided')).toBeVisible();
});
