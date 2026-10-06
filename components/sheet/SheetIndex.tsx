'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlateFigure, figureCaption, hasFigure } from '@/components/figures/PlateFigure';
import { DISCIPLINES, getPlateByHref, type Discipline } from '@/lib/plates';
import { useRoute } from '@/components/system/Route';
import styles from './SheetIndex.module.css';

export interface IndexEntry {
  sheet: string;
  title: string;
  subtitle: string;
  href: string;
  discipline: Discipline;
  /** Heading this row files under, e.g. "Works". */
  group: string;
  /** Year and month of issue, for detail sheets. */
  issued?: string;
  /** Words in each section of the article, in order. */
  profile?: number[];
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

/** The text with the part that matched the query marked, where there is one. */
function marked(text: string, query: string): ReactNode {
  const q = query.trim().toLowerCase();
  if (!q) return text;
  const at = wordStart(text.toLowerCase(), q);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <mark className={styles.hit}>{text.slice(at, at + q.length)}</mark>
      {text.slice(at + q.length)}
    </>
  );
}

const seriesName = (group: string) => group.replace(' · details', '').replace(' arrangement', '');

/**
 * The drawing index: the contents table of the set, made navigable.
 *
 * A list on the left; on the right, on a wide screen, the sheet under the
 * cursor drawn in small: its number, its title in the display face, and its
 * figure (for a section sheet) or its section profile (for an article). The
 * preview is the reason this module is loaded on demand: it carries the
 * drafted figures, and no page needs them until the index is opened.
 */
export function SheetIndex({ entries, open, onClose, currentSheet }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [series, setSeries] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const read = new Set(useRoute());
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  // The preview is only shown beside the list on a wide screen; on a narrow
  // one it was still being rendered (a drafted figure, hundreds of paths)
  // and then hidden, which was most of what a phone paid to open the index.
  const [showPreview, setShowPreview] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(min-width: 62rem)');
    const sync = () => setShowPreview(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const groups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of entries) counts.set(entry.group, (counts.get(entry.group) ?? 0) + 1);
    return [...counts.entries()];
  }, [entries]);

  const results = useMemo(() => {
    const pool = series ? entries.filter((e) => e.group === series) : entries;
    const q = query.trim();
    if (!q) return pool;
    return pool
      .map((entry) => ({ entry, rank: score(entry, q) }))
      .filter((r) => r.rank > 0)
      .sort((a, b) => b.rank - a.rank || a.entry.sheet.localeCompare(b.entry.sheet))
      .map((r) => r.entry);
  }, [entries, query, series]);

  // Rows shift under the cursor as the query narrows; keep the cursor in range.
  useEffect(() => {
    setActive(0);
  }, [query, series]);

  useEffect(() => {
    if (!open) return;
    restoreFocus.current = document.activeElement as HTMLElement | null;
    // Not on a touch screen: focusing the field there throws the keyboard up
    // over the very list the reader opened the index to look at.
    if (!window.matchMedia('(hover: none)').matches) inputRef.current?.focus();

    // The index is a modal surface; the sheet behind it must not scroll.
    // Changing the body's overflow relays out the whole page behind, which
    // on a phone was most of the cost of opening. There the panel covers the
    // screen and contains its own scrolling, so the body is left alone.
    const lock = !window.matchMedia('(max-width: 44rem)').matches;
    const previous = document.body.style.overflow;
    if (lock) document.body.style.overflow = 'hidden';
    // Notes and notices step aside for it. A flag on the root is matched by
    // one rule; `body:has([role=dialog])` meant restyling the whole page
    // every time the index opened or closed.
    document.documentElement.dataset.dialog = '';
    return () => {
      delete document.documentElement.dataset.dialog;
      if (lock) document.body.style.overflow = previous;
      restoreFocus.current?.focus();
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
      const focused = document.activeElement;
      const inside = Array.from(stops).includes(focused as HTMLElement);
      if (event.shiftKey && (focused === first || !inside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (focused === last || !inside)) {
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
    if (event.key === 'Enter' && results[active] && event.target === inputRef.current) {
      event.preventDefault();
      router.push(results[active].href);
      onClose();
    }
  };

  const shown = results[active];
  const plate = shown ? getPlateByHref(shown.href) : undefined;
  const words = shown?.profile?.reduce((sum, n) => sum + n, 0) ?? 0;
  let lastGroup = '';

  return (
    <div className={styles.scrim} onClick={onClose} role="presentation" data-lens-skip>
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
            {read.size > 0 ? ` · ${read.size} read` : ''}
          </span>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close index">
            <span className={styles.closeKey} aria-hidden="true">
              Esc
            </span>
            <span className={styles.closeX} aria-hidden="true">
              Close ×
            </span>
          </button>
        </div>

        <div className={styles.searchRow}>
          <svg className={styles.searchGlyph} viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="6.5" cy="6.5" r="4.6" />
            <path d="M10 10l4.4 4.4" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            inputMode="search"
            enterKeyHint="go"
            className={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sheet number, title, or subject"
            aria-label="Search the drawing index"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              className={styles.clear}
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              Clear
            </button>
          )}
        </div>

        <div className={styles.series} role="group" aria-label="Series">
          <button
            type="button"
            className={styles.seriesTab}
            aria-pressed={series === null}
            onClick={() => setSeries(null)}
          >
            All <span>{entries.length}</span>
          </button>
          {groups.map(([group, count]) => (
            <button
              key={group}
              type="button"
              className={styles.seriesTab}
              aria-pressed={series === group}
              onClick={() => setSeries((s) => (s === group ? null : group))}
            >
              {seriesName(group)} <span>{count}</span>
            </button>
          ))}
        </div>

        <div className={styles.body}>
          <div className={styles.list} ref={listRef}>
            {results.length === 0 && (
              <p className={styles.empty}>
                No sheet matches <strong>{query}</strong>.
                <span>
                  Try a sheet number such as <kbd>W-405</kbd>, or a subject such as <kbd>RAG</kbd>.
                </span>
              </p>
            )}

            {results.map((entry, i) => {
              const showGroup = entry.group !== lastGroup;
              lastGroup = entry.group;

              return (
                <div key={entry.sheet + entry.href}>
                  {showGroup && !query.trim() && !series && (
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
                    data-read={read.has(entry.href) || undefined}
                    onMouseEnter={() => setActive(i)}
                    onClick={onClose}
                  >
                    <span className={styles.rowSheet}>{marked(entry.sheet, query)}</span>
                    <span className={styles.rowMain}>
                      <span className={styles.rowTitle}>{marked(entry.title, query)}</span>
                      <span className={styles.rowSubtitle}>{marked(entry.subtitle, query)}</span>
                    </span>
                    <span className={styles.rowMeta}>
                      {entry.sheet === currentSheet
                        ? 'You are here'
                        : read.has(entry.href)
                          ? 'Read'
                          : (entry.issued ?? '')}
                    </span>
                    <span className={styles.rowLeader} aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* The sheet under the cursor, drawn in small. Decorative: every
              word of it is already in the row it previews. */}
          {shown && showPreview && (
            <aside className={styles.preview} aria-hidden="true" key={shown.href}>
              <span className={styles.previewTag}>{shown.sheet}</span>
              <span className={styles.previewSeries}>
                {DISCIPLINES[shown.discipline].name}
                {shown.issued ? ` · ${shown.issued}` : ''}
              </span>

              <span className={styles.previewTitle}>{shown.title}</span>
              <span className={styles.previewText}>{shown.subtitle}</span>

              {plate && hasFigure(plate.id) && (
                <span className={styles.previewFigure}>
                  <PlateFigure id={plate.id} />
                  <span className={styles.previewCaption}>{figureCaption(plate.id)}</span>
                </span>
              )}

              {shown.profile && shown.profile.length > 1 && (
                <span className={styles.previewProfile}>
                  <span className={styles.previewCaption}>
                    Section through this sheet · {shown.profile.length} sections · {words} words
                  </span>
                  <span className={styles.previewStrip}>
                    {shown.profile.map((n, i) => (
                      <span key={i} style={{ flexGrow: Math.max(n, 1) }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    ))}
                  </span>
                </span>
              )}

              <span className={styles.previewOpen}>
                <kbd>↵</kbd> Open {shown.sheet}
              </span>
            </aside>
          )}
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
