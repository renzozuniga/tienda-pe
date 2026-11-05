# Tienda PE

Tienda en línea de productos peruanos con precios en soles (PEN). Interfaz en español latinoamericano.

| Paquete | Stack |
| --- | --- |
| `apps/web` | React 19 · Vite · TypeScript · Vitest + Testing Library |
| `apps/api` | Fastify 5 · TypeScript · Zod · Prisma 7 sobre PostgreSQL · Vitest |
| `packages/contracts` | `openapi.yaml` (contrato de la API) + tipos generados con openapi-typescript |

## Levantarlo en 5 minutos

**Requisitos:** Node 22+, pnpm 10+ y Docker Desktop abierto.

```bash
cp apps/api/.env.example apps/api/.env
```

```bash
pnpm bootstrap  # instala dependencias, levanta Postgres, aplica migraciones y carga datos de ejemplo
```

```bash
pnpm dev        # API en http://localhost:3001 · web en http://localhost:5173
```

Abre http://localhost:5173: debe decir **API: operativa · Base de datos: operativa**.
También puedes probar la API directamente con `curl http://localhost:3001/health`.

> Postgres corre en el puerto **5433** del host, para no chocar con un Postgres local en el 5432.
> Para cambiarlo, define `POSTGRES_PORT` al levantar Docker y ajusta `DATABASE_URL` en `apps/api/.env`.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | API y web en paralelo, con recarga en caliente |
| `pnpm test` | Vitest en todas las apps |
| `pnpm typecheck` | `tsc --noEmit` en todo el workspace |
| `pnpm build` | Compila la API (`apps/api/dist`) y la web (`apps/web/dist`) |
| `pnpm db:up` / `pnpm db:down` | Levanta o detiene Postgres (los datos quedan en un volumen) |
| `pnpm db:migrate` | `prisma migrate dev`: crea y aplica migraciones a partir de `schema.prisma` |
| `pnpm db:seed` | Carga productos de ejemplo |
| `pnpm contracts:generate` | Regenera `packages/contracts/src/schema.ts` desde `openapi.yaml` |

## API

| Método | Ruta | Respuesta |
| --- | --- | --- |
| `GET` | `/health` | `200 { status: "ok", db: "ok", uptimeSeconds }`, o `503 { status: "degraded", db: "down", … }` si Postgres no responde |

El contrato completo está en [`packages/contracts/openapi.yaml`](packages/contracts/openapi.yaml).

## Dinero

Los precios se guardan como **enteros en céntimos** (`priceCents`) con moneda `PEN`, nunca como decimales.
Para mostrarlos en la web usa `formatPEN(cents)` → `S/ 38.90`.

## Problemas comunes

- **`Cannot connect to the Docker daemon`**: abre Docker Desktop y vuelve a ejecutar `pnpm db:up`.
- **`DATABASE_URL es obligatoria`**: falta `apps/api/.env` (revisa el primer paso).
- **La web dice "No pudimos conectar con la API"**: la API no está corriendo en el 3001. Mira la salida de `pnpm dev`.
