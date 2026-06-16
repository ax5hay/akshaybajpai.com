'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function HomeHeroBodyClass() {
  const pathname = usePathname();

  useEffect(() => {
    const isHome = pathname === '/';
    document.body.classList.toggle('home-hero', isHome);

    if (!isHome) {
      document.body.classList.remove('scrolled-past-hero');
      return;
    }

    const update = () => {
      document.body.classList.toggle('scrolled-past-hero', window.scrollY > window.innerHeight * 0.55);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', update);
      document.body.classList.remove('home-hero', 'scrolled-past-hero');
    };
  }, [pathname]);

  return null;
}
