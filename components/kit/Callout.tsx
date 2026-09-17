import type { ReactNode } from 'react';
import styles from './Callout.module.css';

interface Props {
  /** The markup note, keyed to the block it wraps. */
  note: ReactNode;
  children: ReactNode;
}

/**
 * A keyed margin note. Invisible on the issued drawing and drawn into the
 * sheet margin in annotated mode, which is where the markup pen belongs:
 * the measure stays the same width in both modes, so turning annotations on
 * never reflows the prose the reader is in the middle of.
 *
 * Numbering is a CSS counter rather than a prop, so notes renumber
 * themselves when one is added, removed, or reordered.
 */
export function Callout({ note, children }: Props) {
  return (
    <div className={styles.host}>
      {children}
      <span className={styles.leader} aria-hidden="true" />
      <aside className={styles.note}>
        <span className={styles.no} aria-hidden="true" />
        <span className={styles.body}>{note}</span>
      </aside>
    </div>
  );
}
