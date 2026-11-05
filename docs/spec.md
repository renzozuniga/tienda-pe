# Spec: Tienda PE (MVP)

> Una página. Si algo no está aquí, no es parte del MVP. Los términos en _cursiva_ están en el
> [glosario](glossary.md).

## Problema

Los pequeños productores y revendedores de productos peruanos (café, cacao, granos andinos, artesanía)
venden por WhatsApp e Instagram. El catálogo vive en fotos sueltas, los precios cambian de un chat a otro,
el _stock_ se lleva de memoria y cada pedido se arma copiando mensajes. Se pierden ventas por respuestas
lentas y se venden productos que ya no hay.

## Usuarios

| Usuario           | Contexto                                                                                                          | Lo que necesita                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Comprador**     | En Lima Metropolitana, compra desde el celular, a menudo con datos móviles. Paga con _Yape/Plin_ o transferencia. | Ver qué hay, cuánto cuesta en soles con _IGV_ incluido y pedir sin crear una cuenta. |
| **Administrador** | El dueño de la tienda, desde el celular o una laptop.                                                             | Publicar productos, mantener el stock al día y atender los pedidos en orden.         |

## Historias de usuario

1. Como **comprador**, quiero ver el catálogo por categoría con precio y disponibilidad, para decidir qué
   comprar sin preguntar por chat.
2. Como **comprador**, quiero agregar productos a un carrito y ver el total en soles, para saber cuánto voy
   a pagar antes de pedir.
3. Como **comprador**, quiero registrar mi pedido con nombre, teléfono, dirección y distrito de entrega, para
   recibir la confirmación y las instrucciones de pago.
4. Como **administrador**, quiero crear y editar productos con precio y stock, para que el catálogo refleje
   lo que realmente tengo.
5. Como **administrador**, quiero ver los pedidos por estado y marcarlos como pagados, enviados o
   cancelados, para atenderlos en orden y que el stock se actualice solo.

## Alcance del MVP

- Catálogo público con categorías, detalle de producto y estados de stock (disponible, pocas unidades,
  agotado).
- Carrito en el navegador y pedido sin cuenta. El stock se reserva al registrar el pedido y se libera si se
  cancela.
- Pedido con estados `pending_payment → paid → shipped`, o `cancelled`. El pago se coordina fuera de la app
  y el administrador lo confirma a mano.
- Entregas solo en distritos de Lima Metropolitana y el Callao, con costo de envío por distrito (_ubigeo_).
- Panel de administración con un solo usuario administrador y acceso con contraseña.
- Interfaz en español latinoamericano, mobile-first, con precios en _PEN_ e IGV incluido.

## Fuera de alcance

- Pagos en línea con tarjeta o pasarela (Culqi, Niubiz, Mercado Pago). Se evaluará después con un ADR.
- Emisión de _boleta_ o _factura_ electrónica ante SUNAT.
- Envíos a provincias, seguimiento del courier y cálculo de peso.
- Cuentas de cliente, historial de compras, cupones y programas de puntos.
- Varios administradores o roles.
- Inventario en varios almacenes.

## Requisitos antes de abrir al público

Estos requisitos no bloquean el MVP en desarrollo, pero sí el lanzamiento:

- **_Libro de Reclamaciones_ virtual**, visible en la tienda (Código de Protección y Defensa del Consumidor,
  Ley 29571).
- **Precio final con impuestos incluidos** en todo lugar donde se muestre un precio.
- **Política de privacidad** y consentimiento para usar los datos del comprador (Ley 29733 de Protección de
  Datos Personales).
- Términos de venta con política de cambios y devoluciones.

## Cómo sabremos que funciona

- Un comprador hace un pedido completo desde el celular en menos de 2 minutos.
- Ningún pedido se registra con un producto sin stock.
- El administrador atiende un pedido sin salir del panel ni copiar datos a mano.
