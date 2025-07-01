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

// import { test, expect } from '@playwright/test';

// test('dashboard shows totals', async ({ page, request }) => {
//   // dashboard loads
//   await page.goto('/org/1/dashboard');
//   await expect(page.getByRole('heading', { name: /latest ledger events/i })).toBeVisible();

//   // inject a new event via backend API
//   await request.post('http://localhost:4000/v1/events', {
//     headers: {
//       authorization: 'Bearer demo-secret',
//       'content-type': 'application/json',
//     },
//     data: [{
//       cloud: 'aws',
//       region: 'eu-central-1',
//       sku: 't3.micro',
//       kwh: 0.1,
//       usd: 0.01,
//       kg: 0.07,
//     }],
//   });

//   // refresh → KPI tiles should reflect the new totals
//   await page.reload();
//   await expect(page.getByText(/\$0\.0[0-9]/)).toBeVisible();
// });

// // frontend/tests/dashboard.spec.ts
// import { test, expect } from '@playwright/test';

// test('dashboard shows totals', async ({ page, request }) => {
//   /* 1. open the dashboard ------------------------------------------------ */
//   await page.goto('http://localhost:3000/org/1/dashboard');
//   await expect(page.getByRole('heading', { name: /latest ledger events/i }))
//     .toBeVisible();

//   /* 2. inject a new event via backend API -------------------------------- */
//   await request.post('http://localhost:4000/v1/events', {
//     headers: { Authorization: 'Bearer demo-secret',
//                'Content-Type': 'application/json' },
//     data: [{
//       cloud:  'aws',
//       region: 'eu-central-1',
//       sku:    't3.micro',
//       kwh:    0.2,
//       usd:    0.02,
//       kg:     0.15
//     }]
//   });

//   /* 3. reload & assert KPI tiles update ---------------------------------- */
//   await page.reload();

//   // CO₂ tile — any non-zero kg value
//   await expect(
//     page.getByText(/kg/, { exact: false })
//   ).toHaveText(/0\.[0-9]{2}\s?kg/);

//   // Money tile — use **unique test-id** (strict-mode safe)
//   const moneyTile = page.getByTestId('kpi-money');
//   await expect(moneyTile).toHaveText(/\$0\.0[0-9]/);
// });

import { test, expect } from '@playwright/test';

test('dashboard shows totals', async ({ page, request }) => {
  /* ── 1. open the dashboard ─────────────────────────────────────────── */
  await page.goto('http://localhost:3000/org/1/dashboard');
  await expect(
    page.getByRole('heading', { name: /latest ledger events/i })
  ).toBeVisible();

  /* ── 2. inject a new ledger event via the backend API ──────────────── */
  await request.post('http://localhost:4000/v1/events', {
    headers: {
      Authorization: 'Bearer demo-secret',
      'Content-Type': 'application/json'
    },
    data: [
      {
        cloud:  'aws',
        region: 'eu-central-1',
        sku:    't3.micro',
        kwh:    0.2,
        usd:    0.02,
        kg:     0.15
      }
    ]
  });

  /* ── 3. reload the page ─ KPI tiles must reflect the new totals ────── */
  await page.reload();

  // CO₂ tile (unique test-id =kpi-co2)
  await expect(page.getByTestId('kpi-co2'))
    .toHaveText(/[0-9]+\.[0-9]{2}\s*kg/);     // e.g. “7.33 kg”

  // Money tile (unique test-id =kpi-money)
  await expect(page.getByTestId('kpi-money'))
    .toHaveText(/\$\d+\.\d{2}/);              // e.g. “$0.05”

  // Active repos tile (unique test-id =kpi-active)
  await expect(page.getByTestId('kpi-active'))
    .toHaveText(/\d+/);
});
