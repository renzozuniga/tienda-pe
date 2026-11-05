# apps/web

React 19 + Vite + TypeScript, tested with Vitest + Testing Library on jsdom. Root CLAUDE.md conventions apply.

## Commands

```bash
pnpm --filter @tienda/web dev          # :5173, proxies /api/* to the API on :3001
pnpm --filter @tienda/web test         # vitest run
pnpm --filter @tienda/web build        # tsc --noEmit + vite build
```

## How the app talks to the API

- All requests go through `src/lib/api.ts` using types from `@tienda/contracts`. Don't call `fetch` from
  components.
- The client calls `/api/*`. In dev, Vite strips the prefix and proxies to the API (`vite.config.ts`). In other
  environments, set `VITE_API_URL`.
- Some endpoints return a useful body with a non-2xx status (`/health` returns 503 with `degraded`). Handle the
  documented statuses explicitly instead of throwing on any non-2xx.

## UI rules

- Mobile-first: every screen must work at 400 px wide.
- Every screen that loads data has loading, empty and error states.
- Prices always come in céntimos and are shown with `formatPEN` (`src/lib/money.ts`). Intl separates `S/` from
  the amount with a non-breaking space (U+00A0); tests must expect it.
- Copy is in Latin American Spanish, addressing the buyer as "tú".
- Tests mock `fetch` with `vi.stubGlobal` and assert on what the user sees, not on implementation details.
