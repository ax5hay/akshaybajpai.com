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
export function rosette(): string {
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
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200">` +
    `<defs>${defs}</defs>` +
    `<g fill="none" stroke="#000" stroke-width="0.5">${uses}${rings}<path d="${ticks}"/></g>` +
    `</svg>`
  );
}

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
