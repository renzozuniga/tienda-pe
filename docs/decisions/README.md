# Decisiones de arquitectura (ADR)

Cada decisión que cambia cómo se construye el proyecto queda en un ADR corto. Un ADR aceptado no se edita:
si la decisión cambia, se escribe uno nuevo que lo reemplaza y el anterior pasa a `Reemplazado por ADR-NNNN`.

| ADR                                    | Decisión                               | Estado   |
| -------------------------------------- | -------------------------------------- | -------- |
| [0001](0001-monorepo-pnpm.md)          | Monorepo con pnpm workspaces           | Aceptado |
| [0002](0002-dinero-en-centimos.md)     | Dinero como enteros en céntimos de sol | Aceptado |
| [0003](0003-contract-first-openapi.md) | Contract-first con OpenAPI             | Aceptado |
| [0004](0004-postgres-puerto-5433.md)   | Postgres local en Docker, puerto 5433  | Aceptado |
| [0005](0005-hosting-render-y-neon.md)  | Hosting en Render y Postgres en Neon   | Aceptado |

Para uno nuevo: copia [`0000-plantilla.md`](0000-plantilla.md) con el siguiente número y agrégalo a esta tabla
en el mismo PR.
