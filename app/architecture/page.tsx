import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { ContentPage } from '@/components/ContentPage';
import { PageHero } from '@/components/PageHero';
import { ProseContent } from '@/components/ProseContent';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Architecture · Akshay Bajpai | AI Architect & Technology Leader',
  description:
    'How I design AI platforms: governed agents, hybrid retrieval, event-driven inference, and infrastructure as product.',
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
            Architecture is the set of decisions that outlast implementation. In AI systems that means naming
            invariants early: the clinician or operator is always the final authority, every model output is
            traceable to a version and data slice, and ambiguous database questions never execute without
            preview, disambiguation, and explicit human confirmation. Those are not compliance checkboxes — they
            are structural choices that keep NL2SQL, RAG, and agent tool calls from becoming silent liabilities.
          </p>
          <p>
            For conversational and agentic platforms I default to a gateway-first layout: tiered routing
            (exact match → classifier → composed retrieval), hybrid dense-and-sparse search with cross-encoder
            reranking, per-tenant keys and caching, OpenRouter or Bedrock-backed model selection with fallbacks,
            and microservices bounded by failure domain — orchestration, retrieval, execution against real rows,
            guardrails with escalation flags, observability on every hop. Monorepos like{' '}
            <Link href="/work/aurixa-conversational-ai-orchestration/">AURIXA</Link> and forward-deployed stacks
            on AWS CDK (Lambda, API Gateway, RDS, Redis, secrets) are different packaging of the same idea: scale
            the concern that hurts, not the whole binary.
          </p>
          <p>
            When throughput dominates — video ingest, restaurant demand sensing, finance onboarding — I reach for
            Kafka (or equivalent) ingestion, asynchronous inference, WebSocket fan-out for operators, and
            sub-200ms ingestion-to-decision budgets where the product promise requires it. Air-gapped and
            on-premise defense deployments add another axis: self-contained inference stacks without assuming
            a always-on cloud control plane.
          </p>
          <p>
            MLOps is part of architecture, not an appendix: MLflow and W&amp;B for experiment lineage, QLoRA when
            fine-tunes must be affordable, batching and quantization when p95 cost matters, Spark when batch
            feature work belongs off the request path, Terraform and CDK when environments must be reproducible.
            Local Docker parity with production is non-negotiable for the teams I lead — if staging cannot run
            the same contract as prod, UAT is theatre.
          </p>
          <p>
            Recurring themes across engagements: minimal surface area, clear boundaries, performance as a requirement
            from day one, and the conviction that the best dependency is the one you do not add. Case studies with
            tradeoffs and metrics are in <Link href="/work/">Work</Link>; longer-form philosophy in{' '}
            <Link href="/blog/ai-infrastructure-philosophy/">AI infrastructure philosophy</Link> and{' '}
            <Link href="/essays/">Essays</Link>.
          </p>
        </ProseContent>
      </ContentPage>
    </PageShell>
  );
}
