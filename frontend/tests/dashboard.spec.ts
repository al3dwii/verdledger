// import { test, expect } from '@playwright/test';

// test('dashboard loads', async ({ page }) => {
//   await page.goto('http://localhost:3000/org/1/dashboard');
//   await expect(page.locator('text=CO₂ avoided')).toBeVisible();
// });

// import { test, expect } from '@playwright/test';

// test('dashboard shows totals', async ({ page }) => {
//   await page.goto('http://localhost:3000/org/1/dashboard');
//   await expect(page.getByText(/CO₂ avoided/i)).toHaveText(/kg/);

//   // Post a new event (fastify is on :4000 during test)
//   await page.request.post('http://localhost:4000/v1/events', {
//     headers:{ Authorization:'Bearer demo-secret','content-type':'application/json' },
//     data:[{ cloud:'aws',region:'eu-central-1',sku:'t3.micro',kwh:0.1,usd:0.01,kg:0.07 }]
//   });

//   // Totals should update after a soft reload
//   await page.reload();
//   await expect(page.getByText(/\$0\.0[0-9]/)).toBeVisible();
// });

import { test, expect } from '@playwright/test';

test('dashboard shows totals', async ({ page, request }) => {
  // dashboard loads
  await page.goto('/org/1/dashboard');
  await expect(page.getByRole('heading', { name: /latest ledger events/i })).toBeVisible();

  // inject a new event via backend API
  await request.post('http://localhost:4000/v1/events', {
    headers: {
      authorization: 'Bearer demo-secret',
      'content-type': 'application/json',
    },
    data: [{
      cloud: 'aws',
      region: 'eu-central-1',
      sku: 't3.micro',
      kwh: 0.1,
      usd: 0.01,
      kg: 0.07,
    }],
  });

  // refresh → KPI tiles should reflect the new totals
  await page.reload();
  await expect(page.getByText(/\$0\.0[0-9]/)).toBeVisible();
});
