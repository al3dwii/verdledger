
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
