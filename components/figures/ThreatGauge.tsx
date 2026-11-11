'use client';

import { useState } from 'react';
import shared from './Schematic.module.css';
import styles from './ThreatGauge.module.css';

/**
 * FlowState's fused threat index, drawn as a pressure gauge.
 *
 * Each channel adds its weight times its detector's reading, and the
 * contributions are stacked round the inner ring in the order they are
 * listed. The weights, readings and bands here are an example: on a real
 * console the weights and bands are the operator's to tune. One channel is
 * shown as a missing model would leave it: greyed out, with the reason, and
 * the rest still working.
 */

interface Channel {
  id: string;
  name: string;
  /** Points out of 100 the operator gives this channel. */
  weight: number;
  /** The detector's reading, 0 to 1. */
  reading: number;
  /** Set when the detector could not load; the reason is shown. */
  missing?: string;
}

const CHANNELS: Channel[] = [
  { id: 'weapons', name: 'Weapons', weight: 30, reading: 0.8 },
  { id: 'fire', name: 'Fire', weight: 20, reading: 0.35 },
  { id: 'crowd', name: 'Crowd behaviour', weight: 15, reading: 0.6 },
  { id: 'harmful', name: 'Harmful objects', weight: 15, reading: 0.5 },
  { id: 'covering', name: 'Face covering', weight: 10, reading: 0.7 },
  { id: 'audio', name: 'Audio noise', weight: 10, reading: 0.4 },
  { id: 'plates', name: 'Number plates', weight: 0, reading: 0, missing: 'model not found on this machine' },
];

const BANDS = [
  { from: 0, to: 25, name: 'LOW' },
  { from: 25, to: 50, name: 'ELEVATED' },
  { from: 50, to: 75, name: 'HIGH' },
  { from: 75, to: 100, name: 'CRITICAL' },
];

/* The dial: 270 degrees of sweep, zero at bottom left. */
const CX = 150;
const CY = 126;
const SWEEP = 270;
const START = -135;
const angle = (value: number) => START + (SWEEP * value) / 100;

function polar(r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: +(CX + r * Math.sin(rad)).toFixed(2), y: +(CY - r * Math.cos(rad)).toFixed(2) };
}

function arc(r: number, from: number, to: number): string {
  const a = polar(r, angle(from));
  const b = polar(r, angle(to));
  const large = ((to - from) * SWEEP) / 100 > 180 ? 1 : 0;
  return `M${a.x} ${a.y}A${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
}

const contribution = (c: Channel) => c.weight * c.reading;
const bandOf = (value: number) => BANDS.find((b) => value < b.to) ?? BANDS[BANDS.length - 1];

export function ThreatGauge() {
  const [off, setOff] = useState<Set<string>>(() => new Set());

  const live = CHANNELS.filter((c) => !c.missing && !off.has(c.id));
  const index = live.reduce((sum, c) => sum + contribution(c), 0);
  const band = bandOf(index);
  const missing = CHANNELS.find((c) => c.missing);

  /* Stack the live contributions end to end from zero. */
  let cursor = 0;
  const segments = live.map((c) => {
    const from = cursor;
    cursor += contribution(c);
    return { channel: c, from, to: cursor };
  });

  const toggle = (id: string) =>
    setOff((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <figure className={shared.figure}>
      <div className={shared.picker} role="group" aria-label="Channels in the index">
        {CHANNELS.map((c, i) => {
          const on = !c.missing && !off.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              aria-disabled={c.missing ? true : undefined}
              aria-label={c.missing ? `${c.name}: unavailable, ${c.missing}` : undefined}
              className={`${shared.pick} ${styles.toggle}`}
              data-missing={c.missing ? true : undefined}
              onClick={() => !c.missing && toggle(c.id)}
            >
              <span className={shared.pickNo}>{String(i + 1).padStart(2, '0')}</span>
              {c.name}
            </button>
          );
        })}
      </div>

      <div className={shared.field}>
        <svg
          viewBox="0 0 540 250"
          className={shared.svg}
          role="img"
          aria-label={`Threat index ${Math.round(index)} of 100, ${band.name.toLowerCase()}, from ${live.length} channels`}
        >
          {/* Bezel. */}
          <circle cx={CX} cy={CY} r="116" className={styles.bezel} />
          <circle cx={CX} cy={CY} r="112" className={styles.face} />

          {/* Bands, round the outside. */}
          {BANDS.map((b) => (
            <g key={b.name} className={styles.band} data-on={b === band || undefined}>
              <path d={arc(98, b.from + 0.6, b.to - 0.6)} className={styles.bandArc} />
              <text className={styles.bandName}>
                <textPath href={`#tg-band-${b.name}`} startOffset="50%" textAnchor="middle">
                  {b.name}
                </textPath>
              </text>
              <path id={`tg-band-${b.name}`} d={arc(106, b.from, b.to)} className={styles.guide} />
            </g>
          ))}

          {/* Graduations: every 5, numbered every 10. */}
          {Array.from({ length: 21 }, (_, i) => i * 5).map((v) => {
            const major = v % 10 === 0;
            const a = polar(91, angle(v));
            const b = polar(major ? 83 : 87, angle(v));
            const t = polar(75, angle(v));
            return (
              <g key={v}>
                <path d={`M${a.x} ${a.y}L${b.x} ${b.y}`} className={major ? styles.tickMajor : styles.tick} />
                {major && (
                  <text x={t.x} y={t.y + 2.5} textAnchor="middle" className={styles.number}>
                    {v}
                  </text>
                )}
              </g>
            );
          })}

          {/* The stacked contributions. */}
          <path d={arc(58, 0, 100)} className={styles.stackTrack} />
          {segments.map(({ channel, from, to }) => {
            const i = CHANNELS.indexOf(channel);
            const mid = polar(58, angle((from + to) / 2));
            return (
              <g key={channel.id}>
                <path
                  d={arc(58, from + 0.4, to - 0.4)}
                  className={styles.segment}
                  data-tone={i % 2 ? 'b' : 'a'}
                />
                {to - from >= 4 && (
                  <text x={mid.x} y={mid.y + 2.2} textAnchor="middle" className={styles.segmentNo}>
                    {i + 1}
                  </text>
                )}
              </g>
            );
          })}

          {/* Needle: drawn pointing straight up, turned by transform alone. */}
          <g className={styles.needle} style={{ transform: `rotate(${angle(index)}deg)` }}>
            <path d={`M${CX - 2.4} ${CY}L${CX} ${CY - 84}L${CX + 2.4} ${CY}Z`} />
          </g>
          <circle cx={CX} cy={CY} r="6" className={styles.hub} />

          {/* Digital readout under the hub, as on a gauge. */}
          <rect x={CX - 30} y={CY + 30} width="60" height="30" className={styles.window} />
          <text x={CX} y={CY + 50} textAnchor="middle" className={styles.value}>
            {Math.round(index)}
          </text>
          <text x={CX} y={CY + 72} textAnchor="middle" className={styles.bandNow}>
            {band.name}
          </text>

          {/* The working, read off to the right. */}
          <text x="300" y="34" className={styles.head}>
            CHANNEL
          </text>
          <text x="438" y="34" textAnchor="end" className={styles.head}>
            WEIGHT × READING
          </text>
          <text x="520" y="34" textAnchor="end" className={styles.head}>
            ADDS
          </text>
          <path d="M300 40H520" className={styles.rule} />
          {CHANNELS.map((c, i) => {
            const y = 56 + i * 20;
            const on = !c.missing && !off.has(c.id);
            return (
              <g key={c.id} className={styles.row} data-on={on || undefined} data-missing={c.missing ? true : undefined}>
                <text x="300" y={y} className={styles.rowName}>
                  <tspan className={styles.rowNo}>{String(i + 1).padStart(2, '0')}</tspan> {c.name.toUpperCase()}
                </text>
                <text x="438" y={y} textAnchor="end" className={styles.rowMath}>
                  {c.missing ? 'greyed out' : `${c.weight} × ${c.reading.toFixed(2)}`}
                </text>
                <text x="520" y={y} textAnchor="end" className={styles.rowAdds}>
                  {c.missing || !on ? '0.0' : contribution(c).toFixed(1)}
                </text>
                {c.missing && (
                  <text x="314" y={y + 9} className={styles.reason}>
                    {c.missing}
                  </text>
                )}
              </g>
            );
          })}
          <path d="M300 196H520" className={styles.rule} />
          <text x="300" y="210" className={styles.head}>
            INDEX
          </text>
          <text x="520" y="210" textAnchor="end" className={styles.total}>
            {index.toFixed(1)}
          </text>
        </svg>
      </div>

      <p className={shared.swipe} aria-hidden="true">
        Swipe the drawing to read the working →
      </p>

      <div className={shared.readout} aria-live="polite">
        <p className={shared.says}>
          Index {Math.round(index)} of 100: {band.name.toLowerCase()}.
        </p>
        <p className={shared.path}>
          {live.length
            ? live.map((c) => `${c.name} ${contribution(c).toFixed(1)}`).join('  +  ')
            : 'No channels on'}
        </p>
        <p className={shared.flags}>
          <span>
            {live.length} of {CHANNELS.length} channels counting
          </span>
          {missing && <span data-hot>{missing.name}: greyed out</span>}
        </p>
        <p className={shared.note}>
          {missing?.name} has no model on this machine, so it is greyed out with the reason
          named. The other channels carry on and the console stays up.
        </p>
      </div>

      <figcaption className={shared.caption}>
        <span className={shared.captionNo}>Fig. 1</span>
        Toggle a channel to see what it adds to the index; the weights, readings and bands drawn
        here are an example, because on a real console they are the operator’s to tune.
      </figcaption>
    </figure>
  );
}
