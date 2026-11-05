# ADR-0003: Contract-first con OpenAPI

- **Estado:** Aceptado
- **Fecha:** 2026-11-04

## Contexto

La web y la API las escriben personas y agentes en paralelo. Si el contrato vive solo en el código de la API,
la web se entera de un cambio cuando falla en producción, y un agente puede inventar campos que no existen.

## Opciones consideradas

1. **Code-first:** generar el OpenAPI desde las rutas de Fastify. El contrato cambia como efecto secundario de
   un cambio de código y nadie lo revisa por separado.
2. **Contract-first:** escribir `openapi.yaml` primero y generar tipos para la web. El contrato se revisa en el
   PR antes de implementar.
3. **tRPC o tipos compartidos sin contrato.** Muy cómodo entre TypeScript, pero no deja un contrato que otros
   clientes (una app móvil, un tercero) puedan leer.

## Decisión

`packages/contracts/openapi.yaml` es la fuente de verdad. Para cambiar un endpoint: se edita el YAML, se
corre `pnpm contracts:generate` y luego se implementa. Cada ruta de la API declara su esquema Zod y comprueba en
tiempo de compilación que su tipo es igual al generado desde el contrato. La web importa tipos solo desde
`@tienda/contracts`.

## Consecuencias

- Si la API se aparta del contrato, `pnpm typecheck` falla.
- La web puede avanzar contra el contrato antes de que exista la implementación.
- El esquema Zod y el YAML se escriben dos veces. Lo aceptamos a cambio de que el contrato sea legible y se
  revise aparte.
- Falta un diff del contrato en CI (oasdiff) que marque cambios incompatibles. Se agrega con el pipeline.
