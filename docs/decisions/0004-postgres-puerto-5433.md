# ADR-0004: Postgres local en Docker, puerto 5433

- **Estado:** Aceptado
- **Fecha:** 2026-11-04

## Contexto

La API necesita PostgreSQL en desarrollo y en los tests de integración. En la máquina de desarrollo el puerto
5432 ya lo usa otra instancia de Postgres.

## Opciones consideradas

1. **Postgres instalado en la máquina.** Sin Docker, pero cada persona tiene una versión y configuración
   distintas.
2. **Docker en el puerto 5432.** Choca con la instancia existente.
3. **Docker en el puerto 5433, configurable.** Misma versión para todos y sin conflictos.

## Decisión

`docker-compose.yml` levanta `postgres:16-alpine` y lo publica en `${POSTGRES_PORT:-5433}`. `DATABASE_URL` en
`apps/api/.env.example` apunta a `localhost:5433`. Las credenciales `tienda`/`tienda` son solo para desarrollo
local.

## Consecuencias

- `pnpm bootstrap` funciona igual en cualquier máquina con Docker.
- Quien tenga el 5433 ocupado define `POSTGRES_PORT` y ajusta `DATABASE_URL`.
- Producción usa un Postgres administrado con sus propias credenciales; la decisión de hosting va en otro ADR.
