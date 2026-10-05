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
import { usePathname } from 'next/navigation';
import { PLATES, plateForPath, type Discipline } from '@/lib/plates';

export interface PlateMeta {
  sheet: string;
  title: string;
  subtitle?: string;
  discipline: Discipline;
  scale: string;
  revision: string;
  /** ISO date; the title block prints the issue date. */
  date?: string;
  refs?: string[];
}

interface PlateMetaContextValue {
  meta: PlateMeta;
  /** Detail routes override the section defaults with their own sheet number. */
  setOverride: (meta: PlateMeta | null) => void;
}

const FALLBACK: PlateMeta = {
  sheet: 'X-999',
  title: 'Unissued',
  discipline: 'X',
  scale: 'NTS',
  revision: 'X',
};

const PlateMetaContext = createContext<PlateMetaContextValue | null>(null);

export function PlateMetaProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  const [override, setOverrideState] = useState<{ path: string; meta: PlateMeta } | null>(null);

  // The unissued sheet is exported once and served for any unknown address.
  // It was rendered knowing nothing of that address, so until the reader
  // navigates away the address must not be used to guess a sheet either, or
  // the first client render disagrees with the HTML and React throws the
  // whole tree away. not-found.tsx marks the document before hydration.
  const unissued = useRef(
    typeof document !== 'undefined' && 'unissued' in document.documentElement.dataset
  );
  const landedOn = useRef(pathname);
  if (unissued.current && landedOn.current !== pathname) {
    unissued.current = false;
    delete document.documentElement.dataset.unissued;
  }

  // The override is tagged with the route that set it. Clearing it from an
  // effect here instead would lose every detail sheet's number: child effects
  // run first, so the incoming plate would set its override and this provider
  // would immediately wipe it.
  const setOverride = useCallback((meta: PlateMeta | null) => {
    setOverrideState(meta ? { path: pathRef.current, meta } : null);
  }, []);

  const meta = useMemo<PlateMeta>(() => {
    if (override && override.path === pathname) return override.meta;
    const plate = unissued.current ? undefined : plateForPath(pathname);
    if (!plate) return FALLBACK;
    return {
      sheet: plate.sheet,
      title: plate.title,
      subtitle: plate.subtitle,
      discipline: plate.discipline,
      scale: plate.scale,
      revision: plate.revision,
      refs: plate.refs,
    };
  }, [override, pathname]);

  const value = useMemo(() => ({ meta, setOverride }), [meta, setOverride]);

  useEffect(() => {
    document.documentElement.dataset.discipline = meta.discipline;
  }, [meta.discipline]);

  return <PlateMetaContext.Provider value={value}>{children}</PlateMetaContext.Provider>;
}

export function usePlateMeta(): PlateMetaContextValue {
  const ctx = useContext(PlateMetaContext);
  if (!ctx) throw new Error('usePlateMeta must be used inside PlateMetaProvider');
  return ctx;
}

export const TOTAL_SHEETS = PLATES.length;

/**
 * Rendered by detail routes to stamp their own number into the title block.
 * Renders nothing.
 */
export function SetPlateMeta(meta: PlateMeta) {
  const { setOverride } = usePlateMeta();
  const key = JSON.stringify(meta);

  useEffect(() => {
    setOverride(JSON.parse(key) as PlateMeta);
    return () => setOverride(null);
  }, [key, setOverride]);

  return null;
}
