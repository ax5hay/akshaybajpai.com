import { PlateShell } from '@/components/plate/PlateShell';
import { SheetSchedule, type ScheduleRow } from '@/components/plate/SheetSchedule';
import { getCollection, estimateReadingTime } from '@/lib/content';
import { detailSheetNumber, getPlateByHref } from '@/lib/plates';
import { buildMetadata } from '@/lib/metadata';

const PLATE = getPlateByHref('/essays/')!;

export const metadata = buildMetadata({
  title: 'Essays · Akshay Bajpai | AI Architect & Technology Leader',
  description:
    'Long-form essays on systems thinking, the architecture of trust, minimalism as engineering, and why performance is a feature.',
  path: '/essays/',
});

export default async function EssaysIndexPage() {
  const entries = await getCollection('essays');

  const rows: ScheduleRow[] = entries.map((entry, i) => ({
    sheet: detailSheetNumber('essays', i),
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    href: `/essays/${entry.slug}/`,
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
