'use client';

import { useEffect, useRef } from 'react';
import type { OverlayPhase } from './NeuralScene';
import styles from './NeuralOverlay.module.css';

interface Props {
  url: string | null;
  phase: OverlayPhase;
  onClose: () => void;
}

export function NeuralOverlay({ url, phase, onClose }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isOpen = phase === 'open' && url !== null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen && iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
  }, [isOpen]);

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
    >
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div className={styles.panel}>
        <div className={styles.panelGlow} aria-hidden="true" />
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Back to neural map"
        >
          <span aria-hidden="true">×</span>
        </button>
        {url && (
          <iframe
            ref={iframeRef}
            className={styles.frame}
            src={isOpen ? url : 'about:blank'}
            title="Section content"
          />
        )}
      </div>
    </div>
  );
}
