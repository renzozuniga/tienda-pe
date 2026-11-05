## Qué

<!-- Qué cambia, en 2 o 3 líneas. Enlaza la historia de docs/spec.md o el issue si existe. -->

## Por qué

<!-- El problema que resuelve o la decisión detrás. Si contradice un ADR, enlaza el ADR nuevo. -->

## Cómo probarlo

<!-- Pasos concretos: comandos, URL, datos de prueba. -->

## Capturas

<!-- Para cambios de UI: a 400 px y en escritorio, claro y oscuro. Borra la sección si no aplica. -->

## Checklist

- [ ] `pnpm check` en verde (lint, formato, typecheck y tests)
- [ ] El contrato (`openapi.yaml`) se actualizó antes que el código, si cambió la API
- [ ] Hay una migración nueva, si cambió `schema.prisma`
- [ ] Textos al usuario en español (es-PE) y montos en céntimos
- [ ] Pasó el subagent `reviewer` y se resolvieron los hallazgos altos
