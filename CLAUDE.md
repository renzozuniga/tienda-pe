# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Online store for Peruvian products, priced in soles (PEN). pnpm workspace: `apps/web` (React + Vite),
`apps/api` (Fastify + Zod + Prisma 7 on PostgreSQL), `packages/contracts` (OpenAPI contract). Each app has its
own CLAUDE.md with app-specific notes. Setup and the full command list are in README.md.

Read before building a feature: `docs/spec.md` (what is in and out of the MVP), `docs/glossary.md` (domain
terms and their names in code) and `docs/decisions/` (ADRs). If a change contradicts an accepted ADR, stop and
propose a new ADR instead.

## Commands

```bash
pnpm dev                                      # api :3001 + web :5173 (needs `pnpm db:up` first)
pnpm test && pnpm typecheck                   # run both before calling a change done
pnpm --filter @tienda/api test -- -t "503"    # single test by name (same pattern for @tienda/web)
pnpm contracts:generate                       # after editing openapi.yaml
```

Postgres runs in Docker on host port **5433** (ADR-0004).

## Conventions

- **Git:** `main` is protected; work on `feat/`, `fix/`, `docs/` or `chore/` branches and merge by squash PR.
  Conventional Commits.
- **Language:** all UI copy, user-facing errors and API messages in Latin American Spanish (es-PE); code,
  identifiers and routes in English. Docs in `docs/` are in Spanish.
- **Money (ADR-0002):** always integer céntimos (`priceCents: Int`) plus `currency = "PEN"`. Stored prices
  already include IGV (18 %). Never floats; format only at display time with `formatPEN`.
- **Contract first (ADR-0003):** `packages/contracts/openapi.yaml` is the source of truth. Edit the yaml, run
  `pnpm contracts:generate`, then implement. Drift between a route's Zod schema and the contract fails
  `pnpm typecheck`. The web imports API types only from `@tienda/contracts`.
- **Scope:** online payments, SUNAT invoicing, shipping outside Lima/Callao and customer accounts are out of
  the MVP (`docs/spec.md`). Don't build them without a spec change.
