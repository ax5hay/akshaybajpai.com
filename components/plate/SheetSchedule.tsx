'use client';

import { useMemo, useState } from 'react';
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
  /** The one measured figure worth setting large against this row. */
  metric?: string;
  /** Word count of each section, in order: the article's profile, in small. */
  profile?: number[];
}

/** Tags worth offering as a filter: those on more than one sheet. */
function sharedTags(rows: ScheduleRow[]): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const row of rows) for (const tag of row.tags ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/**
 * A drawing schedule: the index table that fronts each discipline. Rows are
 * ruled and numbered rather than being cards, so a long collection reads as
 * one continuous document.
 *
 * With `filterable`, the tags the sheets have in common are set out above the
 * schedule as a key. Choosing one strikes the other sheets back without
 * removing them, so the schedule keeps its length and its numbering, and the
 * reader can still see what they are not looking at.
 */
export function SheetSchedule({
  rows,
  unit = 'sheets',
  filterable = false,
}: {
  rows: ScheduleRow[];
  unit?: string;
  filterable?: boolean;
}) {
  const [tag, setTag] = useState<string | null>(null);
  const tags = useMemo(() => (filterable ? sharedTags(rows) : []), [rows, filterable]);

  if (rows.length === 0) {
    return <p className={styles.empty}>No sheets issued in this series yet.</p>;
  }

  const matches = (row: ScheduleRow) => !tag || (row.tags ?? []).includes(tag);
  const shown = rows.filter(matches).length;

  return (
    <section className={styles.schedule} aria-label="Sheet schedule">
      {tags.length > 0 && (
        <div className={styles.key} role="group" aria-label="Filter by stack">
          <span className={styles.keyLabel}>Stack key</span>
          <span className={styles.keyTags}>
            {tags.map(([name, count]) => (
              <button
                key={name}
                type="button"
                className={styles.keyTag}
                aria-pressed={tag === name}
                onClick={() => setTag((t) => (t === name ? null : name))}
              >
                {name}
                <span className={styles.keyCount}>{count}</span>
              </button>
            ))}
          </span>
        </div>
      )}

      <div className={styles.columns} aria-hidden="true">
        <span>Sheet</span>
        <span>Title</span>
        <span>Issued</span>
      </div>

      <ol className={styles.list} data-reveal-stagger>
        {rows.map((row) => (
          <li key={row.href} className={styles.row} data-struck={!matches(row) || undefined}>
            <Link href={row.href} className={styles.link}>
              <span className={styles.sheet}>{row.sheet}</span>

              <span className={styles.main}>
                <span className={styles.title}>{row.title}</span>
                <span className={styles.description}>{row.description}</span>

                {row.tags && row.tags.length > 0 && (
                  <span className={styles.tags}>
                    {row.tags.slice(0, 6).map((t) => (
                      <span key={t} className={styles.tag} data-on={t === tag || undefined}>
                        {t}
                      </span>
                    ))}
                  </span>
                )}
              </span>

              <span className={styles.meta}>
                {row.metric && <span className={styles.metric}>{row.metric}</span>}
                <time dateTime={row.date}>{formatDate(row.date, 'short')}</time>
                {row.readingTime != null && (
                  <span className={styles.readingTime}>{row.readingTime} min</span>
                )}
                {row.profile && row.profile.length > 1 && (
                  <span className={styles.profile} aria-hidden="true">
                    {row.profile.map((words, i) => (
                      <span key={i} style={{ flexGrow: Math.max(words, 1) }} />
                    ))}
                  </span>
                )}
                {row.profile && row.profile.length > 1 && (
                  <span className={styles.profileNote}>{row.profile.length} sections</span>
                )}
              </span>

              <span className={styles.leader} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>

      <p className={styles.total} aria-live="polite">
        <span>{tag ? `Showing ${tag}` : 'End of schedule'}</span>
        <span>
          {tag ? `${shown} of ${rows.length}` : rows.length} {unit}
        </span>
      </p>
    </section>
  );
}
