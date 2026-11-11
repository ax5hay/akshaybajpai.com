'use client';

import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';

/**
 * The hand-drafted figures, each in its own chunk. The case studies share one
 * route, so a static import would ship all three with every case study.
 * React.lazy splits them without next/dynamic's loader runtime, and the
 * static export still renders each drawing into the HTML, so it is on the
 * sheet before its script arrives; hydration waits on the boundary only.
 */
const FIGURES: Record<string, LazyExoticComponent<ComponentType>> = {
  'rebo-reports-in-plain-words': lazy(() => import('./DamFigure').then((m) => ({ default: m.DamFigure }))),
  'keepmeawake-tray-app': lazy(() => import('./EngineLoop').then((m) => ({ default: m.EngineLoop }))),
  'flowstate-offline-video-analytics': lazy(() =>
    import('./ThreatGauge').then((m) => ({ default: m.ThreatGauge }))
  ),
};

export function CaseFigure({ slug }: { slug: string }) {
  const Figure = FIGURES[slug];
  if (!Figure) return null;
  return (
    <Suspense fallback={null}>
      <Figure />
    </Suspense>
  );
}
