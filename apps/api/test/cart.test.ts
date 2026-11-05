import { afterEach, describe, expect, it, vi } from 'vitest';
import type { buildApp } from '../src/app.js';
import { buildTestApp, fakeCatalog, sampleSummary } from './helpers.js';

let app: Awaited<ReturnType<typeof buildApp>> | undefined;
afterEach(async () => app?.close());

const post = (payload: object) => app!.inject({ method: 'POST', url: '/cart/quote', payload });

describe('POST /cart/quote', () => {
  it('prices the cart with the products from the repository', async () => {
    const getProductsBySlugs = vi.fn(async () => [sampleSummary]);
    app = await buildTestApp({ catalog: fakeCatalog({ getProductsBySlugs }) });
    const res = await post({
      items: [
        { slug: sampleSummary.slug, quantity: 2 },
        { slug: 'otro-producto', quantity: 1 },
        { slug: sampleSummary.slug, quantity: 1 },
      ],
    });

    expect(res.statusCode).toBe(200);
    expect(getProductsBySlugs).toHaveBeenCalledWith([sampleSummary.slug, 'otro-producto']);
    expect(res.json()).toEqual({
      lines: [{ product: sampleSummary, requestedQuantity: 3, quantity: 3, lineTotalCents: 11670, status: 'ok' }],
      unavailable: ['otro-producto'],
      itemCount: 3,
      subtotalCents: 11670,
      currency: 'PEN',
    });
  });

  it.each([
    ['an empty cart', { items: [] }],
    ['a zero quantity', { items: [{ slug: 'cafe', quantity: 0 }] }],
    ['more than 20 units of one item', { items: [{ slug: 'cafe', quantity: 21 }] }],
    ['a decimal quantity', { items: [{ slug: 'cafe', quantity: 1.5 }] }],
    ['a price sent by the client', { items: [{ slug: 'cafe', quantity: 1, priceCents: 1 }] }],
    ['31 different items', { items: Array.from({ length: 31 }, (_, i) => ({ slug: `p-${i}`, quantity: 1 })) }],
  ])('rejects %s with VALIDATION_ERROR', async (_case, payload) => {
    app = await buildTestApp();
    const res = await post(payload);
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe('VALIDATION_ERROR');
  });

  it('rejects bodies that are not JSON objects', async () => {
    app = await buildTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/cart/quote',
      payload: 'cafe=1',
      headers: { 'content-type': 'text/plain' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe('VALIDATION_ERROR');
  });

  it('allows POST from the configured web origin (CORS preflight)', async () => {
    app = await buildTestApp({ webOrigins: ['https://tienda.example'] });
    const res = await app.inject({
      method: 'OPTIONS',
      url: '/cart/quote',
      headers: {
        origin: 'https://tienda.example',
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type',
      },
    });
    expect(res.statusCode).toBe(204);
    expect(res.headers['access-control-allow-methods']).toContain('POST');
  });
});
