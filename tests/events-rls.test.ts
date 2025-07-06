// import { buildServer } from '../src/api';
import { buildServer } from '../apps/api-server/api/server';

import { it, expect } from 'vitest';

const app = buildServer();

it('401 on bad token', async () => {
  const res = await app.inject({
    method: 'POST',
    url: '/v1/events',
    headers: { Authorization: 'Bearer bad' },
    payload: []
  });
  expect(res.statusCode).toBe(401);
});
