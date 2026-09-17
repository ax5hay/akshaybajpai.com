/**
 * The sheet registry.
 *
 * The site is a single drawing set. Every route is a numbered plate, and the
 * key plan (G-000) is a general-arrangement drawing of the whole set. Sheet
 * numbers follow drawing-set convention: a discipline letter, then a series
 * number where x00 is the general arrangement for that discipline.
 *
 * Key plan rectangles are authored, not computed. The general arrangement is
 * a designed composition, not a force layout.
 */

export type Discipline = 'G' | 'A' | 'S' | 'R' | 'W' | 'B' | 'E' | 'C' | 'X';

export interface DisciplineInfo {
  letter: Discipline;
  name: string;
}

export const DISCIPLINES: Record<Discipline, DisciplineInfo> = {
  G: { letter: 'G', name: 'General' },
  A: { letter: 'A', name: 'Architectural' },
  S: { letter: 'S', name: 'Structural' },
  R: { letter: 'R', name: 'Research' },
  W: { letter: 'W', name: 'Works' },
  B: { letter: 'B', name: 'Field Notes' },
  E: { letter: 'E', name: 'Essays' },
  C: { letter: 'C', name: 'Correspondence' },
  X: { letter: 'X', name: 'Unissued' },
};

/** Position of a plate on the key plan, in key-plan units. */
export interface KeyPlanRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Plate {
  id: string;
  sheet: string;
  discipline: Discipline;
  /** Title as printed in the title block. */
  title: string;
  /** One line under the title. */
  subtitle: string;
  href: string;
  /** Drawing scale, printed in the title block. NTS = not to scale. */
  scale: string;
  revision: string;
  /** Sheets cross-referenced from this one; drawn as leaders on the key plan. */
  refs: string[];
  /** Omitted for detail sheets, which do not appear on the key plan. */
  rect?: KeyPlanRect;
}

export type PlacedPlate = Plate & { rect: KeyPlanRect };

export const PLATES: Plate[] = [
  {
    id: 'index',
    sheet: 'G-000',
    discipline: 'G',
    title: 'Key Plan',
    subtitle: 'General arrangement of the complete set',
    href: '/',
    scale: 'NTS',
    revision: 'C',
    refs: [],
  },
  {
    id: 'about',
    sheet: 'A-101',
    discipline: 'A',
    title: 'The Architect',
    subtitle: 'Biography, trajectory, and operating principles',
    href: '/about/',
    scale: '1:1',
    revision: 'C',
    refs: ['R-301', 'W-400', 'C-700'],
    rect: { x: 0, y: 150, w: 420, h: 250 },
  },
  {
    id: 'research',
    sheet: 'R-301',
    discipline: 'R',
    title: 'Research',
    subtitle: 'Published work and experimental directions',
    href: '/research/',
    scale: '1:1',
    revision: 'B',
    refs: ['A-101', 'W-400'],
    rect: { x: 0, y: 420, w: 420, h: 200 },
  },
  {
    id: 'architecture',
    sheet: 'S-201',
    discipline: 'S',
    title: 'Structural Principles',
    subtitle: 'The decisions that outlast implementation',
    href: '/architecture/',
    scale: '1:20',
    revision: 'C',
    refs: ['W-400', 'B-500', 'E-600'],
    rect: { x: 0, y: 640, w: 420, h: 250 },
  },
  {
    id: 'work',
    sheet: 'W-400',
    discipline: 'W',
    title: 'Works',
    subtitle: 'Case studies, as built',
    href: '/work/',
    scale: '1:50',
    revision: 'D',
    refs: ['S-201', 'R-301', 'C-700'],
    rect: { x: 460, y: 0, w: 740, h: 400 },
  },
  {
    id: 'essays',
    sheet: 'E-600',
    discipline: 'E',
    title: 'Essays',
    subtitle: 'Longer arguments about systems, cost, and trust',
    href: '/essays/',
    scale: '1:1',
    revision: 'B',
    refs: ['B-500', 'S-201'],
    rect: { x: 460, y: 420, w: 740, h: 225 },
  },
  {
    id: 'blog',
    sheet: 'B-500',
    discipline: 'B',
    title: 'Field Notes',
    subtitle: 'What the work taught, written down while it was fresh',
    href: '/blog/',
    scale: '1:1',
    revision: 'C',
    refs: ['E-600', 'S-201'],
    rect: { x: 1240, y: 0, w: 460, h: 400 },
  },
  {
    id: 'contact',
    sheet: 'C-700',
    discipline: 'C',
    title: 'Correspondence',
    subtitle: 'Open a line',
    href: '/contact/',
    scale: 'NTS',
    revision: 'B',
    refs: ['A-101', 'W-400'],
    rect: { x: 1240, y: 420, w: 460, h: 180 },
  },
];

/** Series number assigned to each collection's detail sheets. */
export const COLLECTION_SERIES = {
  work: { discipline: 'W' as Discipline, base: 400, index: 'W-400', label: 'Works' },
  blog: { discipline: 'B' as Discipline, base: 500, index: 'B-500', label: 'Field notes' },
  essays: { discipline: 'E' as Discipline, base: 600, index: 'E-600', label: 'Essays' },
};

export type SeriesName = keyof typeof COLLECTION_SERIES;

/**
 * Detail sheets are numbered by position in the collection, so a slug's sheet
 * number is stable as long as publication order does not change.
 */
export function detailSheetNumber(collection: SeriesName, indexInCollection: number): string {
  const series = COLLECTION_SERIES[collection];
  return `${series.discipline}-${series.base + indexInCollection + 1}`;
}

const PLATES_BY_HREF = new Map(PLATES.map((p) => [p.href, p]));
const PLATES_BY_SHEET = new Map(PLATES.map((p) => [p.sheet, p]));

export function getPlateByHref(href: string): Plate | undefined {
  return PLATES_BY_HREF.get(href.endsWith('/') ? href : `${href}/`);
}

export function getPlateBySheet(sheet: string): Plate | undefined {
  return PLATES_BY_SHEET.get(sheet);
}

/** Plates drawn on the key plan, in reading order. */
export function keyPlanPlates(): PlacedPlate[] {
  return PLATES.filter((p): p is PlacedPlate => Boolean(p.rect));
}

/**
 * The plan's own coordinate space. Roughly 16:9 so it fills a landscape
 * viewport when fitted, leaving the margins a drawing sheet should have.
 */
export const KEY_PLAN_WIDTH = 1700;
export const KEY_PLAN_HEIGHT = 900;

/** Non-navigable furniture drawn alongside the plates. */
export const KEY_PLAN_FURNITURE = {
  headline: { x: 0, y: 0, w: 420, h: 130 },
  notes: { x: 460, y: 665, w: 740, h: 225 },
  legend: { x: 1240, y: 620, w: 460, h: 270 },
} as const;

/**
 * General notes, numbered as on a real sheet. These state the terms the rest
 * of the set is read under.
 */
export const GENERAL_NOTES = [
  'Organisation names are generalised throughout. The engineering is specific.',
  'Metrics are measured in production unless annotated otherwise.',
  'This set is issued as a static export. No server is in the loop.',
  'Drawings are live: switch Artifact / Annotated / Raw with the selector, or press D.',
] as const;

/**
 * Resolve the plate that owns a pathname. Detail routes resolve to the
 * general arrangement sheet for their series.
 */
export function plateForPath(pathname: string): Plate | undefined {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const exact = PLATES_BY_HREF.get(path);
  if (exact) return exact;

  const segments = path.split('/').filter(Boolean);
  if (segments.length > 1) return PLATES_BY_HREF.get(`/${segments[0]}/`);
  return undefined;
}
