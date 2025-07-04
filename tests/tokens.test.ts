// import { buildServer } from '../src/api';
import { buildServer } from '../src/api/server';

import { describe, it, expect } from 'vitest';

const app = buildServer();

describe('POST /v1/tokens', () => {
  it('creates unique tokens', async () => {
    const run = async () =>
      app.inject({
        method: 'POST',
        url: '/v1/tokens',
        payload: { org: 1 }
      });

    const a = await run();
    const b = await run();

    expect(a.statusCode).toBe(200);
    expect(b.statusCode).toBe(200);
    expect(JSON.parse(a.payload).secret)
      .not.toBe(JSON.parse(b.payload).secret);
  });
});
