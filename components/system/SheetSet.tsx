'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { IndexEntry } from '@/components/sheet/SheetIndex';

/**
 * The drawing index, once. The layout builds it on the server and several
 * client parts need it (the rail's index, the cover's prefetch list, the
 * route tracker, the title block's count). Handed to each as a prop it was
 * serialised into the page four times over; through context it is sent once.
 */
const SheetSetContext = createContext<IndexEntry[]>([]);

export function SheetSetProvider({ entries, children }: { entries: IndexEntry[]; children: ReactNode }) {
  return <SheetSetContext.Provider value={entries}>{children}</SheetSetContext.Provider>;
}

export function useSheetSet(): IndexEntry[] {
  return useContext(SheetSetContext);
}
