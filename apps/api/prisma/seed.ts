import 'dotenv/config';
import { createPrisma } from '../src/db.js';

const prisma = createPrisma(process.env.DATABASE_URL ?? '');

const products = [
  { slug: 'cafe-chanchamayo-500g', name: 'Café de Chanchamayo 500 g', priceCents: 3890, stock: 40 },
  { slug: 'chocolate-cusco-70', name: 'Chocolate 70 % cacao de Cusco', priceCents: 1250, stock: 120 },
  { slug: 'quinua-blanca-1kg', name: 'Quinua blanca de Puno 1 kg', priceCents: 1590, stock: 80 },
];

for (const p of products) {
  await prisma.product.upsert({ where: { slug: p.slug }, update: p, create: p });
}
console.log(`Seed listo: ${products.length} productos.`);
await prisma.$disconnect();
