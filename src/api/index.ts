// backend/src/api/index.ts
import { buildServer } from './server';

const app   = buildServer();
let ready   = false;                // cache across Vercel cold starts
const PORT  = Number(process.env.PORT) || 4000;

/* ---------------------------------------------------------------- * 
 * 1. Vercel / Serverless default export
 * ---------------------------------------------------------------- */
export default async function handler(req: any, res: any) {
  if (!ready) { await app.ready(); ready = true; }
  app.server.emit('request', req, res);
}

/* ---------------------------------------------------------------- *
 * 2. Local dev:  `node src/api/index.ts` or `pnpm dev`
 * ---------------------------------------------------------------- */
if (require.main === module) {
  app.listen({ port: PORT }, (err) => {
    if (err) { console.error(err); process.exit(1); }
    console.log(`VerdLedger API http://localhost:${PORT}`);
  });
}

/* ---------------------------------------------------------------- *
 * 3. Re-export buildServer for Vitest (optional)
 * ---------------------------------------------------------------- */
export { buildServer };


// // backend/src/api/index.ts
// import Fastify from 'fastify';
// import cors from '@fastify/cors';
// import { createClient } from '@supabase/supabase-js';
// import sensible from '@fastify/sensible';
// import { skusRoute } from './routes/skus';
// import { eventsRoute } from './routes/events';
// import { summaryRoute } from './routes/summary';
// import { tokensRoute } from './routes/tokens';
// import { activeReposRoute } from './routes/active-repos';
// import type { Database } from '../db-types';
// import * as dotenv from 'dotenv';
// dotenv.config();

// /* ----------------------------------------------------------------– *
//  * 1.  Build Fastify once
//  * ----------------------------------------------------------------– */
// const sb = createClient<Database>(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE!
// );

// const app = Fastify({ logger: true });
// app.register(cors, { origin: '*' });
// app.register(sensible);

// app.get('/health', () => ({ ok: true }));
// app.register(skusRoute(sb),         { prefix: '/v1/skus' });
// app.register(eventsRoute(sb),       { prefix: '/v1/events' });
// app.register(summaryRoute(sb),      { prefix: '/v1/summary' });
// app.register(tokensRoute(sb),       { prefix: '/v1/tokens' });
// app.register(activeReposRoute(sb),  { prefix: '/v1/active-repos' });

// let ready = false;

// /* ----------------------------------------------------------------– *
//  * 2.  Default export → Vercel handler
//  * ----------------------------------------------------------------– */
// export default async function handler(req: any, res: any) {
//   if (!ready) {          // cold start
//     await app.ready();
//     ready = true;
//   }
//   // Pass the original Node request to Fastify
//   app.server.emit('request', req, res);
// }

// /* ----------------------------------------------------------------– *
//  * 3.  Allow local `node src/api/index.ts`
//  * ----------------------------------------------------------------– */
// if (require.main === module) {
//   app.listen({ port: 4000 }, err => {
//     if (err) { console.error(err); process.exit(1); }
//     console.log('VerdLedger API http://localhost:4000');
//   });
// }




// import Fastify from 'fastify';
// import cors from '@fastify/cors';
// import { createClient } from '@supabase/supabase-js';
// import { skusRoute } from './routes/skus';
// import { eventsRoute } from './routes/events';
// import type { Database } from '../db-types';
// import sensible from '@fastify/sensible';
// import { summaryRoute } from './routes/summary';
// import { tokensRoute }  from './routes/tokens';
// import { activeReposRoute } from './routes/active-repos';
// // 1️⃣  first lines – run immediately
// import * as dotenv from 'dotenv';
// dotenv.config();      

// const sb = createClient<Database>(
//   process.env.SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE!
// );

// export const buildServer = () => {
//   const app = Fastify({ logger: true });
//   app.register(cors, { origin: '*' });
//   app.register(sensible);    

//   app.get('/health', () => ({ ok: true }));

//   app.register(skusRoute(sb), { prefix: '/v1/skus' });
//   app.register(eventsRoute(sb), { prefix: '/v1/events' });
//   app.register(summaryRoute(sb), { prefix: '/v1/summary' });
//   app.register(tokensRoute(sb),  { prefix: '/v1/tokens'   });
//   app.register(activeReposRoute(sb), { prefix: '/v1/active-repos' });


//   return app;
// };

// if (require.main === module) {
//   buildServer().listen({ port: 4000 }, err => {
//     if (err) { console.error(err); process.exit(1); }
//     console.log('VerdLedger API http://localhost:4000');
//   });
// }
