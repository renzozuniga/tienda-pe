# apps/api

Fastify 5 + Zod 4 + Prisma 7 on PostgreSQL. Root CLAUDE.md conventions apply.

## Commands

```bash
pnpm --filter @tienda/api dev                                        # tsx watch on :3001, reads apps/api/.env
pnpm --filter @tienda/api test                                       # vitest; no database needed
pnpm --filter @tienda/api exec prisma migrate dev --name <change>    # after editing prisma/schema.prisma
pnpm db:seed                                                         # idempotent upserts from prisma/seed.ts
```

## How the app is wired

- `src/app.ts` `buildApp(deps)` builds the app without listening; `src/server.ts` creates the real
  dependencies (Prisma, env) and calls `listen`. Tests call `buildApp` with fakes and use `app.inject()`.
- Each route is a Fastify plugin in `src/routes/` that receives its dependencies through plugin options, never
  by importing Prisma directly. Follow `routes/health.ts`.
- Validation and serialization go through `fastify-type-provider-zod`: declare `schema.response` for every
  status code. Returning a field outside the schema throws instead of leaking it.
- Next to each response schema, keep the `Equal<z.infer<…>, ContractType>` assertion against the type from
  `@tienda/contracts`.

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
