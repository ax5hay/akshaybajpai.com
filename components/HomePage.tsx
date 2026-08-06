'use client';

import { PageShell } from '@/components/PageShell';
import { HeroManifesto } from '@/components/HeroManifesto';
import { SectionExplorer } from '@/components/SectionExplorer';
import { NeuralCanvas } from '@/components/neural/NeuralCanvas';
import { useMounted } from '@/hooks/useMounted';
import styles from './HomePage.module.css';

export function HomePage() {
  const mounted = useMounted();

  return (
    <PageShell hero hideHeader hideFooter>
      {mounted ? <NeuralCanvas /> : <div className={styles.loader} aria-hidden="true" />}
      <div className={styles.heroViewport}>
        <HeroManifesto />
      </div>
      <div className={styles.scrollSpacer} aria-hidden="true" />
      <SectionExplorer />
    </PageShell>
  );
}
