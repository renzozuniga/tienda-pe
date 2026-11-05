import type { HTMLAttributes } from 'react';
import { cx } from '../lib/cx';
import styles from './Card.module.css';

export type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'article' | 'section' | 'li';
  padding?: 'md' | 'compact';
  raised?: boolean;
};

export function Card({ as: Tag = 'div', padding = 'md', raised = false, className, ...rest }: CardProps) {
  return (
    <Tag
      className={cx(styles.card, padding === 'compact' && styles.compact, raised && styles.raised, className)}
      {...rest}
    />
  );
}
