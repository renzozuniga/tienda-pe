import type { Health } from '@tienda/contracts';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

/** GET /health. La API responde 503 con el mismo cuerpo cuando la base de datos está caída. */
export async function getHealth(signal?: AbortSignal): Promise<Health> {
  const res = await fetch(`${BASE_URL}/health`, { signal });
  if (res.status !== 200 && res.status !== 503) {
    throw new Error(`Respuesta inesperada de la API (${res.status})`);
  }
  return (await res.json()) as Health;
}
