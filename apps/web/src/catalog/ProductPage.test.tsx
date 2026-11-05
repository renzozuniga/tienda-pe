import { screen } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { mockApi, productDetail, renderRoute } from '../test-utils';

afterEach(() => vi.unstubAllGlobals());

describe('ProductPage', () => {
  it('shows the product detail and links back to its category', async () => {
    mockApi({ '/products/*': () => ({ status: 200, body: productDetail({ stock: 0 }) }) });
    renderRoute('/productos/cafe-chanchamayo-500g');

    expect(await screen.findByRole('heading', { level: 1, name: 'Café de Chanchamayo 500 g' })).toBeInTheDocument();
    expect(
      screen.getByText('S/ 38.90') /* the matcher sees the U+00A0 after S/ as a normal space */,
    ).toBeInTheDocument();
    expect(screen.getByText('IGV incluido')).toBeInTheDocument();
    expect(screen.getByText('Agotado')).toBeInTheDocument();
    expect(screen.getByText('Café arábica de altura.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '← Volver al catálogo' })).toHaveAttribute('href', '/?categoria=cafe');
    expect(document.title).toBe('Café de Chanchamayo 500 g · Tienda PE');
  });

  it('explains when the product does not exist', async () => {
    mockApi({
      '/products/*': () => ({ status: 404, body: { code: 'NOT_FOUND', message: 'No encontramos ese producto.' } }),
    });
    renderRoute('/productos/no-existe');
    expect(await screen.findByText('Este producto no está disponible')).toBeInTheDocument();
  });

  it('offers a retry when the API fails', async () => {
    mockApi({
      '/products/*': () => ({ status: 500, body: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado.' } }),
    });
    renderRoute('/productos/cafe-chanchamayo-500g');
    expect(await screen.findByText('No pudimos cargar el producto')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
