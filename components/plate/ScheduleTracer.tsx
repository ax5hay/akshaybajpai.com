'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TraceSource } from '@/lib/stack';
import styles from './MaterialSchedule.module.css';

/**
 * Trace a project through A-102. Choose a repository or an engagement and
 * every item it was found in stays inked while the rest of the schedule
 * falls back; the elevation above fills each bay to that project's share.
 *
 * The schedule itself is server-rendered markup. This component never
 * re-renders it: it writes one attribute selector into a <style> element
 * and a handful of bay transforms, so a trace across 352 cells is a single
 * style recalculation and no React work. Pointing at a chip previews it;
 * clicking pins it; Escape clears.
 */
const VISIBLE_REPOS = 12;

export function ScheduleTracer({
  sources,
  totals,
  rootId,
}: {
  sources: TraceSource[];
  /** Items per discipline code, in schedule order. */
  totals: Array<[string, number]>;
  rootId: string;
}) {
  const [pinned, setPinned] = useState<string | null>(null);
  const [shown, setShown] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  const byId = useRef(new Map(sources.map((s) => [s.id, s]))).current;
  const engagements = sources.filter((s) => s.kind === 'engagement');
  const repos = sources.filter((s) => s.kind === 'repo');
  const first = repos.slice(0, VISIBLE_REPOS);
  const rest = repos.slice(VISIBLE_REPOS);

  /** Apply a trace to the server-rendered schedule. */
  const apply = useCallback(
    (id: string | null) => {
      const root = document.getElementById(rootId);
      if (!root) return;
      if (!styleRef.current) {
        styleRef.current = document.createElement('style');
        document.head.appendChild(styleRef.current);
      }
      const source = id ? byId.get(id) : undefined;
      styleRef.current.textContent = source
        ? `#${rootId}[data-trace] [data-cell]:not([data-in~="${source.id}"]){opacity:.16}` +
          `#${rootId}[data-trace] [data-cell][data-in~="${source.id}"]{border-color:var(--accent);color:var(--ink)}`
        : '';
      if (source) root.setAttribute('data-trace', source.id);
      else root.removeAttribute('data-trace');

      for (const [code, total] of totals) {
        const n = source?.byCode[code] ?? 0;
        const bay = root.querySelector<SVGElement>(`[data-bay="${code}"]`);
        if (bay) bay.style.transform = `scaleY(${source ? n / total : 0})`;
        const count = root.querySelector<HTMLElement>(`[data-trace-count="${code}"]`);
        if (count) count.textContent = source ? `${n} of ${total} traced` : '';
        const block = root.querySelector<HTMLElement>(`[data-block="${code}"]`);
        if (block) block.toggleAttribute('data-unlit', Boolean(source) && n === 0);
      }
    },
    [byId, rootId, totals]
  );

  useEffect(() => {
    apply(shown);
  }, [apply, shown]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && (pinned || shown)) {
        setPinned(null);
        setShown(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinned, shown]);

  useEffect(() => () => styleRef.current?.remove(), []);

  // Arriving from another sheet with ?trace=<id> pins that project at once,
  // and opens the longer list if it lives there.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('trace');
    if (!id || !byId.has(id)) return;
    setPinned(id);
    setShown(id);
    if (rest.some((s) => s.id === id)) setOpen(true);
    // Only on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preview = (id: string | null) => setShown(id ?? pinned);
  const pin = (id: string) => {
    const next = pinned === id ? null : id;
    setPinned(next);
    setShown(next);
  };

  const current = shown ? byId.get(shown) : undefined;
  const codes = current
    ? Object.entries(current.byCode).sort((a, b) => b[1] - a[1])
    : [];

  const chip = (s: TraceSource) => (
    <button
      key={s.id}
      type="button"
      className={styles.chip}
      aria-pressed={pinned === s.id}
      data-shown={shown === s.id || undefined}
      data-kind={s.kind}
      onClick={() => pin(s.id)}
      onPointerEnter={() => preview(s.id)}
      onPointerLeave={() => preview(null)}
      onFocus={() => preview(s.id)}
      onBlur={() => preview(null)}
    >
      <span className={styles.chipLabel}>{s.label}</span>
      <span className={styles.chipN}>{s.count}</span>
    </button>
  );

  return (
    <div className={styles.tracer}>
      <div className={styles.tracerHead}>
        <span className={styles.tracerTitle}>Trace a project</span>
        <span className={styles.tracerHint}>
          Point at one to preview, choose it to pin, <kbd>Esc</kbd> to clear
        </span>
      </div>

      <div className={styles.groups}>
        <div className={styles.group} role="group" aria-label="Engagements">
          <span className={styles.groupName}>Work I led</span>
          <div className={styles.chips}>{engagements.map(chip)}</div>
        </div>
        <div className={styles.group} role="group" aria-label="Repositories">
          <span className={styles.groupName}>Repositories</span>
          <div className={styles.chips}>
            {first.map(chip)}
            {open && rest.map(chip)}
            {rest.length > 0 && (
              <button
                type="button"
                className={styles.moreSummary}
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
              >
                {open ? 'Fewer' : `+ ${rest.length} more`}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className={styles.readout} aria-live="polite">
        {current ? (
          <>
            <b>{current.label}</b>
            <span>
              {current.count} items across {codes.length}{' '}
              {codes.length === 1 ? 'discipline' : 'disciplines'}
            </span>
            <span className={styles.readoutCodes}>
              {codes.map(([code, n]) => (
                <span key={code}>
                  {code} {n}
                </span>
              ))}
            </span>
            {pinned === current.id && (
              <button type="button" className={styles.clear} onClick={() => pin(current.id)}>
                Clear
              </button>
            )}
          </>
        ) : (
          <span>
            Nothing traced. {sources.length} sources: {engagements.length} kinds of work I led and{' '}
            {repos.length} repositories.
          </span>
        )}
      </p>
    </div>
  );
}
