import { API } from './env';

export type Summary = { total_kg: number; total_usd: number };

export async function fetchSummary(org: number): Promise<Summary> {
  return fetch(`${API}/v1/summary?org=${org}`, { next: { revalidate: 10 } })
    .then(r => r.json());
}

export async function fetchActiveRepos(): Promise<number> {
  return fetch(`${API}/v1/active-repos`, { next: { revalidate: 10 } })
    .then(r => r.json())
    .then(d => d.active_repos as number);
}

export async function fetchLedger(org: number, limit = 25, offset = 0) {
  const qs = new URLSearchParams({ org: String(org), limit: String(limit), offset: String(offset) });
  return fetch(`${API}/v1/events?${qs}`, { cache: 'no-store' }).then(r => r.json());
}

export async function createApiKey(org: number): Promise<{ secret: string }> {
  return fetch(`${API}/v1/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ org })
  }).then(r => r.json());
}
