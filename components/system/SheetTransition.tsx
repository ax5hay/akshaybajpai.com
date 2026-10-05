'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Sheet-to-sheet navigation as one continuous move.
 *
 * A route change is wrapped in a view transition. Whatever is named `sheet`
 * before the change morphs into whatever is named `sheet` after it: a plate on
 * the key plan grows into the page it stands for, and folds back onto the plan
 * on the way home. Between two content sheets the outgoing one reshapes into
 * the incoming one, which is what laying a new sheet on the board looks like.
 *
 * Browsers without the API, and readers who ask for reduced motion, get the
 * plain route change.
 */

interface SheetTransitionValue {
  /** Navigate, morphing from `source` when one is given. */
  navigate: (href: string, source?: HTMLElement) => void;
  supported: boolean;
}

const SheetTransitionContext = createContext<SheetTransitionValue | null>(null);

type TransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void> | void) => { finished: Promise<void> };
};

/** The route the reader was on before the current one. */
let previousPath: string | null = null;

export function lastSheetPath(): string | null {
  return previousPath;
}

const canTransition = () =>
  typeof document !== 'undefined' &&
  typeof (document as TransitionDocument).startViewTransition === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function SheetTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const committed = useRef<(() => void) | null>(null);

  // The new route has rendered: let the transition take its second snapshot.
  useEffect(() => {
    committed.current?.();
    committed.current = null;
  }, [pathname]);

  const navigate = useCallback(
    (href: string, source?: HTMLElement) => {
      const target = new URL(href, window.location.href);
      if (!canTransition() || target.pathname === window.location.pathname) {
        router.push(href);
        return;
      }

      previousPath = window.location.pathname;
      // Entrance animations start from invisible, and the incoming snapshot is
      // taken on the first frame. The flag turns them off for the rest of the
      // visit: from here on the transition is the entrance.
      document.documentElement.dataset.vt = '';
      source?.style.setProperty('view-transition-name', 'sheet');

      const transition = (document as TransitionDocument).startViewTransition!(
        () =>
          new Promise<void>((resolve) => {
            committed.current = resolve;
            router.push(href);
            // Never hold the page frozen if the route fails to commit.
            setTimeout(resolve, 1600);
          })
      );
      transition.finished
        .catch(() => {})
        .finally(() => source?.style.removeProperty('view-transition-name'));
    },
    [router]
  );

  // Every in-site link takes the same road, without each one opting in.
  // Capture phase, so the link's own handler sees the event already handled.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      // Plates on the key plan tell a click from a pan before they navigate.
      if (link.hasAttribute('data-plan-sheet')) return;

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      if (!canTransition()) return;

      event.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate]);

  const value = useMemo(
    () => ({ navigate, supported: typeof document !== 'undefined' && canTransition() }),
    [navigate]
  );

  return (
    <SheetTransitionContext.Provider value={value}>{children}</SheetTransitionContext.Provider>
  );
}

export function useSheetTransition(): SheetTransitionValue {
  const ctx = useContext(SheetTransitionContext);
  if (!ctx) throw new Error('useSheetTransition must be used inside SheetTransitionProvider');
  return ctx;
}
