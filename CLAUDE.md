# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Online store for Peruvian products, priced in soles (PEN). pnpm workspace: `apps/web` (React + Vite),
`apps/api` (Fastify + Zod + Prisma 7 on PostgreSQL), `packages/contracts` (OpenAPI contract).
Setup and the full command list are in README.md.

## Commands

```bash
pnpm dev                                      # api :3001 + web :5173 (needs `pnpm db:up` first)
pnpm test && pnpm typecheck                   # run both before calling a change done
pnpm --filter @tienda/api test -- -t "503"    # single test by name (same pattern for @tienda/web)
pnpm --filter @tienda/api exec prisma migrate dev --name <change>   # after editing schema.prisma
pnpm contracts:generate                       # after editing openapi.yaml
```

Postgres runs in Docker on host port **5433** (5432 is taken on this machine).

## Conventions

- **Language:** all UI copy, user-facing errors and API messages in Latin American Spanish (es-PE); code,
  identifiers and routes in English.
- **Money:** always integer céntimos (`priceCents: Int`) plus `currency = "PEN"`. Never floats. Format for
  display only at the edge with `formatPEN` (`apps/web/src/lib/money.ts`).
- **Contract first:** `packages/contracts/openapi.yaml` is the source of truth. To change an endpoint, edit the
  yaml, run `pnpm contracts:generate`, then update the Zod schema in the route. Each route asserts at the type
  level that its Zod schema equals the generated contract type (see `routes/health.ts`), so drift fails
  `pnpm typecheck`. The web imports types only from `@tienda/contracts`, never from the api.

## Architecture notes

- `apps/api/src/app.ts` `buildApp(deps)` builds the Fastify app without listening. `server.ts` wires real
  dependencies (Prisma, env) and calls `listen`. Tests call `buildApp` with fakes and use `app.inject()`, so
  they need no database. New routes are Fastify plugins that receive their dependencies through options.
- Responses are validated and serialized with `fastify-type-provider-zod`, so returning a field outside the
  schema is an error, not a silent leak.
- Prisma 7: the datasource URL lives in `apps/api/prisma.config.ts`, not in `schema.prisma`. The client is
  generated into `apps/api/src/generated/prisma` (gitignored, regenerated on `pnpm install`) and needs the
  `@prisma/adapter-pg` driver adapter (see `src/db.ts`).
- Env vars are validated with Zod in `apps/api/src/env.ts`. Add new ones there and in `.env.example`.
- The web calls `/api/*`. In dev, Vite proxies that to the API and strips the `/api` prefix
  (`apps/web/vite.config.ts`). API routes themselves have no `/api` prefix.
