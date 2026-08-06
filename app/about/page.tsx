import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { ContentPage } from '@/components/ContentPage';
import { PageHero } from '@/components/PageHero';
import { ProseContent } from '@/components/ProseContent';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'About · Akshay Bajpai | AI Architect & Technology Leader',
  description: 'Akshay Bajpai — From medical AI research to building products people use daily.',
  path: '/about/',
});

export default function AboutPage() {
  return (
    <PageShell>
      <ContentPage section="about">
        <PageHero
          section="about"
          title="About"
          lead="Architect of systems. Builder of intelligence."
        />
        <ProseContent section="about">
          <p>
            I operate at the intersection of AI infrastructure, systems thinking, and product. My work spans
            research, architecture, and shipping—each system designed with explicit tradeoffs and long-term
            maintainability in mind.
          </p>
          <p>
            I hold a Master&apos;s with distinction in Artificial Intelligence & Intelligent Systems. I have
            published research and shipped products that people use daily. I prefer building with minimal
            dependencies, clear architecture, and performance as a non-negotiable.
          </p>
          <p>
            This site is a thinking laboratory: essays, case studies, and technical writing that reflect how
            I approach problems. If you want to collaborate on AI systems, architecture, or performance-critical
            products, <Link href="/contact/">get in touch</Link>.
          </p>
        </ProseContent>
      </ContentPage>
    </PageShell>
  );
}
