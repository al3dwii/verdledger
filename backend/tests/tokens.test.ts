import { buildServer } from '../src/api';
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
    expect(JSON.parse(a.payload).token)
      .not.toBe(JSON.parse(b.payload).token);
  });
});
