import { PlateShell } from '@/components/plate/PlateShell';
import { SheetSchedule, type ScheduleRow } from '@/components/plate/SheetSchedule';
import { getCollection, estimateReadingTime } from '@/lib/content';
import { detailSheetNumber, getPlateByHref } from '@/lib/plates';
import { buildMetadata } from '@/lib/metadata';

const PLATE = getPlateByHref('/blog/')!;

export const metadata = buildMetadata({
  title: 'Blog · Akshay Bajpai | AI Architect & Technology Leader',
  description:
    'Technical writing on AI infrastructure, healthcare AI architecture, performance engineering, and building software with a zero-dependency mindset.',
  path: '/blog/',
});

export default async function BlogIndexPage() {
  const entries = await getCollection('blog');

  const rows: ScheduleRow[] = entries.map((entry, i) => ({
    sheet: detailSheetNumber('blog', i),
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    href: `/blog/${entry.slug}/`,
    date: entry.frontmatter.pubDate,
    readingTime: estimateReadingTime(entry.content),
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
