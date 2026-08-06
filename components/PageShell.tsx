'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ScrollProgress } from '@/components/ScrollProgress';
import { ClusterContextBar } from '@/components/ClusterContextBar';
import { AtmosphereCanvas } from '@/components/atmosphere/AtmosphereCanvas';
import { NeuralVeins } from '@/components/atmosphere/NeuralVeins';
import { applySectionTheme, getSectionFromPath } from '@/lib/sections';
import { useMounted } from '@/hooks/useMounted';

interface Props {
  children: ReactNode;
  hero?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

function detectEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function PageShell({ children, hero = false, hideHeader = false, hideFooter = false }: Props) {
  const pathname = usePathname();
  const mounted = useMounted();
  const [embedded, setEmbedded] = useState(false);
  const section = getSectionFromPath(pathname);
  const isHome = pathname === '/' || pathname === '';
  const showAtmosphere = mounted && !isHome && !embedded && !hero;

  useEffect(() => {
    setEmbedded(detectEmbedded());
  }, []);

  useEffect(() => {
    applySectionTheme(section);
    return () => applySectionTheme(null);
  }, [section]);

  const showHeader = !hideHeader && !embedded;
  const showFooter = !hideFooter && !embedded;

  return (
    <>
      {showAtmosphere && (
        <>
          <AtmosphereCanvas />
          <NeuralVeins />
        </>
      )}
      {mounted && embedded && section && <ClusterContextBar section={section} />}
      {showHeader && <ScrollProgress />}
      {showHeader && <Header />}
      <main
        className={hero ? 'page-main page-main--hero' : 'page-main'}
        id="main-content"
        data-section={section ?? undefined}
        data-embedded={mounted && embedded ? true : undefined}
      >
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  );
}
