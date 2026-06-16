'use client';

import { useEffect, useState } from 'react';
import styles from './HeroManifesto.module.css';

export function HeroManifesto() {
  const [visible, setVisible] = useState(false);
  const [hints, setHints] = useState({ h1: false, h2: false });

  useEffect(() => {
    const show = () => setVisible(true);
    const t = setTimeout(show, 900);
    window.addEventListener('neuralready', show, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('neuralready', show);
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      setHints({ h1: y > vh * 0.06, h2: y > vh * 0.22 });
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <>
      <section
        className={`${styles.hero} ${visible ? styles.heroVisible : ''}`}
        aria-label="Introduction"
      >
        <div className={styles.text}>
          <h1 className={styles.title}>
            <span className={styles.name}>Akshay Bajpai</span>
            <span className={styles.role}>Architect of Systems</span>
            <span className={styles.role}>Builder of Intelligence</span>
          </h1>
          <a href="#explore" className={styles.cta} aria-label="Explore the mind">
            Explore the mind
          </a>
        </div>
        <div className={styles.scrollPrompt} aria-hidden="true">
          <span className={styles.scrollLabel}>Scroll</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 14" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="12">
            <path d="M2 2l10 10 10-10" />
          </svg>
        </div>
      </section>
      <div className={styles.hints} aria-live="polite">
        <p className={`${styles.hint} ${hints.h1 ? styles.hintVisible : ''}`}>
          Hover nodes to reveal · Click to enter
        </p>
        <p className={`${styles.hint} ${styles.hintSecondary} ${hints.h2 ? styles.hintVisible : ''}`}>
          Shift + scroll for raw mode
        </p>
      </div>
    </>
  );
}
