# ADR-0001: Monorepo con pnpm workspaces

- **Estado:** Aceptado
- **Fecha:** 2026-11-04

## Contexto

La tienda tiene una web, una API y un contrato que ambas comparten. Personas y agentes van a trabajar en
paralelo sobre funcionalidades completas (vertical slices) que tocan las tres partes en un mismo cambio.

## Opciones consideradas

1. **Repos separados para web y API.** Despliegues independientes, pero un cambio de contrato exige PRs
   coordinados en dos repos y versionar el contrato como paquete publicado.
2. **Monorepo con pnpm workspaces.** Un PR por funcionalidad, tipos compartidos sin publicar paquetes y un
   solo lockfile. Requiere filtrar comandos por app.
3. **Monorepo con Turborepo o Nx.** Caché de tareas y grafo de dependencias, a cambio de otra herramienta que
   aprender y configurar.

## Decisión

Usamos un monorepo con pnpm workspaces: `apps/web`, `apps/api` y `packages/contracts`, enlazados con
`workspace:*`. Los scripts de la raíz corren en todas las apps con `pnpm -r`.

## Consecuencias

- Un cambio de contrato, API e interfaz va en un solo PR y se revisa junto.
- `@tienda/contracts` se consume como código fuente TypeScript: no hay paso de build ni publicación.
- Cada app mantiene su propio `package.json`, `tsconfig.json` y configuración de Vitest.
- Revisaremos agregar Turborepo si el CI pasa de 10 minutos.
