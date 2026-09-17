import Link from 'next/link';
import { formatDate } from '@/lib/format';
import styles from './SheetSchedule.module.css';

export interface ScheduleRow {
  sheet: string;
  title: string;
  description: string;
  href: string;
  date: string;
  /** Optional trailing facts, e.g. stack or client. */
  tags?: string[];
  readingTime?: number;
}

/**
 * A drawing schedule: the index table that fronts each discipline. Rows are
 * ruled and numbered rather than being cards, so a long collection reads as
 * one continuous document.
 */
export function SheetSchedule({ rows, unit = 'sheets' }: { rows: ScheduleRow[]; unit?: string }) {
  if (rows.length === 0) {
    return <p className={styles.empty}>No sheets issued in this series yet.</p>;
  }

  return (
    <section className={styles.schedule} aria-label="Sheet schedule">
      <div className={styles.columns} aria-hidden="true">
        <span>Sheet</span>
        <span>Title</span>
        <span>Issued</span>
      </div>

      <ol className={styles.list} data-reveal-stagger>
        {rows.map((row) => (
          <li key={row.href} className={styles.row}>
            <Link href={row.href} className={styles.link}>
              <span className={styles.sheet}>{row.sheet}</span>

              <span className={styles.main}>
                <span className={styles.title}>{row.title}</span>
                <span className={styles.description}>{row.description}</span>

                {row.tags && row.tags.length > 0 && (
                  <span className={styles.tags}>
                    {row.tags.slice(0, 5).map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </span>
                )}
              </span>

              <span className={styles.meta}>
                <time dateTime={row.date}>{formatDate(row.date, 'short')}</time>
                {row.readingTime != null && (
                  <span className={styles.readingTime}>{row.readingTime} min</span>
                )}
              </span>

              <span className={styles.leader} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>

      <p className={styles.total}>
        <span>End of schedule</span>
        <span>
          {rows.length} {unit}
        </span>
      </p>
    </section>
  );
}
