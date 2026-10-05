'use client';

import { useEffect } from 'react';

const COLS = 8;
const ROWS = 6;

/**
 * Tracks the pointer against the zone grid printed in the sheet margins. The
 * column number and row letter it is over light up on all four rulers, and
 * the title block reads out the reference, the way you would find a detail on
 * a real sheet by running a finger in from two edges.
 *
 * Written straight to the DOM from one frame-coalesced handler: this fires on
 * every pointer move, and nothing about it needs a render.
 */
export function ZoneCursor() {
  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    let lit: Element[] = [];
    let last = '';

    const paint = () => {
      frame = 0;
      const border = document.querySelector('[data-zone-field]')?.getBoundingClientRect();
      if (!border) return;

      const col = Math.floor(((x - border.left) / border.width) * COLS);
      const row = Math.floor(((y - border.top) / border.height) * ROWS);
      const inside = col >= 0 && col < COLS && row >= 0 && row < ROWS;
      const ref = inside ? `${String.fromCharCode(65 + row)}/${col + 1}` : '';
      if (ref === last) return;
      last = ref;

      lit.forEach((el) => el.removeAttribute('data-on'));
      lit = inside
        ? Array.from(
            document.querySelectorAll(`[data-zone-col="${col + 1}"], [data-zone-row="${row}"]`)
          )
        : [];
      lit.forEach((el) => el.setAttribute('data-on', ''));

      document.querySelectorAll('[data-grid-ref]').forEach((el) => {
        el.textContent = ref;
      });
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame) cancelAnimationFrame(frame);
      lit.forEach((el) => el.removeAttribute('data-on'));
    };
  }, []);

  return null;
}
