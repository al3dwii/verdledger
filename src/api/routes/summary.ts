// src/api/routes/summary.ts
import { FastifyInstance } from 'fastify';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db-types';

export const summaryRoute =
  (sb: SupabaseClient<Database>) => async (app: FastifyInstance) => {

  app.get('/', async (req, res) => {
    const { org, limit = 50, offset = 0, period = 'month' } = req.query as any;

    if (!org)       return res.badRequest('org required');
    if (limit > 100) return res.badRequest('limit ≤ 100');

    const { data, error } = await sb
      .rpc<'ledger_summary_paginated', {
        p_org:     number;
        p_period:  string;
        p_limit:   number;
        p_offset:  number;
      }>('ledger_summary_paginated', {
        p_org:    Number(org),
        p_period: period,
        p_limit:  Number(limit),
        p_offset: Number(offset)
      });

    if (error) return res.internalServerError(error);
    res.send(data);
  });
};


// import { FastifyInstance } from 'fastify';
// import type { SupabaseClient } from '@supabase/supabase-js';
// import type { Database } from '../../db-types';
// export const summaryRoute =
//   (sb: SupabaseClient<Database>) => async (app: FastifyInstance) => {

//   app.get('/', async (req, res) => {
//     const org = Number((req.query as any).org);
//     if (!org) return res.badRequest('org required');

//     const { data, error } = await sb
//       .rpc('ledger_summary', { p_org: org })
//       .single();
//     if (error) return res.internalServerError(error);
//     res.send(data as any);
//   });
// };
