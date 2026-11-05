import type { CSSProperties } from 'react';
import { cx } from '../lib/cx';
import styles from './Skeleton.module.css';

export type SkeletonProps = {
  variant?: 'block' | 'text' | 'circle';
  /** Match the size of the content it replaces to avoid layout shift (CLS). */
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  className?: string;
};

/** Decorative placeholder. The container that is loading should carry aria-busy and a status message. */
export function Skeleton({ variant = 'block', width = '100%', height, className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(styles.skeleton, variant === 'text' && styles.text, variant === 'circle' && styles.circle, className)}
      style={{ width, height: height ?? (variant === 'text' ? undefined : '1rem') }}
    />
  );
}
