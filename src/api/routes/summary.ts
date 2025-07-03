import { FastifyInstance } from 'fastify';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db-types';
export const summaryRoute =
  (sb: SupabaseClient<Database>) => async (app: FastifyInstance) => {

  app.get('/', async (req, res) => {
    const org = Number((req.query as any).org);
    if (!org) return res.badRequest('org required');

    const { data, error } = await sb
      .rpc('ledger_summary', { p_org: org })
      .single();
    if (error) return res.internalServerError(error);
    res.send(data as any);
  });
};
