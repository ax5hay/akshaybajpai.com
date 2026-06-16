'use client';

import { useEffect } from 'react';
import styles from './ScrollProgress.module.css';

export function ScrollProgress() {
  useEffect(() => {
    const bar = document.querySelector('[data-scroll-progress]') as HTMLElement | null;
    const wrap = document.querySelector(`.${styles.progress}`) as HTMLElement | null;
    if (!bar || !wrap) return;

    const update = () => {
      const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = max > 0 ? window.scrollY / max : 0;
      bar.style.transform = `scaleX(${pct})`;
      wrap.classList.toggle(styles.visible, window.scrollY > 60);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className={styles.progress} aria-hidden="true">
      <div className={styles.bar} data-scroll-progress />
    </div>
  );
}
