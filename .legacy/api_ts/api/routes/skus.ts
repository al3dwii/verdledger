import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/supabase-db/src/db-types';
export const skusRoute =
  (sb: SupabaseClient<Database>) => async (app: FastifyInstance, _opts: FastifyPluginOptions) => {

  app.get('/', async (_req, res) => {
    const { data, error } = await sb
      .from('sku_catalogue')
      .select('*')
      .limit(5000);

    if (error) return res.internalServerError(error);
    res.send(data);
  });
};
