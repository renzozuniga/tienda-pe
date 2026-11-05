import type { ProductDetail, ProductSummary } from '@tienda/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { vi } from 'vitest';
import { routes } from './router';

type Handler = (url: URL) => { status: number; body: unknown } | Promise<{ status: number; body: unknown }>;

/** Stubs fetch with handlers keyed by API path ("/products", "/products/:slug" matches by prefix). */
export function mockApi(handlers: Record<string, Handler>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), 'http://localhost');
    const path = url.pathname.replace(/^\/api/, '');
    const key =
      Object.keys(handlers).find((k) => k === path) ??
      Object.keys(handlers).find((k) => k.endsWith('/*') && path.startsWith(k.slice(0, -1)));
    if (!key) return new Response(JSON.stringify({ code: 'NOT_FOUND', message: 'sin mock' }), { status: 404 });
    const { status, body } = await handlers[key]!(url);
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function renderRoute(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { router, queryClient };
}

export const cafe = { slug: 'cafe', name: 'Café' };
export const granos = { slug: 'granos-andinos', name: 'Granos andinos' };

export function product(overrides: Partial<ProductSummary> = {}): ProductSummary {
  return {
    slug: 'cafe-chanchamayo-500g',
    name: 'Café de Chanchamayo 500 g',
    origin: 'Junín',
    priceCents: 3890,
    currency: 'PEN',
    stock: 40,
    category: cafe,
    ...overrides,
  };
}

export function productDetail(overrides: Partial<ProductDetail> = {}): ProductDetail {
  return { ...product(), description: 'Café arábica de altura.', ...overrides };
}
