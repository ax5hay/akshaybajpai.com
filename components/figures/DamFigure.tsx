'use client';

import { useState } from 'react';
import shared from './Schematic.module.css';
import styles from './DamFigure.module.css';

/**
 * ReBo's five walls against a write, drawn as a section through a dam.
 *
 * The question is held on the reservoir side and the database lies
 * downstream. Each wall is one course of the section, and each is enough on
 * its own to keep a write out of the database. Choosing an attempt lights
 * every wall that would refuse it alone; the flow line stops at the first.
 *
 * In Raw mode each wall is labelled with the mechanism that enforces it
 * instead of its plain name.
 */

interface Wall {
  plain: [string, string];
  raw: [string, string];
}

const WALLS: Wall[] = [
  { plain: ['SELECT-ONLY', 'DATABASE USER'], raw: ['GRANT SELECT', 'no other grant'] },
  { plain: ['READ-ONLY', 'SESSION'], raw: ['READ ONLY', 'transaction'] },
  { plain: ['STATEMENT', 'TIMEOUT'], raw: ['TIMEOUT', 'statement_timeout'] },
  { plain: ['SYNTAX-TREE', 'GUARD'], raw: ['SQLGLOT AST', 'one SELECT'] },
  { plain: ['ROLLBACK', 'FETCH CAP'], raw: ['ROLLBACK', 'fetch cap'] },
];

interface Attempt {
  label: string;
  says: string;
  sql: string;
  /** Indexes of the walls that would refuse it, each on its own. */
  stops: number[];
  note: string;
}

const ATTEMPTS: Attempt[] = [
  {
    label: 'A plain question',
    says: 'Someone asks for last month’s totals in their own words.',
    sql: 'SELECT sum(total) …',
    stops: [],
    note: 'One read-only query passes every wall, runs, and comes back with its rows and the steps it took, in plain language.',
  },
  {
    label: 'An UPDATE',
    says: 'The model writes an UPDATE instead of a report.',
    sql: 'UPDATE invoices …',
    stops: [0, 1, 3, 4],
    note: 'The user has no write grant, the session refuses writes, the guard allows one SELECT and nothing else, and the transaction is rolled back. Any one of them is enough.',
  },
  {
    label: 'SELECT … INTO',
    says: 'A query that reads like a report but would create a table.',
    sql: 'SELECT … INTO t',
    stops: [0, 1, 3, 4],
    note: 'INTO is a write wearing a SELECT. The guard reads the syntax tree, not the first word, so it is refused there as well as by the grants and the session.',
  },
  {
    label: 'An endless scan',
    says: 'A valid read that would run for an hour.',
    sql: 'SELECT … CROSS JOIN …',
    stops: [2],
    note: 'Nothing about it is a write, so only the timeout has a reason to act. It does, and the database is left alone.',
  },
  {
    label: 'An unknown table',
    says: 'The model names a table or a column the schema does not have.',
    sql: 'SELECT … FROM no_such',
    stops: [3],
    note: 'The guard checks every table and column against the schema read at bootstrap. An unknown name is refused before the database sees it.',
  },
  {
    label: 'Ten million rows',
    says: 'A read that is correct and far too large.',
    sql: 'SELECT * FROM events',
    stops: [4],
    note: 'Rows are fetched up to a cap, then the transaction is rolled back. The answer says it was cut short.',
  },
];

/* Geometry, in viewBox units. */
const DAM_X = 112;
const WALL_W = 64;
const GROUND = 196;
const TOPS = [44, 66, 88, 110, 132];
const FLOW_Y = 168;
const COURSE = 11;

/** Masonry: horizontal courses with the vertical joints staggered. */
function masonry(left: number, top: number): string {
  let d = '';
  for (let y = GROUND - COURSE; y > top + 3; y -= COURSE) d += `M${left} ${y}H${left + WALL_W}`;
  // Running bond: one joint mid-course, then two at the quarters, alternately.
  for (let y = GROUND, row = 0; y > top + 3; y -= COURSE, row += 1) {
    const upper = Math.max(top, y - COURSE);
    const joints = row % 2 ? [WALL_W / 4, (WALL_W * 3) / 4] : [WALL_W / 2];
    for (const jx of joints) d += `M${left + jx} ${y}V${upper}`;
  }
  return d;
}

/** Water: short dashes on regular rows, the surface ruled heavier. */
function water(): string {
  let d = '';
  for (let y = 58; y < GROUND; y += 10) {
    const shift = ((y / 10) % 2) * 9;
    for (let x = 18 + shift; x < DAM_X - 10; x += 18) d += `M${x} ${y}h9`;
  }
  return d;
}

export function DamFigure() {
  const [active, setActive] = useState(1);
  const attempt = ATTEMPTS[active];
  const first = attempt.stops.length ? Math.min(...attempt.stops) : -1;
  const flowEnd = first === -1 ? 452 : DAM_X + first * WALL_W;
  const passed = first === -1;

  return (
    <figure className={shared.figure}>
      <div className={shared.picker} role="radiogroup" aria-label="Attempt to send">
        {ATTEMPTS.map((a, i) => (
          <button
            key={a.label}
            type="button"
            role="radio"
            aria-checked={i === active}
            className={shared.pick}
            onClick={() => setActive(i)}
          >
            <span className={shared.pickNo}>{String(i + 1).padStart(2, '0')}</span>
            {a.label}
          </button>
        ))}
      </div>

      <div className={shared.field}>
        <svg
          viewBox="0 0 540 250"
          className={shared.svg}
          role="img"
          aria-label={
            passed
              ? `${attempt.label}: passes all five walls and reaches the database`
              : `${attempt.label}: refused by ${attempt.stops.length} of 5 walls`
          }
        >
          {/* Reservoir: the question, held back. */}
          <path d={`M14 50H${DAM_X}`} className={styles.surface} />
          <path d={water()} className={styles.water} />
          <path d="M70 50l-4 -6h8z" className={styles.surfaceMark} />
          <text x="18" y="40" className={styles.label}>
            QUESTION
          </text>
          <rect x="14" y="67" width="94" height="13" className={styles.sqlPlate} />
          <text x="18" y="76" className={styles.sql}>
            {attempt.sql}
          </text>

          {/* Ground, hatched. */}
          <path d={`M10 ${GROUND}H530`} className={styles.ground} />
          <path
            d={Array.from({ length: 58 }, (_, i) => `M${12 + i * 9} ${GROUND + 8}l8 -8`).join('')}
            className={styles.hatch}
          />

          {/* The five walls. */}
          {WALLS.map((wall, i) => {
            const left = DAM_X + i * WALL_W;
            const top = TOPS[i];
            const on = attempt.stops.includes(i);
            return (
              <g
                key={wall.plain.join(' ')}
                className={styles.wall}
                data-on={on || undefined}
                data-first={i === first || undefined}
              >
                <rect x={left} y={top} width={WALL_W} height={GROUND - top} className={styles.block} />
                <path d={masonry(left, top)} className={styles.joints} />
                <circle cx={left + WALL_W / 2} cy={top - 12} r="7" className={styles.bubble} />
                <text x={left + WALL_W / 2} y={top - 9.5} textAnchor="middle" className={styles.bubbleNo}>
                  {i + 1}
                </text>
                <g className={styles.plain}>
                  <text x={left + 4} y={GROUND + 22} className={styles.wallName}>
                    {wall.plain[0]}
                  </text>
                  <text x={left + 4} y={GROUND + 31} className={styles.wallName}>
                    {wall.plain[1]}
                  </text>
                </g>
                <g className={styles.raw}>
                  <text x={left + 4} y={GROUND + 22} className={styles.wallName}>
                    {wall.raw[0]}
                  </text>
                  <text x={left + 4} y={GROUND + 31} className={styles.wallSub}>
                    {wall.raw[1]}
                  </text>
                </g>
              </g>
            );
          })}

          {/* The flow line, stopped at the first wall that refuses it. */}
          <path
            key={active}
            d={`M40 ${FLOW_Y}H${flowEnd - (passed ? 0 : 3)}`}
            className={styles.flow}
            data-passed={passed || undefined}
          />
          {passed ? (
            <path d={`M452 ${FLOW_Y}l-8 -4v8z`} className={styles.arrow} />
          ) : (
            <path d={`M${flowEnd - 3} ${FLOW_Y - 9}v18`} className={styles.stopBar} />
          )}

          {/* Downstream: the database. */}
          <g className={styles.db} data-on={passed || undefined}>
            <path d="M460 140a32 7 0 0 0 64 0a32 7 0 0 0 -64 0v44a32 7 0 0 0 64 0v-44" />
            <path d="M460 155a32 7 0 0 0 64 0M460 170a32 7 0 0 0 64 0" className={styles.dbRing} />
          </g>
          <text x="492" y="124" textAnchor="middle" className={styles.label}>
            DATABASE
          </text>
          <text x="492" y="214" textAnchor="middle" className={styles.dbState} data-on={passed || undefined}>
            {passed ? 'ROWS · READ-ONLY' : 'UNTOUCHED'}
          </text>
        </svg>
      </div>

      <p className={shared.swipe} aria-hidden="true">
        Swipe the drawing to see every wall →
      </p>

      <div className={shared.readout} aria-live="polite">
        <p className={shared.says}>{attempt.says}</p>
        <p className={shared.path}>
          {passed
            ? 'Passes walls 1 to 5  ›  database'
            : `Refused by ${attempt.stops.map((i) => `wall ${i + 1}`).join(', ')}`}
        </p>
        <p className={shared.flags}>
          <span>{passed ? 'walls that act: 0 of 5' : `walls that act: ${attempt.stops.length} of 5`}</span>
          <span data-hot={!passed || undefined}>{passed ? 'rows returned' : 'nothing written'}</span>
        </p>
        <p className={shared.note}>{attempt.note}</p>
      </div>

      <figcaption className={shared.caption}>
        <span className={shared.captionNo}>Fig. 1</span>
        Five walls stand between a question and the database, and each would hold on its own;
        choose an attempt to see which of them refuse it.
      </figcaption>
    </figure>
  );
}
