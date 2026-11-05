import compress from '@fastify/compress';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
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
  /** Requests per minute per client IP (default 120). /health is exempt. */
  rateLimitPerMinute?: number;
  /** Trust X-Forwarded-For from the platform's proxy so limits apply per client. */
  trustProxy?: boolean;
  logger?: boolean;
};

/** Builds the app without listening: server.ts starts it and tests use app.inject(). */
export async function buildApp({
  db,
  catalog,
  webOrigins,
  rateLimitPerMinute = 120,
  trustProxy = false,
  logger = false,
}: AppDeps) {
  const app = Fastify({ logger, trustProxy }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  registerErrorHandling(app);

  // Security headers. The API only serves JSON, so helmet's defaults (including a strict CSP) fit as is.
  await app.register(helmet);
  if (webOrigins?.length) await app.register(cors, { origin: webOrigins, methods: ['GET', 'HEAD'] });
  // In-memory store: fine for a single instance; move to a shared store if the API scales out.
  await app.register(rateLimit, {
    max: rateLimitPerMinute,
    timeWindow: '1 minute',
    allowList: (req) => req.url === '/health',
  });
  // gzip/brotli for responses over 1 KB (catalog pages), negotiated with Accept-Encoding.
  await app.register(compress, { threshold: 1024 });

  await app.register(healthRoutes, { db });
  await app.register(catalogRoutes, { catalog });

  return app;
}
