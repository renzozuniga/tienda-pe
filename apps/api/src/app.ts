import cors from '@fastify/cors';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import type { DbPinger } from './db.js';
import { healthRoutes } from './routes/health.js';

export type AppDeps = {
  db: DbPinger;
  webOrigin?: string;
  logger?: boolean;
};

/** Construye la app sin escuchar en un puerto: server.ts la arranca y los tests usan app.inject(). */
export async function buildApp({ db, webOrigin, logger = false }: AppDeps) {
  const app = Fastify({ logger }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  if (webOrigin) await app.register(cors, { origin: webOrigin });
  await app.register(healthRoutes, { db });

  return app;
}
