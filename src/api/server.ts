// backend/src/api/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { createClient } from '@supabase/supabase-js';
import { skusRoute } from './routes/skus';
import { eventsRoute } from './routes/events';
import { summaryRoute } from './routes/summary';
import { tokensRoute } from './routes/tokens';
import { activeReposRoute } from './routes/active-repos';
import type { Database } from '../db-types';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Build and return a fully-wired Fastify instance.
 * Vitest uses this for `app.inject()`, while the
 * Vercel edge handler imports it once and re-uses it
 * across cold starts.
 */
export function buildServer() {
  const sb = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );

  const app = Fastify({ logger: true });
  app.register(cors, { origin: '*' });
  app.register(sensible);

  app.get('/health', () => ({ ok: true }));
  app.register(skusRoute(sb),        { prefix: '/v1/skus' });
  app.register(eventsRoute(sb),      { prefix: '/v1/events' });
  app.register(summaryRoute(sb),     { prefix: '/v1/summary' });
  app.register(tokensRoute(sb),      { prefix: '/v1/tokens' });
  app.register(activeReposRoute(sb), { prefix: '/v1/active-repos' });

  return app;
}
