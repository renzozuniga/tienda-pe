import type { CartLine, CartQuote, CartQuoteRequest } from '@tienda/contracts';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, vi } from 'vitest';
import { mockApi, product, renderRoute } from '../test-utils';
import { cart } from './cartStore';

const cafe = product();
const cacao = product({ slug: 'cacao-blanco', name: 'Cacao blanco 80 g', priceCents: 1490, stock: 3 });

/** A fake /cart/quote that prices with the given products, like the real API. */
function quoteApi(products = [cafe, cacao]) {
  const requests: CartQuoteRequest[] = [];
  const api = mockApi({
    '/cart/quote': (_url, body) => {
      const req = body as CartQuoteRequest;
      requests.push(req);
      const lines: CartLine[] = [];
      const unavailable: string[] = [];
      for (const { slug, quantity: requested } of req.items) {
        const p = products.find((x) => x.slug === slug);
        if (!p) {
          unavailable.push(slug);
          continue;
        }
        const quantity = Math.min(requested, p.stock);
        const status = quantity === 0 ? 'sold_out' : quantity < requested ? 'limited' : 'ok';
        lines.push({
          product: p,
          requestedQuantity: requested,
          quantity,
          lineTotalCents: p.priceCents * quantity,
          status,
        });
      }
      const quote: CartQuote = {
        lines,
        unavailable,
        itemCount: lines.reduce((s, l) => s + l.quantity, 0),
        subtotalCents: lines.reduce((s, l) => s + l.lineTotalCents, 0),
        currency: 'PEN',
      };
      return { status: 200, body: quote };
    },
  });
  return { api, requests };
}

beforeEach(() => {
  localStorage.clear();
  cart.reload();
});
afterEach(() => vi.unstubAllGlobals());

describe('CartPage', () => {
  it('shows an empty state without calling the API', async () => {
    const { api } = quoteApi();
    renderRoute('/carrito');
    expect(await screen.findByText('Tu carrito está vacío')).toBeInTheDocument();
    expect(api).not.toHaveBeenCalled();
  });

  it('sends only slug and quantity and shows the subtotal priced by the API', async () => {
    cart.add(cafe.slug, 2);
    const { requests } = quoteApi();
    renderRoute('/carrito');

    expect(await screen.findByRole('link', { name: cafe.name })).toBeInTheDocument();
    expect(requests[0]).toEqual({ items: [{ slug: cafe.slug, quantity: 2 }] });
    const summary = screen.getByRole('region', { name: 'Resumen' });
    expect(within(summary).getByText('S/ 77.80')).toBeInTheDocument();
  });

  it('updates the quantity with the stepper and re-quotes', async () => {
    cart.add(cafe.slug, 1);
    const { requests } = quoteApi();
    renderRoute('/carrito');

    await userEvent.click(await screen.findByRole('button', { name: `Agregar una unidad de ${cafe.name}` }));
    await waitFor(() => expect(requests.at(-1)).toEqual({ items: [{ slug: cafe.slug, quantity: 2 }] }));
    expect(cart.get()).toEqual([{ slug: cafe.slug, quantity: 2 }]);
  });

  it('lowers a line to the stock left and says so, so the header and the subtotal match', async () => {
    cart.add(cacao.slug, 5);
    quoteApi();
    renderRoute('/carrito');

    expect(
      await screen.findByText('Cacao blanco 80 g: solo quedan 3, así que ajustamos tu cantidad.'),
    ).toBeInTheDocument();
    await waitFor(() => expect(cart.get()).toEqual([{ slug: cacao.slug, quantity: 3 }]));
    expect(screen.getByRole('link', { name: 'Carrito, 3 productos' })).toBeInTheDocument();
  });

  it('drops a product that sold out while in the cart', async () => {
    cart.add(cafe.slug, 1);
    cart.add('nibs', 2);
    quoteApi([cafe, product({ slug: 'nibs', name: 'Nibs de cacao', stock: 0 })]);
    renderRoute('/carrito');

    expect(await screen.findByText('Nibs de cacao se agotó y lo quitamos de tu carrito.')).toBeInTheDocument();
    await waitFor(() => expect(cart.get()).toEqual([{ slug: cafe.slug, quantity: 1 }]));
  });

  it('removes products that are no longer for sale and says so', async () => {
    cart.add(cafe.slug, 1);
    cart.add('producto-retirado', 1);
    quoteApi();
    renderRoute('/carrito');

    expect(await screen.findByText('Quitamos 1 producto que ya no está a la venta.')).toBeInTheDocument();
    await waitFor(() => expect(cart.get()).toEqual([{ slug: cafe.slug, quantity: 1 }]));
  });

  it('removes a line with "Quitar"', async () => {
    cart.add(cafe.slug, 1);
    quoteApi();
    renderRoute('/carrito');
    await userEvent.click(await screen.findByRole('button', { name: 'Quitar' }));
    expect(await screen.findByText('Tu carrito está vacío')).toBeInTheDocument();
  });
});

describe('adding to the cart', () => {
  it('adds from the product page and updates the header count', async () => {
    mockApi({ '/products/*': () => ({ status: 200, body: { ...cacao, description: null } }) });
    renderRoute('/productos/cacao-blanco');

    await userEvent.click(await screen.findByRole('button', { name: 'Agregar al carrito' }));
    expect(screen.getByRole('link', { name: 'Carrito, 1 producto' })).toBeInTheDocument();
    expect(screen.getByText(/Tienes 1 en tu carrito/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }));
    await userEvent.click(screen.getByRole('button', { name: 'Agregar al carrito' }));
    expect(screen.getByRole('button', { name: 'Máximo en tu carrito' })).toBeDisabled();
    expect(cart.get()).toEqual([{ slug: cacao.slug, quantity: 3 }]);
  });

  it('does not offer to add a sold-out product', async () => {
    mockApi({ '/products/*': () => ({ status: 200, body: { ...cafe, stock: 0, description: null } }) });
    renderRoute('/productos/cafe-chanchamayo-500g');
    expect(await screen.findByRole('button', { name: 'No disponible' })).toBeDisabled();
    expect(screen.getAllByText('Agotado')).toHaveLength(1);
  });
});
