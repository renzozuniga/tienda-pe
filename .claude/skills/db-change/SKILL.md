---
name: db-change
description: Use when changing the database schema in apps/api/prisma/schema.prisma (new model, column, relation, index or constraint) or when a query needs a new index. Ensures a named migration, constraints for business rules, indexes for real queries and an updated seed.
---

# Change the database

Never change the database by hand and never edit a migration that is already in `main`.

1. **Model by queries.** Write down the queries the feature runs (filters, sort, joins). Every filter or
   sort column on a list gets an index (`@@index`), and every natural key gets `@unique`.
2. **Edit `schema.prisma`.** Names in English, `camelCase` fields mapped to `snake_case` with `@map` /
   `@@map`. Money as `Int` in céntimos (`*Cents`, ADR-0002). Timestamps `createdAt`/`updatedAt`.
3. **Create the migration.**
   `pnpm --filter @tienda/api exec prisma migrate dev --name <verb_object>` (for example `add_categories`).
4. **Business rules as constraints.** Prisma can't declare `CHECK`; add them by editing the new
   `migration.sql` before it is applied anywhere else, for example
   `ALTER TABLE "products" ADD CONSTRAINT "products_price_cents_check" CHECK ("priceCents" >= 0);`.
   Required: money ≥ 0 and stock ≥ 0. Then run `prisma migrate reset` locally to replay it.
5. **Seed.** Update `apps/api/prisma/seed.ts` so `pnpm db:seed` stays idempotent (upserts by natural key).
6. **Verify.** `pnpm db:migrate` on a clean database, `pnpm db:seed` twice, `pnpm typecheck`,
   `pnpm --filter @tienda/api test`.
7. **Document.** If the change alters a decision (new data store, soft deletes, multi-currency), write an
   ADR in `docs/decisions/`.
