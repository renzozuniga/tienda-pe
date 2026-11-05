import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { quoteCart } from '../cart/quote.js';
import { CartQuoteRequestSchema, CartQuoteSchema } from '../cart/schemas.js';
import type { CatalogRepo } from '../catalog/repo.js';
import { errorResponses } from '../lib/errors.js';

export const cartRoutes: FastifyPluginAsyncZod<{ catalog: CatalogRepo }> = async (app, { catalog }) => {
  app.post(
    '/cart/quote',
    {
      // 30 items × ~150 bytes fit comfortably; anything bigger is not a cart.
      bodyLimit: 16 * 1024,
      schema: { body: CartQuoteRequestSchema, response: { 200: CartQuoteSchema, ...errorResponses } },
    },
    async (req) => {
      const slugs = [...new Set(req.body.items.map((i) => i.slug))];
      const products = await catalog.getProductsBySlugs(slugs);
      return quoteCart(req.body.items, products);
    },
  );
};
