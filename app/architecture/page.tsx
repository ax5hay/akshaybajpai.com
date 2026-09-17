import Link from 'next/link';
import { PlateShell } from '@/components/plate/PlateShell';
import { ExtractionFigure } from '@/components/plate/ExtractionFigure';
import { ControlSchedule } from '@/components/kit/ControlSchedule';
import { Callout } from '@/components/kit/Callout';
import { DimensionLine } from '@/components/kit/DimensionLine';
import { getPlateByHref } from '@/lib/plates';
import { buildMetadata } from '@/lib/metadata';

const PLATE = getPlateByHref('/architecture/')!;

export const metadata = buildMetadata({
  title: 'Architecture · Akshay Bajpai | AI Architect & Technology Leader',
  description:
    'How I design AI platforms: governed agents, hybrid retrieval, event-driven inference, and infrastructure as product.',
  path: '/architecture/',
});

export default function ArchitecturePage() {
  return (
    <PlateShell
      sheet={PLATE.sheet}
      title={PLATE.title}
      subtitle={PLATE.subtitle}
      discipline={PLATE.discipline}
      scale={PLATE.scale}
      revision={PLATE.revision}
      refs={PLATE.refs}
      lead={<p>System design, infrastructure patterns, and how I think about structure.</p>}
      record={[
        { k: 'invariants', v: 'operator authority · output traceability · no silent execution' },
        { k: 'default', v: 'gateway-first, tiered routing' },
      ]}
    >
      <Callout note="Three invariants are named in this paragraph. Every sheet in the W series is a case of holding at least one of them.">
        <div className="prose prose-lead">
          <p>
            Architecture is the set of decisions that outlast implementation. In AI systems that
            means naming invariants early: the clinician or operator is always the final authority,
            every model output is traceable to a version and data slice, and ambiguous database
            questions never execute without preview, disambiguation, and explicit human
            confirmation. Those are not compliance checkboxes. They are structural choices that
            keep NL2SQL, RAG, and agent tool calls from becoming silent liabilities.
          </p>
        </div>
      </Callout>

      <DimensionLine />

      <Callout note="Both states are always mounted and in register. The divider is a clip boundary, so dragging it never reflows either pane.">
        <ExtractionFigure />
      </Callout>

      <div className="prose">
        <p>
          For conversational and agentic platforms I default to a gateway-first layout: tiered
          routing (exact match → classifier → composed retrieval), hybrid dense-and-sparse search
          with cross-encoder reranking, per-tenant keys and caching, OpenRouter or Bedrock-backed
          model selection with fallbacks, and microservices bounded by failure domain:
          orchestration, retrieval, execution against real rows, guardrails with escalation flags,
          observability on every hop. Monorepos like{' '}
          <Link href="/work/aurixa-conversational-ai-orchestration/">AURIXA</Link> and
          forward-deployed stacks on AWS CDK (Lambda, API Gateway, RDS, Redis, secrets) are
          different packaging of the same idea: scale the concern that hurts, not the whole binary.
        </p>
        <p>
          When throughput dominates (video ingest, restaurant demand sensing, finance onboarding),
          I reach for Kafka (or equivalent) ingestion, asynchronous inference, WebSocket fan-out
          for operators, and sub-200ms ingestion-to-decision budgets where the product promise
          requires it. Air-gapped and on-premise defense deployments add another axis:
          self-contained inference stacks without assuming a always-on cloud control plane.
        </p>
        <p>
          MLOps is part of architecture, not an appendix: MLflow and W&amp;B for experiment
          lineage, QLoRA when fine-tunes must be affordable, batching and quantization when p95
          cost matters, Spark when batch feature work belongs off the request path, Terraform and
          CDK when environments must be reproducible. Local Docker parity with production is
          non-negotiable for the teams I lead: if staging cannot run the same contract as prod,
          UAT is theatre.
        </p>

        <h2>Drawing conventions</h2>
        <p>
          The same discipline applies to this site. It is issued as a drawing set with three
          states, and the controls that govern it are exposed rather than hidden.
        </p>
      </div>

      <Callout note="The switches below write to the root element. Every mode and overlay on this set is a CSS state, which is why none of them re-render the page.">
        <ControlSchedule />
      </Callout>

      <div className="prose">
        <p>
          Recurring themes across engagements: minimal surface area, clear boundaries, performance
          as a requirement from day one, and the conviction that the best dependency is the one
          you do not add. Case studies with tradeoffs and metrics are in{' '}
          <Link href="/work/">Work</Link>; longer-form philosophy in{' '}
          <Link href="/blog/ai-infrastructure-philosophy/">AI infrastructure philosophy</Link> and{' '}
          <Link href="/essays/">Essays</Link>.
        </p>
      </div>
    </PlateShell>
  );
}
