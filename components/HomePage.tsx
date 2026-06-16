'use client';

import dynamic from 'next/dynamic';
import { PageShell } from '@/components/PageShell';
import { HeroManifesto } from '@/components/HeroManifesto';
import styles from './HomePage.module.css';

const NeuralCanvas = dynamic(
  () => import('@/components/neural/NeuralCanvas').then((m) => m.NeuralCanvas),
  {
    ssr: false,
    loading: () => <div className={styles.loader} aria-hidden="true" />,
  }
);

export function HomePage() {
  return (
    <PageShell hero hideHeader hideFooter>
      <NeuralCanvas />
      <div className={styles.heroViewport}>
        <HeroManifesto />
      </div>
      <div id="explore" className={styles.scrollSpacer} aria-hidden="true" />
    </PageShell>
  );
}
