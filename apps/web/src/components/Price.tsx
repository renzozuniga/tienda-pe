import { cx } from '../lib/cx';
import { formatPEN } from '../lib/money';
import styles from './Price.module.css';

export type PriceProps = {
  /** Amount in céntimos of PEN, IGV included (ADR-0002). */
  cents: number;
  size?: 'sm' | 'md' | 'lg';
  /** Shows "IGV incluido" under the amount. */
  taxNote?: boolean;
  className?: string;
};

export function Price({ cents, size = 'md', taxNote = false, className }: PriceProps) {
  return (
    <span className={cx(styles.price, styles[size], className)}>
      <span className={styles.amount}>{formatPEN(cents)}</span>
      {taxNote && <span className={styles.note}>IGV incluido</span>}
    </span>
  );
}
