import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, vi } from 'vitest';
import { cafe, granos, mockApi, product, renderRoute } from '../test-utils';

afterEach(() => vi.unstubAllGlobals());

const quinua = product({
  slug: 'quinua-roja-500g',
  name: 'Quinua roja 500 g',
  priceCents: 1190,
  stock: 3,
  category: granos,
  origin: 'Ayacucho',
});

describe('CatalogPage', () => {
  it('shows products with price, stock and a link to the detail', async () => {
    mockApi({
      '/categories': () => ({ status: 200, body: { items: [cafe, granos] } }),
      '/products': () => ({ status: 200, body: { items: [product(), quinua], nextCursor: null } }),
    });
    renderRoute('/');

    const link = await screen.findByRole('link', { name: 'Café de Chanchamayo 500 g' });
    expect(link).toHaveAttribute('href', '/productos/cafe-chanchamayo-500g');
    const card = link.closest('li')!;
    expect(
      within(card).getByText('S/ 38.90') /* the matcher sees the U+00A0 after S/ as a normal space */,
    ).toBeInTheDocument();
    expect(within(card).getByText('40 en stock')).toBeInTheDocument();
    expect(screen.getByText('Quedan 3')).toBeInTheDocument();
    expect(screen.getByText('2 productos')).toBeInTheDocument();
  });

  it('filters by the category in the URL and marks it as current', async () => {
    const api = mockApi({
      '/categories': () => ({ status: 200, body: { items: [cafe, granos] } }),
      '/products': () => ({ status: 200, body: { items: [quinua], nextCursor: null } }),
    });
    renderRoute('/?categoria=granos-andinos');

    expect(await screen.findByRole('heading', { level: 1, name: 'Granos andinos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Granos andinos' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Todo' })).not.toHaveAttribute('aria-current');
    const productCall = api.mock.calls.map(([u]) => String(u)).find((u) => u.includes('/products'));
    expect(productCall).toContain('category=granos-andinos');
  });

  it('loads the next page with the cursor', async () => {
    const api = mockApi({
      '/categories': () => ({ status: 200, body: { items: [cafe] } }),
      '/products': (url) =>
        url.searchParams.get('cursor') === 'c1'
          ? { status: 200, body: { items: [quinua], nextCursor: null } }
          : { status: 200, body: { items: [product()], nextCursor: 'c1' } },
    });
    renderRoute('/');

    await userEvent.click(await screen.findByRole('button', { name: 'Ver más productos' }));
    expect(await screen.findByRole('link', { name: 'Quinua roja 500 g' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ver más productos' })).not.toBeInTheDocument();
    expect(api.mock.calls.some(([u]) => String(u).includes('cursor=c1'))).toBe(true);
  });

  it('shows an empty state when the category has no products', async () => {
    mockApi({
      '/categories': () => ({ status: 200, body: { items: [cafe] } }),
      '/products': () => ({ status: 200, body: { items: [], nextCursor: null } }),
    });
    renderRoute('/?categoria=cafe');
    expect(await screen.findByText('No hay productos en esta categoría')).toBeInTheDocument();
  });

  it('shows the API error message and retries', async () => {
    let calls = 0;
    mockApi({
      '/categories': () => ({ status: 200, body: { items: [] } }),
      '/products': () =>
        ++calls === 1
          ? { status: 500, body: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado.' } }
          : { status: 200, body: { items: [product()], nextCursor: null } },
    });
    renderRoute('/');

    expect(await screen.findByText('Ocurrió un error inesperado.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(screen.getByRole('link', { name: 'Café de Chanchamayo 500 g' })).toBeInTheDocument());
  });
});
