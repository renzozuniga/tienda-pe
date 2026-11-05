import type { CartLine, CartQuote, CartQuoteRequest, ProductSummary } from '@tienda/contracts';

/**
 * Prices a cart with current prices and stock (money-pen skill: integer céntimos, IGV already included).
 * Repeated slugs are merged in order of first appearance. Each line sells min(requested, stock) units.
 * Pure function: the route fetches the products, this decides the numbers.
 */
export function quoteCart(items: CartQuoteRequest['items'], products: ProductSummary[]): CartQuote {
  const requested = new Map<string, number>();
  for (const { slug, quantity } of items) requested.set(slug, (requested.get(slug) ?? 0) + quantity);

  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const lines: CartLine[] = [];
  const unavailable: string[] = [];

  for (const [slug, requestedQuantity] of requested) {
    const product = bySlug.get(slug);
    if (!product) {
      unavailable.push(slug);
      continue;
    }
    const quantity = Math.min(requestedQuantity, product.stock);
    const status: CartLine['status'] = quantity === 0 ? 'sold_out' : quantity < requestedQuantity ? 'limited' : 'ok';
    lines.push({ product, requestedQuantity, quantity, lineTotalCents: product.priceCents * quantity, status });
  }

  return {
    lines,
    unavailable,
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotalCents: lines.reduce((sum, l) => sum + l.lineTotalCents, 0),
    currency: 'PEN',
  };
}
