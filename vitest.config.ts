import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'apps/**/__tests__/**/*.ts',
      'packages/**/__tests__/**/*.ts'
    ],
    snapshotFormat: { printBasicPrototype: false }
  },

  // ── extra tweaks so Vitest can resolve ESM deps like @supabase/supabase-js
  resolve: {
    conditions: ['node']            // prefer the Node build of ESM packages
  },
  optimizeDeps: {
    exclude: ['@supabase/supabase-js']  // keep it external; no pre-bundle
  }
});
