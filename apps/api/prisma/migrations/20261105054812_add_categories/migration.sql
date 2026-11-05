-- Catalog categories, product origin, catalog indexes and money/stock CHECK constraints.
-- Edited by hand (db-change skill) so it also applies to databases that already have products.

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- Existing products need a category before the column becomes required.
INSERT INTO "categories" ("id", "slug", "name", "sortOrder", "updatedAt")
SELECT 'cat_otros', 'otros', 'Otros', 999, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "products");

-- AlterTable
ALTER TABLE "products" ADD COLUMN "categoryId" TEXT,
ADD COLUMN "origin" TEXT;

UPDATE "products" SET "categoryId" = 'cat_otros' WHERE "categoryId" IS NULL;

ALTER TABLE "products" ALTER COLUMN "categoryId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "products_active_name_id_idx" ON "products"("active", "name", "id");

-- CreateIndex
CREATE INDEX "products_categoryId_active_name_id_idx" ON "products"("categoryId", "active", "name", "id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Business rules (ADR-0002): money and stock can never be negative.
ALTER TABLE "products" ADD CONSTRAINT "products_price_cents_check" CHECK ("priceCents" >= 0);
ALTER TABLE "products" ADD CONSTRAINT "products_stock_check" CHECK ("stock" >= 0);
