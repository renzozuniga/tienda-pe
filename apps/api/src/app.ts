import cors from '@fastify/cors';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import type { DbPinger } from './db.js';
import { healthRoutes } from './routes/health.js';

export type AppDeps = {
  db: DbPinger;
  /** Origins allowed by CORS. Without it, no cross-origin request is allowed. */
  webOrigins?: string[];
  logger?: boolean;
};

/** Builds the app without listening: server.ts starts it and tests use app.inject(). */
export async function buildApp({ db, webOrigins, logger = false }: AppDeps) {
  const app = Fastify({ logger }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  if (webOrigins?.length) await app.register(cors, { origin: webOrigins });
  await app.register(healthRoutes, { db });

  return app;
}
