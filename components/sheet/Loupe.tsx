'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Loupe.module.css';

const SIZE = 260;
const MIN = 140;
const MAX = 460;
/** Barrel wall, in px. The x-ray is clipped inside it so the rim stays clean. */
const WALL = 9;
/** Enough to cover a dense sheet without drawing boxes nobody will look at. */
const PROBE_LIMIT = 420;
/** Below this, a box has no room to print its own name legibly. */
const LABEL_MIN_W = 58;
const LABEL_MIN_H = 20;

/**
 * Everything worth naming when the lens passes over it.
 *
 * `[class*="__"]` is the load-bearing one: every styled element in this site
 * is a CSS module, and module class names always carry a `__` hash separator.
 * Naming the modules individually meant the lens found the sheets but almost
 * nothing inside them, which is the opposite of an x-ray.
 */
const PROBE_SELECTOR = [
  '[class*="__"]',
  '[data-raw]',
  '[data-annotate]',
  '[data-bound]',
  'h1',
  'h2',
  'h3',
  'h4',
  'main p',
  'main li',
  'main dt',
  'main dd',
  'main th',
  'main td',
  'main pre',
  'main code',
  'main blockquote',
  'main img',
  'kbd',
].join(',');

interface Probe {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  /** Whether this box prints its own name, or leaves it to the readout. */
  labelled: boolean;
}

/** Advance of one label character, in px, at the size the x-ray sets them. */
const LABEL_CHAR_W = 6.1;
const LABEL_H = 12;

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

  // The attribute, not the property: on SVG elements `className` is an
  // SVGAnimatedString and stringifies to "[object SVGAnimatedString]".
  const cls = (el.getAttribute('class') ?? '').split(/\s+/)[0] ?? '';
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
  const sizeRef = useRef<HTMLSpanElement>(null);

  const [size, setSize] = useState(SIZE);
  const [probes, setProbes] = useState<Probe[]>([]);

  const pos = useRef({ x: 0, y: 0 });
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const probeList = useRef<Probe[]>([]);
  /** Markup layers the lens reveals, with where each sits and how it is scaled. */
  const layers = useRef<Array<{ el: HTMLElement; x: number; y: number; k: number }>>([]);

  /** Measure once per layout change; moving the lens must not re-measure. */
  const measure = useCallback(() => {
    const seen = new Set<Element>();
    const found: Probe[] = [];

    // An x-ray of something that is not on the sheet is noise: rows the key
    // plan has faded out, or that a short sheet has clipped away, would all
    // draw as stacks of empty boxes. Clip rectangles are cached per pass.
    const clips = new Map<Element, DOMRect | null>();
    const clipOf = (el: Element) => {
      let clip = clips.get(el);
      if (clip === undefined) {
        const style = getComputedStyle(el);
        clip =
          style.overflowX !== 'visible' || style.overflowY !== 'visible'
            ? el.getBoundingClientRect()
            : null;
        clips.set(el, clip);
      }
      return clip;
    };
    const onSheet = (el: Element, r: DOMRect) => {
      const shown = (
        el as Element & { checkVisibility?: (o: Record<string, boolean>) => boolean }
      ).checkVisibility?.({ opacityProperty: true, visibilityProperty: true, checkOpacity: true });
      if (shown === false) return false;
      for (let up = el.parentElement; up && up !== document.body; up = up.parentElement) {
        const clip = clipOf(up);
        if (!clip) continue;
        if (r.bottom <= clip.top || r.top >= clip.bottom) return false;
        if (r.right <= clip.left || r.left >= clip.right) return false;
      }
      return true;
    };

    document.querySelectorAll(PROBE_SELECTOR).forEach((el) => {
      if (seen.has(el) || found.length >= PROBE_LIMIT) return;
      seen.add(el);
      // The root carries font-variable classes that look like module names.
      if (el === document.documentElement || el === document.body) return;
      // The lens is not part of the drawing and must not inspect itself.
      if (el.closest(`.${styles.loupe}, .${styles.xray}, [data-lens-skip]`)) return;

      const r = el.getBoundingClientRect();
      if (r.width < 16 || r.height < 7) return;
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      if (r.right < 0 || r.left > window.innerWidth) return;
      if (!onSheet(el, r)) return;

      found.push({
        x: r.x,
        y: r.y,
        w: r.width,
        h: r.height,
        label: describe(el),
        labelled: false,
      });
    });

    // Nested boxes share a top-left corner, so naming all of them stacks the
    // names into one unreadable smear. The innermost boxes claim their corner
    // first; anything that would print over a name already set goes without.
    const taken: Array<{ x: number; y: number; w: number }> = [];
    [...found]
      .sort((a, b) => a.w * a.h - b.w * b.h)
      .forEach((p) => {
        if (p.w < LABEL_MIN_W || p.h < LABEL_MIN_H) return;
        const w = p.label.length * LABEL_CHAR_W + 8;
        const clash = taken.some(
          (t) => p.x < t.x + t.w && p.x + w > t.x && Math.abs(p.y - t.y) < LABEL_H
        );
        if (clash) return;
        taken.push({ x: p.x, y: p.y, w });
        p.labelled = true;
      });

    layers.current = Array.from(document.querySelectorAll<HTMLElement>('[data-lens-layer]')).map(
      (el) => {
        const r = el.getBoundingClientRect();
        // Layers on the key plan live inside a scaled plane; the clip is set
        // in their own units, so the lens position is divided back down.
        const own = el.offsetWidth || el.clientWidth || r.width || 1;
        return { el, x: r.left, y: r.top, k: r.width / own || 1 };
      }
    );

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
    for (const layer of layers.current) {
      layer.el.style.setProperty('--lx', `${(x + half - layer.x) / layer.k}px`);
      layer.el.style.setProperty('--ly', `${(y + half - layer.y) / layer.k}px`);
      layer.el.style.setProperty('--lr', `${(half - WALL) / layer.k}px`);
    }
    if (readoutRef.current) {
      // Everything containing the crosshair, largest first, is the containment
      // chain at that point. Reading it out is what makes the lens an
      // inspector rather than a magnifier.
      const cx = x + half;
      const cy = y + half;
      const stack = probeList.current
        .filter((p) => cx >= p.x && cx <= p.x + p.w && cy >= p.y && cy <= p.y + p.h)
        .sort((a, b) => b.w * b.h - a.w * a.h);

      const innermost = stack[stack.length - 1];
      if (!innermost) {
        readoutRef.current.textContent = 'Nothing under the crosshair';
        if (sizeRef.current) sizeRef.current.textContent = `⌀ ${Math.round(size)}`;
        return;
      }

      // A chain inside one component repeats its name at every level, which
      // is three quarters of the readout saying nothing. Only the first
      // mention keeps the component.
      let owner = '';
      const chain = stack.slice(-3).map((p) => {
        const [component, part] = p.label.split('.');
        if (!part) return p.label;
        if (component === owner) return `.${part}`;
        owner = component;
        return p.label;
      });

      readoutRef.current.textContent = `${chain.join(' › ')}`;
      if (sizeRef.current) {
        sizeRef.current.textContent = `${Math.round(innermost.w)} × ${Math.round(innermost.h)}`;
      }
    }
  }, [size]);

  // While the lens is out, the annotation layer is live in every mode and
  // shown only through the barrel. The flag goes on before the first
  // measurement so those layers have a box to be measured.
  useEffect(() => {
    document.documentElement.dataset.lens = '';
    return () => {
      delete document.documentElement.dataset.lens;
      for (const { el } of layers.current) {
        el.style.removeProperty('--lx');
        el.style.removeProperty('--ly');
        el.style.removeProperty('--lr');
      }
    };
  }, []);

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
    // The key plan moves under the lens without scrolling the page.
    const plane = document.querySelector('[data-plan-plane]');
    const camera = plane ? new MutationObserver(schedule) : null;
    if (plane) camera?.observe(plane, { attributes: true, attributeFilter: ['style', 'data-lod'] });
    return () => {
      camera?.disconnect();
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
                  exactly when the lens is over that edge. Boxes too small to
                  hold their own name are left to the readout. */}
              {p.labelled && (
                <>
                  <text x={p.x + 4} y={p.y + 11} className={styles.boxLabel}>
                    {p.label}
                  </text>
                  {/* The size needs a line of its own under the name. */}
                  {p.h >= LABEL_MIN_H * 2 && (
                    <text x={p.x + 4} y={p.y + p.h - 4} className={styles.boxDim}>
                      {Math.round(p.w)} × {Math.round(p.h)}
                    </text>
                  )}
                </>
              )}
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
        {/* The rim: a graduated ring, as on a protractor, with an index at
            the top and the diameter engraved beside it. */}
        <span className={styles.barrel} aria-hidden="true" />
        <span className={styles.graduations} aria-hidden="true" />
        <span className={styles.index} aria-hidden="true" />

        {/* The tag: a detail callout hung off the barrel on a leader. It
            names what is under the crosshair and gives its size. */}
        <span className={styles.leader} aria-hidden="true" />
        <span className={styles.tag} aria-hidden="true">
          <span className={styles.tagHead}>
            <span>Detail</span>
            <span ref={sizeRef} className={styles.tagSize} />
          </span>
          <span ref={readoutRef} className={styles.readout} />
        </span>
      </div>
    </>
  );
}
