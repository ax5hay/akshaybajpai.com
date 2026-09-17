'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Loupe.module.css';

const SIZE = 260;
const MIN = 140;
const MAX = 460;

/**
 * A draggable lens. Rather than rendering the page twice, it inverts whatever
 * is behind it — which turns warm paper and dark ink into the cyanotype
 * negative, and back again in annotated mode. One compositor layer, no reflow.
 *
 * Drag to move. Wheel over it to change the barrel diameter.
 */
export function Loupe({ onDismiss }: { onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(SIZE);
  const pos = useRef({ x: 0, y: 0 });
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const paint = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
  }, []);

  // open centred in the viewport
  useEffect(() => {
    pos.current = {
      x: window.innerWidth / 2 - size / 2,
      y: window.innerHeight / 2 - size / 2,
    };
    paint();
    // size intentionally excluded: recentring on resize would fight the user
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paint]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!drag.current) return;
      pos.current = {
        x: Math.min(Math.max(e.clientX - drag.current.dx, -size * 0.35), window.innerWidth - size * 0.65),
        y: Math.min(Math.max(e.clientY - drag.current.dy, -size * 0.35), window.innerHeight - size * 0.65),
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
    const next = Math.min(Math.max(size - e.deltaY * 0.4, MIN), MAX);
    setSize(next);
  };

  // arrow keys nudge, so the lens is usable without a pointer
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
      aria-label="Inspection lens. Drag to move, arrow keys to nudge, scroll to resize, double-click or Escape to stow."
    >
      <span className={styles.field} aria-hidden="true" />
      <span className={styles.reticle} aria-hidden="true" />
      <span className={styles.barrel} aria-hidden="true" />
      <span className={styles.readout} aria-hidden="true">
        ⌀ {Math.round(size)}
      </span>
    </div>
  );
}
