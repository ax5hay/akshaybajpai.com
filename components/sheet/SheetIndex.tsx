'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './SheetIndex.module.css';
import type { Discipline } from '@/lib/plates';

export interface IndexEntry {
  sheet: string;
  title: string;
  subtitle: string;
  href: string;
  discipline: Discipline;
  /** Heading this row files under, e.g. "Works". */
  group: string;
}

interface Props {
  entries: IndexEntry[];
  open: boolean;
  onClose: () => void;
  currentSheet: string;
}

/** Position of `q` at the start of a word in `text`, or -1. */
function wordStart(text: string, q: string): number {
  let at = text.indexOf(q);
  while (at > -1) {
    if (at === 0 || !/[a-z0-9]/.test(text[at - 1])) return at;
    at = text.indexOf(q, at + 1);
  }
  return -1;
}

/**
 * Abbreviation match: every letter of the query either opens a word or
 * continues the run the previous letter was in. "fdai" finds
 * "Forward-Deployed AI"; "rag" does not find "peRformAnce enGineering".
 */
function abbreviates(text: string, q: string): boolean {
  let i = 0;
  let previous = -2;
  for (let at = 0; at < text.length && i < q.length; at += 1) {
    if (text[at] !== q[i]) continue;
    const opensWord = at === 0 || !/[a-z0-9]/.test(text[at - 1]);
    if (!opensWord && previous !== at - 1) continue;
    previous = at;
    i += 1;
  }
  return i === q.length;
}

/**
 * Ranked match. A sheet number beats everything, then a title prefix, then a
 * word in the title by position, then a word in the description. Matches are
 * anchored to the start of a word throughout, so "rag" finds RAG and not
 * "leverage". Last resort is an abbreviation over the title.
 */
function score(entry: IndexEntry, query: string): number {
  const q = query.toLowerCase();
  const sheet = entry.sheet.toLowerCase();
  const title = entry.title.toLowerCase();

  if (sheet.startsWith(q) || sheet.replace('-', '').startsWith(q.replace('-', ''))) return 1000;
  if (title.startsWith(q)) return 800;

  const at = wordStart(title, q);
  if (at > -1) return 600 - at;

  if (wordStart(entry.subtitle.toLowerCase(), q) > -1) return 300;
  if (wordStart(entry.group.toLowerCase(), q) > -1) return 200;

  // Mid-word hits are only worth showing once the query is long enough to
  // mean something on its own.
  if (q.length >= 4 && title.includes(q)) return 160;
  if (abbreviates(title, q)) return 120;
  if (q.length >= 4 && entry.subtitle.toLowerCase().includes(q)) return 80;
  return 0;
}

export function SheetIndex({ entries, open, onClose, currentSheet }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return entries;
    return entries
      .map((entry) => ({ entry, rank: score(entry, q) }))
      .filter((r) => r.rank > 0)
      .sort((a, b) => b.rank - a.rank || a.entry.sheet.localeCompare(b.entry.sheet))
      .map((r) => r.entry);
  }, [entries, query]);

  // Rows shift under the cursor as the query narrows; keep the cursor in range.
  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      restoreFocus.current?.focus();
      return;
    }
    restoreFocus.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();

    // The index is a modal surface; the sheet behind it must not scroll.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-row="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  if (!open) return null;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    // A modal keeps the focus it took: Tab cycles inside the panel instead
    // of walking out into the sheet behind the scrim.
    if (event.key === 'Tab') {
      const stops = event.currentTarget.querySelectorAll<HTMLElement>('input, button');
      const first = stops[0];
      const last = stops[stops.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      const inside = Array.from(stops).includes(active as HTMLElement);
      if (event.shiftKey && (active === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !inside)) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      setActive((i) => (results.length ? (i + delta + results.length) % results.length : 0));
      return;
    }
    if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      router.push(results[active].href);
      onClose();
    }
  };

  let lastGroup = '';

  return (
    <div className={styles.scrim} onClick={onClose} role="presentation">
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Drawing index"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className={styles.head}>
          <span className={styles.headTitle}>Drawing Index</span>
          <span className={styles.headCount} aria-live="polite">
            {results.length} of {entries.length} sheets
          </span>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close index">
            <span aria-hidden="true">Esc</span>
          </button>
        </div>

        <div className={styles.searchRow}>
          <span className={styles.searchLabel} aria-hidden="true">
            Find
          </span>
          <input
            ref={inputRef}
            type="text"
            className={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sheet number, title, or subject"
            aria-label="Search the drawing index"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className={styles.columns} aria-hidden="true">
          <span>Sheet</span>
          <span>Title</span>
          <span>Description</span>
        </div>

        <div className={styles.list} ref={listRef}>
          {results.length === 0 && (
            <p className={styles.empty}>
              No sheet matches <strong>{query}</strong>. The set holds {entries.length} drawings.
            </p>
          )}

          {results.map((entry, i) => {
            const showGroup = entry.group !== lastGroup;
            lastGroup = entry.group;

            return (
              <div key={entry.sheet + entry.href}>
                {showGroup && !query.trim() && (
                  <div className={styles.group}>
                    <span>{entry.group}</span>
                  </div>
                )}
                <Link
                  href={entry.href}
                  prefetch={false}
                  tabIndex={-1}
                  data-row={i}
                  className={styles.row}
                  data-active={i === active || undefined}
                  data-current={entry.sheet === currentSheet || undefined}
                  onMouseEnter={() => setActive(i)}
                  onClick={onClose}
                >
                  <span className={styles.rowSheet}>{entry.sheet}</span>
                  <span className={styles.rowTitle}>{entry.title}</span>
                  <span className={styles.rowSubtitle}>{entry.subtitle}</span>
                  <span className={styles.rowLeader} aria-hidden="true" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className={styles.foot}>
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> move
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
