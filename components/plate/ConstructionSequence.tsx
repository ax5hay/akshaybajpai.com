import { SequenceControl } from './SequenceControl';
import { Say, type Said3 } from './Say';
import type { Step } from '@/lib/engagements';
import styles from './ConstructionSequence.module.css';

/**
 * How the work runs, drawn the way a set shows the order a building goes up:
 * six courses from the foundation (a written scope) to the roof (a runbook),
 * each stage built on the one below and each leaving a document on the table.
 *
 * Choosing a stage sets every course below it as built, the chosen one in the
 * accent, and everything above it as proposed: dashed, lifted, not yet placed.
 * The delivered schedule beside the drawing fills in step with it. All six
 * stages are in the markup, so without script, and on paper, the sequence
 * reads in full.
 *
 * The drawing is rendered on the server, complete. The only script is
 * SequenceControl, which moves the stage by setting attributes on what is
 * already drawn; nothing here is re-rendered in the browser.
 */
const ROOT_ID = 'sequence';

/* Drawing units. The building stands between BL and BR on the ground line. */
const W = 720;
const H = 290;
const BL = 150;
const BR = 410;
const GROUND = 224;
const LX = 440;
/** Top of each course, foundation first: where the level mark rides to. */
const TOP = [GROUND, 186, 172, 124, 94, 58];
/** Where each course's leader meets it. */
const MID = [238, 205, 179, 148, 109, 80];

function hatch(x0: number, x1: number, y0: number, y1: number, step = 10) {
  let d = '';
  const h = y1 - y0;
  for (let x = x0 - h; x < x1; x += step) {
    const a = Math.max(x, x0);
    const b = Math.min(x + h, x1);
    if (b <= a) continue;
    d += `M${a} ${y1 - (a - x)}L${b} ${y1 - (b - x)}`;
  }
  return d;
}

function brick(x0: number, x1: number, y0: number, y1: number) {
  let d = '';
  let row = 0;
  for (let y = y0 + 8; y < y1; y += 8, row += 1) d += `M${x0} ${y}H${x1}`;
  row = 0;
  for (let y = y0; y < y1; y += 8, row += 1) {
    for (let x = x0 + (row % 2 ? 10 : 20); x < x1; x += 20) d += `M${x} ${y}V${Math.min(y + 8, y1)}`;
  }
  return d;
}

/**
 * Mode-dependent lettering inside the drawing. The set's Voice spans cannot
 * sit in SVG text, so each level gets its own group; `display: contents` on
 * a group renders its text, and the stylesheet shows the mode's one.
 */
function SvgSay({ s, ...text }: { s: Said3 } & React.SVGProps<SVGTextElement>) {
  return (
    <>
      <g data-v="a"><text {...text}>{s.a}</text></g>
      <g data-v="b"><text {...text}>{s.b}</text></g>
      <g data-v="c"><text {...text}>{s.c}</text></g>
    </>
  );
}

/** One course of the building, drawn by hand. */
function Course({ i }: { i: number }) {
  switch (i) {
    case 0:
      return (
        <>
          <rect x={BL - 20} y={GROUND} width={BR - BL + 40} height={28} className={styles.solid} />
          <path d={hatch(BL - 20, BR + 20, GROUND, GROUND + 28)} className={styles.fine} />
        </>
      );
    case 1:
      return (
        <>
          {[BL + 2, BL + 84, BL + 168, BR - 10].map((x) => (
            <rect key={x} x={x} y={192} width={8} height={GROUND - 192} className={styles.solid} />
          ))}
          <rect x={BL} y={186} width={BR - BL} height={6} className={styles.solid} />
          <path d={`M${BL + 10} ${GROUND}L${BL + 84} 192M${BL + 92} 192L${BL + 168} ${GROUND}`} className={styles.fine} />
        </>
      );
    case 2:
      return <rect x={BL - 4} y={172} width={BR - BL + 8} height={14} className={styles.slab} />;
    case 3:
      return (
        <>
          <rect x={BL} y={124} width={BR - BL} height={48} className={styles.solid} />
          <path d={brick(BL, BR, 124, 172)} className={styles.fine} />
        </>
      );
    case 4:
      return (
        <>
          <rect x={BL} y={94} width={BR - BL} height={30} className={styles.solid} />
          {[BL + 14, BL + 74, BL + 134, BL + 194].map((x) => (
            <rect key={x} x={x} y={101} width={40} height={16} className={styles.glass} />
          ))}
          <circle cx={BR + 2} cy={94} r={9} className={styles.seal} />
          <path d={`M${BR - 3} 94l3.5 3.5 6 -7`} className={styles.sealTick} />
        </>
      );
    default:
      return (
        <>
          <path d={`M${BL - 10} 94L${(BL + BR) / 2} 58L${BR + 10} 94Z`} className={styles.solid} />
          <path d={`M${BL + 30} 89L${(BL + BR) / 2} 66L${BR - 30} 89`} className={styles.fine} />
        </>
      );
  }
}

export function ConstructionSequence({ steps }: { steps: Step[] }) {
  const last = steps.length - 1;
  const at = last;
  const no = (i: number) => String(i + 1).padStart(2, '0');

  return (
    <figure id={ROOT_ID} className={styles.figure} data-at={at}>
      <div className={styles.bench}>
        <div className={styles.field}>
          <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="group" aria-label="How the work runs, as a building going up">
            {/* Ground, and the earth under it. */}
            <path d={`M20 ${GROUND}H${W - 20}`} className={styles.ground} />
            <path d={hatch(20, BL - 20, GROUND, GROUND + 12, 9) + hatch(BR + 20, W - 20, GROUND, GROUND + 12, 9)} className={styles.earth} />

            {/* The datum the baseline is measured from, carried past the building. */}
            <g className={styles.datum} data-datum data-state="set">
              <path d={`M30 172H${BL - 8}M${BR + 8} 172H${LX - 8}`} />
              <path d="M44 172l-5 -8h10z" className={styles.datumMark} />
              <SvgSay x="54" y="183" className={styles.datumText} s={{ a: 'baseline', b: '±0.00 datum', c: 'baseline' }} />
            </g>

            {steps.map((s, i) => (
              <g
                key={s.name}
                className={styles.course}
                data-course={i}
                data-top={TOP[i]}
                data-state={i < at ? 'built' : i === at ? 'on' : 'proposed'}
                role="button"
                tabIndex={i === at ? 0 : -1}
                aria-label={`${no(i)} of ${no(last)}: ${s.name}. Leaves ${s.leaves.toLowerCase()}.`}
                aria-pressed={i === at}
              >
                <rect x={BL - 30} y={TOP[i]} width={W - 20 - (BL - 30)} height={(i ? TOP[i - 1] : GROUND + 28) - TOP[i]} className={styles.hit} />
                <g className={styles.mass}>
                  <Course i={i} />
                </g>
                <path d={`M${i === 0 ? BR + 24 : i === 4 ? BR + 14 : BR + 6} ${MID[i]}H${LX - 6}`} className={styles.leader} />
                <circle cx={LX - 6} cy={MID[i]} r="1.6" className={styles.leaderDot} />
                <text x={LX} y={MID[i] - 2} className={`${styles.label} ${styles.labelNo}`}>
                  {no(i)}
                </text>
                <SvgSay x={LX + 18} y={MID[i] - 2} className={styles.label} s={{ a: s.name, b: s.course, c: `method[${i}]` }} />
                <SvgSay x={LX + 18} y={MID[i] + 9} className={styles.labelSub} s={{ a: s.leaves, b: s.name, c: s.course.toLowerCase() }} />
              </g>
            ))}

            {/* Level mark on the chosen stage, read off to the left. */}
            <g className={styles.level} data-level style={{ transform: `translateY(${TOP[at]}px)` }} aria-hidden="true">
              <path d={`M30 0H${BL - 6}`} />
              <path d="M30 0l6 -7h-12z" className={styles.levelMark} />
              <text x="40" y="-5" className={styles.levelText} data-level-text>
                Stage {no(at)}
              </text>
            </g>
          </svg>
        </div>

        {/* The lettering keeps its size on a phone, so there the drawing is wider
            than the sheet and has to say so. */}
        <p className={styles.swipe} aria-hidden="true">
          Swipe the drawing to read every stage →
        </p>

        <div className={styles.delivered}>
          <p className={styles.deliveredHead}>
            <Say s={{ a: 'What you have by now', b: 'Delivered with the stage', c: 'leaves[0..at]' }} />
          </p>
          <ol className={styles.deliveredList}>
            {steps.map((s, i) => (
              <li key={s.leaves} data-deliver={i} data-state={i <= at ? 'issued' : 'pending'} data-on={i === at || undefined}>
                <span className={styles.deliveredNo}>{no(i)}</span>
                <span className={styles.deliveredName}>{s.leaves}</span>
                <span className={styles.deliveredMark} aria-hidden="true">
                  <span className={styles.markIssued}>
                    <Say s={{ a: 'In hand', b: 'Issued', c: 'true' }} />
                  </span>
                  <span className={styles.markPending}>
                    <Say s={{ a: 'To follow', b: 'Pending', c: 'false' }} />
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <ol className={styles.steps} aria-live="polite">
        {steps.map((s, i) => (
          <li key={s.name} className={styles.step} data-step={i} data-on={i === at || undefined}>
            <span className={styles.stepNo}>
              <Say s={{ a: 'Stage', b: s.course, c: `method[${i}]` }} /> · {no(i)} / {no(last)}
            </span>
            <h3 className={styles.stepName}>{s.name}</h3>
            <p className={styles.stepText}>{s.text}</p>
            <p className={styles.stepLeaves}>
              <span>
                <Say s={{ a: 'Leaves', b: 'Issued', c: 'leaves' }} />
              </span>{' '}
              {s.leaves}
            </p>
          </li>
        ))}
      </ol>

      <div className={styles.stepper}>
        <button type="button" data-act="prev">
          ↓ <Say s={{ a: 'Earlier', b: 'Down a stage', c: 'at - 1' }} />
        </button>
        <button type="button" className={styles.build} data-act="build" aria-pressed="false">
          <span className={styles.buildIdle}>
            ▶ <Say s={{ a: 'Build it in order', b: 'Raise in sequence', c: 'play()' }} />
          </span>
          <span className={styles.buildBusy}>
            <Say s={{ a: 'Building…', b: 'Raising…', c: 'running' }} />
          </span>
        </button>
        <span aria-hidden="true" data-counter>
          {no(at)} / {no(last)}
        </span>
        <button type="button" data-act="next" disabled>
          <Say s={{ a: 'Later', b: 'Up a stage', c: 'at + 1' }} /> ↑
        </button>
      </div>

      <pre className={styles.raw} aria-hidden="true">
        {`method = [\n${steps
          .map(({ course, name, leaves }) => `  ${JSON.stringify({ course, name, leaves })}`)
          .join(',\n')}\n]`}
      </pre>

      <figcaption className={styles.caption}>
        <span className={styles.captionNo}>Fig. 1</span>
        <Say
          s={{
            a: 'The work goes up like a building: each stage stands on the one below and leaves something you keep. Choose a stage, or build it in order.',
            b: 'Construction sequence. Each course bears on the one below and is issued with its document; choose a stage, or raise it in sequence.',
            c: 'Six courses from data/engagements.json method[]; state = index vs at; leaves[] accumulate in the schedule.',
          }}
        />
      </figcaption>

      <SequenceControl rootId={ROOT_ID} last={last} />
    </figure>
  );
}
