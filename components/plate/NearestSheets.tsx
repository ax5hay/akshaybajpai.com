'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { IndexEntry } from '@/components/sheet/SheetIndex';
import styles from './NearestSheets.module.css';

const words = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2);

/**
 * On the unissued sheet: reads the reference that was followed and offers the
 * issued sheets whose address or title shares the most words with it. A
 * mistyped or renamed link usually still names what it was after.
 */
export function NearestSheets({ entries }: { entries: IndexEntry[] }) {
  const [path, setPath] = useState('');
  const [near, setNear] = useState<IndexEntry[]>([]);

  useEffect(() => {
    const asked = window.location.pathname;
    setPath(asked);
    const wanted = new Set(words(asked));
    if (!wanted.size) return;

    const scored = entries
      .map((entry) => {
        const have = new Set([...words(entry.href), ...words(entry.title)]);
        let score = 0;
        wanted.forEach((w) => {
          if (have.has(w)) score += 2;
          else if ([...have].some((h) => h.startsWith(w) || w.startsWith(h))) score += 1;
        });
        return { entry, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
    setNear(scored.map((s) => s.entry));
  }, [entries]);

  if (!path) return null;

  return (
    <section className={styles.near} aria-label="Nearest issued sheets">
      <p className={styles.asked}>
        <span>Reference followed</span>
        <code>{path}</code>
      </p>

      {near.length > 0 ? (
        <>
          <p className={styles.label}>Nearest issued sheets</p>
          <ul className={styles.list}>
            {near.map((entry) => (
              <li key={entry.href}>
                <Link href={entry.href} className={styles.row}>
                  <span className={styles.sheet}>{entry.sheet}</span>
                  <span className={styles.title}>{entry.title}</span>
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className={styles.label}>No issued sheet shares a word with that reference.</p>
      )}
    </section>
  );
}
