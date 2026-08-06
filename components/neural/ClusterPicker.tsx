'use client';

import type { CSSProperties } from 'react';
import { NEURAL_CLUSTERS } from '@/lib/neural-clusters';
import styles from './ClusterPicker.module.css';

interface Props {
  onSelect: (index: number, url: string) => void;
}

export function ClusterPicker({ onSelect }: Props) {
  return (
    <nav className={styles.picker} aria-label="Quick section picker">
      <ul className={styles.list}>
        {NEURAL_CLUSTERS.map((cluster, index) => (
          <li key={cluster.slug}>
            <button
              type="button"
              className={styles.btn}
              style={{ '--cluster-accent': cluster.accent } as CSSProperties}
              onClick={() => onSelect(index, cluster.href)}
            >
              {cluster.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
