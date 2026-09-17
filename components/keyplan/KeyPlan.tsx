'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DISCIPLINES,
  GENERAL_NOTES,
  KEY_PLAN_FURNITURE,
  KEY_PLAN_HEIGHT,
  KEY_PLAN_WIDTH,
  keyPlanPlates,
  PLATES,
  type KeyPlanRect,
  type PlacedPlate,
} from '@/lib/plates';
import { useInstruments } from '@/components/system/InstrumentProvider';
import { useMode } from '@/components/system/ModeProvider';
import { useToast } from '@/components/system/ToastProvider';
import { MODE_INFO, MODES } from '@/lib/mode';
import styles from './KeyPlan.module.css';

export interface PlateItem {
  sheet?: string;
  title: string;
  meta?: string;
  href?: string;
}

export type KeyPlanContents = Record<string, PlateItem[]>;

const MIN_SCALE = 0.35;
const MAX_SCALE = 2.6;
const FLY_MS = 340;
/** Travel, in px, that separates a click on a sheet from a pan of the plan. */
const DRAG_SLOP = 4;
/** Radius of a cross-reference bubble, in plan units. */
const XREF_R = 17;

interface Camera {
  scale: number;
  x: number;
  y: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Plan-space rectangle to absolute CSS geometry. */
const place = (r: { x: number; y: number; w: number; h: number }) => ({
  left: r.x,
  top: r.y,
  width: r.w,
  height: r.h,
});

/** The plan's own drawing grid, matching the ticks printed on the sheet frame. */
const GRID_COLS = 8;
const GRID_ROWS = 6;

/** Grid reference for a rectangle's centre, e.g. `B/1`. */
const gridRef = (r: KeyPlanRect) => {
  const col = Math.min(GRID_COLS, Math.floor((r.x + r.w / 2) / (KEY_PLAN_WIDTH / GRID_COLS)) + 1);
  const row = Math.min(GRID_ROWS, Math.floor((r.y + r.h / 2) / (KEY_PLAN_HEIGHT / GRID_ROWS)));
  return `${String.fromCharCode(65 + row)}/${col}`;
};

/**
 * Scalloped outline used to ring a revised area, as on an issued drawing.
 * Walks the perimeter placing one arc per step so the bulges face outward.
 */
const revisionCloud = (r: KeyPlanRect, step = 34, bulge = 11) => {
  const pts: Array<[number, number]> = [];
  const edge = (x1: number, y1: number, x2: number, y2: number) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(1, Math.round(len / step));
    for (let i = 0; i < n; i += 1) {
      pts.push([x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n]);
    }
  };
  const { x, y, w, h } = r;
  edge(x, y, x + w, y);
  edge(x + w, y, x + w, y + h);
  edge(x + w, y + h, x, y + h);
  edge(x, y + h, x, y);

  return (
    pts
      .map(([px, py], i) => {
        const [nx, ny] = pts[(i + 1) % pts.length];
        const a = i === 0 ? `M ${px} ${py}` : '';
        // Sweep 1 keeps every bulge on the outside of the walk.
        return `${a} A ${bulge} ${bulge} 0 0 1 ${nx} ${ny}`;
      })
      .join(' ') + ' Z'
  );
};

export function KeyPlan({ contents }: { contents: KeyPlanContents }) {
  const plates = useMemo(() => keyPlanPlates(), []);
  const router = useRouter();
  const { toast } = useToast();
  const { toggleLens, openIndex, lensOn, inviting } = useInstruments();
  const { mode, cycleMode } = useMode();
  const nextMode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];

  const stageRef = useRef<HTMLDivElement>(null);
  const [camera, setCamera] = useState<Camera>({ scale: 1, x: 0, y: 0 });
  const [animating, setAnimating] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [interactive, setInteractive] = useState(false);

  // Drag bookkeeping lives in a ref so pointermove never triggers a render
  // it does not need; only the camera state does.
  const drag = useRef({ active: false, moved: 0, px: 0, py: 0, ox: 0, oy: 0, captured: false });
  const flyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Camera that frames the whole plan inside the stage. */
  const fitCamera = useCallback((): Camera => {
    const stage = stageRef.current;
    if (!stage) return { scale: 1, x: 0, y: 0 };
    const { width, height } = stage.getBoundingClientRect();
    const scale = Math.min(width / KEY_PLAN_WIDTH, height / KEY_PLAN_HEIGHT) * 0.9;
    return {
      scale,
      x: (width - KEY_PLAN_WIDTH * scale) / 2,
      y: (height - KEY_PLAN_HEIGHT * scale) / 2,
    };
  }, []);

  const fit = useCallback(() => {
    setAnimating(true);
    setCamera(fitCamera());
  }, [fitCamera]);

  // Pan and zoom only make sense on a pointer-driven sheet wide enough to hold
  // the plan; narrow screens fall back to the stacked list rendered by CSS.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 60rem)');
    const sync = () => {
      setInteractive(query.matches);
      if (query.matches) setCamera(fitCamera());
    };
    sync();
    query.addEventListener('change', sync);
    window.addEventListener('resize', sync);
    return () => {
      query.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
    };
  }, [fitCamera]);

  useEffect(() => () => {
    if (flyTimer.current) clearTimeout(flyTimer.current);
  }, []);

  /** Zoom about a point in stage coordinates, keeping that point fixed. */
  const zoomAt = useCallback((factor: number, px: number, py: number) => {
    setAnimating(false);
    setCamera((cam) => {
      const scale = clamp(cam.scale * factor, MIN_SCALE, MAX_SCALE);
      const ratio = scale / cam.scale;
      return { scale, x: px - (px - cam.x) * ratio, y: py - (py - cam.y) * ratio };
    });
  }, []);

  const zoomCentre = useCallback(
    (factor: number) => {
      const stage = stageRef.current;
      if (!stage) return;
      const { width, height } = stage.getBoundingClientRect();
      setAnimating(true);
      zoomAt(factor, width / 2, height / 2);
    },
    [zoomAt]
  );

  const onWheel = (event: React.WheelEvent) => {
    if (!interactive) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    zoomAt(
      Math.exp(-event.deltaY * 0.0016),
      event.clientX - rect.left,
      event.clientY - rect.top
    );
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (!interactive || event.button !== 0) return;
    drag.current = {
      active: true,
      moved: 0,
      px: event.clientX,
      py: event.clientY,
      ox: camera.x,
      oy: camera.y,
      captured: false,
    };
    setAnimating(false);
    // Capture is deliberately NOT taken here. Capturing on pointerdown makes
    // the browser retarget the subsequent click to the capturing element, so
    // every sheet on the plan would stop being clickable.
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = event.clientX - d.px;
    const dy = event.clientY - d.py;
    d.moved = Math.max(d.moved, Math.abs(dx) + Math.abs(dy));

    // Once this is unambiguously a pan, take the pointer so the drag survives
    // leaving the surface. By now the gesture can no longer become a click.
    if (!d.captured && d.moved > DRAG_SLOP) {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      d.captured = true;
    }

    setCamera((cam) => ({ ...cam, x: d.ox + dx, y: d.oy + dy }));
  };

  const endDrag = (event: React.PointerEvent) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (drag.current.captured) {
      (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
      drag.current.captured = false;
    }
  };

  /** Move the camera to frame one plate, then hand off to the router. */
  const flyTo = useCallback(
    (plate: PlacedPlate) => {
      const stage = stageRef.current;
      if (!stage) return false;
      const { width, height } = stage.getBoundingClientRect();
      const { rect } = plate;
      const scale = Math.min(width / rect.w, height / rect.h) * 0.78;

      setAnimating(true);
      setCamera({
        scale,
        x: width / 2 - (rect.x + rect.w / 2) * scale,
        y: height / 2 - (rect.y + rect.h / 2) * scale,
      });
      return true;
    },
    []
  );

  const onPlateClick = (
    event: React.MouseEvent,
    plate: PlacedPlate
  ) => {
    // A drag that ends over a plate is a pan, not a click.
    if (drag.current.moved > DRAG_SLOP) {
      event.preventDefault();
      drag.current.moved = 0;
      return;
    }
    if (!interactive || event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    event.preventDefault();
    if (!flyTo(plate)) {
      router.push(plate.href);
      return;
    }
    flyTimer.current = setTimeout(() => router.push(plate.href), FLY_MS);
  };

  // Keyboard focus can land on a plate that is off-camera; bring it into frame.
  const onPlateFocus = (plate: PlacedPlate) => {
    if (!interactive) return;
    const stage = stageRef.current;
    if (!stage) return;
    const { width, height } = stage.getBoundingClientRect();
    const cx = (plate.rect.x + plate.rect.w / 2) * camera.scale + camera.x;
    const cy = (plate.rect.y + plate.rect.h / 2) * camera.scale + camera.y;
    if (cx > 0 && cx < width && cy > 0 && cy < height) return;

    setAnimating(true);
    setCamera((cam) => ({
      ...cam,
      x: width / 2 - (plate.rect.x + plate.rect.w / 2) * cam.scale,
      y: height / 2 - (plate.rect.y + plate.rect.h / 2) * cam.scale,
    }));
  };

  const lod = camera.scale < 0.62 ? 'far' : camera.scale < 1.1 ? 'mid' : 'near';

  // Cross-reference leaders, deduplicated so each pair is drawn once.
  const leaders = useMemo(() => {
    const byId = new Map(plates.map((p) => [p.sheet, p]));
    const seen = new Set<string>();
    const lines: Array<{ key: string; a: PlacedPlate; b: PlacedPlate }> = [];

    for (const plate of plates) {
      for (const ref of plate.refs) {
        const other = byId.get(ref);
        if (!other) continue;
        const key = [plate.sheet, ref].sort().join('~');
        if (seen.has(key)) continue;
        seen.add(key);
        lines.push({ key, a: plate, b: other });
      }
    }
    return lines;
  }, [plates]);

  /**
   * Chain dimension across the plan: each column band and the gutter between
   * them, read off the plates so the printed figures always match the real
   * composition rather than being written down twice.
   */
  const chain = useMemo(() => {
    const xs = [...new Set(plates.map((p) => p.rect.x))].sort((a, b) => a - b);
    const runs: Array<{ x: number; w: number; gutter?: true }> = [];

    xs.forEach((x, i) => {
      const w = Math.max(...plates.filter((p) => p.rect.x === x).map((p) => p.rect.w));
      runs.push({ x, w });
      const next = xs[i + 1];
      if (next !== undefined) runs.push({ x: x + w, w: next - (x + w), gutter: true });
    });
    return runs;
  }, [plates]);

  /**
   * Sheets joined to the one under the cursor, in either direction. Hovering
   * anything on the plan reads its cross-references out loud: the pair stays
   * lit and everything unrelated falls back, so the set shows how it is wired
   * without the reader having to open a thing.
   */
  const lit = useMemo(() => {
    if (!hovered) return null;
    const live = new Set<string>([hovered]);
    for (const plate of plates) {
      if (plate.sheet === hovered) plate.refs.forEach((r) => live.add(r));
      else if (plate.refs.includes(hovered)) live.add(plate.sheet);
    }
    return live;
  }, [hovered, plates]);

  /** The sheet at the highest revision gets the cloud, as on a real issue. */
  const revised = useMemo(
    () => plates.reduce((a, b) => (b.revision > a.revision ? b : a)),
    [plates],
  );

  /** Which sheets stand at which revision, newest issue first. */
  const revisions = useMemo(() => {
    const byRev = new Map<string, string[]>();
    for (const plate of plates) {
      const list = byRev.get(plate.revision) ?? [];
      list.push(plate.sheet);
      byRev.set(plate.revision, list);
    }
    return [...byRev.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [plates]);

  /**
   * Leaders are drawn between plate edges, not centres: a line that runs
   * under an opaque sheet is never seen, so each end is pulled back to the
   * boundary and the run lives entirely in the gutters between plates.
   */
  const edgePoint = (p: PlacedPlate, towards: { x: number; y: number }) => {
    const cx = p.rect.x + p.rect.w / 2;
    const cy = p.rect.y + p.rect.h / 2;
    const dx = towards.x - cx;
    const dy = towards.y - cy;
    if (dx === 0 && dy === 0) return { x: cx, y: cy };

    // Scale the direction until it first crosses a side of the rectangle.
    const tx = dx === 0 ? Infinity : p.rect.w / 2 / Math.abs(dx);
    const ty = dy === 0 ? Infinity : p.rect.h / 2 / Math.abs(dy);
    const t = Math.min(tx, ty);
    return { x: cx + dx * t, y: cy + dy * t };
  };

  const centre = (p: PlacedPlate) => ({
    x: p.rect.x + p.rect.w / 2,
    y: p.rect.y + p.rect.h / 2,
  });

  /**
   * Bubbles are drawn under the sheets, so one placed over a plate would be
   * half eaten by it. Walk out from the midpoint of the leader and take the
   * first clear spot; a leader with no clear spot goes unlabelled, exactly as
   * it would on paper.
   */
  const bubbleOn = (pa: { x: number; y: number }, pb: { x: number; y: number }) => {
    const clear = (m: { x: number; y: number }) =>
      !plates.some(
        (p) =>
          m.x > p.rect.x - XREF_R &&
          m.x < p.rect.x + p.rect.w + XREF_R &&
          m.y > p.rect.y - XREF_R &&
          m.y < p.rect.y + p.rect.h + XREF_R
      );

    for (const t of [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74]) {
      const m = { x: pa.x + (pb.x - pa.x) * t, y: pa.y + (pb.y - pa.y) * t };
      if (clear(m)) return m;
    }
    return null;
  };

  return (
    <section className={styles.stage} aria-label="Key plan, general arrangement">
      <div
        className={styles.surface}
        ref={stageRef}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        data-interactive={interactive || undefined}
      >
        <div
          className={styles.plane}
          data-lod={lod}
          data-animating={animating || undefined}
          style={{
            width: KEY_PLAN_WIDTH,
            height: KEY_PLAN_HEIGHT,
            transform: interactive
              ? `translate3d(${camera.x}px, ${camera.y}px, 0) scale(${camera.scale})`
              : undefined,
            transitionDuration: animating ? `${FLY_MS}ms` : '0ms',
          }}
          onTransitionEnd={() => setAnimating(false)}
        >
          <svg
            className={styles.leaders}
            viewBox={`0 0 ${KEY_PLAN_WIDTH} ${KEY_PLAN_HEIGHT}`}
            aria-hidden="true"
          >
            {leaders.map(({ key, a, b }) => {
              const pa = edgePoint(a, centre(b));
              const pb = edgePoint(b, centre(a));
              const on = hovered === a.sheet || hovered === b.sheet;
              return (
                <line
                  key={key}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  className={styles.leader}
                  data-lit={on || undefined}
                />
              );
            })}

            {/* Cross-reference bubbles, the split circle a drawing uses to
                name the two sheets a leader joins. They are what keeps the
                gutters worth looking at when no markup layer is on. */}
            {leaders.map(({ key, a, b }) => {
              const pa = edgePoint(a, centre(b));
              const pb = edgePoint(b, centre(a));
              const m = bubbleOn(pa, pb);
              if (!m) return null;
              const on = hovered === a.sheet || hovered === b.sheet;
              return (
                <g key={`b${key}`} className={styles.xref} data-lit={on || undefined}>
                  <circle cx={m.x} cy={m.y} r={XREF_R} />
                  <line x1={m.x - XREF_R} y1={m.y} x2={m.x + XREF_R} y2={m.y} />
                  <text x={m.x} y={m.y - 3.5}>
                    {a.sheet}
                  </text>
                  <text x={m.x} y={m.y + 10}>
                    {b.sheet}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Markup layer. Annotation is drawn over the drawing, not under it,
              so this sits above the sheets and is inert to the pointer. CSS
              alone decides whether it prints. */}
          <svg
            className={styles.markup}
            viewBox={`0 0 ${KEY_PLAN_WIDTH} ${KEY_PLAN_HEIGHT}`}
            aria-hidden="true"
          >
            {/* Chain dimension: column widths and gutters, then the overall. */}
            <g className={styles.dim}>
              {chain.map((run) => (
                <g key={`c${run.x}`}>
                  <line x1={run.x} y1={402} x2={run.x} y2={418} className={styles.dimTick} />
                  <line
                    x1={run.x + 6}
                    y1={410}
                    x2={run.x + run.w - 6}
                    y2={410}
                    className={styles.dimLine}
                  />
                  <text x={run.x + run.w / 2} y={407} className={styles.dimText}>
                    {run.gutter ? run.w : `${run.w}`}
                  </text>
                </g>
              ))}
              <line
                x1={KEY_PLAN_WIDTH}
                y1={402}
                x2={KEY_PLAN_WIDTH}
                y2={418}
                className={styles.dimTick}
              />

              {/* Overall height, taken up the first gutter. */}
              <line x1={440} y1={6} x2={440} y2={KEY_PLAN_HEIGHT - 6} className={styles.dimLine} />
              <line x1={432} y1={0} x2={448} y2={0} className={styles.dimTick} />
              <line
                x1={432}
                y1={KEY_PLAN_HEIGHT}
                x2={448}
                y2={KEY_PLAN_HEIGHT}
                className={styles.dimTick}
              />
              <text
                x={440}
                y={KEY_PLAN_HEIGHT / 2}
                className={styles.dimText}
                transform={`rotate(-90 440 ${KEY_PLAN_HEIGHT / 2})`}
              >
                {KEY_PLAN_HEIGHT}
              </text>
            </g>

            {/* Cross-references are named by the bubbles on the leader layer
                in every mode, so the markup layer does not repeat them. */}

            {/* Revision cloud and triangle over the most recently issued sheet. */}
            <path
              d={revisionCloud({
                x: revised.rect.x - 7,
                y: revised.rect.y - 7,
                w: revised.rect.w + 14,
                h: revised.rect.h + 14,
              })}
              className={styles.cloud}
            />
            <g
              className={styles.revFlag}
              transform={`translate(${revised.rect.x + revised.rect.w - 4} ${revised.rect.y - 4})`}
            >
              <path d="M 0 -15 L 13 8 L -13 8 Z" />
              <text y={5}>{revised.revision}</text>
            </g>
          </svg>

          <div className={styles.header} style={place(KEY_PLAN_FURNITURE.headline)}>
            <h1 className={styles.headline}>
              <span className={styles.headlineName}>Akshay Bajpai</span>
              <span className={styles.headlineRole}>Architect of systems · Builder of intelligence</span>
            </h1>
            <p className={styles.headlineNote}>
              This site is a drawing set. Every section is a numbered sheet on the plan below.
              Open one, or press <kbd>/</kbd> for the index.
            </p>

            {/* Raw: what the plan is generated from. */}
            <p className={styles.provenance}>
              <span>lib/plates.ts</span>
              <span>
                PLATES: Plate[] = {PLATES.length}, {plates.length} placed on G-000
              </span>
              <span>
                plan {KEY_PLAN_WIDTH} × {KEY_PLAN_HEIGHT} units, {leaders.length} refs resolved
              </span>
              <span>KeyPlan.tsx, client, no data fetch</span>
            </p>
          </div>

          {plates.map((plate, index) => (
            <Link
              key={plate.sheet}
              href={plate.href}
              className={styles.plate}
              data-discipline={plate.discipline}
              style={{ ...place(plate.rect), '--i': index } as React.CSSProperties}
              data-wide={plate.rect.w >= 600 || undefined}
              data-linked={(lit && plate.sheet !== hovered && lit.has(plate.sheet)) || undefined}
              data-dim={(lit && !lit.has(plate.sheet)) || undefined}
              onClick={(e) => onPlateClick(e, plate)}
              onMouseEnter={() => setHovered(plate.sheet)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => onPlateFocus(plate)}
              aria-label={`${plate.sheet}. ${plate.title}. ${plate.subtitle}`}
            >
              <span className={styles.plateTag}>{plate.sheet}</span>

              <span className={styles.plateHead}>
                <span className={styles.plateTitle}>{plate.title}</span>
                <span className={styles.plateSubtitle}>{plate.subtitle}</span>
              </span>

              {/* Rows only reserve a sheet-number gutter when the plate
                  actually numbers its contents, so unnumbered lists get the
                  full width for their titles. */}
              <span
                className={styles.plateBody}
                data-numbered={(contents[plate.id] ?? []).some((i) => i.sheet) || undefined}
              >
                {(contents[plate.id] ?? []).map((item, i) => (
                  <span key={i} className={styles.item}>
                    {item.sheet && <span className={styles.itemSheet}>{item.sheet}</span>}
                    <span className={styles.itemTitle}>{item.title}</span>
                    {item.meta && <span className={styles.itemMeta}>{item.meta}</span>}
                  </span>
                ))}
              </span>

              {/* Annotated: the sheet states its own placement on the plan. */}
              <span className={styles.plateAnnot}>
                <span>Grid {gridRef(plate.rect)}</span>
                <span>
                  {plate.rect.w} × {plate.rect.h}
                </span>
                <span>{DISCIPLINES[plate.discipline].name}</span>
              </span>

              {/* Raw: the record this sheet was drawn from, verbatim. */}
              <span className={styles.plateRecord}>
                {(
                  [
                    ['route', plate.href],
                    ['source', `app${plate.href}page.tsx`],
                    ['id', plate.id],
                    ['discipline', `${plate.discipline} · ${DISCIPLINES[plate.discipline].name}`],
                    ['rect', `x ${plate.rect.x}  y ${plate.rect.y}  w ${plate.rect.w}  h ${plate.rect.h}`],
                    // scale and revision are already printed in the sheet
                    // footer, so the record does not repeat them.
                    ['refs', plate.refs.join(' ') || 'none'],
                    ['entries', String((contents[plate.id] ?? []).length)],
                  ] as const
                ).map(([k, v]) => (
                  <span key={k} className={styles.recordRow}>
                    <span className={styles.recordKey}>{k}</span>
                    <span className={styles.recordValue}>{v}</span>
                  </span>
                ))}
              </span>

              <span className={styles.plateFoot}>
                <span>Rev {plate.revision}</span>
                <span>{plate.scale}</span>
                <span className={styles.plateOpen}>Open sheet →</span>
              </span>

              <span className={styles.corner} aria-hidden="true" />
            </Link>
          ))}

          <div className={styles.notes} style={place(KEY_PLAN_FURNITURE.notes)}>
            <span className={styles.furnitureTitle}>General Notes</span>
            <ol className={styles.notesList}>
              {GENERAL_NOTES.map((note, i) => (
                <li key={i} className={styles.note}>
                  <span className={styles.noteNo} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {note}
                </li>
              ))}
            </ol>
          </div>

          {/* Instrument tray. The set can be operated, and this is where it
              says so: named tools with their keys, on the plan itself, so no
              one has to discover them by chance. */}
          <div
            className={styles.instruments}
            style={place(KEY_PLAN_FURNITURE.instruments)}
            data-inviting={inviting || undefined}
          >
            <span className={styles.furnitureTitle}>Instruments</span>

            <button
              type="button"
              className={styles.instrument}
              onClick={toggleLens}
              aria-pressed={lensOn}
            >
              <svg className={styles.instrGlyph} viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="6.5" cy="6.5" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
                <path d="M10 10l4.4 4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
                <path d="M4.2 6.5h4.6M6.5 4.2v4.6" stroke="currentColor" strokeWidth="0.8" />
              </svg>
              <span className={styles.instrText}>
                <span className={styles.instrName}>Inspection lens</span>
                <span className={styles.instrNote}>
                  {lensOn ? 'Deployed. Drag it over the sheet.' : 'X-ray anything it covers'}
                </span>
              </span>
              <kbd className={styles.instrKey}>L</kbd>
            </button>

            <button type="button" className={styles.instrument} onClick={openIndex}>
              <svg className={styles.instrGlyph} viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M1.5 3.5h13M1.5 8h13M1.5 12.5h13"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
              <span className={styles.instrText}>
                <span className={styles.instrName}>Sheet index</span>
                <span className={styles.instrNote}>Jump to any sheet in the set</span>
              </span>
              <kbd className={styles.instrKey}>/</kbd>
            </button>

            <button type="button" className={styles.instrument} onClick={cycleMode}>
              <svg className={styles.instrGlyph} viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
                <path d="M8 1.8a6.2 6.2 0 0 0 0 12.4z" fill="currentColor" />
              </svg>
              <span className={styles.instrText}>
                <span className={styles.instrName}>Drawing mode</span>
                <span className={styles.instrNote}>
                  Rev {MODE_INFO[mode].rev}, {MODE_INFO[mode].label.toLowerCase()}. Next is{' '}
                  {MODE_INFO[nextMode].label.toLowerCase()}.
                </span>
              </span>
              <kbd className={styles.instrKey}>D</kbd>
            </button>

            <span className={styles.instrFoot}>
              Drag to pan · Scroll to zoom · Click any sheet to open it
            </span>
          </div>

          <div className={styles.legend} style={place(KEY_PLAN_FURNITURE.legend)} aria-hidden="true">
            <span className={styles.furnitureTitle}>Legend</span>
            <span className={styles.legendRow}>
              <span className={styles.legendSwatch} data-kind="sheet" />
              Sheet boundary
            </span>
            <span className={styles.legendRow}>
              <span className={styles.legendSwatch} data-kind="leader" />
              Cross-reference
            </span>
            <span className={styles.legendRow}>
              <span className={styles.legendSwatch} data-kind="rev" />
              Current revision
            </span>
            <span className={styles.legendRow} data-layer="markup">
              <span className={styles.legendSwatch} data-kind="dim" />
              Dimension, plan units
            </span>
            <span className={styles.legendRow} data-layer="markup">
              <span className={styles.legendSwatch} data-kind="cloud" />
              Revision cloud
            </span>
            <span className={styles.legendRow} data-layer="record">
              <span className={styles.legendSwatch} data-kind="record" />
              Sheet record, as authored
            </span>
            {/* Revision schedule, read off the sheets rather than written
                down twice. Dense small type is what a drawing is made of. */}
            <span className={styles.revTitle}>Revision schedule</span>
            {revisions.map(([rev, sheets]) => (
              <span key={rev} className={styles.revRow}>
                <span className={styles.revLetter}>{rev}</span>
                <span className={styles.revSheets}>{sheets.join('  ')}</span>
              </span>
            ))}

            <span className={styles.legendScale}>
              <span className={styles.scaleBar} />
              <span>Plan 1:50 at fit</span>
            </span>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => zoomCentre(1 / 1.35)}
          aria-label="Zoom out"
          className={styles.control}
        >
          −
        </button>
        <button type="button" onClick={fit} className={styles.controlFit}>
          Fit
        </button>
        <button
          type="button"
          onClick={() => zoomCentre(1.35)}
          aria-label="Zoom in"
          className={styles.control}
        >
          +
        </button>
        <button
          type="button"
          className={styles.controlHelp}
          onClick={() =>
            toast({
              kind: 'Reading the plan',
              message: 'Drag to pan, scroll to zoom, click any sheet to open it.',
              detail: '/ opens the index · D changes drawing mode',
              tone: 'note',
            })
          }
        >
          ?
        </button>
      </div>

    </section>
  );
}
