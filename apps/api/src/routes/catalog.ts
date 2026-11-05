import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import type { CatalogRepo } from '../catalog/repo.js';
import {
  CategoryListSchema,
  ListProductsQuerySchema,
  ProductDetailSchema,
  ProductPageSchema,
  ProductParamsSchema,
} from '../catalog/schemas.js';
import { errorResponses, notFound } from '../lib/errors.js';

export const catalogRoutes: FastifyPluginAsyncZod<{ catalog: CatalogRepo }> = async (app, { catalog }) => {
  app.get('/categories', { schema: { response: { 200: CategoryListSchema, ...errorResponses } } }, async () => ({
    items: await catalog.listCategories(),
  }));

  app.get(
    '/products',
    { schema: { querystring: ListProductsQuerySchema, response: { 200: ProductPageSchema, ...errorResponses } } },
    async (req) => catalog.listProducts(req.query),
  );

  app.get(
    '/products/:slug',
    { schema: { params: ProductParamsSchema, response: { 200: ProductDetailSchema, ...errorResponses } } },
    async (req, reply) => {
      const product = await catalog.getProduct(req.params.slug);
      if (!product)
        return reply.code(404).send(notFound('No encontramos ese producto. Puede que ya no esté a la venta.'));
      return product;
    },
  );
};
