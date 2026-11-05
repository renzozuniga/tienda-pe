/** Units at or below this count show as "pocas unidades" (docs/glossary.md). */
export const LOW_STOCK_THRESHOLD = 5;

export type StockStatus = 'in_stock' | 'low_stock' | 'sold_out';

export function stockStatus(stock: number, threshold = LOW_STOCK_THRESHOLD): StockStatus {
  if (stock <= 0) return 'sold_out';
  if (stock <= threshold) return 'low_stock';
  return 'in_stock';
}
