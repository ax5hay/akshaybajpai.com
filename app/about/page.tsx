import Link from 'next/link';
import { PlateShell } from '@/components/plate/PlateShell';
import { CareerElevation } from '@/components/plate/CareerElevation';
import { Callout } from '@/components/kit/Callout';
import { getPlateByHref } from '@/lib/plates';
import { buildMetadata, breadcrumbs, webPage, PERSON_ID } from '@/lib/metadata';
import { JsonLd } from '@/components/JsonLd';

const PLATE = getPlateByHref('/about/')!;

const META = {
  title: 'The Architect · About Akshay Bajpai',
  description:
    'Forward-deployed AI engineer: multi-tenant platforms, governed agents, clinical and operational intelligence from research to production.',
  path: '/about/',
  card: 'about',
  keywords: ['Akshay Bajpai', 'about Akshay Bajpai', 'ax5hay', 'AI architect New Delhi', 'forward-deployed AI engineer', 'MSc Artificial Intelligence'],
};

export const metadata = buildMetadata(META);

export default function AboutPage() {
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
          type: 'ProfilePage',
          card: META.card,
          extra: { mainEntity: { '@id': PERSON_ID } },
        }),
        breadcrumbs([{ name: 'A-101 The Architect', path: META.path }]),
      ]}
      lead={<p>Architect of systems. Builder of intelligence.</p>}
      record={[
        { k: 'name', v: 'Akshay Bajpai' },
        { k: 'role', v: 'Senior Full Stack AI Engineer · Forward Deployment' },
        { k: 'based', v: 'New Delhi, India' },
      ]}
    >
      <div className="prose prose-lead">
        <p>
          I work where product stakes, model behavior, and infrastructure meet. The through-line in
          my career is taking ambiguous domain problems (multi-tenant fertility platforms,
          defense-adjacent video intelligence, and clinical NLP) and making them operable.
        </p>
        <p>
          Technically, I live in the stack you actually run in production: LLMs and SLMs, agentic
          orchestration, hybrid RAG, schema-grounded NL2SQL, FastAPI, React, Kafka, Docker, and AWS
          CDK. I care about evaluation, cost-aware routing, and the boring parts: JWT auth, audit
          logs, and Playwright regression. That is what separates a demo from something a
          C-suite can sign off on.
        </p>

        <h2>Chronology</h2>
      </div>

      <Callout note="Read as an elevation, not a list: the datum runs along the years and each role is a volume standing on it.">
        <CareerElevation />
      </Callout>

      <div className="prose">
        <p>
          This site is a thinking laboratory: <Link href="/work/">case studies</Link>,{' '}
          <Link href="/blog/">technical writing</Link>, and <Link href="/essays/">essays</Link> that
          mirror how I negotiate scope, architecture, and delivery. Organization names are
          generalized on this site; the engineering is specific. For AI systems, forward-deployed
          engineering, or performance-critical products, <Link href="/contact/">get in touch</Link>.
        </p>
      </div>
    </PlateShell>
  );
}
