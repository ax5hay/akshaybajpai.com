'use client';

import { useEffect, useRef } from 'react';
import styles from './AtmosphereCanvas.module.css';

/** Lightweight 2D biolume spores — subtle ambient layer for inner pages */
export function AtmosphereCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;

    const spores = Array.from({ length: reduced ? 0 : 48 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.8 + Math.random() * 2.2,
      hue: [160, 42, 280, 12][Math.floor(Math.random() * 4)],
      phase: Math.random() * Math.PI * 2,
      drift: 0.00006 + Math.random() * 0.00012,
    }));

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of spores) {
        s.y -= s.drift * h;
        if (s.y < 0) s.y = 1;
        const pulse = 0.3 + Math.sin(t * 0.001 + s.phase) * 0.22;
        const x = s.x * w + Math.sin(t * 0.0004 + s.phase) * 10;
        const y = s.y * h;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, s.r * 8);
        grad.addColorStop(0, `hsla(${s.hue}, 65%, 62%, ${pulse * 0.28})`);
        grad.addColorStop(1, 'hsla(0,0%,0%,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, s.r * 8, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className={styles.canvas} aria-hidden="true" />;
}
