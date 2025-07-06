// packages/supabase-db/__tests__/rls-policies.test.ts
import { createClient } from '@supabase/supabase-js';
import { describe, it, expect } from 'vitest';

/* ------------------------------------------------------------------ */
/* Guard: only run if real Supabase creds are present                  */
/* ------------------------------------------------------------------ */
const { SUPABASE_URL, SUPABASE_ANON, SUPABASE_SERVICE_ROLE } = process.env;

if (!SUPABASE_URL || !SUPABASE_ANON || !SUPABASE_SERVICE_ROLE) {
  // Skip the whole file
  describe.skip('Supabase RLS policies (env vars missing)', () => {});
} else {
  /* ---------------------------------------------------------------- */
  /* Actual RLS tests                                                 */
  /* ---------------------------------------------------------------- */
  const anon = createClient(SUPABASE_URL, SUPABASE_ANON);
  const svc  = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  it('🔒 anon cannot read other-org events', async () => {
    const { error } = await anon
      .from('events')
      .select('*')
      .eq('org', 999);

    expect(error?.message).toMatch(/permission denied/i);
  });

  it('🔑 service role bypasses RLS', async () => {
    const { data, error } = await svc
      .from('events')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(0);
  });
}
