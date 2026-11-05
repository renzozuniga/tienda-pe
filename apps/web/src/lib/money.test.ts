import { formatPEN } from './money';

describe('formatPEN', () => {
  // Intl separa "S/" del monto con un espacio no separable (U+00A0).
  it('formatea céntimos como soles', () => {
    expect(formatPEN(3890)).toBe('S/\u00a038.90');
    expect(formatPEN(123456)).toBe('S/\u00a01,234.56');
    expect(formatPEN(0)).toBe('S/\u00a00.00');
  });

  it('rechaza montos que no están en céntimos', () => {
    expect(() => formatPEN(38.9)).toThrow();
  });
});
