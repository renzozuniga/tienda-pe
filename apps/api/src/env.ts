import { z } from 'zod';

const MISSING_DATABASE_URL = 'DATABASE_URL es obligatoria (copia apps/api/.env.example a .env)';

const EnvSchema = z.object({
  DATABASE_URL: z.string({ error: MISSING_DATABASE_URL }).min(1, MISSING_DATABASE_URL),
  API_PORT: z.coerce.number().int().positive().default(3001),
  API_HOST: z.string().default('127.0.0.1'),
  /** Comma-separated list of origins allowed by CORS. */
  WEB_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim().replace(/\/$/, ''))
        .filter(Boolean),
    ),
});

export type Env = z.infer<typeof EnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  // Hosting platforms such as Render inject the port as PORT.
  const parsed = EnvSchema.safeParse({ ...source, API_PORT: source.API_PORT ?? source.PORT });
  if (!parsed.success) {
    throw new Error(`Variables de entorno inválidas:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}
