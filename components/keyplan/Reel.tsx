'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { PlateFigure, figureCaption, hasFigure } from '@/components/figures/PlateFigure';
import type { PlacedPlate } from '@/lib/plates';
import type { KeyPlanContents } from './KeyPlan';
import styles from './Reel.module.css';

/**
 * The tour, on a phone.
 *
 * A phone cannot fly a camera over a plan it has no room to show, so the tour
 * is told the way a phone tells things: one sheet to a screen, a row of
 * segments along the top that fill as each is held, a tap on the right to go
 * on and on the left to go back, a finger held down to stop and look, and a
 * swipe down to leave.
 *
 * The timing is the segment's own CSS animation and the reel advances on its
 * `animationend`, so holding a finger down pauses the fill and the tour with
 * it, with no timer to keep in step. Everything that moves is a transform or
 * an opacity.
 */
export function Reel({
  plates,
  contents,
  read,
  onClose,
}: {
  plates: PlacedPlate[];
  contents: KeyPlanContents;
  read: Set<string>;
  onClose: () => void;
}) {
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);
  const press = useRef({ x: 0, y: 0, t: 0, moved: false });
  const cardRef = useRef<HTMLDivElement>(null);
  const plate = plates[at];

  const go = useCallback(
    (step: number) => {
      setAt((i) => {
        const next = i + step;
        if (next >= plates.length) {
          onClose();
          return i;
        }
        return Math.max(0, next);
      });
    },
    [plates.length, onClose]
  );

  // The page behind does not scroll, and Escape leaves, for a keyboard that
  // happens to be attached.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.dataset.dialog = '';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      delete document.documentElement.dataset.dialog;
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [go, onClose]);

  const onPointerDown = (event: React.PointerEvent) => {
    if ((event.target as Element).closest('a, button')) return;
    press.current = { x: event.clientX, y: event.clientY, t: performance.now(), moved: false };
    setHeld(true);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!held) return;
    const dy = event.clientY - press.current.y;
    if (Math.abs(dy) > 8) press.current.moved = true;
    // The card follows a downward drag, so leaving feels like putting it down.
    if (dy > 0 && cardRef.current) {
      cardRef.current.style.transform = `translate3d(0, ${dy}px, 0)`;
      cardRef.current.style.opacity = String(Math.max(0.3, 1 - dy / 500));
    }
  };

  const onPointerUp = (event: React.PointerEvent) => {
    if (!held) return;
    setHeld(false);
    const dy = event.clientY - press.current.y;
    const quick = performance.now() - press.current.t < 320;
    if (cardRef.current) {
      cardRef.current.style.transform = '';
      cardRef.current.style.opacity = '';
    }
    if (dy > 110) {
      onClose();
      return;
    }
    // A long press was a pause; only a quick, still tap turns the page.
    if (!quick || press.current.moved) return;
    go(event.clientX < window.innerWidth * 0.33 ? -1 : 1);
  };

  const items = contents[plate.id] ?? [];
  const done = (read.has(plate.href) ? 1 : 0) + items.filter((i) => i.href && read.has(i.href)).length;
  const last = at === plates.length - 1;

  // Rendered on the body: the plan sits in a stacking context under the rail
  // and the dock, and the reel has to cover both.
  return createPortal(
    <div
      className={styles.reel}
      role="dialog"
      aria-modal="true"
      aria-label={`Tour, sheet ${at + 1} of ${plates.length}: ${plate.title}`}
      data-held={held || undefined}
      data-lens-skip
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => setHeld(false)}
    >
      <div className={styles.segments} aria-hidden="true">
        {plates.map((p, i) => (
          <span key={p.sheet} className={styles.segment} data-state={i < at ? 'done' : i === at ? 'on' : undefined}>
            {i === at && <span key={at} className={styles.fill} onAnimationEnd={() => go(1)} />}
          </span>
        ))}
      </div>

      <div className={styles.top}>
        <span className={styles.count}>
          Tour · {String(at + 1).padStart(2, '0')} / {String(plates.length).padStart(2, '0')}
        </span>
        <button type="button" className={styles.close} onClick={onClose}>
          Close ×
        </button>
      </div>

      {/* Re-keyed per sheet, so each one is laid down and its figure plotted. */}
      <div
        ref={cardRef}
        key={plate.sheet}
        className={`${styles.card} composited ${plate.id === 'contact' ? 'reversed' : ''}`}
      >
        <span className={styles.tag}>{plate.sheet}</span>
        <h2 className={styles.title}>{plate.title}</h2>
        <p className={styles.subtitle}>{plate.subtitle}</p>

        {hasFigure(plate.id) && (
          <div className={styles.figure}>
            <PlateFigure id={plate.id} />
            <span className={styles.caption}>{figureCaption(plate.id)}</span>
          </div>
        )}

        <ul className={styles.rows}>
          {items.slice(0, 4).map((item, i) => (
            <li key={i}>
              {item.sheet && <span>{item.sheet}</span>}
              {item.title}
            </li>
          ))}
        </ul>

        <div className={styles.foot}>
          <span className={styles.read}>
            {done > 0 ? `${done} of ${items.filter((i) => i.href).length + 1} read` : `Rev ${plate.revision} · ${plate.scale}`}
          </span>
          <Link href={plate.href} className={styles.open} onClick={onClose}>
            {last ? 'Write to me →' : 'Open sheet →'}
          </Link>
        </div>
      </div>

      <p className={styles.help} aria-hidden="true">
        {held ? 'Holding' : 'Tap to turn · hold to pause · swipe down to leave'}
      </p>
    </div>,
    document.body
  );
}
