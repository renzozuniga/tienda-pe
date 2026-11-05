import 'dotenv/config';
import { createPrisma } from '../src/db.js';

// Sample data for development. Idempotent: upserts by slug, so it can run any number of times.
const prisma = createPrisma(process.env.DATABASE_URL ?? '');

const categories = [
  { slug: 'cafe', name: 'Café', sortOrder: 1 },
  { slug: 'cacao-y-chocolate', name: 'Cacao y chocolate', sortOrder: 2 },
  { slug: 'granos-andinos', name: 'Granos andinos', sortOrder: 3 },
  { slug: 'despensa', name: 'Despensa', sortOrder: 4 },
];

type SeedProduct = {
  slug: string;
  name: string;
  origin: string;
  priceCents: number;
  stock: number;
  category: string;
  description: string;
};

const products: SeedProduct[] = [
  {
    slug: 'cafe-chanchamayo-500g',
    name: 'Café de Chanchamayo 500 g',
    origin: 'Junín',
    priceCents: 3890,
    stock: 40,
    category: 'cafe',
    description: 'Café arábica de altura, tostado medio. Notas a chocolate y frutos secos. En grano.',
  },
  {
    slug: 'cafe-villa-rica-250g',
    name: 'Café de Villa Rica molido 250 g',
    origin: 'Pasco',
    priceCents: 2450,
    stock: 4,
    category: 'cafe',
    description: 'Molienda media para cafetera de filtro o prensa francesa.',
  },
  {
    slug: 'cafe-tunki-500g',
    name: 'Café de Sandia 500 g',
    origin: 'Puno',
    priceCents: 5200,
    stock: 18,
    category: 'cafe',
    description: 'Café de los valles de Sandia, tostado claro. Acidez brillante y cuerpo ligero.',
  },
  {
    slug: 'chocolate-cusco-70',
    name: 'Chocolate 70 % cacao de Cusco',
    origin: 'Cusco',
    priceCents: 1250,
    stock: 120,
    category: 'cacao-y-chocolate',
    description: 'Tableta de 80 g elaborada con cacao chuncho de La Convención.',
  },
  {
    slug: 'chocolate-piura-blanco',
    name: 'Cacao blanco de Piura 80 g',
    origin: 'Piura',
    priceCents: 1490,
    stock: 3,
    category: 'cacao-y-chocolate',
    description: 'Tableta al 65 % con cacao blanco de Piura. Sabor suave y floral.',
  },
  {
    slug: 'nibs-cacao-200g',
    name: 'Nibs de cacao 200 g',
    origin: 'San Martín',
    priceCents: 1890,
    stock: 0,
    category: 'cacao-y-chocolate',
    description: 'Trozos de cacao tostado para yogur, avena o repostería.',
  },
  {
    slug: 'quinua-blanca-1kg',
    name: 'Quinua blanca de Puno 1 kg',
    origin: 'Puno',
    priceCents: 1590,
    stock: 80,
    category: 'granos-andinos',
    description: 'Quinua lavada y lista para cocinar.',
  },
  {
    slug: 'quinua-roja-500g',
    name: 'Quinua roja 500 g',
    origin: 'Ayacucho',
    priceCents: 1190,
    stock: 25,
    category: 'granos-andinos',
    description: 'Grano firme que no se deshace, ideal para ensaladas.',
  },
  {
    slug: 'kiwicha-500g',
    name: 'Kiwicha 500 g',
    origin: 'Arequipa',
    priceCents: 990,
    stock: 30,
    category: 'granos-andinos',
    description: 'Kiwicha natural para graneado, sopas o reventada.',
  },
  {
    slug: 'canihua-500g',
    name: 'Cañihua 500 g',
    origin: 'Puno',
    priceCents: 1350,
    stock: 2,
    category: 'granos-andinos',
    description: 'Grano andino tostado y molido, listo para bebidas calientes.',
  },
  {
    slug: 'maiz-morado-1kg',
    name: 'Maíz morado 1 kg',
    origin: 'Áncash',
    priceCents: 890,
    stock: 50,
    category: 'despensa',
    description: 'Mazorcas enteras para chicha morada y mazamorra.',
  },
  {
    slug: 'aji-amarillo-pasta-200g',
    name: 'Pasta de ají amarillo 200 g',
    origin: 'Lima',
    priceCents: 790,
    stock: 60,
    category: 'despensa',
    description: 'Ají amarillo licuado sin conservantes. Refrigerar después de abrir.',
  },
  {
    slug: 'sal-maras-500g',
    name: 'Sal de Maras 500 g',
    origin: 'Cusco',
    priceCents: 1100,
    stock: 22,
    category: 'despensa',
    description: 'Sal rosada de las salineras de Maras, en cristales.',
  },
  {
    slug: 'miel-de-abeja-500g',
    name: 'Miel de abeja de Oxapampa 500 g',
    origin: 'Pasco',
    priceCents: 2290,
    stock: 14,
    category: 'despensa',
    description: 'Miel multifloral de bosque de neblina, sin pasteurizar.',
  },
];

const categoryIds = new Map<string, string>();
for (const c of categories) {
  const row = await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c, select: { id: true } });
  categoryIds.set(c.slug, row.id);
}

for (const { category, ...p } of products) {
  const categoryId = categoryIds.get(category);
  if (!categoryId) throw new Error(`Categoría desconocida en el seed: ${category}`);
  const data = { ...p, categoryId };
  await prisma.product.upsert({ where: { slug: p.slug }, update: data, create: data });
}

// The add_categories migration parks pre-existing products in "otros"; drop it once it is empty.
await prisma.category.deleteMany({ where: { slug: 'otros', products: { none: {} } } });

console.log(`Seed listo: ${categories.length} categorías y ${products.length} productos.`);
await prisma.$disconnect();
