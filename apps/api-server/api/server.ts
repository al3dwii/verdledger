// apps/api-server/api/server.ts
import fs from 'node:fs';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { skusRoute }        from './routes/skus';
import { eventsRoute }      from './routes/events';
import { summaryRoute }     from './routes/summary';
import { tokensRoute }      from './routes/tokens';
import { activeReposRoute } from './routes/active-repos';

import type { Database } from '~/supabase-db/src/db-types';

/* ───────────── load .env from repo root ───────────── */
const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  loadEnv({ path: envPath });
  console.log(`[env] loaded ${envPath}`);
}

/* ───────────── validate + assert types ───────────── */
const SUPABASE_URL: string = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE: string = process.env.SUPABASE_SERVICE_ROLE ?? '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE in environment');
}

/* ───────────── build Fastify app ───────────── */
export function buildServer() {
  // The second generic (“public”) silences the schema-name warning.
  const supabase: SupabaseClient<Database, 'public'> =
    createClient<Database, 'public'>(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  const app = Fastify({ logger: true });
  app.register(cors, { origin: '*' });
  app.register(sensible);

  app.get('/health', () => ({ ok: true }));

  app.register(skusRoute(supabase),        { prefix: '/v1/skus' });
  app.register(eventsRoute(supabase),      { prefix: '/v1/events' });
  app.register(summaryRoute(supabase),     { prefix: '/v1/summary' });
  app.register(tokensRoute(supabase),      { prefix: '/v1/tokens' });
  app.register(activeReposRoute(supabase), { prefix: '/v1/active-repos' });

  return app;
}
