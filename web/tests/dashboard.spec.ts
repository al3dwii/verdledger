import { test, expect } from '@playwright/test';

test('kpi loads', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const kpi = page.locator('text=/CO₂ Avoided/');
  await expect(kpi).toContainText('kg');
});
