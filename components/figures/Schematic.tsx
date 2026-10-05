'use client';

import { useState } from 'react';
import type { SchematicSpec } from './schematics';
import styles from './Schematic.module.css';

/**
 * An operable schematic: the pipeline a case study describes, drawn once,
 * with a picker that traces one scenario through it at a time.
 *
 * The drawing is data (see schematics.ts), and every node, branch and outcome
 * in that data is taken from the case study it sits in, so the figure can be
 * checked against the prose beside it.
 */
export function Schematic({ spec, figure = 'Fig. 1' }: { spec: SchematicSpec; figure?: string }) {
  const [active, setActive] = useState(0);
  const scenario = spec.scenarios[active];
  const input = spec.input ?? { x: 24, y: 45, label: 'USER' };
  const exit = spec.exit === null ? null : (spec.exit ?? { x: 398, y: 180, w: 112 });
  const height = spec.base ? 262 : 226;
  const names = scenario.nodes.map((id) => spec.nodes[id].name);

  return (
    <figure className={styles.figure}>
      <div className={styles.picker} role="radiogroup" aria-label={spec.pick}>
        {spec.scenarios.map((s, i) => (
          <button
            key={s.label}
            type="button"
            role="radio"
            aria-checked={i === active}
            className={styles.pick}
            onClick={() => setActive(i)}
          >
            <span className={styles.pickNo}>{String(i + 1).padStart(2, '0')}</span>
            {s.label}
          </button>
        ))}
      </div>

      <div className={styles.field}>
        <svg
          viewBox={`0 0 540 ${height}`}
          className={styles.svg}
          role="img"
          aria-label={`${scenario.label}: ${names.join(', ')}`}
        >
          {spec.base && (
            <>
              <rect x="60" y="232" width="450" height="18" className={styles.base} />
              <text x="285" y="244.5" textAnchor="middle" className={styles.baseText}>
                {spec.base}
              </text>
            </>
          )}

          {Object.entries(spec.edges).map(([id, d]) => (
            <path
              key={id}
              d={d}
              className={styles.edge}
              data-on={scenario.edges.includes(id) || undefined}
            />
          ))}

          <circle cx={input.x} cy={input.y} r="8" className={styles.user} />
          <text x={input.x} y={input.y + 23} textAnchor="middle" className={styles.port}>
            {input.label}
          </text>

          {Object.entries(spec.nodes).map(([id, n]) => (
            <g key={id} className={styles.node} data-on={scenario.nodes.includes(id) || undefined}>
              <rect x={n.x} y={n.y} width={n.w ?? 130} height="30" />
              <text x={n.x + 9} y={n.y + (n.sub ? 13 : 19)} className={styles.name}>
                {n.name.toUpperCase()}
              </text>
              {n.sub && (
                <text x={n.x + 9} y={n.y + 24} className={styles.port}>
                  {n.sub}
                </text>
              )}
            </g>
          ))}

          {exit && scenario.exit && (
            <g className={styles.exit} data-hot={scenario.hot || undefined}>
              <rect x={exit.x} y={exit.y} width={exit.w} height="30" />
              <text x={exit.x + exit.w / 2} y={exit.y + 19} textAnchor="middle">
                {scenario.exit}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* The drawing keeps its lettering legible on a phone by not shrinking,
          so there it is wider than the sheet and has to say so. */}
      <p className={styles.swipe} aria-hidden="true">
        Swipe the drawing to follow the path →
      </p>

      <div className={styles.readout} aria-live="polite">
        <p className={styles.says}>{scenario.says}</p>
        <p className={styles.path}>
          {scenario.nodes
            .map((id) => {
              const n = spec.nodes[id];
              return spec.pathWithSub && n.sub ? `${n.name} ${n.sub}` : n.name;
            })
            .join('  ›  ')}
        </p>
        <p className={styles.flags}>
          {scenario.flags.map((flag, i) => (
            <span key={flag} data-hot={(scenario.hot && i === scenario.flags.length - 1) || undefined}>
              {flag}
            </span>
          ))}
        </p>
        <p className={styles.note}>{scenario.note}</p>
      </div>

      <figcaption className={styles.caption}>
        <span className={styles.captionNo}>{figure}</span>
        {spec.caption}
      </figcaption>
    </figure>
  );
}
