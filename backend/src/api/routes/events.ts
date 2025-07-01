import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db-types';
// export const eventsRoute =
//   (sb: SupabaseClient<Database>) => async (app: FastifyInstance) => {


export const eventsRoute =
  (sb: SupabaseClient<Database>) => async (app: FastifyInstance) => {
 // ① list events (public, read-only, org filter)
 app.get('/', async (req, res) => {
   const { org, limit = '25', offset = '0' } = req.query as Record<string, string>;
    if (!org) return res.badRequest('org required');

   const { data, error } = await sb
     .from('savings_event')
     .select('*')
     .eq('org_id', Number(org))
     .order('ts', { ascending: false })
     .range(Number(offset), Number(offset) + Number(limit) - 1);

   if (error) return res.internalServerError(error);
   res.send(data);
 });

     const bodySchema = z.array(z.object({
    cloud: z.string(), region: z.string(), sku: z.string(),
    kwh: z.number(), usd: z.number(), kg: z.number(),
    note: z.string().optional()
  }));

  app.post('/', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).send({ error: 'missing token' });

    const token = auth.split(' ')[1]!;
    const { data: keyRow } = await sb
      .from('api_key')
      .select('org_id')
      .eq('secret', token)
      .single();

    if (!keyRow) return res.status(401).send({ error: 'bad token' });

    const events = bodySchema.parse(req.body)
      .map(e => ({ ...e, org_id: keyRow.org_id }));

    const { error } = await sb.from('savings_event').insert(events);
    if (error) return res.internalServerError(error);

    res.send({ inserted: events.length });
  });
};
