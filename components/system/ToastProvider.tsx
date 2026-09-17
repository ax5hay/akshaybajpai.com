'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import styles from './ToastProvider.module.css';

export type ToastTone = 'note' | 'issue' | 'revision';

export interface ToastSpec {
  /** Short uppercase classification printed in the stamp header. */
  kind?: string;
  message: string;
  detail?: string;
  tone?: ToastTone;
  duration?: number;
}

interface Toast extends Required<Omit<ToastSpec, 'detail'>> {
  id: number;
  detail?: string;
}

interface ToastContextValue {
  toast: (spec: ToastSpec) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ kind = 'Note', message, detail, tone = 'note', duration = 3800 }: ToastSpec) => {
      const id = nextId++;
      // Cap the stack so a key held down cannot bury the sheet in slips.
      setToasts((current) => [...current.slice(-2), { id, kind, message, detail, tone, duration }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration)
      );
    },
    [dismiss]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.stack} role="region" aria-label="Notices">
        {toasts.map((t) => (
          <output key={t.id} className={styles.toast} data-tone={t.tone}>
            <span className={styles.kind}>{t.kind}</span>
            <button
              type="button"
              className={styles.dismiss}
              onClick={() => dismiss(t.id)}
              aria-label={`Dismiss notice: ${t.message}`}
            >
              <span aria-hidden="true">×</span>
            </button>
            <span className={styles.message}>{t.message}</span>
            {t.detail && <span className={styles.detail}>{t.detail}</span>}
            <span
              className={styles.timer}
              style={{ animationDuration: `${t.duration}ms` }}
              aria-hidden="true"
            />
          </output>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  // Toasts are decoration; a missing provider should never break a page.
  return ctx ?? { toast: () => {} };
}
