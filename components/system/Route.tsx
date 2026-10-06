'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSheetSet } from './SheetSet';

/**
 * The reader's route through the set.
 *
 * Which sheets they have read, in the order they first read them. It is kept
 * in their browser and nowhere else; nothing here sends it anywhere. The key
 * plan plots it, the index ticks it off, and the transmittal offers to
 * enclose it, which is the only way it ever leaves the machine and only if
 * the reader ticks the box.
 */

const KEY = 'plate.route';
const EVENT = 'plate:route';
/** Long enough to have read something, not merely passed through. */
const DWELL_MS = 3000;

export function readRoute(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter((h): h is string => typeof h === 'string') : [];
  } catch {
    return [];
  }
}

function writeRoute(route: string[]) {
  try {
    if (route.length) localStorage.setItem(KEY, JSON.stringify(route));
    else localStorage.removeItem(KEY);
  } catch {
    /* nothing to persist to */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function clearRoute() {
  writeRoute([]);
}

/** The route, live. Empty on the server and on the first client render. */
export function useRoute(): string[] {
  const [route, setRoute] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setRoute(readRoute());
    sync();
    window.addEventListener(EVENT, sync);
    // Another tab reading another sheet.
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return route;
}

/**
 * Notes a sheet as read once the reader has stayed on it. Rendered once, in
 * the layout. `hrefs` is every sheet in the set, so nothing else is recorded.
 */
export function RouteTracker() {
  const pathname = usePathname();
  const hrefs = useSheetSet().map((entry) => entry.href).join('\n');

  useEffect(() => {
    const href = pathname.endsWith('/') ? pathname : `${pathname}/`;
    // The key plan is where the route is drawn, not a stop on it.
    if (href === '/' || !hrefs.split('\n').includes(href)) return;

    const timer = setTimeout(() => {
      const route = readRoute();
      if (!route.includes(href)) writeRoute([...route, href]);
    }, DWELL_MS);
    return () => clearTimeout(timer);
  }, [pathname, hrefs]);

  return null;
}
