---
name: add-endpoint
description: Use when adding or changing an API endpoint in apps/api (new route, new field in a response, new query parameter, new error case). Enforces contract-first with openapi.yaml, Zod schemas that match the generated types, the single error format and an integration test.
---

# Add or change an endpoint

ADR-0003 (contract-first) applies. Never write the route before the contract.

1. **Contract.** Edit `packages/contracts/openapi.yaml`: path, `operationId`, parameters, every response
   status with a schema under `components/schemas`. Errors use the shared `Error` schema
   `{ code, message, details }` (add it to the contract the first time it is needed). Money fields are
   integers in céntimos named `*Cents`. Lists use cursor pagination (`cursor`, `limit` ≤ 50, `nextCursor`).
2. **Types.** Run `pnpm contracts:generate` and export the new types from `packages/contracts/src/index.ts`.
3. **Route.** Create or extend a plugin in `apps/api/src/routes/` that receives its dependencies through
   plugin options (see `routes/health.ts`). Declare `schema.params`/`querystring`/`body` and
   `schema.response` for every status with Zod. Add the `Equal<z.infer<…>, ContractType>` assertion for each
   response schema. Register the plugin in `src/app.ts`.
4. **Data access.** Use Prisma `select` with only the DTO fields; never return a Prisma model as is. If the
   query needs a new index or column, use the `db-change` skill first.
5. **Messages.** Client-facing error messages in Spanish (es-PE); logs in English; never log personal data.
6. **Tests.** Add `apps/api/test/<feature>.test.ts` with `buildApp` and `app.inject()`: happy path, validation
   error (400), not found (404) when applicable. Use fakes for dependencies.
7. **Verify.** `pnpm --filter @tienda/api test`, `pnpm typecheck` and `pnpm lint`. Done only when all pass.
