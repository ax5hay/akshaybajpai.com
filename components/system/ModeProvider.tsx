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

/** Browser chrome follows the board, so the tab bar re-inks with the sheet. */
const THEME_COLOR: Record<Mode, string> = {
  artifact: '#ded2b8',
  annotated: '#082139',
  raw: '#08080a',
};

type WipeDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

/** Where the last press landed, so the new mode can develop out from it. */
const lastPress = { x: 0, y: 0, at: 0 };

/**
 * Apply a mode change as an exposure spreading from where it was asked for:
 * the press if there was one, otherwise the switch in the rail.
 */
function develop(apply: () => void) {
  const doc = document as WipeDocument;
  const root = document.documentElement;
  if ('wipe' in root.dataset) {
    apply();
    return;
  }
  if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // No exposure to hide behind: the palette just changes. Transitions are
    // still held off for the change itself, because a few hundred elements
    // each cross-fading three colours is the slowest part of a re-issue.
    root.dataset.wipe = '';
    apply();
    requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.wipe));
    return;
  }

  let { x, y } = lastPress;
  if (performance.now() - lastPress.at > 500) {
    const dial = document.querySelector('[role="radiogroup"]')?.getBoundingClientRect();
    x = dial ? dial.left + dial.width / 2 : window.innerWidth / 2;
    y = dial ? dial.top + dial.height / 2 : 0;
  }
  root.style.setProperty('--wipe-x', `${x}px`);
  root.style.setProperty('--wipe-y', `${y}px`);
  root.dataset.wipe = '';

  doc
    .startViewTransition(apply)
    .finished.catch(() => {})
    .finally(() => delete root.dataset.wipe);
}

function paintThemeColor(mode: Mode) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[mode]);
}

export function ModeProvider({ children }: { children: ReactNode }) {
  // ModeScript already wrote the real mode to <html> before paint, so read it
  // back rather than defaulting and causing a visible correction on hydrate.
  const [mode, setModeState] = useState<Mode>('artifact');
  const { toast } = useToast();

  useEffect(() => {
    const current = document.documentElement.dataset.mode;
    if (isMode(current)) {
      setModeState(current);
      paintThemeColor(current);
    }
  }, []);

  const setMode = useCallback(
    (next: Mode) => {
      // <html> is the source of truth, so this stays correct even if a render
      // has not yet flushed. Side effects stay out of the state updater.
      if (document.documentElement.dataset.mode === next) return;

      develop(() => {
        document.documentElement.dataset.mode = next;
      });
      paintThemeColor(next);
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
        tone: 'issue',
        group: 'mode',
      });
    },
    [toast]
  );

  const cycleMode = useCallback(() => {
    const current = document.documentElement.dataset.mode;
    const index = isMode(current) ? MODES.indexOf(current) : 0;
    setMode(MODES[(index + 1) % MODES.length]);
  }, [setMode]);

  useEffect(() => {
    const onPress = (event: PointerEvent) => {
      lastPress.x = event.clientX;
      lastPress.y = event.clientY;
      lastPress.at = performance.now();
    };
    window.addEventListener('pointerdown', onPress, true);
    return () => window.removeEventListener('pointerdown', onPress, true);
  }, []);

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
