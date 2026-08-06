'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { OverlayPhase } from './NeuralScene';
import styles from './NeuralOverlay.module.css';

interface Props {
  url: string | null;
  title: string;
  phase: OverlayPhase;
  onClose: () => void;
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
}

export function NeuralOverlay({ url, title, phase, onClose, closeButtonRef }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const isOpen = phase === 'open' && url !== null;

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], iframe'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'neural-close') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    window.addEventListener('message', onMessage);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('message', onMessage);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen && iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
  }, [isOpen]);

  const openFullPage = () => {
    if (!url) return;
    window.location.href = url;
  };

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-label={title ? `${title} section` : 'Section content'}
    >
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div className={styles.panel} ref={panelRef}>
        <header className={styles.chrome}>
          <span className={styles.title}>{title}</span>
          <div className={styles.actions}>
            {url && (
              <button type="button" className={styles.fullPage} onClick={openFullPage}>
                Open full page
              </button>
            )}
            <button
              type="button"
              ref={closeButtonRef}
              className={styles.close}
              onClick={onClose}
              aria-label="Back to neural map"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </header>
        {loading && isOpen && <div className={styles.loading} aria-live="polite">Loading…</div>}
        {url && (
          <iframe
            key={url}
            ref={iframeRef}
            className={styles.frame}
            src={isOpen ? url : 'about:blank'}
            title={title || 'Section content'}
            onLoad={() => setLoading(false)}
          />
        )}
      </div>
    </div>
  );
}
