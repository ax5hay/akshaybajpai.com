'use client';

import { useEffect } from 'react';

export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('reveal-visible');
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0 }
    );

    document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
