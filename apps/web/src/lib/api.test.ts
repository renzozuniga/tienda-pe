import { afterEach, vi } from 'vitest';
import { ApiError, getProduct, listProducts } from './api';

afterEach(() => vi.unstubAllGlobals());

function stubFetch(status: number, body: unknown) {
  const fn = vi.fn(async (_input: RequestInfo | URL) => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('api client', () => {
  it('builds the query string and skips undefined values', async () => {
    const fn = stubFetch(200, { items: [], nextCursor: null });
    await listProducts({ category: 'cafe', cursor: undefined, limit: 12 });
    expect(String(fn.mock.calls[0]![0])).toBe('/api/products?category=cafe&limit=12');
  });

  it('encodes the slug in the path', async () => {
    const fn = stubFetch(200, {});
    await getProduct('a/b');
    expect(String(fn.mock.calls[0]![0])).toBe('/api/products/a%2Fb');
  });

  it('turns contract errors into ApiError with the Spanish message', async () => {
    stubFetch(400, {
      code: 'VALIDATION_ERROR',
      message: 'Revisa los datos enviados.',
      details: [{ field: 'querystring.limit', message: 'x' }],
    });
    const err = await listProducts({ limit: 99 }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 400, code: 'VALIDATION_ERROR', message: 'Revisa los datos enviados.' });
  });

  it('reports network failures as NETWORK_ERROR with a friendly message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))),
    );
    const err = await listProducts({}).catch((e: unknown) => e);
    expect(err).toMatchObject({ status: 0, code: 'NETWORK_ERROR' });
    expect((err as Error).message).toMatch(/Revisa tu conexión/);
  });
});
