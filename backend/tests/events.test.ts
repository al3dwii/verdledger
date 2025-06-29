import { buildServer } from '../src/api';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const app = buildServer();
const token = 'demo-secret';

beforeAll(async () => {
  await app.inject({
    method: 'POST',
    url:    '/v1/events',
    headers:{ Authorization:`Bearer ${token}`,'content-type':'application/json' },
    payload:[{cloud:'aws',region:'eu-central-1',sku:'t3.micro',kwh:0.2,usd:0.02,kg:0.15}]
  });
});

afterAll(() => app.close());

describe('summary reflects event', () => {
  it('/v1/summary?org=1 adds up', async () => {
    const res = await app.inject({ method:'GET', url:'/v1/summary?org=1' });
    const body = JSON.parse(res.payload);
    expect(body.total_kg).toBeGreaterThan(0);
    expect(body.total_usd).toBeGreaterThan(0);
  });
});
