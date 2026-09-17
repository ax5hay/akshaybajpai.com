'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './ComparisonSlider.module.css';

interface Props {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
  /** Figure number printed in the corner, e.g. "Fig. 1". */
  figure?: string;
}

const clamp = (v: number) => Math.min(100, Math.max(0, v));

/**
 * A section cut through two states of the same thing. The divider is a real
 * slider input, so it is draggable, focusable, and arrow-key operable without
 * bespoke keyboard handling.
 */
export function ComparisonSlider({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  caption,
  figure = 'Fig. 1',
}: Props) {
  const [split, setSplit] = useState(50);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    setSplit(clamp(((clientX - rect.left) / rect.width) * 100));
  }, []);

  // Dragging is tracked on the window so the pointer can leave the frame
  // mid-drag without the divider sticking.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      setFromClientX(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
      frameRef.current?.removeAttribute('data-dragging');
    };

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [setFromClientX]);

  const startDrag = (e: React.PointerEvent) => {
    dragging.current = true;
    frameRef.current?.setAttribute('data-dragging', 'true');
    setFromClientX(e.clientX);
  };

  return (
    <figure className={styles.figure}>
      <div
        className={styles.frame}
        ref={frameRef}
        onPointerDown={startDrag}
        style={{ '--split': `${split}%` } as React.CSSProperties}
      >
        <div className={styles.layer}>{before}</div>

        {/* The after layer is clipped rather than resized, so no reflow
            happens while the divider moves. */}
        <div className={styles.layer} data-after>
          {after}
        </div>

        <span className={styles.label} data-side="before" aria-hidden="true">
          {beforeLabel}
        </span>
        <span className={styles.label} data-side="after" aria-hidden="true">
          {afterLabel}
        </span>

        <span className={styles.divider} aria-hidden="true">
          <span className={styles.grip}>
            <span className={styles.gripArrow} data-dir="left" />
            <span className={styles.gripArrow} data-dir="right" />
          </span>
        </span>

        <span className={styles.figureNo} aria-hidden="true">
          {figure}
        </span>

        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={split}
          onChange={(e) => setSplit(Number(e.target.value))}
          className={styles.range}
          aria-label={`Reveal ${afterLabel} over ${beforeLabel}`}
          aria-valuetext={`${Math.round(split)}% ${afterLabel}`}
        />
      </div>

      {caption && (
        <figcaption className={styles.caption}>
          <span className={styles.captionNo}>{figure}</span>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
