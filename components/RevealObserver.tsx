'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function revealAll() {
  document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach((el) => {
    el.classList.add('reveal-visible');
  });
}

export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const embedded = window.self !== window.top;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (embedded) {
      document.documentElement.classList.add('embedded');
    }

    if (embedded || reduced) {
      // IntersectionObserver is unreliable inside iframe modals — show content immediately
      revealAll();
      return () => {
        if (embedded) document.documentElement.classList.remove('embedded');
      };
    }

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
  }, [pathname]);

  return null;
}
