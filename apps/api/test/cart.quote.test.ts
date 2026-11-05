import type { ProductSummary } from '@tienda/contracts';
import { describe, expect, it } from 'vitest';
import { quoteCart } from '../src/cart/quote.js';

const cat = { slug: 'cafe', name: 'Café' };
const p = (slug: string, priceCents: number, stock: number): ProductSummary => ({
  slug,
  name: slug,
  origin: null,
  priceCents,
  currency: 'PEN',
  stock,
  category: cat,
});

describe('quoteCart', () => {
  it('multiplies integer céntimos by quantity and sums the subtotal', () => {
    const q = quoteCart(
      [
        { slug: 'cafe', quantity: 3 },
        { slug: 'quinua', quantity: 2 },
      ],
      [p('cafe', 3890, 40), p('quinua', 1590, 80)],
    );
    expect(q.lines.map((l) => l.lineTotalCents)).toEqual([11670, 3180]);
    expect(q.subtotalCents).toBe(14850);
    expect(q.itemCount).toBe(5);
    expect(Number.isInteger(q.subtotalCents)).toBe(true);
    expect(q.currency).toBe('PEN');
  });

  it('caps a line at the available stock and marks it as limited', () => {
    const [line] = quoteCart([{ slug: 'cacao', quantity: 5 }], [p('cacao', 1490, 3)]).lines;
    expect(line).toMatchObject({ requestedQuantity: 5, quantity: 3, lineTotalCents: 4470, status: 'limited' });
  });

  it('keeps sold-out products as a zero line so the buyer sees what happened', () => {
    const q = quoteCart([{ slug: 'nibs', quantity: 2 }], [p('nibs', 1890, 0)]);
    expect(q.lines[0]).toMatchObject({ quantity: 0, lineTotalCents: 0, status: 'sold_out' });
    expect(q.subtotalCents).toBe(0);
    expect(q.itemCount).toBe(0);
  });

  it('reports unknown or inactive slugs as unavailable', () => {
    const q = quoteCart(
      [
        { slug: 'cafe', quantity: 1 },
        { slug: 'ya-no-existe', quantity: 1 },
      ],
      [p('cafe', 3890, 40)],
    );
    expect(q.lines).toHaveLength(1);
    expect(q.unavailable).toEqual(['ya-no-existe']);
  });

  it('merges repeated slugs in order of first appearance', () => {
    const q = quoteCart(
      [
        { slug: 'b', quantity: 1 },
        { slug: 'a', quantity: 1 },
        { slug: 'b', quantity: 2 },
      ],
      [p('a', 100, 10), p('b', 200, 10)],
    );
    expect(q.lines.map((l) => [l.product.slug, l.quantity])).toEqual([
      ['b', 3],
      ['a', 1],
    ]);
  });

  it('handles a free product without breaking the totals', () => {
    const q = quoteCart([{ slug: 'muestra', quantity: 2 }], [p('muestra', 0, 10)]);
    expect(q.subtotalCents).toBe(0);
    expect(q.lines[0]?.status).toBe('ok');
  });
});
