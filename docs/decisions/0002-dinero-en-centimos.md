# ADR-0002: Dinero como enteros en céntimos de sol

- **Estado:** Aceptado
- **Fecha:** 2026-11-04

## Contexto

La tienda cobra en soles (PEN) y el precio que ve el comprador debe incluir el IGV. JavaScript representa los
números como punto flotante binario: `0.1 + 0.2` da `0.30000000000000004`, y esos errores se acumulan al
sumar líneas de un pedido, aplicar descuentos o desglosar impuestos.

## Opciones consideradas

1. **`Decimal` en Postgres y `number` en JS.** El error de redondeo reaparece apenas el valor llega a JS.
2. **Librería de decimales (decimal.js, dinero.js).** Precisa, pero obliga a envolver cada operación y a
   serializar los valores como texto en la API.
3. **Enteros en céntimos.** Exacto para sumas y multiplicaciones por cantidades, y simple en JSON y en la base
   de datos.

## Decisión

Todo monto se guarda, se calcula y viaja por la API como un entero en céntimos (`priceCents`, `totalCents`,
`shippingCents`), acompañado de `currency = "PEN"`. El precio guardado ya incluye IGV. La conversión a soles
ocurre solo al mostrar, con `formatPEN` en la web.

## Consecuencias

- Las sumas de un pedido son exactas y los tests comparan enteros.
- Desglosar el IGV (valor de venta = precio / 1.18) produce fracciones: se redondea una sola vez, al final, y
  la regla de redondeo se documenta junto al cálculo.
- Los campos de dinero llevarán `CHECK (… >= 0)` en la base de datos; hoy `priceCents` todavía no lo tiene.
- Revisaremos esta decisión si la tienda vende en más de una moneda.
