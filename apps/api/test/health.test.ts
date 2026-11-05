import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import type { DbPinger } from '../src/db.js';

const up: DbPinger = { ping: async () => {} };
const down: DbPinger = {
  ping: async () => {
    throw new Error('connection refused');
  },
};

describe('GET /health', () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;
  afterEach(async () => app?.close());

  it('responde 200 cuando la base de datos responde', async () => {
    app = await buildApp({ db: up });
    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'ok', db: 'ok' });
    expect(res.json().uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it('responde 503 y "degraded" cuando la base de datos no responde', async () => {
    app = await buildApp({ db: down });
    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(503);
    expect(res.json()).toMatchObject({ status: 'degraded', db: 'down' });
  });
});
