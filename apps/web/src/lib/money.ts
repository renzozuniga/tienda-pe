const pen = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });

/** Formatea céntimos de sol para mostrar al usuario: 3890 → "S/ 38.90". */
export function formatPEN(cents: number): string {
  if (!Number.isInteger(cents)) throw new Error('El monto debe estar en céntimos (entero)');
  return pen.format(cents / 100);
}
