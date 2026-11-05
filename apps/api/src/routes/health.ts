import type { Health } from '@tienda/contracts';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import type { DbPinger } from '../db.js';
import { contractMatches } from '../lib/contract.js';

export const HealthSchema = z.strictObject({
  status: z.enum(['ok', 'degraded']),
  db: z.enum(['ok', 'down']),
  uptimeSeconds: z.number().nonnegative(),
});

contractMatches<z.infer<typeof HealthSchema>, Health>(true);

export const healthRoutes: FastifyPluginAsyncZod<{ db: DbPinger }> = async (app, { db }) => {
  app.get('/health', { schema: { response: { 200: HealthSchema, 503: HealthSchema } } }, async (_req, reply) => {
    const uptimeSeconds = Math.round(process.uptime());
    try {
      await db.ping();
      return { status: 'ok', db: 'ok', uptimeSeconds } as const;
    } catch (err) {
      app.log.warn({ err }, 'La base de datos no responde');
      return reply.code(503).send({ status: 'degraded', db: 'down', uptimeSeconds });
    }
  });
};
