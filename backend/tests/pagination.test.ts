import { buildServer } from '../src/api';
import { describe, it, expect } from 'vitest';

const app = buildServer();

describe('event list pagination', () => {
  it('returns exactly limit rows', async () => {
    // ensure at least 30 rows exist
    await app.inject({
      method: 'POST',
      url: '/v1/events',
      headers: { Authorization: 'Bearer demo-secret' },
      payload: Array.from({ length: 30 }).map(() => ({
        cloud: 'aws', region: 'eu-central-1', sku: 't3.micro',
        kwh: 0.1, usd: 0.01, kg: 0.07
      }))
    });

    const res = await app.inject('/v1/events?org=1&limit=10&offset=10');
    expect(JSON.parse(res.payload)).toHaveLength(10);
  });
});
