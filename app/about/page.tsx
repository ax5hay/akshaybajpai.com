import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { ContentPage } from '@/components/ContentPage';
import { PageHero } from '@/components/PageHero';
import { ProseContent } from '@/components/ProseContent';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'About · Akshay Bajpai | AI Architect & Technology Leader',
  description:
    'Forward-deployed AI engineer — multi-tenant platforms, governed agents, clinical and operational intelligence from research to production.',
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
            I work where product stakes, model behavior, and infrastructure meet. Today I am forward-deployed
            as lead full-stack AI engineer, owning roadmap-to-production delivery across multiple client programs
            and serving as the primary technical interface for product, engineering leadership, and executive
            stakeholders. That role is less about slides and more about shipping: shared LLM gateways, governed
            reporting agents, React administration surfaces, Python microservices on AWS CDK, and the release
            discipline that keeps multi-tenant fertility and surrogacy workflows trustworthy under UAT.
          </p>
          <p>
            The through-line in my career is taking ambiguous domain problems and making them operable. I
            architected an agentic video-intelligence platform over 24/7 CCTV — LangGraph and MCP — cutting
            analyst intervention by roughly seventy percent. I have built LangGraph finance workflows and
            multimodal clinical pipelines (QLoRA fine-tunes, hybrid RAG, HIPAA-aware AWS) that reduced manual
            touchpoints and inference cost while holding sub-800ms p95 latency. As founding engineer on a
            restaurant SaaS pilot I validated forecasting across two hundred-plus sites with XGBoost and Prophet,
            cutting food waste by a third on event pipelines processing millions of events per day. Earlier roles
            shipped document intelligence on Bedrock and ensemble underwriting models, and productionized
            clinical NLP extracting dozens of structured variables from EHRs at thousands of documents per day.
          </p>
          <p>
            Technically I live in the stack you actually run in production: LLMs and SLMs, agentic orchestration,
            hybrid dense-and-sparse RAG with reranking, schema-grounded NL2SQL with human confirmation, FastAPI
            and Node services, React and Next.js operator UX, Kafka and Spark where throughput matters, Docker
            and Kubernetes, Terraform and CDK, SageMaker and Vertex when training belongs in the cloud. I care
            about evaluation, cost-aware routing, and the boring parts — JWT auth, audit logs, Playwright
            regression — because that is what separates a demo from something a C-suite can sign off on.
          </p>
          <p>
            I hold a Master&apos;s with distinction (9.8/10) in Artificial Intelligence &amp; Intelligent Systems
            from Lviv Polytechnic National University and a B.Tech in Computer Science from Rajiv Gandhi
            Prodyogiki Vishwavidyalaya, Bhopal. I am lead author on a peer-reviewed Springer chapter on machine
            learning for medical diagnosis and began research on Alzheimer&apos;s classification as an undergraduate
            at IIT Gandhinagar — threads you can follow in <Link href="/research/">Research</Link> and{' '}
            <Link href="/work/alzheimers-ml-thesis-research/">thesis work</Link>.
          </p>
          <p>
            This site is a thinking laboratory: <Link href="/work/">case studies</Link>,{' '}
            <Link href="/blog/">technical writing</Link>, and <Link href="/essays/">essays</Link> that mirror how
            I negotiate scope, architecture, and delivery. Organization names are generalized on this site; the
            engineering is specific. For AI systems, forward-deployed engineering, or performance-critical products,{' '}
            <Link href="/contact/">get in touch</Link>.
          </p>
        </ProseContent>
      </ContentPage>
    </PageShell>
  );
}
