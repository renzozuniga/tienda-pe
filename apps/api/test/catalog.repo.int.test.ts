/**
 * Integration test of the Prisma catalog repository against a real Postgres (local Docker or the CI service).
 * It creates its own uniquely named rows and deletes them afterwards, so it never touches seed data.
 */
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prismaCatalogRepo } from '../src/catalog/repo.js';
import { createPrisma } from '../src/db.js';

const url = process.env.DATABASE_URL;

describe.skipIf(!url)('prismaCatalogRepo (Postgres)', () => {
  const prisma = createPrisma(url ?? '');
  const repo = prismaCatalogRepo(prisma);
  const tag = `t${randomUUID().slice(0, 8)}`;
  const category = `${tag}-cat`;

  beforeAll(async () => {
    const cat = await prisma.category.create({ data: { slug: category, name: 'Prueba', sortOrder: 0 } });
    const base = { priceCents: 1000, stock: 5, categoryId: cat.id, origin: 'Lima' };
    await prisma.product.createMany({
      data: [
        { ...base, slug: `${tag}-c`, name: `${tag} Charqui` },
        { ...base, slug: `${tag}-a`, name: `${tag} Algarrobina` },
        { ...base, slug: `${tag}-b`, name: `${tag} Barquillo`, description: 'Crocante' },
        { ...base, slug: `${tag}-z`, name: `${tag} Zapallo`, active: false },
      ],
    });
  });

  afterAll(async () => {
    await prisma.product.deleteMany({ where: { slug: { startsWith: tag } } });
    await prisma.category.deleteMany({ where: { slug: category } });
    await prisma.$disconnect();
  });

  it('pages through active products of a category, sorted by name', async () => {
    const first = await repo.listProducts({ category, limit: 2 });
    expect(first.items.map((p) => p.slug)).toEqual([`${tag}-a`, `${tag}-b`]);
    expect(first.nextCursor).toEqual(expect.any(String));

    const second = await repo.listProducts({ category, limit: 2, cursor: first.nextCursor! });
    expect(second.items.map((p) => p.slug)).toEqual([`${tag}-c`]);
    expect(second.nextCursor).toBeNull();
  });

  it('never returns inactive products', async () => {
    const all = await repo.listProducts({ category, limit: 50 });
    expect(all.items.map((p) => p.slug)).not.toContain(`${tag}-z`);
    expect(await repo.getProduct(`${tag}-z`)).toBeNull();
  });

  it('returns the detail with category and description', async () => {
    expect(await repo.getProduct(`${tag}-b`)).toEqual({
      slug: `${tag}-b`,
      name: `${tag} Barquillo`,
      origin: 'Lima',
      priceCents: 1000,
      currency: 'PEN',
      stock: 5,
      category: { slug: category, name: 'Prueba' },
      description: 'Crocante',
    });
  });

  it('lists only categories with active products', async () => {
    const slugs = (await repo.listCategories()).map((c) => c.slug);
    expect(slugs).toContain(category);
  });
});
