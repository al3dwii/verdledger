// iac-advisor-action/tests/pulumi.test.ts
import { expect, it, vi } from 'vitest';
import preview from './pulumi-plan.json';   // <-- works with resolveJsonModule

/* ------------------------------------------------------------------ */
/* 1 • Mock node-fetch so suggest() never touches the network         */
/* ------------------------------------------------------------------ */
vi.mock('node-fetch', () => ({
  default: vi.fn(async () => ({
    json: async () => [
      { sku: 't3.large',  kg: 1.0,  usd: 0.12, region: 'eu' },
      { sku: 't3a.large', kg: 0.75, usd: 0.10, region: 'eu' }
    ]
  }))
}));

import { suggest } from '../src/suggest';

/* ------------------------------------------------------------------ */
/* 2 • Build the resources array expected by suggest()                */
/* ------------------------------------------------------------------ */
type Res = { provider: string; region: string; sku: string };

const resources: Res[] = preview.steps
  .filter((s: any) => ['create', 'update'].includes(s.op))
  .map((s: any) => ({
    provider: s.provider             ?? 'aws',
    region:   s.inputs?.region       ?? 'eu',
    sku:      s.inputs?.instanceType ?? 't3.large'
  }));


/* ------------------------------------------------------------------ */
/* 3 • Call suggest() – no runtime error means the parser works       */
/* ------------------------------------------------------------------ */
it('parses a Pulumi preview without throwing', async () => {
  const suggestions = await suggest(resources as any, 'http://mock', '');
  // basic sanity: returns an array (may be empty)
  expect(Array.isArray(suggestions)).toBe(true);
});


