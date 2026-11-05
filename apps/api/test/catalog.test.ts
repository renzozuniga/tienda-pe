import { afterEach, describe, expect, it, vi } from 'vitest';
import type { buildApp } from '../src/app.js';
import { buildTestApp, fakeCatalog, sampleProduct, sampleSummary } from './helpers.js';

let app: Awaited<ReturnType<typeof buildApp>> | undefined;
afterEach(async () => app?.close());

describe('GET /categories', () => {
  it('returns the categories wrapped in items', async () => {
    app = await buildTestApp();
    const res = await app.inject({ url: '/categories' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ items: [{ slug: 'cafe', name: 'Café' }] });
  });
});

describe('GET /products', () => {
  it('returns a page with the default limit of 12', async () => {
    const listProducts = vi.fn(async () => ({ items: [sampleSummary], nextCursor: 'abc' }));
    app = await buildTestApp({ catalog: fakeCatalog({ listProducts }) });
    const res = await app.inject({ url: '/products' });

    expect(res.statusCode).toBe(200);
    expect(listProducts).toHaveBeenCalledWith({ limit: 12 });
    expect(res.json().nextCursor).toBe('abc');
  });

  it('returns the summary fields of each product', async () => {
    app = await buildTestApp();
    const [item] = (await app.inject({ url: '/products' })).json().items;
    expect(item).toEqual(sampleSummary);
  });

  it('fails instead of leaking fields that are not in the contract', async () => {
    const leaky = { ...sampleSummary, costCents: 2100 };
    app = await buildTestApp({
      catalog: fakeCatalog({ listProducts: async () => ({ items: [leaky], nextCursor: null }) }),
    });
    const res = await app.inject({ url: '/products' });
    expect(res.statusCode).toBe(500);
    expect(res.body).not.toContain('2100');
  });

  it('treats an empty limit as not set', async () => {
    const listProducts = vi.fn(async () => ({ items: [], nextCursor: null }));
    app = await buildTestApp({ catalog: fakeCatalog({ listProducts }) });
    const res = await app.inject({ url: '/products?limit=' });
    expect(res.statusCode).toBe(200);
    expect(listProducts).toHaveBeenCalledWith({ limit: 12 });
  });

  it('passes category, cursor and limit to the repository', async () => {
    const listProducts = vi.fn(async () => ({ items: [], nextCursor: null }));
    app = await buildTestApp({ catalog: fakeCatalog({ listProducts }) });
    await app.inject({ url: '/products?category=granos-andinos&cursor=c123&limit=5' });
    expect(listProducts).toHaveBeenCalledWith({ category: 'granos-andinos', cursor: 'c123', limit: 5 });
  });

  it.each(['limit=0', 'limit=51', 'limit=abc', 'category=Café', 'category=a b'])(
    'rejects %s with VALIDATION_ERROR in Spanish',
    async (query) => {
      app = await buildTestApp();
      const res = await app.inject({ url: `/products?${query}` });
      expect(res.statusCode).toBe(400);
      const body = res.json();
      expect(body).toMatchObject({ code: 'VALIDATION_ERROR', message: 'Revisa los datos enviados.' });
      expect(body.details[0].field).toMatch(/^querystring\./);
    },
  );

  it('hides internal errors behind INTERNAL_ERROR', async () => {
    const listProducts = vi.fn(async () => {
      throw new Error('connection refused to db.internal:5432');
    });
    app = await buildTestApp({ catalog: fakeCatalog({ listProducts }) });
    const res = await app.inject({ url: '/products' });
    expect(res.statusCode).toBe(500);
    expect(res.json().code).toBe('INTERNAL_ERROR');
    expect(res.body).not.toContain('db.internal');
  });
});

describe('GET /products/:slug', () => {
  it('returns the detail with description', async () => {
    app = await buildTestApp();
    const res = await app.inject({ url: `/products/${sampleProduct.slug}` });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(sampleProduct);
  });

  it('returns NOT_FOUND for an unknown product', async () => {
    app = await buildTestApp();
    const res = await app.inject({ url: '/products/no-existe' });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ code: 'NOT_FOUND' });
  });

  it('rejects a malformed slug', async () => {
    app = await buildTestApp();
    const res = await app.inject({ url: '/products/Caf%C3%A9_raro' });
    expect(res.statusCode).toBe(400);
    expect(res.json().details[0].field).toBe('params.slug');
  });
});

describe('unknown routes', () => {
  it('answer with the contract error format', async () => {
    app = await buildTestApp();
    const res = await app.inject({ url: '/no-existe' });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({ code: 'NOT_FOUND', message: 'No encontramos lo que buscas.' });
  });
});
