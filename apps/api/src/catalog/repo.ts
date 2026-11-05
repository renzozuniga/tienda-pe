import type { Category, ProductDetail, ProductPage, ProductSummary } from '@tienda/contracts';
import type { PrismaClient } from '../generated/prisma/client.js';
import type { ListProductsInput } from './schemas.js';

/** What the catalog routes need from storage. Tests pass a fake; server.ts passes the Prisma one. */
export type CatalogRepo = {
  listCategories(): Promise<Category[]>;
  listProducts(input: ListProductsInput): Promise<ProductPage>;
  getProduct(slug: string): Promise<ProductDetail | null>;
  /** Active products among the given slugs, in no particular order. Unknown or inactive slugs are left out. */
  getProductsBySlugs(slugs: string[]): Promise<ProductSummary[]>;
};

const summarySelect = {
  id: true,
  slug: true,
  name: true,
  origin: true,
  priceCents: true,
  currency: true,
  stock: true,
  category: { select: { slug: true, name: true } },
} as const;

type SummaryRow = {
  slug: string;
  name: string;
  origin: string | null;
  priceCents: number;
  currency: string;
  stock: number;
  category: Category;
};

function toSummary({ slug, name, origin, priceCents, currency, stock, category }: SummaryRow): ProductSummary {
  if (currency !== 'PEN') throw new Error(`Unsupported currency ${currency} for product ${slug}`);
  return { slug, name, origin, priceCents, currency, stock, category };
}

export function prismaCatalogRepo(prisma: PrismaClient): CatalogRepo {
  return {
    async listCategories() {
      return prisma.category.findMany({
        where: { products: { some: { active: true } } },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select: { slug: true, name: true },
      });
    },

    async listProducts({ category, cursor, limit }) {
      // Fetch one extra row to know whether there is a next page. The cursor is the last product's id.
      const rows = await prisma.product.findMany({
        where: { active: true, ...(category ? { category: { slug: category } } : {}) },
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        select: summarySelect,
      });
      const page = rows.slice(0, limit);
      const nextCursor = rows.length > limit ? (page.at(-1)?.id ?? null) : null;
      return { items: page.map(toSummary), nextCursor };
    },

    async getProduct(slug) {
      const row = await prisma.product.findFirst({
        where: { slug, active: true },
        select: { ...summarySelect, description: true },
      });
      return row ? { ...toSummary(row), description: row.description } : null;
    },

    async getProductsBySlugs(slugs) {
      if (slugs.length === 0) return [];
      const rows = await prisma.product.findMany({
        where: { slug: { in: slugs }, active: true },
        select: summarySelect,
      });
      return rows.map(toSummary);
    },
  };
}
