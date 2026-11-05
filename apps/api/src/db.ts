import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';

export function createPrisma(connectionString: string): PrismaClient {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/** Lo mínimo que necesita /health. Permite inyectar un doble en los tests sin base de datos. */
export type DbPinger = { ping(): Promise<void> };

export function prismaPinger(prisma: PrismaClient): DbPinger {
  return {
    async ping() {
      await prisma.$queryRaw`SELECT 1`;
    },
  };
}
