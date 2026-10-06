import { getCollection } from '@/lib/content';
import { parseContentDate } from '@/lib/format';
import { COLLECTION_SERIES, PLATES, detailSheetNumber, type SeriesName } from '@/lib/plates';
import type { IndexEntry } from '@/components/sheet/SheetIndex';

/** Year and month, as stamped on a sheet. */
function stamp(date: string): string {
  const d = parseContentDate(date);
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/**
 * Builds the complete drawing index at build time: the seven general
 * arrangement sheets plus every detail sheet across the three collections.
 */
export async function buildSheetIndex(): Promise<IndexEntry[]> {
  const [work, blog, essays] = await Promise.all([
    getCollection('work'),
    getCollection('blog'),
    getCollection('essays'),
  ]);

  const general: IndexEntry[] = PLATES.map((plate) => ({
    sheet: plate.sheet,
    title: plate.title,
    subtitle: plate.subtitle,
    href: plate.href,
    discipline: plate.discipline,
    group: 'General arrangement',
  }));

  const details: IndexEntry[] = [
    ...work.map((entry, i) => ({
      sheet: detailSheetNumber('work', i),
      title: entry.frontmatter.title,
      subtitle: entry.frontmatter.description,
      href: `/work/${entry.slug}/`,
      discipline: COLLECTION_SERIES.work.discipline,
      group: 'Works · details',
      issued: stamp(entry.frontmatter.pubDate),
      profile: entry.sections.map((section) => section.words),
    })),
    ...essays.map((entry, i) => ({
      sheet: detailSheetNumber('essays', i),
      title: entry.frontmatter.title,
      subtitle: entry.frontmatter.description,
      href: `/essays/${entry.slug}/`,
      discipline: COLLECTION_SERIES.essays.discipline,
      group: 'Essays · details',
      issued: stamp(entry.frontmatter.pubDate),
      profile: entry.sections.map((section) => section.words),
    })),
    ...blog.map((entry, i) => ({
      sheet: detailSheetNumber('blog', i),
      title: entry.frontmatter.title,
      subtitle: entry.frontmatter.description,
      href: `/blog/${entry.slug}/`,
      discipline: COLLECTION_SERIES.blog.discipline,
      group: 'Field notes · details',
      issued: stamp(entry.frontmatter.pubDate),
      profile: entry.sections.map((section) => section.words),
    })),
  ];

  return [...general, ...details];
}

/**
 * Sheet number for one detail route, resolved by its position in the
 * collection so the number matches what the index prints.
 */
export async function detailSheetFor(collection: SeriesName, slug: string): Promise<string> {
  const entries = await getCollection(collection);
  const position = entries.findIndex((e) => e.slug === slug);
  return position === -1
    ? `${COLLECTION_SERIES[collection].discipline}-000`
    : detailSheetNumber(collection, position);
}

/**
 * The sheets either side of this one in the series, wrapping at the ends so a
 * reader at the edge of a collection still gets somewhere to go next.
 */
export async function adjacentSheets(
  collection: SeriesName,
  slug: string,
  limit = 3
): Promise<Array<{ sheet: string; title: string; href: string }>> {
  const entries = await getCollection(collection);
  const at = entries.findIndex((e) => e.slug === slug);
  if (at === -1) return [];

  return Array.from({ length: Math.min(limit, entries.length - 1) }, (_, i) => {
    const index = (at + i + 1) % entries.length;
    const entry = entries[index];
    return {
      sheet: detailSheetNumber(collection, index),
      title: entry.frontmatter.title,
      href: `/${collection}/${entry.slug}/`,
    };
  });
}

export interface SheetRef {
  sheet: string;
  title: string;
  href: string;
}

/**
 * Cross-references for one sheet, read off the Markdown: the sheets its text
 * links to, and the sheets whose text links to it. Nothing is inferred; a
 * sheet with no links in either direction has no cross-references.
 */
export async function crossReferences(href: string): Promise<{ out: SheetRef[]; in: SheetRef[] }> {
  const [index, work, blog, essays] = await Promise.all([
    buildSheetIndex(),
    getCollection('work'),
    getCollection('blog'),
    getCollection('essays'),
  ]);
  const byHref = new Map(index.map((e) => [e.href, e]));
  const ref = (h: string): SheetRef | null => {
    const entry = byHref.get(h);
    return entry ? { sheet: entry.sheet, title: entry.title, href: entry.href } : null;
  };
  const linksIn = (markdown: string) =>
    [...markdown.matchAll(/\]\((\/[^)#\s]*)/g)].map((m) => (m[1].endsWith('/') ? m[1] : `${m[1]}/`));

  const sources = [
    ...work.map((e) => ({ href: `/work/${e.slug}/`, content: e.content })),
    ...blog.map((e) => ({ href: `/blog/${e.slug}/`, content: e.content })),
    ...essays.map((e) => ({ href: `/essays/${e.slug}/`, content: e.content })),
  ];

  const unique = (refs: Array<SheetRef | null>) => {
    const seen = new Set<string>();
    return refs.filter((r): r is SheetRef => {
      if (!r || r.href === href || seen.has(r.href)) return false;
      seen.add(r.href);
      return true;
    });
  };

  const self = sources.find((s) => s.href === href);
  return {
    out: unique(self ? linksIn(self.content).map(ref) : []),
    in: unique(sources.filter((s) => linksIn(s.content).includes(href)).map((s) => ref(s.href))),
  };
}
