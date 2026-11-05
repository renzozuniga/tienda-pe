import type { Category, CategoryList, ProductDetail, ProductPage, ProductSummary } from '@tienda/contracts';
import { z } from 'zod';
import { contractMatches } from '../lib/contract.js';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const CategorySchema = z.strictObject({ slug: z.string(), name: z.string() });

export const CategoryListSchema = z.strictObject({ items: z.array(CategorySchema) });

export const ProductSummarySchema = z.strictObject({
  slug: z.string(),
  name: z.string(),
  origin: z.string().nullable(),
  priceCents: z.number().int().nonnegative(),
  currency: z.literal('PEN'),
  stock: z.number().int().nonnegative(),
  category: CategorySchema,
});

export const ProductDetailSchema = z.strictObject({
  ...ProductSummarySchema.shape,
  description: z.string().nullable(),
});

export const ProductPageSchema = z.strictObject({
  items: z.array(ProductSummarySchema),
  nextCursor: z.string().nullable(),
});

export const ListProductsQuerySchema = z.object({
  category: z.string().max(80).regex(SLUG, 'Usa un slug de categoría válido').optional(),
  cursor: z.string().min(1).max(64).optional(),
  // An empty value (?limit=) means "not set", not 0.
  limit: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().min(1).max(50).default(12)),
});

export const ProductParamsSchema = z.object({
  slug: z.string().max(120).regex(SLUG, 'Usa un slug de producto válido'),
});

contractMatches<z.infer<typeof CategorySchema>, Category>(true);
contractMatches<z.infer<typeof CategoryListSchema>, CategoryList>(true);
contractMatches<z.infer<typeof ProductSummarySchema>, ProductSummary>(true);
contractMatches<z.infer<typeof ProductDetailSchema>, ProductDetail>(true);
contractMatches<z.infer<typeof ProductPageSchema>, ProductPage>(true);

export type ListProductsInput = z.infer<typeof ListProductsQuerySchema>;
