import { z } from 'zod';

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria (copia apps/api/.env.example a .env)'),
  API_PORT: z.coerce.number().int().positive().default(3001),
  API_HOST: z.string().default('127.0.0.1'),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = EnvSchema.safeParse(source);
  if (!parsed.success) {
    throw new Error(`Variables de entorno inválidas:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}
