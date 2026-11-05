import { afterEach, describe, expect, it } from 'vitest';
import type { buildApp } from '../src/app.js';
import type { DbPinger } from '../src/db.js';
import { buildTestApp } from './helpers.js';

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
    app = await buildTestApp({ db: up });
    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: 'ok', db: 'ok' });
    expect(res.json().uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it('responde 503 y "degraded" cuando la base de datos no responde', async () => {
    app = await buildTestApp({ db: down });
    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(503);
    expect(res.json()).toMatchObject({ status: 'degraded', db: 'down' });
  });
});

describe('CORS', () => {
  it('only allows the configured origins', async () => {
    const app = await buildTestApp({ webOrigins: ['https://tienda.example'] });
    const allowed = await app.inject({ method: 'GET', url: '/health', headers: { origin: 'https://tienda.example' } });
    const denied = await app.inject({ method: 'GET', url: '/health', headers: { origin: 'https://otro.example' } });
    expect(allowed.headers['access-control-allow-origin']).toBe('https://tienda.example');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
    await app.close();
  });
});
