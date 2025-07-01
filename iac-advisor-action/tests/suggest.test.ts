// import { describe, expect, it, vi } from 'vitest';
// import { suggest } from '../src/suggest';
// import type { Resource } from '../src/plan';

// vi.mock('node-fetch', () => ({
//   default: vi.fn(() => Promise.resolve({
//     json: () => Promise.resolve([
//       { cloud: 'aws', region: 'us-west-2', sku: 't3.medium', watts: 100, usd_hour: 0.1 },
//       { cloud: 'aws', region: 'us-west-2', sku: 't3.small',  watts: 70,  usd_hour: 0.07 }
//     ])
//   }))
// }));

// it('suggests greener sku', async () => {
//   const resources: Resource[] = [{ provider: 'aws', region: 'us-west-2', sku: 't3.medium' }];
//   const res = await suggest(resources, 'https://api');
//   expect(res.length).toBe(1);
//   expect(res[0].altSku).toBe('t3.small');
//   expect(res[0].deltaKg).toBeGreaterThan(0);
//   expect(res[0].deltaUsd).toBeGreaterThan(0);
// });

import { afterEach, expect, it, vi } from 'vitest';
import { suggest } from '../src/suggest';
import type { Resource } from '../src/plan';

/* ── 1. mock data returned by /v1/skus ─────────────────────────── */
const mockSku = [
  { cloud: 'aws', region: 'us-west-2', sku: 't3.medium', watts: 200, usd_hour: 0.04 },
  { cloud: 'aws', region: 'us-west-2', sku: 't3.small',  watts:  30, usd_hour: 0.02 }
];

/* ── 2. stub node-fetch before suggest.ts is evaluated ─────────── */
vi.mock('node-fetch', () => ({
  default: vi.fn().mockResolvedValue({
    json: async () => mockSku
  })
}));

/* ── 3. reset mocks after each test (returns void) ─────────────── */
afterEach(() => {
  vi.restoreAllMocks();
});

/* ── 4. the actual test case ───────────────────────────────────── */
it('suggests a greener SKU', async () => {
  const resources: Resource[] = [
    { provider: 'aws', region: 'us-west-2', sku: 't3.medium' }
  ];

  const res = await suggest(resources, 'https://fake-api');
  expect(res).toHaveLength(1);
  expect(res[0].altSku).toBe('t3.small');
  expect(res[0].deltaKg).toBeGreaterThan(0);   // ≈0.119 kg
});
