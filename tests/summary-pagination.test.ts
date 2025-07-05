// tests/summary-pagination.test.ts
import { buildServer } from '../src/api/server';
import { expect, it } from 'vitest';

it('paginates summary', async () => {
  const app = buildServer();
  const r   = await app.inject('/v1/summary?org=1&limit=10');
  expect(JSON.parse(r.payload)).toHaveLength(10);
});
