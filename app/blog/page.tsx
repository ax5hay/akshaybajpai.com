import { PlateShell } from '@/components/plate/PlateShell';
import { SheetSchedule, type ScheduleRow } from '@/components/plate/SheetSchedule';
import { getCollection, estimateReadingTime } from '@/lib/content';
import { detailSheetNumber, getPlateByHref } from '@/lib/plates';
import { SITE_URL } from '@/lib/constants';
import { buildMetadata, breadcrumbs, webPage } from '@/lib/metadata';
import { JsonLd } from '@/components/JsonLd';

const PLATE = getPlateByHref('/blog/')!;

const META = {
  title: 'Field Notes · Technical writing on AI systems',
  description:
    'Technical writing on AI infrastructure, healthcare AI architecture, performance engineering, and building software with a zero-dependency mindset.',
  path: '/blog/',
  card: 'blog',
  keywords: ['AI field notes', 'LLM engineering notes', 'RAG in production', 'agentic systems', 'Akshay Bajpai blog'],
};

export const metadata = buildMetadata(META);

export default async function BlogIndexPage() {
  const entries = await getCollection('blog');

  const rows: ScheduleRow[] = entries.map((entry, i) => ({
    sheet: detailSheetNumber('blog', i),
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    href: `/blog/${entry.slug}/`,
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
        breadcrumbs([{ name: 'B-500 Field Notes', path: META.path }]),
      ]}
      figure={PLATE.id}
      facts={[{ k: 'Sheets', v: String(rows.length) }]}
      record={[{ k: 'series', v: 'B-5xx' }, { k: 'count', v: String(rows.length) }]}
      wide
      lead={
        <p>
          Shorter pieces written close to the work: what a system taught while it was still
          being built, before the lesson had time to round itself off.
        </p>
      }
    >
      <SheetSchedule rows={rows} unit="notes" />
    </PlateShell>
  );
}
