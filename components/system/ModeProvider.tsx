'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useToast } from './ToastProvider';
import { isMode, MODE_INFO, MODE_STORAGE_KEY, MODES, type Mode } from '@/lib/mode';

interface ModeContextValue {
  mode: Mode;
  setMode: (mode: Mode) => void;
  cycleMode: () => void;
}

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  // ModeScript already wrote the real mode to <html> before paint, so read it
  // back rather than defaulting and causing a visible correction on hydrate.
  const [mode, setModeState] = useState<Mode>('artifact');
  const { toast } = useToast();

  useEffect(() => {
    const current = document.documentElement.dataset.mode;
    if (isMode(current)) setModeState(current);
  }, []);

  const setMode = useCallback(
    (next: Mode) => {
      // <html> is the source of truth, so this stays correct even if a render
      // has not yet flushed. Side effects stay out of the state updater.
      if (document.documentElement.dataset.mode === next) return;

      document.documentElement.dataset.mode = next;
      try {
        localStorage.setItem(MODE_STORAGE_KEY, next);
      } catch {
        // Private browsing: the mode still applies for this session.
      }

      setModeState(next);
      toast({
        kind: `Re-issued · Rev ${MODE_INFO[next].rev}`,
        message: MODE_INFO[next].label,
        detail: MODE_INFO[next].blurb,
        tone: next === 'artifact' ? 'note' : next === 'annotated' ? 'issue' : 'revision',
      });
    },
    [toast]
  );

  const cycleMode = useCallback(() => {
    const current = document.documentElement.dataset.mode;
    const index = isMode(current) ? MODES.indexOf(current) : 0;
    setMode(MODES[(index + 1) % MODES.length]);
  }, [setMode]);

  // `D` cycles the drawing mode from anywhere, except while typing.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key.toLowerCase() !== 'd') return;
      event.preventDefault();
      cycleMode();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cycleMode]);

  const value = useMemo(() => ({ mode, setMode, cycleMode }), [mode, setMode, cycleMode]);

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode(): ModeContextValue {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error('useMode must be used inside ModeProvider');
  return ctx;
}
