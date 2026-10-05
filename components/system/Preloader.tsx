'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Preloader.module.css';

/**
 * The cover sheet. Shown once per visit, and it earns the time it takes.
 *
 * WHAT IT SHOWS. One composition printed three times, once per drawing mode,
 * stacked in exact register: same type, same size, same position, different
 * ink. The source print comes first, the cyanotype is exposed across it, the
 * paper is laid across that, and then the two seams draw back so all three
 * stand side by side with the name running straight through them.
 *
 * WHAT IT DOES. While that plays it issues the set: waits for the typefaces,
 * fetches the inspection lens, and prefetches every other sheet into the
 * router's cache. The counter and the meter are that work, not a timer. When
 * it is done the cover is stamped, the seams run out in favour of the mode
 * the reader is in, and it lifts; from then on every sheet opens instantly.
 *
 * WHAT IT SAYS. That this is best seen on a desktop. That is half of why the
 * cover exists, so it is set as a notice, not a caption, and it changes with
 * the screen it finds itself on.
 *
 * WHAT IT TOURS. Once the three prints stand side by side, the seams travel:
 * each mode in turn is given most of the sheet and says what it is. The tour
 * loops for as long as the fetching takes and plays through once regardless.
 *
 * HOW IT ENDS. The moment the set is actually loaded, a button offers the way
 * in, and Enter does the same. Nobody is made to sit through a show to reach
 * a page that is already there. Beside the button a counter runs down to the
 * moment the cover will lift by itself. Any other key, or a tap anywhere off
 * the button, holds it there: the count stops, the tour carries on, and the
 * reader stays as long as they like. The same again resumes it.
 *
 * WHAT HOLDS IT UP. Nothing, for long: loading is given up on after twelve
 * seconds and the way in is offered anyway, a metered or slow connection only
 * fetches the seven section sheets, and without script the stylesheet runs
 * the whole sequence, and removes it, on a fixed clock.
 */

export interface CoverSheet {
  sheet: string;
  title: string;
  href: string;
}

/** The staged entrance, then one full tour of the three modes. */
const INTRO_MS = 3600;
const TOUR_MS = 6000;
/** Left alone, the cover leaves when the tour has played through once. */
const MIN_MS = INTRO_MS + TOUR_MS + 300;
/** The count never starts lower than this, and resumes from this after a hold. */
const COUNT_MIN_S = 6;
/** Stop waiting on the network by now, and offer the way in regardless. */
const LOAD_CEILING_MS = 12000;
/** Seams out, then lift. Mirrors the `[data-ready]` animations. */
const LIFT_AT_MS = 1500;
const GONE_AT_MS = 2200;
/** The same, when the reader has asked to get on with it. */
const HURRY_LIFT_AT_MS = 320;
const HURRY_GONE_AT_MS = 800;
/** Earliest the way in is shown: the button itself inks in at one second. */
const OFFER_FROM_MS = 1400;
/** The count starts once the progress block has inked in. */
const COUNT_FROM_MS = 1300;

type Connection = { saveData?: boolean; effectiveType?: string };

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

        {/* Struck when the set is issued. */}
        <span className={styles.stamp}>
          <span>Issued</span>
          <span>Cleared for full thrust</span>
        </span>
      </span>

      <span className={styles.dim}>
        <span className={styles.tick} />
        <span className={styles.line} />
        <span className={styles.role}>Architect of systems · Builder of intelligence</span>
        <span className={styles.line} />
        <span className={styles.tick} />
      </span>

      {/* Half the reason the cover exists. Which sentence follows the lead
          depends on the screen: see the media queries in the stylesheet. */}
      <p className={styles.notice}>
        <span className={styles.noticeLead}>Best viewed on desktop.</span>
        <span className={styles.noticeWide}>
          You are on a wide screen: this is the full set, at full thrust.
        </span>
        <span className={styles.noticeNarrow}>
          This set is drawn for a wide screen. It holds on a phone; the plan, the lens and the
          transitions open up on a desktop.
        </span>
      </p>

      <span className={styles.progress}>
        <span className={styles.count}>
          Issuing set <span className={styles.countNo} /> of{' '}
          <span className={styles.countTotal}>{total}</span> sheets
        </span>
        <span className={styles.meter} />
        <span className={styles.task} />
      </span>
    </div>
  );
}

export function Preloader({ sheets }: { sheets: CoverSheet[] }) {
  const [done, setDone] = useState(false);
  /** The set is in the cache: the way in can be offered. */
  const [loaded, setLoaded] = useState(false);
  /** Sheets this visit will actually fetch: fewer on a frugal connection. */
  const [issuing, setIssuing] = useState(sheets.length);
  /** Seconds until the cover lifts by itself, and whether that is on hold. */
  const [left, setLeft] = useState(0);
  const [run, setRun] = useState(0);
  const [held, setHeld] = useState(false);
  const enter = useRef<() => void>(() => {});
  const toggleHold = useRef<() => void>(() => {});
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const el = ref.current;
    if ('preloaded' in root.dataset || !el) {
      setDone(true);
      return;
    }

    const started = performance.now();
    const here = pathname.endsWith('/') ? pathname : `${pathname}/`;
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    // A phone is the device most likely to be on a metered or patchy link,
    // and Safari does not report the connection at all, so a narrow screen
    // is treated the same as one that asks to save data.
    const frugal =
      Boolean(connection?.saveData) ||
      /(^|-)2g|3g/.test(connection?.effectiveType ?? '') ||
      window.matchMedia('(max-width: 40rem)').matches;

    // The section sheets always; the detail sheets too unless that would be
    // spending someone's data allowance on pages they have not asked for.
    const wanted = sheets.filter(
      (s) => s.href !== here && (!frugal || s.href.split('/').filter(Boolean).length <= 1)
    );
    const pending = new Map(wanted.map((s) => [s.href, s]));
    // The sheet being read is already issued.
    const total = wanted.length + 1;
    let issued = 1;
    let fontsReady = false;
    let lensReady = false;
    // Sheets that have landed but not yet been counted on the cover. On a
    // fast connection the whole set arrives before the cover has finished
    // being drawn, so the count is paced: it never shows a sheet that has not
    // landed, it just does not show them all in one frame.
    const landedQueue: CoverSheet[] = [];

    const show = (task: string) => {
      const steps = total + 2;
      const stepsDone = issued + (fontsReady ? 1 : 0) + (lensReady ? 1 : 0);
      el.style.setProperty('--issued', String(issued));
      el.style.setProperty('--p', String(Math.min(1, stepsDone / steps)));
      el.style.setProperty('--task', JSON.stringify(task));
    };
    // In state, not written to the DOM: the next render would put the full
    // count straight back.
    setIssuing(total);
    show('Setting type');

    let released = false;
    let timers: Array<ReturnType<typeof setTimeout>> = [];

    const release = (hurry = false) => {
      if (released) return;
      released = true;
      if (hurry) el.setAttribute('data-hurry', '');
      else show('Set issued');
      // The seams are mid-breath; the run-out has to start from where they
      // actually are, so their live values are handed to its keyframes.
      const live = getComputedStyle(el);
      el.style.setProperty('--r1', live.getPropertyValue('--s1'));
      el.style.setProperty('--r2', live.getPropertyValue('--s2'));
      el.style.setProperty('--r3', live.getPropertyValue('--slant'));
      el.setAttribute('data-ready', '');
      timers.push(
        setTimeout(
          () => {
            // Lets the plan start plotting as the cover comes off it.
            root.dataset.issued = '';
          },
          hurry ? HURRY_LIFT_AT_MS : LIFT_AT_MS
        ),
        setTimeout(
          () => {
            root.dataset.preloaded = '';
            setDone(true);
          },
          hurry ? HURRY_GONE_AT_MS : GONE_AT_MS
        )
      );
    };

    let offered = false;
    let canEnter = false;
    let holding = false;
    let deadline = 0;
    let counter: ReturnType<typeof setInterval> | undefined;

    /** Run the count down from `seconds`, and lift the cover when it ends. */
    const count = (seconds: number) => {
      deadline = performance.now() + seconds * 1000;
      el.style.setProperty('--count', `${seconds}s`);
      setLeft(seconds);
      // Restarts the ring's own animation from full.
      setRun((n) => n + 1);
      if (counter) clearInterval(counter);
      counter = setInterval(() => {
        if (holding || released) return;
        const remaining = Math.ceil((deadline - performance.now()) / 1000);
        setLeft(Math.max(0, remaining));
        if (remaining <= 0) {
          clearInterval(counter);
          release();
        }
      }, 200);
    };

    /** Everything has landed (or been given up on): offer the way in. */
    const offer = () => {
      if (offered) return;
      offered = true;
      // As soon as that is true, bar the first beat in which the cover is
      // still drawing itself and there is nowhere yet to put a button.
      const untilDrawn = Math.max(0, OFFER_FROM_MS - (performance.now() - started));
      timers.push(
        setTimeout(() => {
          canEnter = true;
          setLoaded(true);
          enter.current = () => release(true);
          toggleHold.current = () => {
            if (released) return;
            holding = !holding;
            setHeld(holding);
            if (!holding) count(COUNT_MIN_S);
          };
          // Long enough for the tour to play through once.
          const toTour = Math.ceil((MIN_MS - (performance.now() - started)) / 1000);
          count(Math.max(COUNT_MIN_S, toTour));
        }, untilDrawn)
      );
    };

    // On what has actually landed, not on what the paced count has got
    // round to showing: the way in is offered the moment it is real.
    const settle = () => {
      if (pending.size || !fontsReady || !lensReady) return;
      offer();
    };

    // One sheet per beat, with the beat set so a full set counts up across
    // the time the triptych is forming.
    const beat = Math.max(55, Math.min(140, (INTRO_MS + 1400 - COUNT_FROM_MS) / total));
    let ticker: ReturnType<typeof setInterval> | undefined;
    timers.push(
      setTimeout(() => {
        ticker = setInterval(() => {
          const sheet = landedQueue.shift();
          if (!sheet) return;
          issued += 1;
          show(`${sheet.sheet} · ${sheet.title}`);
        }, beat);
      }, COUNT_FROM_MS)
    );

    // A prefetch has no promise to wait on, so the fetch itself is watched:
    // each sheet's payload shows up as a resource entry when it lands.
    const landed = (url: string) => {
      const path = new URL(url, window.location.href).pathname;
      if (!path.endsWith('index.txt')) return;
      const href = path.slice(0, -'index.txt'.length);
      const sheet = pending.get(href);
      if (!sheet) return;
      pending.delete(href);
      landedQueue.push(sheet);
      settle();
    };
    const watcher =
      'PerformanceObserver' in window
        ? new PerformanceObserver((list) => list.getEntries().forEach((e) => landed(e.name)))
        : null;
    watcher?.observe({ type: 'resource', buffered: false });

    document.fonts.ready.then(() => {
      fontsReady = true;
      if (issued === 1) show('Type set');
      settle();
    });
    import('@/components/sheet/Loupe')
      .catch(() => {})
      .then(() => {
        lensReady = true;
        if (issued === 1) show('Instruments ready');
        settle();
      });
    // Not until the page's own styles, scripts and typefaces are in: thirty
    // prefetches started alongside them compete for the same connection and
    // hold up the first paint they were meant to follow.
    const issue = () => wanted.forEach((s) => router.prefetch(s.href));
    if (document.readyState === 'complete') issue();
    else window.addEventListener('load', issue, { once: true });
    settle();

    // A network that never answers must not keep the door shut. Whatever is
    // still outstanding carries on fetching behind the page.
    const ceiling = setTimeout(offer, LOAD_CEILING_MS);
    const onKey = (event: KeyboardEvent) => {
      if (!canEnter || released) return;
      // Keys that are not the reader saying anything to the cover.
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(event.key)) return;
      // Left to the button when it has focus, or it would fire twice.
      if (event.target instanceof HTMLButtonElement && (event.key === 'Enter' || event.key === ' '))
        return;
      event.preventDefault();
      if (event.key === 'Enter') enter.current();
      else toggleHold.current();
    };
    window.addEventListener('keydown', onKey, true);

    return () => {
      watcher?.disconnect();
      clearTimeout(ceiling);
      if (ticker) clearInterval(ticker);
      if (counter) clearInterval(counter);
      timers.forEach(clearTimeout);
      timers = [];
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('load', issue);
    };
    // Runs once: the cover belongs to the load, not to later navigations.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  return (
    <div
      ref={ref}
      className={styles.pre}
      data-loaded={loaded || undefined}
      data-held={held || undefined}
      onPointerDown={(event) => {
        // A press on the way in is a press on the way in.
        if ((event.target as Element).closest('button')) return;
        toggleHold.current();
      }}
    >
      {/* The three prints say the same thing three times over; assistive
          technology is given the button and nothing else to wade through. */}
      <div className={`${styles.layer} ${styles.raw}`} aria-hidden="true">
        <Print total={issuing} />
      </div>
      <div className={`${styles.layer} ${styles.annot}`} aria-hidden="true">
        <Print total={issuing} />
      </div>
      <div className={`${styles.layer} ${styles.paper}`} aria-hidden="true">
        <Print total={issuing} />
      </div>

      <span className={`${styles.seam} ${styles.seamOuter}`} aria-hidden="true" />
      <span className={`${styles.seam} ${styles.seamInner}`} aria-hidden="true" />

      {(
        [
          ['a', 'A', 'Artifact', 'The drawing as issued'],
          ['b', 'B', 'Annotated', 'Engineering markup exposed'],
          ['c', 'C', 'Raw', 'Source, stripped of presentation'],
        ] as const
      ).map(([band, rev, name, blurb]) => (
        <span key={band} className={styles.band} data-band={band} aria-hidden="true">
          <b>Rev {rev}</b>
          <span className={styles.bandMore}>
            <span className={styles.bandName}>{name}</span>
            <span className={styles.bandBlurb}>{blurb}</span>
          </span>
        </span>
      ))}

      {/* The way in. Inert until the set has actually loaded, so it never
          promises a page that is not there yet. */}
      <div className={styles.way}>
        <div className={styles.wayRow}>
          {/* The count: a bubble with a ring that runs out, as the seconds do. */}
          <span className={styles.ring} aria-hidden="true">
            <svg viewBox="0 0 40 40" key={run}>
              <circle cx="20" cy="20" r="16" className={styles.ringTrack} />
              {loaded && <circle cx="20" cy="20" r="16" pathLength={1} className={styles.ringRun} />}
            </svg>
            <span className={styles.ringNo}>
              {!loaded ? (
                '··'
              ) : held ? (
                <span className={styles.pause} />
              ) : (
                String(left).padStart(2, '0')
              )}
            </span>
          </span>

          <button
            type="button"
            className={styles.enter}
            disabled={!loaded}
            onClick={() => enter.current()}
          >
            {loaded ? (
              <>
                <span>Skip intro · Enter the set</span>
                <kbd aria-hidden="true">Enter ↵</kbd>
              </>
            ) : (
              <span>Loading the set…</span>
            )}
          </button>
        </div>

        <p className={styles.wayHint} role="status">
          {!loaded ? (
            <>The way in opens the moment the set has loaded.</>
          ) : held ? (
            <>
              <b>Holding here.</b> Enter when you are ready, or{' '}
              <span className={styles.byKey}>press any key</span>
              <span className={styles.byTouch}>tap anywhere</span> to resume.
            </>
          ) : (
            <>
              Entering in <b>{left}</b>. <span className={styles.byKey}>Press any key</span>
              <span className={styles.byTouch}>Tap anywhere</span> to hold this screen.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
