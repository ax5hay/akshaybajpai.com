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
import { useToast } from '@/components/system/ToastProvider';

/**
 * The instruments are the parts of the set a reader operates: the index, the
 * inspection lens, and the drawing mode. Their state lives here rather than in
 * the rail so that any surface can offer them. The key plan does exactly that,
 * which is what keeps them from being something you only find by accident.
 */
interface Instruments {
  lensOn: boolean;
  toggleLens: () => void;
  indexOpen: boolean;
  openIndex: () => void;
  closeIndex: () => void;
  /** True on a reader's first visit, until they operate something. */
  inviting: boolean;
}

const InstrumentContext = createContext<Instruments | null>(null);

const INVITED_KEY = 'plate.invited';

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return Boolean(el?.closest('input, textarea, select, [contenteditable="true"]'));
}

export function InstrumentProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [lensOn, setLensOn] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [inviting, setInviting] = useState(false);

  // The announcement is a side effect, so it stays out of the state updater:
  // React invokes updaters twice in development and the lens would announce
  // itself twice every time it was deployed.
  const toggleLens = useCallback(() => {
    setInviting(false);
    setLensOn((on) => !on);
  }, []);

  const announced = useRef(false);
  useEffect(() => {
    if (!lensOn) {
      announced.current = false;
      return;
    }
    if (announced.current) return;
    announced.current = true;
    toast({
      kind: 'Lens deployed',
      message: 'Drag the barrel over the sheet. It names and measures whatever it covers.',
      detail: 'Scroll to resize · Esc or double-click to stow',
      tone: 'revision',
    });
  }, [lensOn, toast]);

  const openIndex = useCallback(() => {
    setInviting(false);
    setIndexOpen(true);
  }, []);
  const closeIndex = useCallback(() => setIndexOpen(false), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIndexOpen((v) => !v);
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;

      if (event.key === '/') {
        event.preventDefault();
        setIndexOpen(true);
        return;
      }
      if (event.key.toLowerCase() === 'l') {
        event.preventDefault();
        toggleLens();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleLens]);

  /**
   * First visit only: say out loud that the set can be operated. A reader who
   * never presses anything should still learn the lens exists.
   */
  useEffect(() => {
    let invited = true;
    try {
      invited = localStorage.getItem(INVITED_KEY) === '1';
    } catch {
      // Private browsing: skip the invitation rather than repeat it every load.
    }
    if (invited) return;

    setInviting(true);
    const timer = setTimeout(() => {
      toast({
        kind: 'This set is instrumented',
        message: 'Open the lens to x-ray any sheet, or switch the drawing mode to see the markup.',
        detail: 'L lens · / index · D mode',
        tone: 'note',
        duration: 9000,
      });
      try {
        localStorage.setItem(INVITED_KEY, '1');
      } catch {
        /* nothing to persist to */
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [toast]);

  const value = useMemo<Instruments>(
    () => ({ lensOn, toggleLens, indexOpen, openIndex, closeIndex, inviting }),
    [lensOn, toggleLens, indexOpen, openIndex, closeIndex, inviting],
  );

  return <InstrumentContext.Provider value={value}>{children}</InstrumentContext.Provider>;
}

export function useInstruments(): Instruments {
  const ctx = useContext(InstrumentContext);
  if (!ctx) throw new Error('useInstruments must be used inside InstrumentProvider');
  return ctx;
}
