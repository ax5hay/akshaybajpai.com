'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollProgress } from '@/components/ScrollProgress';

interface Props {
  children: ReactNode;
  hero?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export function PageShell({ children, hero = false, hideHeader = false, hideFooter = false }: Props) {
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setEmbedded(window.self !== window.top);
  }, []);

  const showHeader = !hideHeader && !embedded;
  const showFooter = !hideFooter && !embedded;

  return (
    <>
      {showHeader && <ScrollProgress />}
      {showHeader && <Header />}
      <main className={hero ? 'page-main page-main--hero' : 'page-main'} id="main-content">
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  );
}
