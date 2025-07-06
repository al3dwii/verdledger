// apps/api-server/__tests__/summary-pagination.test.ts
import { buildServer } from '../api/server';
import { expect, it }   from 'vitest';

it('paginates summary', async () => {
  const app  = buildServer();
  const res  = await app.inject('/v1/summary?org=1&limit=10');
  const json = JSON.parse(res.payload);

  const list = Array.isArray(json) ? json : (json.rows ?? []);

  expect(Array.isArray(list)).toBe(true);
  expect(list.length).toBeLessThanOrEqual(10);

  await app.close();
});
