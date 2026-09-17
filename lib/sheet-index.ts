import { getCollection } from '@/lib/content';
import { COLLECTION_SERIES, PLATES, detailSheetNumber, type SeriesName } from '@/lib/plates';
import type { IndexEntry } from '@/components/sheet/SheetIndex';

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
      group: 'Works — details',
    })),
    ...essays.map((entry, i) => ({
      sheet: detailSheetNumber('essays', i),
      title: entry.frontmatter.title,
      subtitle: entry.frontmatter.description,
      href: `/essays/${entry.slug}/`,
      discipline: COLLECTION_SERIES.essays.discipline,
      group: 'Essays — details',
    })),
    ...blog.map((entry, i) => ({
      sheet: detailSheetNumber('blog', i),
      title: entry.frontmatter.title,
      subtitle: entry.frontmatter.description,
      href: `/blog/${entry.slug}/`,
      discipline: COLLECTION_SERIES.blog.discipline,
      group: 'Field notes — details',
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
