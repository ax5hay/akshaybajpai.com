import styles from './Mark.module.css';

/**
 * The mark. A and B drawn as one piece of line work on a tile of ink: the A
 * is a section (two rafters on a tie), the B's bowls are struck off the same
 * stem, and the A's tie runs on as a dimension line with its ticks. The red
 * dot is the postmark from the Correspondence sheet. On hover the pen plots
 * it again.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`${styles.mark} ${className ?? ''}`} aria-hidden="true">
      <rect width="32" height="32" className={styles.tile} />
      {/* A: rafters on a tie. */}
      <path d="M5.5 24.5L12.5 7.5L19.5 24.5" pathLength={1} className={styles.line} />
      {/* The tie, carried on as a dimension line. */}
      <path d="M8.2 18.5H26.5" pathLength={1} className={`${styles.line} ${styles.thin}`} />
      <path d="M8.2 16.8v3.4M26.5 16.8v3.4" pathLength={1} className={`${styles.line} ${styles.thin}`} />
      {/* B: two bowls off the right rafter's stem. */}
      <path
        d="M19.5 7.5h3.2a3.3 3.3 0 0 1 0 6.6h-3.2M19.5 14.1h3.9a3.6 3.6 0 0 1 0 7.2h-3.9"
        pathLength={1}
        className={styles.line}
      />
      <circle cx="26.5" cy="24.5" r="1.6" className={styles.dot} />
    </svg>
  );
}
