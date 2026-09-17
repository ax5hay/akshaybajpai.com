'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './AnonymizationNotice.module.css';

const STORAGE_KEY = 'akshaybajpai-anonymization-notice-dismissed';

export function AnonymizationNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') return;
    } catch {
      /* private mode */
    }
    const t = window.setTimeout(() => setVisible(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, dismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${styles.toast} ${visible ? styles.toastVisible : ''}`}
    >
      <p className={styles.text}>
        <strong>Confidentiality note</strong>
        Employer and client names are intentionally omitted here. Case studies describe the systems,
        metrics, and tradeoffs—not who signed the SOW.
      </p>
      <button type="button" className={styles.dismiss} onClick={dismiss}>
        Dismiss
      </button>
    </div>
  );
}
