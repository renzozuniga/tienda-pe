# Tienda PE

Tienda en línea de productos peruanos con precios en soles (PEN). Interfaz en español latinoamericano.

| Paquete              | Stack                                                                        |
| -------------------- | ---------------------------------------------------------------------------- |
| `apps/web`           | React 19 · Vite · TypeScript · Vitest + Testing Library                      |
| `apps/api`           | Fastify 5 · TypeScript · Zod · Prisma 7 sobre PostgreSQL · Vitest            |
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

## Documentación

- [`docs/spec.md`](docs/spec.md): problema, usuarios, alcance del MVP y lo que queda fuera.
- [`docs/glossary.md`](docs/glossary.md): términos del dominio (IGV, ubigeo, boleta…) y su nombre en el código.
- [`docs/decisions/`](docs/decisions/): decisiones de arquitectura (ADRs).

## Comandos

| Comando                       | Qué hace                                                                    |
| ----------------------------- | --------------------------------------------------------------------------- |
| `pnpm dev`                    | API y web en paralelo, con recarga en caliente                              |
| `pnpm test`                   | Vitest en todas las apps                                                    |
| `pnpm typecheck`              | `tsc --noEmit` en todo el workspace                                         |
| `pnpm lint` / `pnpm lint:fix` | ESLint en todo el workspace                                                 |
| `pnpm format`                 | Prettier sobre todo el repo                                                 |
| `pnpm check`                  | Lint, formato, typecheck y tests: lo mismo que debe pasar antes de un PR    |
| `pnpm build`                  | Compila la API (`apps/api/dist`) y la web (`apps/web/dist`)                 |
| `pnpm db:up` / `pnpm db:down` | Levanta o detiene Postgres (los datos quedan en un volumen)                 |
| `pnpm db:migrate`             | `prisma migrate dev`: crea y aplica migraciones a partir de `schema.prisma` |
| `pnpm db:seed`                | Carga productos de ejemplo                                                  |
| `pnpm contracts:generate`     | Regenera `packages/contracts/src/schema.ts` desde `openapi.yaml`            |

## Flujo de trabajo

- `main` está protegida: cada cambio va en una rama (`feat/`, `fix/`, `docs/`, `chore/`) y entra por PR con squash merge.
- Los commits siguen [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/). husky corre lint-staged
  antes de cada commit y commitlint revisa el mensaje.
- `.claude/` tiene las skills, subagents y hooks del proyecto para Claude Code; el detalle está en `CLAUDE.md`.

## API

| Método | Ruta      | Respuesta                                                                                                              |
| ------ | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/health` | `200 { status: "ok", db: "ok", uptimeSeconds }`, o `503 { status: "degraded", db: "down", … }` si Postgres no responde |

El contrato completo está en [`packages/contracts/openapi.yaml`](packages/contracts/openapi.yaml).

## Dinero

Los precios se guardan como **enteros en céntimos** (`priceCents`) con moneda `PEN`, nunca como decimales.
Para mostrarlos en la web usa `formatPEN(cents)` → `S/ 38.90`.

## CI y deploy

- **CI** (`.github/workflows/ci.yml`): en cada PR y en `main` corre instalación, tipos del contrato al día, lint,
  formato, typecheck, tests, migraciones sobre un Postgres limpio, seed y build. El job `check` es obligatorio
  para mergear. El job `audit` revisa vulnerabilidades y solo informa.
- **Deploy** ([ADR-0005](docs/decisions/0005-hosting-render-y-neon.md)): la web y la API en Render, definidas en
  `render.yaml`, y Postgres en Neon. Render despliega solo cuando el CI de `main` pasa.

Primer despliegue (una sola vez):

1. Crea un proyecto en [Neon](https://neon.com) en la región AWS us-east-1 y copia la cadena de conexión con pooling.
2. En Render, **New → Blueprint** y elige este repo. Render lee `render.yaml` y pide las variables marcadas
   `sync: false`:
   - `tienda-pe-api` → `DATABASE_URL` (la de Neon) y `WEB_ORIGIN` (la URL de `tienda-pe-web`).
   - `tienda-pe-web` → `VITE_API_URL` (la URL de `tienda-pe-api`).
3. Cuando ambos servicios estén en verde, abre la web: debe decir **API: operativa · Base de datos: operativa**.

En el plan gratuito la API se duerme tras 15 minutos sin tráfico: la primera visita después tarda cerca de un minuto.

## Problemas comunes

- **`Cannot connect to the Docker daemon`**: abre Docker Desktop y vuelve a ejecutar `pnpm db:up`.
- **`DATABASE_URL es obligatoria`**: falta `apps/api/.env` (revisa el primer paso).
- **La web dice "No pudimos conectar con la API"**: la API no está corriendo en el 3001. Mira la salida de `pnpm dev`.
