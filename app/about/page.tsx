import Link from 'next/link';
import { PlateShell } from '@/components/plate/PlateShell';
import { Chronology } from '@/components/plate/Chronology';
import { Callout } from '@/components/kit/Callout';
import { getPlateByHref } from '@/lib/plates';
import { buildMetadata } from '@/lib/metadata';

const PLATE = getPlateByHref('/about/')!;

export const metadata = buildMetadata({
  title: 'About · Akshay Bajpai | AI Architect & Technology Leader',
  description:
    'Forward-deployed AI engineer — multi-tenant platforms, governed agents, clinical and operational intelligence from research to production.',
  path: '/about/',
});

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
          my career is taking ambiguous domain problems—multi-tenant fertility platforms,
          defense-adjacent video intelligence, and clinical NLP—and making them operable.
        </p>
        <p>
          Technically, I live in the stack you actually run in production: LLMs and SLMs, agentic
          orchestration, hybrid RAG, schema-grounded NL2SQL, FastAPI, React, Kafka, Docker, and AWS
          CDK. I care about evaluation, cost-aware routing, and the boring parts — JWT auth, audit
          logs, and Playwright regression — because that is what separates a demo from something a
          C-suite can sign off on.
        </p>

        <h2>Chronology</h2>
      </div>

      <Callout note="Read as a section, not a list: the datum runs vertically and each role is a mark struck off it.">
        <Chronology />
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
