import { buildApp } from './app.js';
import { prismaCatalogRepo } from './catalog/repo.js';
import { createPrisma, prismaPinger } from './db.js';
import { loadEnv } from './env.js';

const env = loadEnv();
const prisma = createPrisma(env.DATABASE_URL);
const app = await buildApp({
  db: prismaPinger(prisma),
  catalog: prismaCatalogRepo(prisma),
  webOrigins: env.WEB_ORIGIN,
  trustProxy: env.TRUST_PROXY,
  rateLimitPerMinute: env.RATE_LIMIT_PER_MINUTE,
  logger: true,
});

const shutdown = async () => {
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await app.listen({ port: env.API_PORT, host: env.API_HOST });
