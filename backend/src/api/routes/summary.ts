import { FastifyInstance } from 'fastify';
export const summaryRoute =
  (sb: any) => async (app: FastifyInstance) => {

  app.get('/', async (req, res) => {
    const org = Number((req.query as any).org);
    if (!org) return res.badRequest('org required');

    const { data } = await sb
      .from('savings_event')
      .select('kg, usd')
      .eq('org_id', org);

    const total_kg  = data?.reduce((a, b) => a + (b.kg  ?? 0), 0) ?? 0;
    const total_usd = data?.reduce((a, b) => a + (b.usd ?? 0), 0) ?? 0;

    res.send({ total_kg, total_usd });
  });
};
