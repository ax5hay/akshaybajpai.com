import type { ReactNode } from 'react';

/**
 * A phrase at the set's three levels, as the Voice component prints it, for
 * client components on A-103. It renders the same three spans and relies on
 * the same stylesheet, but does not import lib/voice: that table is about
 * 5 kB and these sheets need none of it.
 */
export interface Said3 {
  a: ReactNode;
  b: ReactNode;
  c: ReactNode;
}

export function Say({ s }: { s: Said3 }) {
  return (
    <>
      <span data-v="a">{s.a}</span>
      <span data-v="b">{s.b}</span>
      <span data-v="c">{s.c}</span>
    </>
  );
}
