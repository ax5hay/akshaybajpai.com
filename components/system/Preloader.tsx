'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Preloader.module.css';

/**
 * The cover sheet. Shown once per visit, before the set is laid out.
 *
 * It is one composition printed three times, once per drawing mode, and the
 * three prints are stacked in exact register: same type, same size, same
 * position, different ink. Two slanted seams cut between them, so the name
 * reads straight across paper, cyanotype and source without a break. The
 * seams then run out in favour of whichever mode the reader is in, and the
 * cover lifts off the board.
 *
 * The whole sequence is CSS, including its own removal, so it cannot strand a
 * reader whose script never arrives. Script only adds two things: skipping it
 * on a key or a press, and not showing it again this session (ModeScript sets
 * `data-preloaded` before paint on later loads).
 */

/** Must outlast the `pre-lift` animation in the stylesheet. */
const RUN_MS = 3400;

function Print({ total }: { total: number }) {
  return (
    <div className={styles.comp}>
      <span className={styles.kicker}>
        <span className={styles.tag}>G-000</span>
        The Architecture of Intelligence
      </span>

      <span className={styles.nameBox}>
        <span className={styles.rule} />
        <span className={styles.name}>Akshay Bajpai</span>

        {/* Cyanotype only: the construction lines the letters sit on. */}
        <span className={styles.guides}>
          <span data-line="cap" />
          <span data-line="x" />
          <span data-line="base" />
        </span>

        {/* Source only: the element the name is. */}
        <span className={styles.open}>&lt;h1&gt;</span>
        <span className={styles.close}>&lt;/h1&gt;</span>
      </span>

      <span className={styles.dim}>
        <span className={styles.tick} />
        <span className={styles.line} />
        <span className={styles.role}>Architect of systems · Builder of intelligence</span>
        <span className={styles.line} />
        <span className={styles.tick} />
      </span>

      <p className={styles.sub}>
        Drawn for a wide screen. Open it on desktop for the full set, at full thrust.
      </p>

      <span className={styles.count} style={{ '--total': total } as React.CSSProperties}>
        Issuing set <span className={styles.countNo} /> of {total} sheets
      </span>
    </div>
  );
}

export function Preloader({ total }: { total: number }) {
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if ('preloaded' in root.dataset) {
      setDone(true);
      return;
    }

    const finish = () => {
      // Also zeroes --boot, which is what was holding the plan's own plot
      // back until the cover was off it.
      root.dataset.preloaded = '';
      setDone(true);
    };

    let leaving: ReturnType<typeof setTimeout> | undefined;
    const skip = () => {
      if (leaving) return;
      ref.current?.setAttribute('data-skip', '');
      leaving = setTimeout(finish, 260);
    };

    const timer = setTimeout(finish, RUN_MS);
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      clearTimeout(timer);
      if (leaving) clearTimeout(leaving);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, []);

  if (done) return null;

  return (
    <div ref={ref} className={styles.pre} aria-hidden="true">
      <div className={`${styles.layer} ${styles.raw}`}>
        <Print total={total} />
      </div>
      <div className={`${styles.layer} ${styles.annot}`}>
        <Print total={total} />
      </div>
      <div className={`${styles.layer} ${styles.paper}`}>
        <Print total={total} />
      </div>

      <span className={`${styles.seam} ${styles.seamOuter}`} />
      <span className={`${styles.seam} ${styles.seamInner}`} />

      <span className={styles.band} data-band="a">
        <b>Rev A</b> Artifact
      </span>
      <span className={styles.band} data-band="b">
        <b>Rev B</b> Annotated
      </span>
      <span className={styles.band} data-band="c">
        <b>Rev C</b> Raw
      </span>
    </div>
  );
}
