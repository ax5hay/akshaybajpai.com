'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Loupe.module.css';

const SIZE = 260;
const MIN = 140;
const MAX = 460;
/** Barrel wall, in px. The x-ray is clipped inside it so the rim stays clean. */
const WALL = 9;
/** Enough to cover a dense sheet without drawing boxes nobody will look at. */
const PROBE_LIMIT = 220;

/** Everything worth naming when the lens passes over it. */
const PROBE_SELECTOR = [
  '[data-raw]',
  '[data-annotate]',
  '[data-bound]',
  'main h1',
  'main h2',
  'main h3',
  'main h4',
  'main p',
  'main li',
  'main dl',
  'main dt',
  'main dd',
  'main figure',
  'main figcaption',
  'main table',
  'main th',
  'main td',
  'main pre',
  'main code',
  'main strong',
  'main blockquote',
  'main img',
  'main a',
  'main button',
  'main input',
  'main textarea',
  '[class*="_plate__"]',
  '[class*="_notes__"]',
  '[class*="_legend__"]',
].join(',');

interface Probe {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

/**
 * Name an element the way a developer would recognise it. Sheets already carry
 * their own identifiers, so those win; otherwise the CSS module class is
 * un-hashed back into `Component.part`.
 */
function describe(el: Element): string {
  const raw = el.getAttribute('data-raw');
  if (raw) return raw;

  const annotated = el.getAttribute('data-annotate');
  if (annotated) return annotated.toLowerCase();

  const cls = String((el as HTMLElement).className || '').split(/\s+/)[0] ?? '';
  const mod = cls.match(/^([A-Za-z]+)_([A-Za-z0-9]+)__/);
  if (mod) return `${mod[1]}.${mod[2]}`;

  const tag = el.tagName.toLowerCase();
  return cls ? `${tag}.${cls}` : tag;
}

/**
 * An inspection lens. The optic is a backdrop inversion, so the page below is
 * recomposited rather than re-rendered, and over that it draws the technical
 * layer: every element under the barrel outlined, named, and measured.
 *
 * The outlines are drawn once for the whole viewport and revealed by moving a
 * circular clip, so dragging the lens costs one style write rather than a
 * re-measure of the page.
 *
 * Drag to move. Wheel over it to change the barrel diameter.
 */
export function Loupe({ onDismiss }: { onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const xrayRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  const [size, setSize] = useState(SIZE);
  const [probes, setProbes] = useState<Probe[]>([]);

  const pos = useRef({ x: 0, y: 0 });
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const probeList = useRef<Probe[]>([]);

  /** Measure once per layout change; moving the lens must not re-measure. */
  const measure = useCallback(() => {
    const seen = new Set<Element>();
    const found: Probe[] = [];

    document.querySelectorAll(PROBE_SELECTOR).forEach((el) => {
      if (seen.has(el) || found.length >= PROBE_LIMIT) return;
      seen.add(el);

      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 9) return;
      if (r.bottom < 0 || r.top > window.innerHeight) return;

      found.push({ x: r.x, y: r.y, w: r.width, h: r.height, label: describe(el) });
    });

    probeList.current = found;
    setProbes(found);
  }, []);

  const paint = useCallback(() => {
    const { x, y } = pos.current;
    const half = size / 2;

    if (ref.current) {
      ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
    if (xrayRef.current) {
      xrayRef.current.style.clipPath = `circle(${half - WALL}px at ${x + half}px ${y + half}px)`;
    }
    if (readoutRef.current) {
      // Smallest box containing the crosshair is the most specific thing there.
      const cx = x + half;
      const cy = y + half;
      let best: Probe | null = null;
      for (const p of probeList.current) {
        if (cx < p.x || cx > p.x + p.w || cy < p.y || cy > p.y + p.h) continue;
        if (!best || p.w * p.h < best.w * best.h) best = p;
      }
      readoutRef.current.textContent = best
        ? `${best.label}  ${Math.round(best.w)} × ${Math.round(best.h)}`
        : `⌀ ${Math.round(size)}`;
    }
  }, [size]);

  // Open centred in the viewport, then take the first measurement.
  useEffect(() => {
    pos.current = {
      x: window.innerWidth / 2 - SIZE / 2,
      y: window.innerHeight / 2 - SIZE / 2,
    };
    measure();
    paint();
    // Deliberately runs once: recentring on resize would fight the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    paint();
  }, [paint, probes]);

  // Re-measure when the page moves under the lens, coalesced to a frame.
  useEffect(() => {
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [measure]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!drag.current) return;
      pos.current = {
        x: Math.min(
          Math.max(e.clientX - drag.current.dx, -size * 0.35),
          window.innerWidth - size * 0.65,
        ),
        y: Math.min(
          Math.max(e.clientY - drag.current.dy, -size * 0.35),
          window.innerHeight - size * 0.65,
        ),
      };
      paint();
    };
    const onUp = () => {
      drag.current = null;
      ref.current?.removeAttribute('data-dragging');
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [paint, size]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { dx: e.clientX - pos.current.x, dy: e.clientY - pos.current.y };
    ref.current?.setAttribute('data-dragging', 'true');
  };

  const onWheel = (e: React.WheelEvent) => {
    setSize(Math.min(Math.max(size - e.deltaY * 0.4, MIN), MAX));
  };

  // Arrow keys nudge, so the lens is usable without a pointer.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 40 : 12;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    pos.current = { x: pos.current.x + move[0], y: pos.current.y + move[1] };
    paint();
  };

  return (
    <>
      {/* Drawn for the whole viewport, revealed only through the barrel. */}
      <div ref={xrayRef} className={styles.xray} aria-hidden="true">
        <svg className={styles.xrayPlate} width="100%" height="100%">
          {probes.map((p, i) => (
            <g key={`${p.label}-${i}`}>
              <rect x={p.x} y={p.y} width={p.w} height={p.h} className={styles.box} />
              {/* Set inside the box: a label above it would be clipped away
                  exactly when the lens is over that edge. */}
              <text x={p.x + 5} y={p.y + 12} className={styles.boxLabel}>
                {p.label}
              </text>
              <text x={p.x + 5} y={p.y + p.h - 5} className={styles.boxDim}>
                {Math.round(p.w)} × {Math.round(p.h)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div
        ref={ref}
        className={styles.loupe}
        style={{ '--size': `${size}px` } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
        onDoubleClick={onDismiss}
        role="button"
        tabIndex={0}
        aria-label="Inspection lens. Reveals element boundaries, names, and sizes. Drag to move, arrow keys to nudge, scroll to resize, double-click or Escape to stow."
      >
        <span className={styles.field} aria-hidden="true" />
        <span className={styles.reticle} aria-hidden="true" />
        <span className={styles.barrel} aria-hidden="true" />
        <span ref={readoutRef} className={styles.readout} aria-hidden="true" />
      </div>
    </>
  );
}
