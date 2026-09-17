'use client';

import { useRef } from 'react';
import { useMode } from './ModeProvider';
import { MODES, MODE_INFO, type Mode } from '@/lib/mode';
import styles from './ModeSelector.module.css';

export function ModeSelector() {
  const { mode, setMode } = useMode();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const index = Math.max(0, MODES.indexOf(mode));

  // Arrow keys walk the detents; Home/End slam to either end of the throw.
  const onKeyDown = (event: React.KeyboardEvent) => {
    const deltas: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    };

    let next: number | null = null;
    if (event.key in deltas) next = (index + deltas[event.key] + MODES.length) % MODES.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = MODES.length - 1;
    if (next === null) return;

    event.preventDefault();
    setMode(MODES[next]);
    refs.current[next]?.focus();
  };

  return (
    <div className={styles.housing}>
      <span className={styles.caption} aria-hidden="true">
        Mode
      </span>

      <div
        className={styles.track}
        role="radiogroup"
        aria-label="Drawing mode"
        onKeyDown={onKeyDown}
        data-position={index}
      >
        <span className={styles.thumb} aria-hidden="true" />

        {MODES.map((m: Mode, i) => (
          <button
            key={m}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={mode === m}
            tabIndex={mode === m ? 0 : -1}
            className={styles.detent}
            onClick={() => setMode(m)}
            title={MODE_INFO[m].blurb}
          >
            <span className={styles.tick} aria-hidden="true" />
            <span className={styles.name}>{MODE_INFO[m].label}</span>
            {/* Narrow sheets show the revision letter: Artifact and Annotated
                share an initial, but Rev A/B/C never collide. */}
            <span className={styles.rev} aria-hidden="true">
              {MODE_INFO[m].rev}
            </span>
          </button>
        ))}
      </div>

      <kbd className={styles.hint} aria-hidden="true">
        D
      </kbd>
    </div>
  );
}
