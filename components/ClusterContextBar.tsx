'use client';

import type { CSSProperties } from 'react';
import { SECTION_THEMES, type SectionId } from '@/lib/sections';
import styles from './ClusterContextBar.module.css';

interface Props {
  section: SectionId;
}

export function ClusterContextBar({ section }: Props) {
  const theme = SECTION_THEMES[section];

  const close = () => {
    window.parent.postMessage({ type: 'neural-close' }, '*');
  };

  const openFull = () => {
    window.parent.postMessage({ type: 'neural-open-full', url: window.location.pathname }, '*');
  };

  return (
    <div className={styles.bar} data-section={section} style={{ '--section-accent': theme.accent } as CSSProperties}>
      <span className={styles.label}>
        <span className={styles.dot} aria-hidden="true" />
        {theme.label}
      </span>
      <div className={styles.actions}>
        <button type="button" className={styles.full} onClick={openFull}>
          Open full page
        </button>
        <button type="button" className={styles.close} onClick={close}>
          ← Back to map
        </button>
      </div>
    </div>
  );
}
