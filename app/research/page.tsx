import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { ContentPage } from '@/components/ContentPage';
import { PageHero } from '@/components/PageHero';
import { ProseContent } from '@/components/ProseContent';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Research · Akshay Bajpai | AI Architect & Technology Leader',
  description: 'Published research and experimental work in AI, ML, and intelligent systems.',
  path: '/research/',
});

export default function ResearchPage() {
  return (
    <PageShell>
      <ContentPage section="research">
        <PageHero
          section="research"
          title="Research"
          lead="Published work and experimental directions."
        />
        <ProseContent section="research">
          <p>
            My research background spans medical AI, computer vision, and intelligent systems. I hold a
            Master&apos;s with 97.5% distinction in Artificial Intelligence & Intelligent Systems from Lviv
            Polytechnic National University.
          </p>
          <p>
            Current interests include robust AI infrastructure, minimal-dependency systems, performance
            engineering for static and edge deployments, and the intersection of systems thinking with
            product design.
          </p>
          <p>
            Selected technical writing is in <Link href="/blog/">Blog</Link> and{' '}
            <Link href="/essays/">Essays</Link>.
          </p>
        </ProseContent>
      </ContentPage>
    </PageShell>
  );
}
