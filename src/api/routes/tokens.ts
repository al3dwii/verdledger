import { randomUUID } from 'node:crypto';
import { FastifyInstance } from 'fastify';
import { sign } from '../../lib/jwt';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db-types';

export const tokensRoute =
  (sb: SupabaseClient<Database>) => async (app: FastifyInstance) => {

  app.post('/', async (req, res) => {
    const { org } = req.body as { org?: number };
    if (!org) return res.badRequest('org required');

    const secret = randomUUID().replace(/-/g, '');
    const { error } = await sb
      .from('api_key')
      .insert({ org_id: org, secret, label: 'dashboard' });

    if (error) return res.internalServerError(error);

    const token = sign({ key: secret });
    res.send({ secret: token });
  });
};
