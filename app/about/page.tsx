import Link from 'next/link';
import { PlateShell } from '@/components/plate/PlateShell';
import { CareerElevation } from '@/components/plate/CareerElevation';
import { Callout } from '@/components/kit/Callout';
import { getPlateByHref } from '@/lib/plates';
import { buildMetadata, breadcrumbs, webPage, PERSON_ID, JOB_TITLE, NAME, STANDFIRST } from '@/lib/metadata';
import { JsonLd } from '@/components/JsonLd';

const PLATE = getPlateByHref('/about/')!;

const META = {
  title: `${NAME} · ${JOB_TITLE}`,
  description:
    'Akshay Bajpai leads technology end to end, from client and executive strategy to production code: LLM platforms, governed text-to-SQL agents, defence video intelligence, document AI and native software in Rust.',
  path: '/about/',
  card: 'about',
  keywords: ['Akshay Bajpai', 'about Akshay Bajpai', 'ax5hay', 'technology leader', 'systems architect', 'AI architect New Delhi', 'forward-deployed AI engineer', 'text-to-SQL', 'computer vision', 'Rust', 'MSc Artificial Intelligence'],
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
      issued="2026.11"
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
      lead={<p>{STANDFIRST}</p>}
      record={[
        { k: 'name', v: 'Akshay Bajpai' },
        { k: 'role', v: JOB_TITLE },
        { k: 'based', v: 'New Delhi, India' },
      ]}
    >
      <div className="prose prose-lead">
        <p>
          I am a technology leader and systems architect in New Delhi. I lead technology end to
          end, from client and executive strategy to production code: multi-tenant LLM platforms,
          governed natural-language-to-SQL agents, agentic video intelligence for government
          defence deployments, document AI on AWS, and native desktop software in Rust. I have run
          engineering as CTO, where the architecture, the people and the delivery were one job. I
          am a Springer author and hold an MSc in Artificial Intelligence with distinction.
        </p>
        <p>
          The range is the point. In one programme I was the client&rsquo;s main technical voice,
          from the first scoping call to acceptance testing with the C-suite. In another I wrote
          the Rust that holds a Windows power request and an IOKit assertion, with{' '}
          <code>unsafe</code> kept to two files. Both got the same treatment: decisions written
          down, numbers measured with their conditions, safety built into the structure.
        </p>
        <p>
          Day to day that means LLMs and agentic orchestration, hybrid retrieval, schema-grounded
          text-to-SQL, computer vision at the edge, FastAPI, React, Kafka, Docker and AWS CDK. I
          care most about the unglamorous middle: evaluation, cost-aware routing, auth, audit logs
          and the regression suite. That is the part an executive signs and an operator lives with.
        </p>

        <h2>The record</h2>
      </div>

      <Callout note="Read as an elevation: each volume is a kind of work, standing on the one before it.">
        <CareerElevation />
      </Callout>

      <div className="prose">
        <p>
          The whole range is drawn on one sheet, the{' '}
          <Link href="/schedule/">schedule of materials</Link>: every tool and practice, counted
          from the repositories I pushed and the work I led. The{' '}
          <Link href="/work/">case studies</Link> show how it was used, and the{' '}
          <Link href="/blog/">field notes</Link> and <Link href="/essays/">essays</Link> show how I
          think about scope, architecture and delivery. Company names are left out on purpose; the
          engineering is specific. What I take on, and how the work runs, is on the{' '}
          <Link href="/engagements/">terms of engagement</Link>; to start one,{' '}
          <Link href="/contact/">write to me</Link>.
        </p>
      </div>
    </PlateShell>
  );
}
