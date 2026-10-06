import { PlateShell } from '@/components/plate/PlateShell';
import { SheetSchedule, type ScheduleRow } from '@/components/plate/SheetSchedule';
import { getCollection, estimateReadingTime } from '@/lib/content';
import { detailSheetNumber, getPlateByHref } from '@/lib/plates';
import { SITE_URL } from '@/lib/constants';
import { buildMetadata, breadcrumbs, webPage } from '@/lib/metadata';
import { JsonLd } from '@/components/JsonLd';

const PLATE = getPlateByHref('/essays/')!;

const META = {
  title: 'Essays · Systems, cost and trust',
  description:
    'Long-form essays on systems thinking, the architecture of trust, minimalism as engineering, and why performance is a feature.',
  path: '/essays/',
  card: 'essays',
  keywords: ['AI essays', 'world models', 'JEPA', 'reinforcement learning', 'AI architecture essays', 'Akshay Bajpai essays'],
};

export const metadata = buildMetadata(META);

export default async function EssaysIndexPage() {
  const entries = await getCollection('essays');

  const rows: ScheduleRow[] = entries.map((entry, i) => ({
    sheet: detailSheetNumber('essays', i),
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    href: `/essays/${entry.slug}/`,
    date: entry.frontmatter.pubDate,
    readingTime: estimateReadingTime(entry.content),
    profile: entry.sections.map((section) => section.words),
  }));

  return (
    <PlateShell
      sheet={PLATE.sheet}
      title={PLATE.title}
      subtitle={PLATE.subtitle}
      discipline={PLATE.discipline}
      scale={PLATE.scale}
      revision={PLATE.revision}
      refs={PLATE.refs}
      jsonLd={[
        webPage({
          path: META.path,
          name: META.title,
          description: META.description,
          type: 'CollectionPage',
          card: META.card,
          extra: {
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: rows.map((row, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: `${row.sheet} ${row.title}`,
              url: `${SITE_URL}${row.href}`,
            })),
          },
        },
        }),
        breadcrumbs([{ name: 'E-600 Essays', path: META.path }]),
      ]}
      figure={PLATE.id}
      facts={[{ k: 'Sheets', v: String(rows.length) }]}
      record={[{ k: 'series', v: 'E-6xx' }, { k: 'count', v: String(rows.length) }]}
      wide
      lead={
        <p>
          Arguments that needed room. These are about the parts of engineering that do not show
          up in a diagram: what convenience costs, what trust is made of, and why restraint is a
          technique rather than a taste.
        </p>
      }
    >
      <SheetSchedule rows={rows} unit="essays" />
    </PlateShell>
  );
}
