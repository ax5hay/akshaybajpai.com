import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'About · Akshay Bajpai | AI Architect & Technology Leader',
  description: 'Akshay Bajpai — From medical AI research to building products people use daily.',
  path: '/about/',
});

export default function AboutPage() {
  return (
    <PageShell>
      <article className="page-shell section-surface">
        <div className="page-shell-inner">
          <header className="page-header" data-reveal>
            <h1 className="page-title">About</h1>
            <p className="page-lead">Architect of systems. Builder of intelligence.</p>
          </header>
          <div data-reveal-stagger style={{ fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-relaxed)' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
              I operate at the intersection of AI infrastructure, systems thinking, and product. My work spans
              research, architecture, and shipping—each system designed with explicit tradeoffs and long-term
              maintainability in mind.
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
              I hold a Master&apos;s with distinction in Artificial Intelligence & Intelligent Systems. I have
              published research and shipped products that people use daily. I prefer building with minimal
              dependencies, clear architecture, and performance as a non-negotiable.
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              This site is a thinking laboratory: essays, case studies, and technical writing that reflect how
              I approach problems. If you want to collaborate on AI systems, architecture, or performance-critical
              products, <Link href="/contact/" className="link-hover" style={{ color: 'var(--shimmer-cyan)' }}>get in touch</Link>.
            </p>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
