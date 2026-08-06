'use client';

import { useEffect, useRef } from 'react';
import { SECTION_THEMES, type SectionId } from '@/lib/sections';
import styles from './SectionOrb.module.css';

interface Props {
  section: SectionId;
}

/** Mini pulsing orb — echoes neural cluster nuclei on index pages */
export function SectionOrb({ section }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const theme = SECTION_THEMES[section];

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 120;
    canvas.width = size;
    canvas.height = size;

    let raf = 0;
    const draw = (t: number) => {
      const cx = size / 2;
      const cy = size / 2;
      ctx.clearRect(0, 0, size, size);

      const pulse = reduced ? 0.5 : 0.42 + Math.sin(t * 0.0015) * 0.18;
      const outer = ctx.createRadialGradient(cx, cy, 0, cx, cy, 52);
      outer.addColorStop(0, `hsla(${theme.orbHue}, 55%, 68%, ${pulse * 0.55})`);
      outer.addColorStop(0.45, `hsla(${theme.orbHue}, 50%, 55%, ${pulse * 0.2})`);
      outer.addColorStop(1, 'hsla(0,0%,0%,0)');
      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.arc(cx, cy, 52, 0, Math.PI * 2);
      ctx.fill();

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
      core.addColorStop(0, 'rgba(232, 232, 236, 0.95)');
      core.addColorStop(0.6, `hsla(${theme.orbHue}, 40%, 75%, 0.5)`);
      core.addColorStop(1, 'hsla(0,0%,0%,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fill();

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    draw(0);
    if (!reduced) raf = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(raf);
  }, [theme.orbHue]);

  return (
    <div className={styles.wrap} aria-hidden="true">
      <canvas ref={ref} className={styles.canvas} width={120} height={120} />
    </div>
  );
}
