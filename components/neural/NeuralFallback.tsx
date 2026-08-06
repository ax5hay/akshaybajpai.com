import type { CSSProperties } from 'react';
import { NEURAL_CLUSTERS } from '@/lib/neural-clusters';
import styles from './NeuralFallback.module.css';

interface Props {
  onSelect: (index: number, url: string) => void;
}

/** Static grid when WebGL or motion is unavailable */
export function NeuralFallback({ onSelect }: Props) {
  return (
    <div className={styles.fallback} role="navigation" aria-label="Site sections">
      <p className={styles.lead}>Explore the archive</p>
      <ul className={styles.grid}>
        {NEURAL_CLUSTERS.map((cluster, index) => (
          <li key={cluster.slug}>
            <button
              type="button"
              className={styles.card}
              data-cluster-index={index}
              style={{ '--cluster-accent': cluster.accent } as CSSProperties}
              onClick={() => onSelect(index, cluster.href)}
            >
              <span className={styles.dot} aria-hidden="true" />
              {cluster.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
