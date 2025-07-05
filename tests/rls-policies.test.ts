// tests/rls-policies.test.ts
import { createClient } from '@supabase/supabase-js';
import { expect, it } from 'vitest';

const anon = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON!);
const svc  = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);

it('🔒 anon cannot read other org events', async () => {
  const { error } = await anon.from('events')
                              .select('*')
                              .eq('org', 999);
  expect(error?.message).toMatch(/permission denied/);
});

it('🔑 service role bypasses RLS', async () => {
  const { data, error } = await svc.from('events').select('*').limit(1);
  expect(error).toBeNull();
  expect(data.length).toBeGreaterThan(0);
});
