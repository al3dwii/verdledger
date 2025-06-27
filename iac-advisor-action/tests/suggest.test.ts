import { describe, expect, it, vi } from 'vitest';
import { suggest } from '../src/suggest';
import type { Resource } from '../src/plan';

vi.mock('node-fetch', () => ({
  default: vi.fn(() => Promise.resolve({
    json: () => Promise.resolve([
      { cloud: 'aws', region: 'us-west-2', sku: 't3.medium', watts: 100, usd_hour: 0.1 },
      { cloud: 'aws', region: 'us-west-2', sku: 't3.small',  watts: 70,  usd_hour: 0.07 }
    ])
  }))
}));

it('suggests greener sku', async () => {
  const resources: Resource[] = [{ provider: 'aws', region: 'us-west-2', sku: 't3.medium' }];
  const res = await suggest(resources, 'https://api');
  expect(res.length).toBe(1);
  expect(res[0].altSku).toBe('t3.small');
  expect(res[0].deltaKg).toBeGreaterThan(0);
  expect(res[0].deltaUsd).toBeGreaterThan(0);
});
