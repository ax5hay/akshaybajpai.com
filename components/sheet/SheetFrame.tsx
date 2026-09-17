import styles from './SheetFrame.module.css';

const ZONE_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const ZONE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * The drawing border: trim marks, ruled edge, and the zone grid printed down
 * the margins of every sheet in the set. Pure decoration — never interactive,
 * never in the accessibility tree, and rendered once in the root layout so it
 * survives navigation without repainting.
 */
export function SheetFrame() {
  return (
    <div className={styles.frame} aria-hidden="true">
      <div className={styles.border} />

      <div className={`${styles.ruler} ${styles.rulerTop}`}>
        {ZONE_NUMBERS.map((n) => (
          <span key={n} className={styles.zone}>
            {n}
          </span>
        ))}
      </div>
      <div className={`${styles.ruler} ${styles.rulerBottom}`}>
        {ZONE_NUMBERS.map((n) => (
          <span key={n} className={styles.zone}>
            {n}
          </span>
        ))}
      </div>
      <div className={`${styles.ruler} ${styles.rulerLeft}`}>
        {ZONE_LETTERS.map((l) => (
          <span key={l} className={styles.zone}>
            {l}
          </span>
        ))}
      </div>
      <div className={`${styles.ruler} ${styles.rulerRight}`}>
        {ZONE_LETTERS.map((l) => (
          <span key={l} className={styles.zone}>
            {l}
          </span>
        ))}
      </div>

      <span className={`${styles.trim} ${styles.trimTL}`} />
      <span className={`${styles.trim} ${styles.trimTR}`} />
      <span className={`${styles.trim} ${styles.trimBL}`} />
      <span className={`${styles.trim} ${styles.trimBR}`} />
    </div>
  );
}
