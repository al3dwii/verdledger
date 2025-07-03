import { buildServer } from '../src/api';
import { describe, it, expect } from 'vitest';

const app = buildServer();

describe('GET /v1/active-repos', () => {
  it('returns active repo count', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/active-repos' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(typeof body.active_repos).toBe('number');
  });
});
