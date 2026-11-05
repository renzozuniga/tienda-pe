import type { CartLine, CartQuote } from '@tienda/contracts';
import { product } from '../test-utils';
import { cartAdjustments } from './adjustments';

const line = (
  slug: string,
  name: string,
  requested: number,
  quantity: number,
  status: CartLine['status'],
): CartLine => ({
  product: product({ slug, name, stock: quantity }),
  requestedQuantity: requested,
  quantity,
  lineTotalCents: 0,
  status,
});
const quote = (lines: CartLine[], unavailable: string[] = []): CartQuote => ({
  lines,
  unavailable,
  itemCount: 0,
  subtotalCents: 0,
  currency: 'PEN',
});

describe('cartAdjustments', () => {
  it('changes nothing when every line fits', () => {
    expect(cartAdjustments(quote([line('a', 'A', 2, 2, 'ok')]))).toEqual({ remove: [], lower: [], notices: [] });
  });

  it('lowers limited lines, drops sold-out and retired ones, with one notice each', () => {
    const adj = cartAdjustments(
      quote([line('a', 'Café', 5, 1, 'limited'), line('b', 'Nibs', 2, 0, 'sold_out')], ['x', 'y']),
    );
    expect(adj.lower).toEqual([{ slug: 'a', quantity: 1 }]);
    expect(adj.remove).toEqual(['x', 'y', 'b']);
    expect(adj.notices).toEqual([
      'Quitamos 2 productos que ya no están a la venta.',
      'Café: solo queda 1, así que ajustamos tu cantidad.',
      'Nibs se agotó y lo quitamos de tu carrito.',
    ]);
  });
});
