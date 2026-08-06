import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { ContentPage } from '@/components/ContentPage';
import { PageHero } from '@/components/PageHero';
import { ProseContent } from '@/components/ProseContent';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Architecture · Akshay Bajpai | AI Architect & Technology Leader',
  description: 'System design, infrastructure patterns, and architectural thinking for AI and product.',
  path: '/architecture/',
});

export default function ArchitecturePage() {
  return (
    <PageShell>
      <ContentPage section="architecture">
        <PageHero
          section="architecture"
          title="Architecture"
          lead="System design, infrastructure patterns, and how I think about structure."
        />
        <ProseContent section="architecture">
          <p>
            Architecture is the set of decisions that outlast implementation. I approach it as explicit
            tradeoffs: consistency vs. availability, latency vs. throughput, dependency count vs. speed
            of delivery.
          </p>
          <p>
            Recurring themes: minimal surface area, clear boundaries, performance as a requirement from
            day one, and the conviction that the best dependency is the one you don&apos;t add.
          </p>
          <p>
            For deep dives see <Link href="/work/">Work</Link> and <Link href="/essays/">Essays</Link>.
          </p>
        </ProseContent>
      </ContentPage>
    </PageShell>
  );
}
