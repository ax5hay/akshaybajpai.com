import type { ReactNode } from 'react';

/**
 * A template remounts on every navigation, so the enter animation replays
 * per route without any client-side transition plumbing. The sheet frame and
 * rail live in the layout and stay put, which is what makes a route change
 * read as a new sheet laid on the same board rather than a new page.
 */
export default function PlateTemplate({ children }: { children: ReactNode }) {
  return <div className="plate-enter">{children}</div>;
}
