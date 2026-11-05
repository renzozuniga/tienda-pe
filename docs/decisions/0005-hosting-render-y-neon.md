# ADR-0005: Hosting en Render y Postgres en Neon

- **Estado:** Aceptado
- **Fecha:** 2026-11-05

## Contexto

Queremos el walking skeleton desplegado antes de la primera feature y a costo cero mientras se aprende. La web es
un sitio estático (Vite), la API es un servidor Node que necesita PostgreSQL y la tienda vende productos, así que
cualquier plan que prohíba el uso comercial obliga a migrar antes de abrir al público.

Datos revisados el 2026-11-05 en la documentación oficial:

| Opción                         | Plan gratuito                                                                           | Restricción que importa                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Vercel Hobby (web)             | CDN y builds gratuitos                                                                  | Solo uso personal y no comercial ([fair use](https://vercel.com/docs/plans/hobby)).                       |
| Render, sitio estático (web)   | Gratis en CDN global ([docs](https://render.com/docs/free))                             | Consume el ancho de banda incluido del workspace.                                                         |
| Render, web service free (API) | 750 horas de instancia al mes                                                           | Se duerme tras 15 min sin tráfico y tarda ~1 min en despertar; sin pre-deploy; "no usar para producción". |
| Render Postgres free           | 1 GB                                                                                    | **Vence a los 30 días**, con 14 días de gracia antes de borrarse; sin backups.                            |
| Neon Free                      | 1 GB por proyecto, 100 CU-hora al mes, permanente ([pricing](https://neon.com/pricing)) | Se suspende tras 5 min sin uso (arranque en frío al primer query).                                        |
| Supabase Free                  | 500 MB por proyecto, 2 proyectos activos ([pricing](https://supabase.com/pricing))      | Se pausa tras 1 semana de inactividad.                                                                    |

## Opciones consideradas

1. **Vercel (web) + Render (API) + Render Postgres.** Dos plataformas y una base de datos que vence al mes.
2. **Render (web y API) + Render Postgres.** Una plataforma, pero la base vence cada 30 días.
3. **Render (web y API) + Neon.** Una plataforma para el código, definida en `render.yaml`, y una base gratuita
   que no vence y no se pausa por semanas.

## Decisión

Usamos la opción 3. `render.yaml` define `tienda-pe-api` (web service Node, región `virginia`, la más cercana a
Lima) y `tienda-pe-web` (sitio estático con rewrite a `index.html` y headers de seguridad). La base de datos es un
proyecto de Neon; su cadena de conexión se carga una vez como `DATABASE_URL` en Render. Los deploys se disparan
solo cuando el CI de `main` está en verde (`autoDeployTrigger: checksPass`).

Como el plan gratuito de Render no tiene pre-deploy, `prisma migrate deploy` corre en el `startCommand`, antes de
levantar la API.

## Consecuencias

- Costo cero durante el desarrollo, con la configuración versionada en el repo.
- La primera visita después de 15 minutos sin tráfico tarda ~1 minuto (API dormida) y la primera consulta a la
  base, algo más (Neon suspendida). Es aceptable para el walking skeleton, no para compradores reales.
- Las migraciones corren en cada arranque. `migrate deploy` es idempotente, pero una migración larga retrasa el
  arranque; en un plan de pago pasará a `preDeployCommand`.
- **Antes de abrir al público** (requisitos de `docs/spec.md`): pasar la API a una instancia de pago sin
  suspensión y con pre-deploy, y la base a un plan con backups. Esa decisión irá en un ADR nuevo con los costos
  del momento.
- Revisaremos esta decisión si cambian los límites de los planes gratuitos o si la API necesita otra región.
