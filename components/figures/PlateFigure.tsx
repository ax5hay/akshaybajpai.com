import type { CSSProperties, ReactNode } from 'react';
import styles from './PlateFigure.module.css';

/**
 * The drawings. A drawing set with nothing drawn in it is a filing system, so
 * every general-arrangement sheet carries one figure, drafted by hand in the
 * weights a real sheet uses: heavy for what the section cuts through, medium
 * for outlines, thin for detail, hair for hatching and grids.
 *
 * Every stroked element is given `pathLength={1}`, which lets one CSS rule
 * plot all of them with a pen regardless of their real length. `o` is the
 * order a draughtsman would put the lines down in.
 */

type Weight = 'h' | 'm' | 't' | 'x' | 'a';

const pen = (o: number) => ({ '--o': o }) as CSSProperties;

function P({ d, w = 't', o = 0, fill }: { d: string; w?: Weight; o?: number; fill?: 'paper' | 'ink' }) {
  return (
    <path
      d={d}
      pathLength={1}
      className={`${styles.p} ${styles[w]} ${fill ? styles[fill] : ''}`}
      style={pen(o)}
    />
  );
}

/** Hidden or projected line: dashed, so it is faded in rather than plotted. */
function D({ d, o = 0, accent }: { d: string; o?: number; accent?: boolean }) {
  return <path d={d} className={`${styles.d} ${accent ? styles.da : ''}`} style={pen(o)} />;
}

function T({
  x,
  y,
  children,
  o = 0,
  anchor = 'start',
  accent,
}: {
  x: number;
  y: number;
  children: ReactNode;
  o?: number;
  anchor?: 'start' | 'middle' | 'end';
  accent?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className={`${styles.tx} ${accent ? styles.txa : ''}`}
      style={pen(o)}
    >
      {children}
    </text>
  );
}

/** 45° hatching inside a rectangle, as short strokes clipped to its bounds. */
function hatch(x: number, y: number, w: number, h: number, step = 7): string {
  let d = '';
  for (let i = -h; i < w; i += step) {
    const x1 = Math.max(x, x + i);
    const y1 = i < 0 ? y - i : y;
    const x2 = Math.min(x + w, x + i + h);
    const y2 = x + i + h > x + w ? y + (w - i) : y + h;
    d += `M${x1} ${y1}L${x2} ${y2}`;
  }
  return d;
}

/** Dimension line with 45° terminators. */
function dim(x1: number, y1: number, x2: number, y2: number): string {
  const tick = (x: number, y: number) => `M${x - 3} ${y + 3}L${x + 3} ${y - 3}`;
  return `M${x1} ${y1}L${x2} ${y2}${tick(x1, y1)}${tick(x2, y2)}`;
}

/* ---------------------------------------------------------------- S-201 --- */

/** Section through a governed AI platform, operator at the ridge. */
function Section() {
  return (
    <>
      {/* Foundation: observability under everything. */}
      <P d={hatch(34, 166, 232, 16)} w="x" o={9} />
      <P d="M34 182H266" w="t" o={9} />
      <T x={150} y={194} anchor="middle" o={10}>
        OBSERVABILITY · EVERY HOP
      </T>

      {/* Slabs are cut through, so they are poched solid. */}
      <P d="M22 160H278V166H22Z" w="h" fill="ink" o={0} />
      <P d="M36 112H264V118H36Z" w="h" fill="ink" o={2} />
      <P d="M54 72H246V78H54Z" w="h" fill="ink" o={4} />

      {/* Ground floor: three services, each its own failure domain. */}
      <P d="M34 160V118M110 160V118M190 160V118M266 160V118" w="h" o={1} />
      <T x={72} y={142} anchor="middle" o={6}>
        RETRIEVAL
      </T>
      <T x={150} y={142} anchor="middle" o={6}>
        EXECUTION
      </T>
      <T x={228} y={142} anchor="middle" o={6}>
        GUARDRAILS
      </T>

      {/* First floor: the three routing tiers. */}
      <P d="M46 112V78M114 112V78M186 112V78M254 112V78" w="h" o={3} />
      <T x={80} y={98} anchor="middle" o={7}>
        T1 EXACT
      </T>
      <T x={150} y={98} anchor="middle" o={7}>
        T2 CLASSIFY
      </T>
      <T x={220} y={98} anchor="middle" o={7}>
        T3 COMPOSE
      </T>

      {/* Second floor: one gateway. */}
      <P d="M62 72V42M238 72V42" w="h" o={5} />
      <T x={150} y={60} anchor="middle" o={8}>
        GATEWAY
      </T>

      {/* Roof, and the one thing above the roof. */}
      <P d="M52 42L150 20L248 42Z" w="m" o={6} />
      <P d="M150 20m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0" w="a" o={10} />
      <T x={162} y={17} o={11} accent>
        OPERATOR
      </T>

      {/* The request path, projected down through every level. */}
      <D d="M150 26V160" o={11} accent />

      {/* Level datums. */}
      {[
        [42, 'L3'],
        [78, 'L2'],
        [118, 'L1'],
        [166, '±0'],
      ].map(([y, label], i) => (
        <g key={label}>
          <P d={`M284 ${y}H306M300 ${y}m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0`} w="t" o={8 + i} />
          <T x={312} y={Number(y) + 2.5} o={9 + i}>
            {label}
          </T>
        </g>
      ))}

      <P d={dim(12, 20, 12, 166)} w="a" o={10} />
    </>
  );
}

/* ---------------------------------------------------------------- W-400 --- */

const ISO_X = 0.866;
const iso = (x: number, y: number, z: number): [number, number] => [
  +(168 + (x - y) * ISO_X).toFixed(1),
  +(118 + (x + y) * 0.5 - z).toFixed(1),
];
const poly = (pts: Array<[number, number]>) => `M${pts.map((p) => p.join(' ')).join('L')}Z`;

/** The three faces of an axonometric box a viewer can see. */
function Box({
  x,
  y,
  z,
  w,
  d,
  h,
  o,
  weight = 'm',
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  o: number;
  weight?: Weight;
}) {
  const top = poly([iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)]);
  const left = poly([iso(x, y + d, z + h), iso(x + w, y + d, z + h), iso(x + w, y + d, z), iso(x, y + d, z)]);
  const right = poly([iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x + w, y + d, z), iso(x + w, y, z)]);
  return (
    <>
      <P d={left} w={weight} fill="paper" o={o} />
      <P d={right} w={weight} fill="paper" o={o} />
      <P d={top} w={weight} fill="paper" o={o + 1} />
    </>
  );
}

/** Exploded axonometric of a platform: data, orchestration, interface. */
function Axonometric() {
  const callout = (z: number, n: string, label: string, o: number) => {
    const [x, y] = iso(110, 0, z + 5);
    return (
      <g key={n}>
        <P d={`M${x} ${y}L${x + 34} ${y - 16}H${x + 44}`} w="t" o={o} />
        <P d={`M${x + 52} ${y - 16}m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0`} w="t" o={o} />
        <T x={x + 52} y={y - 13.5} anchor="middle" o={o + 1}>
          {n}
        </T>
        <T x={x + 66} y={y - 13.5} o={o + 1}>
          {label}
        </T>
      </g>
    );
  };

  return (
    <>
      {/* Projection lines between levels: what "exploded" means. */}
      <D d={[0, 110].flatMap((x) => [0, 90].map((y) => `M${iso(x, y, 0).join(' ')}L${iso(x, y, 96).join(' ')}`)).join('')} o={7} />

      {/* Level 1: stores. */}
      <Box x={0} y={0} z={0} w={110} d={90} h={5} o={0} weight="h" />
      <Box x={10} y={10} z={5} w={40} d={30} h={10} o={1} />
      <Box x={62} y={46} z={5} w={38} d={34} h={10} o={2} />

      {/* Level 2: services, bounded by failure domain. */}
      <Box x={0} y={0} z={46} w={110} d={90} h={5} o={3} weight="h" />
      <Box x={8} y={8} z={51} w={22} d={22} h={16} o={4} />
      <Box x={44} y={8} z={51} w={22} d={22} h={16} o={4} />
      <Box x={80} y={8} z={51} w={22} d={22} h={16} o={4} />
      <Box x={26} y={54} z={51} w={22} d={22} h={16} o={5} />
      <Box x={62} y={54} z={51} w={22} d={22} h={16} o={5} />

      {/* Level 3: the surface an operator touches. */}
      <Box x={0} y={0} z={92} w={110} d={90} h={5} o={6} weight="h" />
      <Box x={14} y={20} z={97} w={82} d={50} h={3} o={7} weight="a" />

      {callout(92, '3', 'INTERFACE', 8)}
      {callout(46, '2', 'ORCHESTRATION', 9)}
      {callout(0, '1', 'DATA', 10)}
    </>
  );
}

/* ---------------------------------------------------------------- A-101 --- */

const YEAR_X = (year: number) => +(30 + (year - 2017) * 30.4).toFixed(1);

/** Elevation along the career datum: each role a volume, each taller. */
function Elevation() {
  const blocks: Array<[number, number, number]> = [
    [2017, 2021, 30],
    [2021, 2023, 52],
    [2023, 2025, 78],
    [2025, 2025.5, 96],
    [2025.5, 2026, 112],
    [2026, 2026.9, 132],
  ];
  const ground = 160;

  return (
    <>
      <P d="M16 160H344" w="h" o={0} />
      <P d={hatch(16, 160, 328, 8, 9)} w="x" o={1} />

      {blocks.map(([from, to, h], i) => {
        const x1 = YEAR_X(from);
        const x2 = YEAR_X(to);
        const last = i === blocks.length - 1;
        let floors = '';
        for (let y = ground - 13; y > ground - h + 4; y -= 13) floors += `M${x1} ${y}H${x2}`;
        return (
          <g key={from}>
            <P d={floors} w="x" o={i + 3} />
            <P d={`M${x1} ${ground}V${ground - h}H${x2}V${ground}`} w={last ? 'a' : 'm'} o={i + 1} />
          </g>
        );
      })}

      {[2017, 2021, 2023, 2025, 2026].map((year, i) => (
        <g key={year}>
          <P d={`M${YEAR_X(year)} 168V174`} w="t" o={2} />
          <T x={YEAR_X(year)} y={184} anchor="middle" o={4 + i}>
            {year}
          </T>
        </g>
      ))}

      {/* Level mark on the current role. */}
      <P d={`M${YEAR_X(2026.9)} 28H338`} w="a" o={8} />
      <T x={338} y={22} anchor="end" o={9} accent>
        CURRENT
      </T>

      <P d={dim(YEAR_X(2017), 14, YEAR_X(2026.9), 14)} w="t" o={9} />
      <T x={150} y={10} anchor="middle" o={10}>
        DATUM · RESEARCH TO PRODUCTION
      </T>
    </>
  );
}

/* ---------------------------------------------------------------- R-301 --- */

/** Benchmark plot: nine models, one that held up. */
function Plot() {
  let grid = '';
  for (let x = 69; x < 330; x += 29) grid += `M${x} 170V20`;
  for (let y = 140; y > 20; y -= 30) grid += `M40 ${y}H330`;
  let ticks = '';
  for (let x = 40; x <= 330; x += 29) ticks += `M${x} 170V174`;
  for (let y = 170; y >= 20; y -= 30) ticks += `M36 ${y}H40`;

  return (
    <>
      <P d={grid} w="x" o={0} />
      <P d="M40 20V170H330" w="m" o={1} />
      <P d={ticks} w="t" o={2} />
      <D d="M40 170L330 22" o={3} />

      <P d="M40 170C110 130 200 80 330 22" w="t" o={3} />
      <P d="M40 170C80 100 160 56 330 22" w="t" o={4} />
      <P d="M40 170C60 70 120 34 330 22" w="a" o={5} />

      {[
        [52, 129],
        [72, 96],
        [114, 63],
        [178.5, 40],
        [245, 29],
      ].map(([x, y], i) => (
        <P key={x} d={`M${x} ${y}m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0`} w="a" fill="paper" o={6 + i} />
      ))}

      <T x={185} y={188} anchor="middle" o={8}>
        FALSE POSITIVE RATE
      </T>
      <T x={48} y={16} o={8}>
        RECALL
      </T>
      <T x={326} y={160} anchor="end" o={9}>
        9 MODELS · OASIS
      </T>
    </>
  );
}

/* ---------------------------------------------------------------- E-600 --- */

/** Detail of a leverage point: a small input, a long arm, a system moved. */
function Lever() {
  return (
    <>
      <P d="M236 104H364" w="h" o={0} />
      <P d={hatch(236, 104, 128, 8, 8)} w="x" o={1} />
      <P d="M300 58L282 104H318Z" w="m" fill="paper" o={1} />

      <P d="M36 50H384V58H36Z" w="h" fill="paper" o={2} />
      <P d="M340 18H376V50H340Z" w="m" fill="paper" o={3} />
      <T x={358} y={37} anchor="middle" o={5}>
        SYSTEM
      </T>

      <P d="M56 14V46M56 46l-4-8M56 46l4-8" w="a" o={4} />
      <T x={66} y={22} o={5} accent>
        SMALL INPUT
      </T>

      <P d={dim(56, 126, 300, 126)} w="t" o={5} />
      <P d={dim(300, 126, 358, 126)} w="t" o={6} />
      <T x={178} y={121} anchor="middle" o={6}>
        LONG ARM
      </T>
      <D d="M56 62V132M300 108V132M358 62V132" o={6} />

      <T x={36} y={144} o={7}>
        DETAIL 1 · LEVERAGE POINT
      </T>
    </>
  );
}

/* ---------------------------------------------------------------- B-500 --- */

/** A survey traverse: eight stations, one per note, walked in order. */
function Traverse() {
  const stations: Array<[number, number]> = [
    [34, 92],
    [82, 50],
    [132, 78],
    [184, 34],
    [236, 68],
    [288, 40],
    [338, 84],
    [392, 46],
  ];

  return (
    <>
      <D d={`M24 104H402${stations.map(([x, y]) => `M${x} ${y}V104`).join('')}`} o={6} />
      <P d={`M${stations.slice(0, 7).map((s) => s.join(' ')).join('L')}`} w="m" o={0} />
      <P d={`M${stations[6].join(' ')}L${stations[7].join(' ')}`} w="a" o={3} />

      {stations.map(([x, y], i) => {
        const latest = i === stations.length - 1;
        return (
          <g key={x}>
            <P
              d={`M${x} ${y}m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0`}
              w={latest ? 'a' : 't'}
              fill="paper"
              o={1 + Math.floor(i / 2)}
            />
            <T x={x} y={y - 9} anchor="middle" o={4 + Math.floor(i / 2)} accent={latest}>
              {508 - i}
            </T>
          </g>
        );
      })}

      {/* North point. */}
      <P d="M22 34m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0" w="t" o={5} />
      <P d="M22 43V21l-3.5 8M22 21l3.5 8" w="t" o={6} />
      <T x={22} y={15} anchor="middle" o={7}>
        N
      </T>
    </>
  );
}

/* ---------------------------------------------------------------- C-700 --- */

/** A transmittal, in elevation. */
function Envelope() {
  return (
    <>
      <P d="M40 34H240V134H40Z" w="m" fill="paper" o={0} />
      <P d="M40 134L112 86M240 134L168 86" w="x" o={2} />
      <P d="M40 34L140 96L240 34" w="t" o={1} />
      <P d="M140 96m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0" w="a" fill="paper" o={3} />

      {/* Postmark, struck off the corner. */}
      <P d="M252 38m-15 0a15 15 0 1 0 30 0a15 15 0 1 0-30 0" w="a" o={4} />
      <P d="M252 38m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0" w="a" o={4} />
      <P d="M270 30h22M272 38h22M270 46h22" w="a" o={5} />

      <P d={dim(40, 150, 240, 150)} w="t" o={4} />
      <T x={140} y={146} anchor="middle" o={5}>
        TRANSMITTAL · C-700 / 01
      </T>
    </>
  );
}

/* -------------------------------------------------------------------------- */

const FIGURES: Record<string, { viewBox: string; caption: string; draw: () => ReactNode }> = {
  about: { viewBox: '0 0 360 200', caption: 'Elevation along the career datum', draw: Elevation },
  research: { viewBox: '0 0 360 200', caption: 'Benchmark plot, nine models', draw: Plot },
  architecture: { viewBox: '0 0 340 200', caption: 'Section through a governed platform', draw: Section },
  work: { viewBox: '0 0 360 240', caption: 'Exploded axonometric of a platform', draw: Axonometric },
  essays: { viewBox: '0 0 420 150', caption: 'Detail of a leverage point', draw: Lever },
  blog: { viewBox: '0 0 420 116', caption: 'Traverse of the field notes', draw: Traverse },
  contact: { viewBox: '0 0 310 164', caption: 'Transmittal, in elevation', draw: Envelope },
};

export function hasFigure(id: string): boolean {
  return id in FIGURES;
}

export function figureCaption(id: string): string {
  return FIGURES[id]?.caption ?? '';
}

/**
 * One sheet's figure. Decorative on the key plan, where the sheet's own link
 * already names it; captioned by the caller where it stands as content.
 */
export function PlateFigure({ id, className }: { id: string; className?: string }) {
  const figure = FIGURES[id];
  if (!figure) return null;
  const Draw = figure.draw;

  return (
    <svg
      viewBox={figure.viewBox}
      className={`${styles.fig} ${className ?? ''}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <Draw />
    </svg>
  );
}
