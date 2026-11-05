import { beforeEach } from 'vitest';
import { cart, MAX_ITEMS, MAX_QUANTITY } from './cartStore';

beforeEach(() => {
  localStorage.clear();
  cart.reload();
});

describe('cart store', () => {
  it('adds products and persists only slug and quantity', () => {
    cart.add('cafe', 2);
    cart.add('cafe');
    cart.add('quinua');
    expect(cart.get()).toEqual([
      { slug: 'cafe', quantity: 3 },
      { slug: 'quinua', quantity: 1 },
    ]);
    expect(JSON.parse(localStorage.getItem('tienda-pe:cart:v1')!)).toEqual(cart.get());
  });

  it('never goes over the stock the buyer saw nor over the per-item limit', () => {
    expect(cart.add('cacao', 5, 3)).toBe(true);
    expect(cart.get()[0]?.quantity).toBe(3);
    expect(cart.add('cacao', 1, 3)).toBe(false);
    cart.add('cafe', 99);
    expect(cart.get()[1]?.quantity).toBe(MAX_QUANTITY);
  });

  it('does not add a sold-out product', () => {
    expect(cart.add('nibs', 1, 0)).toBe(false);
    expect(cart.get()).toEqual([]);
  });

  it(`stops at ${MAX_ITEMS} different products`, () => {
    for (let i = 0; i < MAX_ITEMS + 2; i++) cart.add(`p-${i}`);
    expect(cart.get()).toHaveLength(MAX_ITEMS);
  });

  it('sets, clamps and removes quantities', () => {
    cart.add('cafe');
    cart.add('quinua');
    cart.setQuantity('cafe', 0);
    expect(cart.get()[0]?.quantity).toBe(1);
    cart.remove('cafe');
    expect(cart.get()).toEqual([{ slug: 'quinua', quantity: 1 }]);
  });

  it('ignores corrupted or tampered storage', () => {
    localStorage.setItem(
      'tienda-pe:cart:v1',
      JSON.stringify([{ slug: 'cafe', quantity: 500, priceCents: 1 }, { slug: '<script>' }, 'x']),
    );
    cart.reload();
    expect(cart.get()).toEqual([{ slug: 'cafe', quantity: MAX_QUANTITY }]);

    localStorage.setItem('tienda-pe:cart:v1', '{not json');
    cart.reload();
    expect(cart.get()).toEqual([]);
  });
});
