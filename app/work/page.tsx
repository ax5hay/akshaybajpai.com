import { PlateShell } from '@/components/plate/PlateShell';
import { SheetSchedule, type ScheduleRow } from '@/components/plate/SheetSchedule';
import { getCollection, estimateReadingTime, type WorkFrontmatter } from '@/lib/content';
import { detailSheetNumber, getPlateByHref } from '@/lib/plates';
import { SITE_URL } from '@/lib/constants';
import { buildMetadata, breadcrumbs, webPage } from '@/lib/metadata';
import { RepoCards } from '@/components/plate/RepoCards';
import { REPO_CARDS } from '@/lib/repos';

const PLATE = getPlateByHref('/work/')!;

const META = {
  title: 'Works · case studies, as built',
  description:
    'Case studies, as built: a self-learning text-to-SQL agent behind five walls, a Rust tray app, offline video analytics, defence video intelligence, multi-tenant LLM platforms and document AI.',
  path: '/work/',
  card: 'work',
  keywords: ['AI case studies', 'forward-deployed AI', 'text-to-SQL', 'NL2SQL', 'computer vision', 'Rust', 'Tauri', 'document AI', 'Akshay Bajpai work'],
};

export const metadata = buildMetadata(META);

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
    profile: entry.sections.map((section) => section.words),
    metric: entry.frontmatter.metrics?.[0],
  }));

  return (
    <PlateShell
      sheet={PLATE.sheet}
      title={PLATE.title}
      subtitle={PLATE.subtitle}
      discipline={PLATE.discipline}
      scale={PLATE.scale}
      revision={PLATE.revision}
      issued="2026.11"
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
        breadcrumbs([{ name: 'W-400 Works', path: META.path }]),
      ]}
      figure={PLATE.id}
      facts={[
        { k: 'Sheets', v: String(rows.length) },
        { k: 'Cards', v: String(REPO_CARDS.length) },
      ]}
      record={[{ k: 'series', v: 'W-4xx' }, { k: 'count', v: String(rows.length) }]}
      wide
      lead={
        <p>
          What was built, the constraints it was built under, and the numbers it was measured by.
          The newest three are my own: a reports agent, a tray app in Rust and an offline video
          console. The others are client engagements, where the model was usually the easy
          part, and open work and research. Company names are left out; the engineering is not.
        </p>
      }
    >
      <SheetSchedule rows={rows} unit="case studies" filterable />
      <RepoCards cards={REPO_CARDS} />
    </PlateShell>
  );
}
