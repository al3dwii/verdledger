import { FastifyInstance, FastifyPluginOptions } from 'fastify';
export const skusRoute =
  (sb: any) => async (app: FastifyInstance, _opts: FastifyPluginOptions) => {

  app.get('/', async (_req, res) => {
    const { data, error } = await sb
      .from('sku_catalogue')
      .select('*')
      .limit(5000);

    if (error) return res.internalServerError(error);
    res.send(data);
  });
};
