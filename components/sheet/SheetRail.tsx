'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useInstruments } from '@/components/system/InstrumentProvider';
import { ModeSelector } from '@/components/system/ModeSelector';
import { usePlateMeta } from './PlateMetaProvider';
import type { IndexEntry } from './SheetIndex';
import styles from './SheetRail.module.css';

// The lens is only ever needed on demand, so it stays out of the entry bundle.
const Loupe = dynamic(() => import('./Loupe').then((m) => m.Loupe), { ssr: false });
// Nor is the index, which carries the drafted figures for its preview. The
// cover sheet fetches both while it plays; hovering the button does too.
const SheetIndex = dynamic(() => import('./SheetIndex').then((m) => m.SheetIndex), { ssr: false });

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
        <Link href="/" className={styles.mark} title="Key plan, G-000">
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
            onPointerEnter={() => void import('./SheetIndex')}
            onFocus={() => void import('./SheetIndex')}
            aria-haspopup="dialog"
            aria-label="Index"
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
            // The lens ships as its own chunk; fetch it on intent so the
            // barrel is there by the time the click lands.
            onPointerEnter={() => void import('./Loupe')}
            onFocus={() => void import('./Loupe')}
            aria-pressed={lensOn}
            aria-label="Lens"
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

      {indexOpen && (
        <SheetIndex entries={entries} open onClose={closeIndex} currentSheet={meta.sheet} />
      )}

      {lensOn && <Loupe onDismiss={toggleLens} />}
    </>
  );
}
