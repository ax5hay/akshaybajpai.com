'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useInstruments } from '@/components/system/InstrumentProvider';
import { ModeSelector } from '@/components/system/ModeSelector';
import { usePlateMeta } from './PlateMetaProvider';
import { SheetIndex, type IndexEntry } from './SheetIndex';
import styles from './SheetRail.module.css';

// The lens is only ever needed on demand, so it stays out of the entry bundle.
const Loupe = dynamic(() => import('./Loupe').then((m) => m.Loupe), { ssr: false });

export function SheetRail({ entries }: { entries: IndexEntry[] }) {
  const { meta } = usePlateMeta();
  const pathname = usePathname();
  const { lensOn, toggleLens, indexOpen, openIndex, closeIndex } = useInstruments();

  const [condensed, setCondensed] = useState(false);

  const isKeyPlan = pathname === '/' || pathname === '';

  // Route changes stow transient chrome.
  useEffect(() => {
    closeIndex();
  }, [pathname, closeIndex]);

  // The rail thins once the reader is into the sheet, giving the drawing room.
  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 64);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={styles.rail} data-condensed={condensed || undefined}>
        <Link href="/" className={styles.mark} aria-label="Key plan, G-000">
          <span className={styles.monogram} aria-hidden="true">
            AB
          </span>
          <span className={styles.markText}>
            <span className={styles.project}>Architecture of Intelligence</span>
            <span className={styles.set}>Drawing set · Akshay Bajpai</span>
          </span>
        </Link>

        <nav className={styles.locus} aria-label="Current sheet">
          <Link href="/" className={styles.crumb} data-root>
            G-000
          </Link>
          {!isKeyPlan && (
            <>
              <span className={styles.crumbSep} aria-hidden="true" />
              <span className={styles.crumb} aria-current="page">
                {meta.sheet}
              </span>
            </>
          )}
        </nav>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.control}
            onClick={openIndex}
            aria-haspopup="dialog"
          >
            <span className={styles.indexGlyph} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className={styles.controlLabel}>Index</span>
            <kbd className={styles.kbd}>/</kbd>
          </button>

          <button
            type="button"
            className={styles.control}
            onClick={toggleLens}
            aria-pressed={lensOn}
          >
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
              <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <path d="M7.8 7.8l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
            </svg>
            <span className={styles.controlLabel}>Lens</span>
            <kbd className={styles.kbd}>L</kbd>
          </button>

          <ModeSelector />
        </div>
      </header>

      <SheetIndex
        entries={entries}
        open={indexOpen}
        onClose={closeIndex}
        currentSheet={meta.sheet}
      />

      {lensOn && <Loupe onDismiss={toggleLens} />}
    </>
  );
}
