import type { ProductDetail, ProductSummary } from '@tienda/contracts';
import { buildApp, type AppDeps } from '../src/app.js';
import type { CatalogRepo } from '../src/catalog/repo.js';

export const sampleProduct: ProductDetail = {
  slug: 'cafe-chanchamayo-500g',
  name: 'Café de Chanchamayo 500 g',
  origin: 'Junín',
  priceCents: 3890,
  currency: 'PEN',
  stock: 40,
  category: { slug: 'cafe', name: 'Café' },
  description: 'Café arábica de altura.',
};

export const sampleSummary: ProductSummary = (({ description: _description, ...summary }) => summary)(sampleProduct);

export function fakeCatalog(overrides: Partial<CatalogRepo> = {}): CatalogRepo {
  return {
    listCategories: async () => [sampleProduct.category],
    listProducts: async () => ({ items: [sampleSummary], nextCursor: null }),
    getProduct: async (slug) => (slug === sampleProduct.slug ? sampleProduct : null),
    getProductsBySlugs: async (slugs) => (slugs.includes(sampleSummary.slug) ? [sampleSummary] : []),
    ...overrides,
  };
}

/** buildApp with working fakes for every dependency; pass only what a test cares about. */
export function buildTestApp(deps: Partial<AppDeps> = {}) {
  return buildApp({ db: { ping: async () => {} }, catalog: fakeCatalog(), ...deps });
}
