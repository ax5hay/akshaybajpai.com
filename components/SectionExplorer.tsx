'use client';

import type { CSSProperties } from 'react';
import { NEURAL_CLUSTERS, SECONDARY_SECTIONS } from '@/lib/neural-clusters';
import styles from './SectionExplorer.module.css';

export function SectionExplorer() {
  const openCluster = (index: number) => {
    window.dispatchEvent(new CustomEvent('neural-select-cluster', { detail: { cluster: index } }));
  };

  const openUrl = (url: string) => {
    window.dispatchEvent(new CustomEvent('neural-navigate', { detail: { url } }));
  };

  return (
    <section id="explore" className={styles.explorer} data-section-explorer aria-label="Explore sections">
      <p className={styles.eyebrow}>Explore the archive</p>
      <h2 className={styles.heading}>Every cluster is a room</h2>

      <ul className={styles.clusters}>
        {NEURAL_CLUSTERS.map((cluster, index) => (
          <li key={cluster.slug}>
            <button
              type="button"
              className={styles.clusterBtn}
              data-cluster-index={index}
              style={{ '--cluster-accent': cluster.accent } as CSSProperties}
              onClick={() => openCluster(index)}
            >
              <span className={styles.clusterDot} aria-hidden="true" />
              <span className={styles.clusterTitle}>{cluster.title}</span>
              <span className={styles.clusterHint}>{cluster.raw}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className={styles.secondaryLabel}>Also</p>
      <ul className={styles.secondary}>
        {SECONDARY_SECTIONS.map((section) => (
          <li key={section.slug}>
            <button type="button" className={styles.secondaryBtn} onClick={() => openUrl(section.href)}>
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
