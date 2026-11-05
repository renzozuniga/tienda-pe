import { afterEach, describe, expect, it } from 'vitest';
import type { buildApp } from '../src/app.js';
import { buildTestApp, fakeCatalog, sampleSummary } from './helpers.js';

let app: Awaited<ReturnType<typeof buildApp>> | undefined;
afterEach(async () => app?.close());

describe('security headers', () => {
  it('are sent on every response', async () => {
    app = await buildTestApp();
    const res = await app.inject({ url: '/products' });
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['strict-transport-security']).toMatch(/max-age=/);
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('rate limit', () => {
  it('answers 429 RATE_LIMITED in Spanish with retry-after after the limit', async () => {
    app = await buildTestApp({ rateLimitPerMinute: 2 });
    await app.inject({ url: '/products' });
    await app.inject({ url: '/products' });
    const res = await app.inject({ url: '/products' });

    expect(res.statusCode).toBe(429);
    expect(res.json()).toEqual({
      code: 'RATE_LIMITED',
      message: 'Hiciste demasiadas solicitudes. Espera un minuto y vuelve a intentarlo.',
    });
    expect(Number(res.headers['retry-after'])).toBeGreaterThan(0);
  });

  it('never limits /health, which the platform polls', async () => {
    app = await buildTestApp({ rateLimitPerMinute: 1 });
    for (let i = 0; i < 3; i++) {
      expect((await app.inject({ url: '/health' })).statusCode).toBe(200);
    }
  });

  it('counts clients separately by forwarded IP when trustProxy is on', async () => {
    app = await buildTestApp({ rateLimitPerMinute: 1, trustProxy: true });
    const a = await app.inject({ url: '/categories', headers: { 'x-forwarded-for': '200.48.1.1' } });
    const b = await app.inject({ url: '/categories', headers: { 'x-forwarded-for': '200.48.1.2' } });
    expect([a.statusCode, b.statusCode]).toEqual([200, 200]);
  });
});

describe('compression', () => {
  it('compresses large catalog pages when the client accepts gzip', async () => {
    const items = Array.from({ length: 40 }, (_, i) => ({ ...sampleSummary, slug: `producto-${i}` }));
    app = await buildTestApp({ catalog: fakeCatalog({ listProducts: async () => ({ items, nextCursor: null }) }) });
    const res = await app.inject({ url: '/products', headers: { 'accept-encoding': 'gzip' } });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-encoding']).toBe('gzip');
  });
});
