'use client';

import { useEffect, useRef } from 'react';

/**
 * A measured figure that counts up to itself when it comes into view.
 *
 * The server renders the real value, so a reader without script, a crawler
 * and a printout all get the figure as written. Script only replays the
 * approach to it, once, and only the numeric part: the `~`, `Sub-`, `%`, `K+`
 * around it stay put, so the row never changes width as it runs.
 */
const PARTS = /^([^\d]*)(\d+(?:\.\d+)?)(.*)$/;

export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parts = value.match(PARTS);
    if (!el || !parts) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const [, prefix, figure, suffix] = parts;
    const target = Number(figure);
    const decimals = (figure.split('.')[1] ?? '').length;
    let frame = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const run = (now: number) => {
          const t = Math.min(1, (now - start) / 900);
          // Fast out, long settle: the last digits are the ones that are read.
          const eased = 1 - Math.pow(1 - t, 4);
          el.textContent = `${prefix}${(target * eased).toFixed(decimals)}${suffix}`;
          if (t < 1) frame = requestAnimationFrame(run);
          else el.textContent = value;
        };
        frame = requestAnimationFrame(run);
      },
      { threshold: 0.6 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (frame) cancelAnimationFrame(frame);
      el.textContent = value;
    };
  }, [value]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </span>
  );
}
