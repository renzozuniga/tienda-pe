import type { CartLine, CartQuote, CartQuoteRequest } from '@tienda/contracts';
import { z } from 'zod';
import { ProductSummarySchema } from '../catalog/schemas.js';
import { contractMatches } from '../lib/contract.js';

export const MAX_CART_ITEMS = 30;
export const MAX_QUANTITY_PER_ITEM = 20;

export const CartQuoteRequestSchema = z.strictObject({
  items: z
    .array(
      z.strictObject({
        slug: z
          .string()
          .max(120)
          .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Usa un slug de producto válido'),
        quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ITEM),
      }),
    )
    .min(1)
    .max(MAX_CART_ITEMS),
});

export const CartLineSchema = z.strictObject({
  product: ProductSummarySchema,
  requestedQuantity: z.number().int().min(1),
  quantity: z.number().int().nonnegative(),
  lineTotalCents: z.number().int().nonnegative(),
  status: z.enum(['ok', 'limited', 'sold_out']),
});

export const CartQuoteSchema = z.strictObject({
  lines: z.array(CartLineSchema),
  unavailable: z.array(z.string()),
  itemCount: z.number().int().nonnegative(),
  subtotalCents: z.number().int().nonnegative(),
  currency: z.literal('PEN'),
});

contractMatches<z.infer<typeof CartQuoteRequestSchema>, CartQuoteRequest>(true);
contractMatches<z.infer<typeof CartLineSchema>, CartLine>(true);
contractMatches<z.infer<typeof CartQuoteSchema>, CartQuote>(true);
