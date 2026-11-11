'use client';

import { useState } from 'react';
import shared from './Schematic.module.css';
import styles from './EngineLoop.module.css';

/**
 * KeepMeAwake's engine loop, drawn as the loop it is.
 *
 * One thread runs these eight steps and then waits on a condvar, so nothing
 * polls while it rests. Choosing a step reads out what it does and the call
 * it makes on each platform. Only one step talks to the power manager.
 */

interface Step {
  id: string;
  name: string;
  sub?: string;
  says: string;
  /** Hold, then release, where the step makes a call. */
  windows: string[];
  macos: string[];
  /** This step makes the power call. */
  os?: boolean;
  note: string;
}

const NONE = ['no power call'];
const PURE = ['none · a pure function, no I/O'];

const STEPS: Step[] = [
  {
    id: 'wake',
    name: 'Wake',
    says: 'The engine thread is woken on its condvar, by a command or by the deadline it set.',
    windows: NONE,
    macos: NONE,
    note: 'Commands and deadlines arrive by the same door. Until one does, the thread is asleep.',
  },
  {
    id: 'tick',
    name: 'Tick',
    says: 'A pass begins. Every step that follows works from the same pass.',
    windows: NONE,
    macos: NONE,
    note: 'Nothing here holds the machine awake. It only starts the pass.',
  },
  {
    id: 'schedule',
    name: 'Schedule',
    says: 'Timers, “until a time” and the weekly schedule, with its skip, are checked.',
    windows: NONE,
    macos: NONE,
    note: 'The schedule says what should be true now. It does not act on it.',
  },
  {
    id: 'battery',
    name: 'Battery',
    says: 'The battery rules are applied to the power state the platform reported.',
    windows: NONE,
    macos: NONE,
    note: 'The platform sits behind a trait with a fake for tests, so these rules run without a laptop.',
  },
  {
    id: 'decide',
    name: 'Decide',
    sub: 'policy · pure',
    says: 'Everything gathered so far is turned into one answer: hold, or release.',
    windows: PURE,
    macos: PURE,
    note: 'The decision is a pure function over the session, the settings and the battery, so it is tested as a plain function, without a laptop.',
  },
  {
    id: 'apply',
    name: 'Apply',
    sub: 'the one OS call',
    os: true,
    says: 'The decision reaches the operating system: a power request is held, or released.',
    windows: ['hold · PowerCreateRequest, PowerSetRequest', 'release · PowerClearRequest'],
    macos: ['hold · IOPMAssertionCreateWithName', 'release · IOPMAssertionRelease'],
    note: 'The mechanism a video player uses. It shows by name in powercfg /requests or pmset -g assertions, and is released the instant it is switched off.',
  },
  {
    id: 'snapshot',
    name: 'Snapshot',
    says: 'The new state is published for the tray and, if it is open, the window.',
    windows: NONE,
    macos: NONE,
    note: 'The Svelte window exists only while it is open. In the tray the app uses about 5 MB.',
  },
  {
    id: 'wait',
    name: 'Wait',
    sub: 'condvar',
    says: 'The thread sleeps on the condvar until the next deadline or command.',
    windows: NONE,
    macos: NONE,
    note: 'Nothing polls while it rests.',
  },
];

/* The track: a stadium, top run left to right, bottom run right to left. */
const TOP = 52;
const BOTTOM = 168;
const LEFT = 116;
const RIGHT = 424;
const R = (BOTTOM - TOP) / 2;
const TRACK = `M${LEFT} ${TOP}H${RIGHT}A${R} ${R} 0 0 1 ${RIGHT} ${BOTTOM}H${LEFT}A${R} ${R} 0 0 1 ${LEFT} ${TOP}`;

const COLS = [LEFT, LEFT + (RIGHT - LEFT) / 3, LEFT + ((RIGHT - LEFT) * 2) / 3, RIGHT];
const POS = [
  ...COLS.map((x) => ({ x, y: TOP })),
  ...[...COLS].reverse().map((x) => ({ x, y: BOTTOM })),
];
const NODE_W = 84;
const NODE_H = 30;

/* Arrowheads midway along each straight run and round each end. */
const ARROWS = [
  ...COLS.slice(0, 3).map((x, i) => `M${(x + COLS[i + 1]) / 2 + 3} ${TOP}l-6 -3.5v7z`),
  ...COLS.slice(0, 3).map((x, i) => `M${(x + COLS[i + 1]) / 2 - 3} ${BOTTOM}l6 -3.5v7z`),
  `M${RIGHT + R} ${(TOP + BOTTOM) / 2 + 3}l-3.5 -6h7z`,
  `M${LEFT - R} ${(TOP + BOTTOM) / 2 - 3}l-3.5 6h7z`,
];

export function EngineLoop() {
  const [at, setAt] = useState(5);
  const step = STEPS[at];

  const move = (by: number) => setAt((i) => (i + by + STEPS.length) % STEPS.length);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const by =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (!by) return;
    event.preventDefault();
    move(by);
    // Roving focus: the newly chosen step takes the focus with it.
    const group = (event.currentTarget as SVGGElement).ownerSVGElement;
    const next = (at + by + STEPS.length) % STEPS.length;
    (group?.querySelector(`[data-step="${next}"]`) as SVGGElement | null)?.focus();
  };

  return (
    <figure className={shared.figure}>
      <p className={styles.hint}>
        Choose a step: point at it, tap it, or tab to the loop and use the arrow keys.
      </p>

      <div className={shared.field}>
        <svg viewBox="0 0 540 222" className={shared.svg} role="group" aria-label="The engine loop">
          <path d={TRACK} className={styles.track} />
          <path d={TRACK} className={styles.run} />
          {ARROWS.map((d) => (
            <path key={d} d={d} className={styles.arrow} />
          ))}

          {/* The reading in the middle of the loop. */}
          <g className={styles.panel} aria-hidden="true">
            <text x="270" y="80" textAnchor="middle" className={styles.panelHead}>
              {String(at + 1).padStart(2, '0')} · {step.name.toUpperCase()}
            </text>
            {(
              [
                ['WINDOWS', step.windows, 95],
                ['MACOS', step.macos, 125],
              ] as const
            ).map(([platform, calls, y]) => (
              <g key={platform}>
                <text x="270" y={y} textAnchor="middle" className={styles.platform}>
                  {platform}
                </text>
                {calls.map((call, i) => (
                  <text
                    key={call}
                    x="270"
                    y={y + 10 + i * 9}
                    textAnchor="middle"
                    className={styles.call}
                    data-os={step.os || undefined}
                  >
                    {call}
                  </text>
                ))}
              </g>
            ))}
          </g>

          {STEPS.map((s, i) => {
            const p = POS[i];
            return (
              <g
                key={s.id}
                data-step={i}
                className={styles.node}
                data-on={i === at || undefined}
                data-os={s.os || undefined}
                role="button"
                tabIndex={i === at ? 0 : -1}
                aria-pressed={i === at}
                aria-label={`Step ${i + 1}, ${s.name}${s.os ? ', makes the power call' : ''}`}
                onClick={() => setAt(i)}
                onMouseEnter={() => setAt(i)}
                onFocus={() => setAt(i)}
                onKeyDown={onKeyDown}
              >
                <rect x={p.x - NODE_W / 2} y={p.y - NODE_H / 2} width={NODE_W} height={NODE_H} />
                <text x={p.x - NODE_W / 2 + 8} y={p.y + (s.sub ? -2 : 3)} className={styles.name}>
                  <tspan className={styles.no}>{String(i + 1).padStart(2, '0')}</tspan> {s.name.toUpperCase()}
                </text>
                {s.sub && (
                  <text x={p.x - NODE_W / 2 + 8} y={p.y + 9} className={styles.sub}>
                    {s.sub}
                  </text>
                )}
                {s.os && <circle cx={p.x + NODE_W / 2 - 7} cy={p.y - NODE_H / 2 + 7} r="2.6" className={styles.osDot} />}
              </g>
            );
          })}
        </svg>
      </div>

      <p className={shared.swipe} aria-hidden="true">
        Swipe the drawing to follow the loop →
      </p>

      <div className={shared.readout} aria-live="polite">
        <p className={shared.says}>{step.says}</p>
        <p className={shared.path}>
          Windows: {step.windows.join('; ')}
          <br />
          macOS: {step.macos.join('; ')}
        </p>
        <p className={shared.flags}>
          <span>
            step {at + 1} of {STEPS.length}
          </span>
          <span data-hot={step.os || undefined}>{step.os ? 'touches the OS' : 'no power call'}</span>
        </p>
        <p className={shared.note}>{step.note}</p>
      </div>

      <figcaption className={shared.caption}>
        <span className={shared.captionNo}>Fig. 1</span>
        One thread runs this loop and then sleeps until it is needed; only the step marked with a
        dot asks the operating system for anything.
      </figcaption>
    </figure>
  );
}
