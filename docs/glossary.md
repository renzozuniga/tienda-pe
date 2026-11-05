# Glosario

Términos del dominio y del proyecto. Cuando el código usa un nombre en inglés, aparece en la columna
**En el código**.

## Dinero e impuestos

| Término | Significado | En el código |
| --- | --- | --- |
| **PEN** | Código ISO 4217 del sol peruano. Se muestra como `S/`. | `currency: "PEN"` |
| **Sol** | Moneda del Perú. 1 sol = 100 céntimos. | — |
| **Céntimo** | La unidad mínima del sol. Todos los montos se guardan y calculan en céntimos, como enteros. | `priceCents`, `totalCents` |
| **IGV** | Impuesto General a las Ventas: 18 % (16 % de IGV más 2 % de Impuesto de Promoción Municipal). El precio que ve el comprador siempre lo incluye. | `IGV_RATE` (cuando exista) |
| **Valor de venta** | Precio sin IGV. Solo se calcula si hace falta desglosar el impuesto. | — |
| **Precio de venta** | Precio final con IGV. Es el que se guarda y se muestra. | `priceCents` |

## Comprobantes y documentos

| Término | Significado | En el código |
| --- | --- | --- |
| **Boleta de venta** | Comprobante para consumidores finales. Fuera de alcance del MVP. | — |
| **Factura** | Comprobante para empresas o personas con RUC; permite usar el IGV como crédito fiscal. Fuera de alcance del MVP. | — |
| **SUNAT** | Superintendencia Nacional de Aduanas y de Administración Tributaria. Autoriza la emisión de comprobantes electrónicos. | — |
| **DNI** | Documento Nacional de Identidad: 8 dígitos. | `documentNumber` (cuando exista) |
| **RUC** | Registro Único de Contribuyentes: 11 dígitos. Empieza con 10 para personas naturales y con 20 para empresas. | — |

## Comprador y entregas

| Término | Significado | En el código |
| --- | --- | --- |
| **Ubigeo** | Código del INEI para ubicar un lugar del Perú: 2 dígitos de departamento, 2 de provincia y 2 de distrito (`150101` = Lima, Lima, Lima). | `ubigeo` |
| **Lima Metropolitana** | Los 43 distritos de la provincia de Lima. Junto con el Callao, es la zona de entrega del MVP. | — |
| **Costo de envío** | Monto en céntimos que depende del distrito de entrega. | `shippingCents` |
| **Yape / Plin** | Billeteras móviles para pagar con el número de celular. En el MVP el pago se hace fuera de la app y se confirma a mano. | — |

## Catálogo y pedidos

| Término | Significado | En el código |
| --- | --- | --- |
| **Producto** | Algo que se vende, con nombre, precio, stock y categoría. | `Product` |
| **Slug** | Identificador legible y único de un producto en la URL (`cafe-chanchamayo-500g`). | `slug` |
| **SKU** | Código interno de inventario. Se agregará si un producto tiene variantes (peso, tamaño). | — |
| **Stock** | Unidades disponibles para vender. Nunca puede ser negativo. | `stock` |
| **Pocas unidades** | Stock mayor que 0 y menor o igual que el umbral (5 por defecto). | `low_stock` |
| **Agotado** | Stock igual a 0. El producto se sigue mostrando, pero no se puede agregar al carrito. | `sold_out` |
| **Pedido** | Solicitud de compra de un comprador, con sus líneas, total y datos de entrega. | `Order` |
| **Línea de pedido** | Un producto dentro de un pedido, con la cantidad y el precio unitario al momento de comprar. | `OrderItem` |
| **Estado del pedido** | `pending_payment` (registrado, esperando el pago), `paid`, `shipped` y `cancelled`. | `OrderStatus` |

## Consumidor y datos personales

| Término | Significado |
| --- | --- |
| **Libro de Reclamaciones** | Registro obligatorio donde el consumidor deja quejas y reclamos. Una tienda en línea debe tener su versión virtual. Lo supervisa el Indecopi. |
| **Indecopi** | Instituto Nacional de Defensa de la Competencia y de la Protección de la Propiedad Intelectual. Protege al consumidor. |
| **Ley 29571** | Código de Protección y Defensa del Consumidor. |
| **Ley 29733** | Ley de Protección de Datos Personales. Regula cómo se piden, guardan y usan los datos del comprador. |

## Proyecto

| Término | Significado |
| --- | --- |
| **Contrato** | `packages/contracts/openapi.yaml`. Define cada endpoint antes de implementarlo. |
| **Walking skeleton** | La versión mínima del sistema funcionando de punta a punta: hoy, la web consultando `GET /health`. |
| **Vertical slice** | Una funcionalidad completa que atraviesa contrato, base de datos, API, interfaz y tests. |
| **ADR** | Architecture Decision Record. Nota corta con contexto, decisión y consecuencias, en `docs/decisions/`. |
