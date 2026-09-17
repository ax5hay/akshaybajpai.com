import { PlateShell } from '@/components/plate/PlateShell';
import { SheetSchedule, type ScheduleRow } from '@/components/plate/SheetSchedule';
import { getCollection, estimateReadingTime, type WorkFrontmatter } from '@/lib/content';
import { detailSheetNumber, getPlateByHref } from '@/lib/plates';
import { buildMetadata } from '@/lib/metadata';

const PLATE = getPlateByHref('/work/')!;

export const metadata = buildMetadata({
  title: 'Work · Akshay Bajpai | AI Architect & Technology Leader',
  description:
    'Case studies in forward-deployed AI: agentic platforms, clinical and insurance document intelligence, demand forecasting, and multi-tenant LLM systems.',
  path: '/work/',
});

export default async function WorkIndexPage() {
  const entries = await getCollection<WorkFrontmatter>('work');

  const rows: ScheduleRow[] = entries.map((entry, i) => ({
    sheet: detailSheetNumber('work', i),
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    href: `/work/${entry.slug}/`,
    date: entry.frontmatter.pubDate,
    tags: entry.frontmatter.stack,
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
      record={[{ k: 'series', v: 'W-4xx' }, { k: 'count', v: String(rows.length) }]}
      wide
      lead={
        <p>
          Engagements where the model was the easy part. Each sheet records what was built, the
          constraints it was built under, and the numbers it was measured by. Organisation names
          are generalised; the engineering is not.
        </p>
      }
    >
      <SheetSchedule rows={rows} unit="case studies" />
    </PlateShell>
  );
}
