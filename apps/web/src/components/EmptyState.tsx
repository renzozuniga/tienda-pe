import type { ReactNode } from 'react';
import { cx } from '../lib/cx';
import styles from './EmptyState.module.css';

export type EmptyStateProps = {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  /** "danger" for error states, so empty and failed look different. */
  tone?: 'neutral' | 'danger';
  /** Heading level that fits the page outline. */
  headingLevel?: 2 | 3;
};

export function EmptyState({ title, description, action, tone = 'neutral', headingLevel = 3 }: EmptyStateProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <div
      className={cx(styles.empty, tone === 'danger' && styles.danger)}
      role={tone === 'danger' ? 'alert' : undefined}
    >
      <Heading className={styles.title}>{title}</Heading>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
