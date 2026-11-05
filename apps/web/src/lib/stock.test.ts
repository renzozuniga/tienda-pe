import { stockStatus } from './stock';

describe('stockStatus', () => {
  it.each([
    [0, 'sold_out'],
    [1, 'low_stock'],
    [5, 'low_stock'],
    [6, 'in_stock'],
    [120, 'in_stock'],
  ] as const)('stock %i → %s', (stock, expected) => {
    expect(stockStatus(stock)).toBe(expected);
  });
});
