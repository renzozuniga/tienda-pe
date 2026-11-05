# apps/api

Fastify 5 + Zod 4 + Prisma 7 on PostgreSQL. Root CLAUDE.md conventions apply.

## Commands

```bash
pnpm --filter @tienda/api dev                                        # tsx watch on :3001, reads apps/api/.env
pnpm --filter @tienda/api test                                       # vitest (route tests use fakes; *.int.test.ts uses Postgres)
pnpm --filter @tienda/api exec prisma migrate dev --name <change>    # after editing prisma/schema.prisma
pnpm --filter @tienda/api exec prisma generate                       # Prisma 7: migrate dev no longer generates
pnpm db:seed                                                         # idempotent upserts from prisma/seed.ts
```

## How the app is wired

- `src/app.ts` `buildApp(deps)` builds the app without listening; `src/server.ts` creates the real
  dependencies (Prisma, env) and calls `listen`. Tests use `buildTestApp` from `test/helpers.ts` (fakes for
  every dependency) and `app.inject()`.
- Each feature has a repository interface (`src/catalog/repo.ts`: `CatalogRepo` plus its Prisma implementation)
  and a route plugin in `src/routes/` that receives the repository through plugin options. Routes never import
  Prisma. Repositories `select` only the DTO fields and map rows to contract types.
- Zod schemas live next to the feature (`src/catalog/schemas.ts`). Every schema that a response uses has a
  `contractMatches<z.infer<…>, ContractType>(true)` line (`src/lib/contract.ts`), so drift fails typecheck.
- Validation and serialization go through `fastify-type-provider-zod`: declare `schema.response` for every
  status code, spreading `errorResponses`. Returning a field outside the schema answers 500 instead of leaking.
- `src/lib/errors.ts` is the single error format `{ code, message, details? }`: validation errors become 400
  `VALIDATION_ERROR` with Spanish messages (Zod's `es` locale), unknown routes 404, anything else 500
  `INTERNAL_ERROR` without internal details.
- `src/app.ts` registers helmet (security headers), rate limiting (per IP, `/health` exempt, in-memory store) and
  compression. Behind Render, `TRUST_PROXY=true` makes limits use the buyer's IP from `X-Forwarded-For`.
- Integration tests (`*.int.test.ts`) create their own uniquely named rows and delete them; they skip when
  `DATABASE_URL` is not set. Test files run sequentially (`fileParallelism: false`).

## Prisma 7

- The datasource URL lives in `prisma.config.ts`, not in `schema.prisma`.
- The client is generated into `src/generated/prisma` (gitignored, regenerated on `pnpm install`). Import it
  from `./generated/prisma/client.js`, never edit it.
- The client needs the `@prisma/adapter-pg` driver adapter; build it with `createPrisma` in `src/db.ts`.
- Never change the database by hand or edit an applied migration: create a new migration.

## Rules

- Env vars are validated in `src/env.ts`; add new ones there and in `.env.example`.
- Error messages returned to clients are in Spanish; log messages are in English.
- Never log personal data (names, phone numbers, addresses, DNI).
- Imports use `.js` extensions (NodeNext ESM).
