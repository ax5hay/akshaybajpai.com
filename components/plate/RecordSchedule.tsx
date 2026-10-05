import type { ReactNode } from 'react';
import styles from './RecordSchedule.module.css';

export interface RecordRow {
  /** Year or span, as printed in the first column. */
  when: string;
  /** What kind of entry: degree, publication, thesis. */
  kind: string;
  title: ReactNode;
  /** Where, with whom, under what reference. */
  detail: ReactNode;
  /** One figure worth setting large: a grade, a count. */
  mark?: string;
}

/**
 * A schedule of record: degrees, publications and studies, ruled and dated
 * the way a drawing set schedules its revisions. Static; the facts in it are
 * the sheet's own.
 */
export function RecordSchedule({ title, rows }: { title: string; rows: RecordRow[] }) {
  return (
    <section className={styles.schedule} aria-label={title}>
      <header className={styles.head}>
        <span>{title}</span>
        <span>{rows.length} entries</span>
      </header>
      <ol className={styles.list} data-reveal-stagger>
        {rows.map((row, i) => (
          <li key={i} className={styles.row}>
            <span className={styles.when}>{row.when}</span>
            <span className={styles.main}>
              <span className={styles.kind}>{row.kind}</span>
              <span className={styles.title}>{row.title}</span>
              <span className={styles.detail}>{row.detail}</span>
            </span>
            {row.mark && <span className={styles.mark}>{row.mark}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
