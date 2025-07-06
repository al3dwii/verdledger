// import { buildServer } from '../src/api';
import { buildServer } from '../apps/api-server/api/server';

import { describe, expect, it } from 'vitest';

const app = buildServer();

describe('API smoke', () => {
  it('GET /skus', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/skus' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload).length).toBeGreaterThan(0);
  });
});
