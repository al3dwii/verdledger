import { test, expect } from '@playwright/test';

test('hero link points to GitHub', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const link = page.getByRole('link', { name: /Star on GitHub/ });
  await expect(link).toHaveAttribute('href', 'https://github.com/verdledger/verdledger');
});
