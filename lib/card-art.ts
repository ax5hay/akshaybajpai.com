import QRCode from 'qrcode';

/**
 * The engraving on the calling card, and the code on its back. Both are drawn
 * here, at build time, so the page ships the result and none of the maths.
 */

/* ---------------------------------------------------------------- Rosette --- */

/** One closed wave around the centre: r = R + A·sin(nθ), to one decimal. */
function wave(radius: number, amplitude: number, lobes: number): string {
  const steps = lobes * 18;
  const points: string[] = [];
  for (let i = 0; i < steps; i += 1) {
    const t = (i / steps) * Math.PI * 2;
    const r = radius + amplitude * Math.sin(lobes * t);
    points.push(`${(r * Math.cos(t)).toFixed(1)} ${(r * Math.sin(t)).toFixed(1)}`);
  }
  return `M${points.join('L')}Z`;
}

/**
 * A guilloché rosette, the engraving banknotes and passports are printed
 * with: three bands of the same wave, each laid down several times a few
 * degrees apart so the copies cross into a lattice, ruled off by plain rings
 * and a scale of ticks at the rim. Each band is drawn once and repeated with
 * <use>, which keeps the file at a few kilobytes.
 *
 * It is used as a mask, never shown as is: the card paints it in whatever
 * ink or foil the mode calls for, so the strokes are plain black.
 */
function rosetteParts() {
  const bands = [
    { id: 'a', radius: 82, amplitude: 8, lobes: 24, copies: 6 },
    { id: 'b', radius: 56, amplitude: 12, lobes: 16, copies: 8 },
    { id: 'c', radius: 33, amplitude: 6, lobes: 10, copies: 6 },
  ];
  const defs = bands.map((b) => `<path id="${b.id}" d="${wave(b.radius, b.amplitude, b.lobes)}"/>`).join('');
  const uses = bands
    .flatMap((b) =>
      Array.from({ length: b.copies }, (_, k) => {
        const turn = ((360 / b.lobes) * k) / b.copies;
        return `<use href="#${b.id}" transform="rotate(${turn.toFixed(3)})"/>`;
      })
    )
    .join('');
  const rings = [24, 42, 70, 93, 96, 99.4].map((r) => `<circle r="${r}"/>`).join('');
  const ticks = Array.from({ length: 120 }, (_, i) => {
    const t = (i / 120) * Math.PI * 2;
    const inner = i % 10 === 0 ? 93 : 96;
    const f = (r: number) => `${(r * Math.cos(t)).toFixed(1)} ${(r * Math.sin(t)).toFixed(1)}`;
    return `M${f(inner)}L${f(99.4)}`;
  }).join('');
  return { defs, lines: `${uses}${rings}<path d="${ticks}"/>` };
}

const svg = (defs: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200"><defs>${defs}</defs>${body}</svg>`;

/** The rosette as a bare mask: black strokes, used where a mask is still wanted. */
export function rosette(): string {
  const { defs, lines } = rosetteParts();
  return svg(defs, `<g fill="none" stroke="#000" stroke-width="0.5">${lines}</g>`);
}

/** The engraving's ink, per drawing mode: the colour and strength it is printed in. */
export const INK = {
  artifact: { color: '#2f5d8c', opacity: 0.5 },
  annotated: { color: '#9dcfff', opacity: 0.42 },
  raw: { color: '#8fe388', opacity: 0.34 },
} as const;

export type InkMode = keyof typeof INK;

/**
 * The card's artwork, drawn once into plain images so that nothing on the
 * card is masked while it moves. A mask is redrawn through, offscreen, on
 * every frame its layer moves; an image is a texture, and costs nothing.
 *
 *   ink-front-<mode>  the engraving, in the mode's ink, fading out under
 *                     the name and the role as a banknote's does
 *   ink-back-<mode>   the same, fainter and whole, for the back
 *   foil-<0|1|2>      the engraving in foil, in a pool of light high on the
 *                     right; three phases of the same rainbow, which the card
 *                     cross-fades as it moves, so the colour seems to slide
 */
export function cardArt(name: string): string | null {
  const { defs, lines } = rosetteParts();
  const ink = /^ink-(front|back)-(artifact|annotated|raw)$/.exec(name);
  if (ink) {
    const [, side, mode] = ink;
    const { color, opacity } = INK[mode as InkMode];
    if (side === 'back') {
      return svg(
        defs,
        `<g fill="none" stroke="${color}" stroke-width="0.5" opacity="${(opacity * 0.45).toFixed(3)}">${lines}</g>`
      );
    }
    // Clear at 4% across, full by the middle: the mask the face used to apply.
    return svg(
      `${defs}<linearGradient id="f" gradientUnits="userSpaceOnUse" x1="-92" y1="0" x2="0" y2="0">` +
        `<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>` +
        `<mask id="m" maskUnits="userSpaceOnUse" x="-100" y="-100" width="200" height="200"><rect x="-100" y="-100" width="200" height="200" fill="url(#f)"/></mask>`,
      `<g fill="none" stroke="${color}" stroke-width="0.5" opacity="${opacity}" mask="url(#m)">${lines}</g>`
    );
  }
  const foil = /^foil-([012])$/.exec(name);
  if (foil) {
    // The rainbow ran at 115deg across a band three times the rosette's width;
    // each phase is that band slid along, as the card's lean used to slide it.
    const shift = [0, -72, 100][Number(foil[1])];
    const dx = Math.sin((115 * Math.PI) / 180);
    const dy = -Math.cos((115 * Math.PI) / 180);
    const half = 314;
    const stops = ['#ff7ad9', '#b48cff', '#78b8ff', '#6ff0d0', '#f5f59a', '#ffb07a', '#ff7ad9', '#b48cff'];
    const at = [0, 14, 28, 42, 56, 70, 84, 100];
    const rainbow =
      `<linearGradient id="r" gradientUnits="userSpaceOnUse" x1="${(-dx * half + shift).toFixed(1)}" y1="${(-dy * half).toFixed(1)}" x2="${(dx * half + shift).toFixed(1)}" y2="${(dy * half).toFixed(1)}">` +
      stops.map((c, i) => `<stop offset="${at[i]}%" stop-color="${c}"/>`).join('') +
      `</linearGradient>`;
    // The pool: full at a point 62% across and 34% down, gone 62% of the way
    // to the farthest corner.
    const pool =
      `<radialGradient id="p" gradientUnits="userSpaceOnUse" cx="24" cy="-32" r="112">` +
      `<stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
      `<mask id="m" maskUnits="userSpaceOnUse" x="-100" y="-100" width="200" height="200"><rect x="-100" y="-100" width="200" height="200" fill="url(#p)"/></mask>`;
    return svg(`${defs}${rainbow}${pool}`, `<g fill="none" stroke="url(#r)" stroke-width="0.5" mask="url(#m)">${lines}</g>`);
  }
  return null;
}

export const CARD_ART = [
  ...(['front', 'back'] as const).flatMap((side) => (Object.keys(INK) as InkMode[]).map((m) => `ink-${side}-${m}`)),
  'foil-0',
  'foil-1',
  'foil-2',
];

/* --------------------------------------------------------------------- QR --- */

export type CardCode = {
  /** Modules along a side, before the quiet zone. */
  size: number;
  /** Every dark module, as one path, in module units. */
  path: string;
  /** The square cleared at the centre for the monogram, in module units. */
  clear: { at: number; size: number };
};

/**
 * The card's address as a QR code, at the highest error correction, so the
 * monogram can sit over the middle and the code still reads: H recovers 30%
 * of the symbol and the monogram covers under 5%. Drawn as one path of
 * horizontal runs, which is a fraction of the markup of a square per module.
 */
export function cardCode(text: string): CardCode {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const size = modules.size;
  const clearSize = size >= 33 ? 7 : 5;
  const at = (size - clearSize) / 2;
  const cleared = (r: number, c: number) => r >= at && r < at + clearSize && c >= at && c < at + clearSize;

  let path = '';
  for (let r = 0; r < size; r += 1) {
    let c = 0;
    while (c < size) {
      if (!modules.get(r, c) || cleared(r, c)) {
        c += 1;
        continue;
      }
      const start = c;
      while (c < size && modules.get(r, c) && !cleared(r, c)) c += 1;
      path += `M${start} ${r}h${c - start}v1h${start - c}z`;
    }
  }
  return { size, path, clear: { at, size: clearSize } };
}
