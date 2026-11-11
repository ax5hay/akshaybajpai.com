import Link from 'next/link';
import { PlateShell } from '@/components/plate/PlateShell';
import { MaterialSchedule } from '@/components/plate/MaterialSchedule';
import { getPlateByHref } from '@/lib/plates';
import { HEAVY_AT, readStack } from '@/lib/stack';
import { buildMetadata, breadcrumbs, webPage, PERSON_ID } from '@/lib/metadata';

const PLATE = getPlateByHref('/schedule/')!;

const META = {
  title: 'Schedule of Materials · skills and practice',
  description:
    'Every tool and practice Akshay Bajpai works with, in one view: leadership and delivery first, then languages, AI and LLM systems, vision, data, infrastructure, security, testing and desktop software.',
  path: '/schedule/',
  card: 'schedule',
  keywords: ['Akshay Bajpai skills', 'technical leadership', 'systems architecture', 'LLM systems', 'computer vision', 'Rust', 'TypeScript', 'Python'],
};

export const metadata = buildMetadata(META);

export default function SchedulePage() {
  const stack = readStack();
  const total = stack.reduce((n, d) => n + d.items.length, 0);
  const heavy = stack.reduce((n, d) => n + d.items.filter((i) => i.n >= HEAVY_AT).length, 0);

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
          card: META.card,
          extra: {
            about: { '@id': PERSON_ID },
            mainEntity: {
              '@type': 'ItemList',
              name: 'Disciplines',
              numberOfItems: stack.length,
              itemListElement: stack.map((d, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: `${d.category}: ${d.items.map((item) => item.name).join(', ')}`,
              })),
            },
          },
        }),
        breadcrumbs([{ name: 'A-102 Schedule of Materials', path: META.path }]),
      ]}
      facts={[
        { k: 'Items', v: String(total) },
        { k: 'Disciplines', v: String(stack.length) },
        { k: 'Heavy', v: String(heavy) },
      ]}
      record={[
        { k: 'source', v: 'data/stack.json' },
        { k: 'sync', v: 'npm run sync:stack' },
        { k: 'heavy_at', v: `n >= ${HEAVY_AT}` },
      ]}
      wide
      lead={
        <p>
          Every item here comes from a repository I pushed or work I led. The heavy ones appear in
          three or more. How they were used is on the <Link href="/work/">case studies</Link>.
        </p>
      }
    >
      <MaterialSchedule stack={stack} />
    </PlateShell>
  );
}
