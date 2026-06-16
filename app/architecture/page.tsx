import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Architecture · Akshay Bajpai | AI Architect & Technology Leader',
  description: 'System design, infrastructure patterns, and architectural thinking for AI and product.',
  path: '/architecture/',
});

export default function ArchitecturePage() {
  return (
    <PageShell>
      <article className="page-shell section-surface">
        <div className="page-shell-inner">
          <header className="page-header" data-reveal>
            <h1 className="page-title">Architecture</h1>
            <p className="page-lead">System design, infrastructure patterns, and how I think about structure.</p>
          </header>
          <div data-reveal-stagger style={{ fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: 'var(--space-6)' }}>
              Architecture is the set of decisions that outlast implementation. I approach it as explicit
              tradeoffs: consistency vs. availability, latency vs. throughput, dependency count vs. speed
              of delivery.
            </p>
            <p style={{ marginBottom: 'var(--space-6)' }}>
              Recurring themes: minimal surface area, clear boundaries, performance as a requirement from
              day one, and the conviction that the best dependency is the one you don&apos;t add.
            </p>
            <p>
              For deep dives see <Link href="/work/" className="link-hover" style={{ color: 'var(--shimmer-cyan)' }}>Work</Link> and{' '}
              <Link href="/essays/" className="link-hover" style={{ color: 'var(--shimmer-cyan)' }}>Essays</Link>.
            </p>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
