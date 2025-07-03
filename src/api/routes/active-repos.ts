import { FastifyInstance } from 'fastify';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db-types';

export const activeReposRoute =
  (sb: SupabaseClient<Database>) => async (app: FastifyInstance) => {

  app.get('/', async (_req, res) => {
    const { data, error } = await sb
      .from('v_active_repo_week')
      .select('active_repos')
      .single();
    if (error) return res.internalServerError(error);
    res.send(data);
  });
};
