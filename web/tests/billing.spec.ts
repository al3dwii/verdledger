import { test, expect } from '@playwright/test';

test('subscribe button opens stripe', async ({ page }) => {
  await page.goto('http://localhost:3000/billing');
  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.click('text=/Subscribe/'),
  ]);
  await expect(popup.url()).toContain('stripe');
});
