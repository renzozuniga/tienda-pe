import styles from './QuantityStepper.module.css';

export type QuantityStepperProps = {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  /** What is being counted, for screen readers: "Café de Chanchamayo 500 g". */
  label: string;
  disabled?: boolean;
};

/** − value + control with 44 px-wide touch targets. The value is announced through aria-live. */
export function QuantityStepper({ value, min = 1, max, onChange, label, disabled = false }: QuantityStepperProps) {
  return (
    <div className={styles.stepper} role="group" aria-label={`Cantidad de ${label}`}>
      <button
        type="button"
        className={styles.step}
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
        aria-label={`Quitar una unidad de ${label}`}
      >
        −
      </button>
      <output className={styles.value} aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={styles.step}
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label={`Agregar una unidad de ${label}`}
      >
        +
      </button>
    </div>
  );
}
