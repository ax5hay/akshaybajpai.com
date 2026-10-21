import type { ReactNode } from 'react';
import { V, type Key, type Said } from '@/lib/voice';

/**
 * A phrase at all three levels, in static markup. Each level is rendered
 * and the stylesheet shows the one the document's mode calls for, so server
 * components say the right thing with no script and nothing to hydrate.
 * Client components with the mode in hand use `useVoice` instead.
 */
export function Voice({ k, s }: { k?: Key; s?: Said }) {
  const said = s ?? (k ? V[k] : undefined);
  if (!said) return null;
  return (
    <>
      <span data-v="a">{said.a}</span>
      <span data-v="b">{said.b}</span>
      <span data-v="c">{said.c}</span>
    </>
  );
}

/** The same, for a phrase given as three nodes rather than three strings. */
export function Levels({ a, b, c }: { a: ReactNode; b: ReactNode; c: ReactNode }) {
  return (
    <>
      <span data-v="a">{a}</span>
      <span data-v="b">{b}</span>
      <span data-v="c">{c}</span>
    </>
  );
}
