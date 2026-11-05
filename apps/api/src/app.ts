import cors from '@fastify/cors';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { CatalogRepo } from './catalog/repo.js';
import type { DbPinger } from './db.js';
import { registerErrorHandling } from './lib/errors.js';
import { catalogRoutes } from './routes/catalog.js';
import { healthRoutes } from './routes/health.js';

// Validation messages shown to buyers come from Zod: use its Spanish locale.
z.config(z.locales.es());

export type AppDeps = {
  db: DbPinger;
  catalog: CatalogRepo;
  /** Origins allowed by CORS. Without it, no cross-origin request is allowed. */
  webOrigins?: string[];
  logger?: boolean;
};

/** Builds the app without listening: server.ts starts it and tests use app.inject(). */
export async function buildApp({ db, catalog, webOrigins, logger = false }: AppDeps) {
  const app = Fastify({ logger }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  registerErrorHandling(app);

  if (webOrigins?.length) await app.register(cors, { origin: webOrigins, methods: ['GET', 'HEAD'] });
  await app.register(healthRoutes, { db });
  await app.register(catalogRoutes, { catalog });

  return app;
}
