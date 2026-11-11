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
    'Akshay Bajpai leads technology from the client room to production code. He co-founded three companies, ran engineering as CTO at two more, and researches world models and reinforcement learning.',
  path: '/about/',
  card: 'about',
  keywords: ['Akshay Bajpai', 'about Akshay Bajpai', 'ax5hay', 'technology leader', 'systems architect', 'co-founder', 'CTO', 'AI researcher', 'AI architect India', 'forward-deployed AI engineer', 'text-to-SQL', 'computer vision', 'Rust', 'MSc Artificial Intelligence'],
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
      facts={[
        { k: 'MSc AI', v: '9.8/10, distinction' },
        { k: 'Springer', v: 'Lead author' },
      ]}
      record={[
        { k: 'name', v: 'Akshay Bajpai' },
        { k: 'role', v: JOB_TITLE },
        { k: 'based', v: 'India' },
      ]}
    >
      <div className="prose prose-lead">
        <p>
          I am a technology leader and systems architect, and I work end to end, from the
          executive table to production code. I have worked across most industries,
          with the deepest runs in healthcare, finance, defence and insurance, and across most
          kinds of AI, from language models and agents to computer vision and forecasting. I co-founded three companies, and I have run engineering as CTO at two others.
          In both seats the architecture, the people and the delivery were one job. Outside client
          work I research world models and reinforcement learning, and write essays on systems,
          cost and trust. I am a Springer author and hold an MSc in Artificial Intelligence with
          distinction.
        </p>
        <p>
          Most of my work sits where two rooms meet. In one, a founder or an executive team
          decides what is worth building and what it has to survive. In the other, engineers make
          it hold. I have spent years in both, often in the same week, and I am most useful where
          a decision in the first room changes what gets written in the second. I write decisions
          down, measure what I claim, and leave behind a system someone else can run.
        </p>

        <h2>Credentials</h2>
        <p>
          An MSc in Artificial Intelligence &amp; Intelligent Systems from Lviv Polytechnic National
          University, awarded with distinction at 9.8 out of 10. Lead author of a chapter in a
          Springer book, now in its third edition. Undergraduate research at IIT Gandhinagar, and a
          B.Tech in Computer Science &amp; Engineering with honours. The{' '}
          <Link href="/research/">research sheet</Link> has the detail, and what I am working
          through now.
        </p>

        <h2>The record</h2>
        <p>
          The record is drawn by kind of work, not by employer. Three results I would point to
          first: analyst intervention down by about 70% on a{' '}
          <Link href="/work/agentic-video-intelligence-operations/">
            defence video platform
          </Link>{' '}
          that can run with no outside connection; food waste down 32% across 200+ restaurants on a{' '}
          <Link href="/work/restaurant-saas-demand-forecasting/">forecasting platform</Link>; and
          reporting rebuilt on 8,000+ approved columns for a{' '}
          <Link href="/work/forward-deployed-multi-tenant-fertility-ai/">
            multi-tenant health platform
          </Link>
          , where I was the main technical voice to the executive team.
        </p>
      </div>

      <Callout note="Read as an elevation: each volume is a kind of work, standing on the one before it.">
        <CareerElevation />
      </Callout>

      <div className="prose">
        <p>
          How each piece was built is under <Link href="/work/">Works</Link>, and the whole range
          of tools and practice is on one sheet, the{' '}
          <Link href="/schedule/">schedule of materials</Link>. How I think about scope,
          architecture and delivery is in the <Link href="/essays/">essays</Link> and{' '}
          <Link href="/blog/">field notes</Link>. Company names are left out on purpose. What I
          take on is on the <Link href="/engagements/">terms of engagement</Link>; to start
          something, <Link href="/contact/">write to me</Link>.
        </p>
      </div>
    </PlateShell>
  );
}
