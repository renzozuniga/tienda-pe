import type { CartQuote } from '@tienda/contracts';

export type CartAdjustments = {
  /** Slugs to drop: no longer for sale, or sold out. */
  remove: string[];
  /** Lines to lower to the stock that is left. */
  lower: Array<{ slug: string; quantity: number }>;
  /** One sentence per change, for the buyer. */
  notices: string[];
};

/**
 * Turns a quote into the changes the stored cart needs, so that what the buyer sees, the header count and
 * the subtotal always match what can actually be sold.
 */
export function cartAdjustments(quote: CartQuote): CartAdjustments {
  const remove = [...quote.unavailable];
  const lower: CartAdjustments['lower'] = [];
  const notices: string[] = [];

  if (quote.unavailable.length === 1) notices.push('Quitamos 1 producto que ya no está a la venta.');
  if (quote.unavailable.length > 1) {
    notices.push(`Quitamos ${quote.unavailable.length} productos que ya no están a la venta.`);
  }

  for (const line of quote.lines) {
    if (line.status === 'sold_out') {
      remove.push(line.product.slug);
      notices.push(`${line.product.name} se agotó y lo quitamos de tu carrito.`);
    } else if (line.status === 'limited') {
      lower.push({ slug: line.product.slug, quantity: line.quantity });
      notices.push(
        `${line.product.name}: ${line.quantity === 1 ? 'solo queda 1' : `solo quedan ${line.quantity}`}, así que ajustamos tu cantidad.`,
      );
    }
  }

  return { remove, lower, notices };
}
