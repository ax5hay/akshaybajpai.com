'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './DimensionLine.module.css';

interface Props {
  /** Fixed text to print. Omit to dimension the element's real width. */
  label?: string;
}

/**
 * A drafting dimension across the full width of its container. With no
 * label it measures itself and reports the rendered width, so the number is
 * the live layout rather than a value that can drift from the CSS.
 */
export function DimensionLine({ label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<number | null>(null);

  useEffect(() => {
    if (label) return;
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setMeasured(Math.round(entry.contentRect.width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [label]);

  // Before measurement there is nothing truthful to print, so the label is
  // held back rather than flashing a wrong number.
  const text = label ?? (measured === null ? '' : `${measured} px`);

  return (
    <div className={styles.dim} ref={ref} aria-hidden="true">
      <span className={styles.tick} data-end="start" />
      <span className={styles.rule} />
      <span className={styles.label}>{text}</span>
      <span className={styles.rule} />
      <span className={styles.tick} data-end="end" />
    </div>
  );
}
