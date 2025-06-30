import Fastify from 'fastify';
import cors from '@fastify/cors';
import { createClient } from '@supabase/supabase-js';
import { skusRoute } from './routes/skus';
import { eventsRoute } from './routes/events';
import type { Database } from '../db-types';
import sensible from '@fastify/sensible';
import { summaryRoute } from './routes/summary';
import { tokensRoute }  from './routes/tokens';
// 1️⃣  first lines – run immediately
import * as dotenv from 'dotenv';
dotenv.config();      

const sb = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export const buildServer = () => {
  const app = Fastify({ logger: true });
  app.register(cors, { origin: '*' });
  app.register(sensible);    

  app.get('/health', () => ({ ok: true }));

  app.register(skusRoute(sb), { prefix: '/v1/skus' });
  app.register(eventsRoute(sb), { prefix: '/v1/events' });
  app.register(summaryRoute(sb), { prefix: '/v1/summary' });
  app.register(tokensRoute(sb),  { prefix: '/v1/tokens'   });


  return app;
};

if (require.main === module) {
  buildServer().listen({ port: 4000 }, err => {
    if (err) { console.error(err); process.exit(1); }
    console.log('VerdLedger API http://localhost:4000');
  });
}
