import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Research · Akshay Bajpai | AI Architect & Technology Leader',
  description: 'Published research and experimental work in AI, ML, and intelligent systems.',
  path: '/research/',
});

export default function ResearchPage() {
  return (
    <PageShell>
      <article className="page-shell section-surface">
        <div className="page-shell-inner">
          <header className="page-header" data-reveal>
            <h1 className="page-title">Research</h1>
            <p className="page-lead">Published work and experimental directions.</p>
          </header>
          <div data-reveal-stagger style={{ fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: 'var(--space-6)' }}>
              My research background spans medical AI, computer vision, and intelligent systems. I hold a
              Master&apos;s with 97.5% distinction in Artificial Intelligence & Intelligent Systems from Lviv
              Polytechnic National University.
            </p>
            <p style={{ marginBottom: 'var(--space-6)' }}>
              Current interests include robust AI infrastructure, minimal-dependency systems, performance
              engineering for static and edge deployments, and the intersection of systems thinking with
              product design.
            </p>
            <p>
              Selected technical writing is in <Link href="/blog/" className="link-hover" style={{ color: 'var(--shimmer-cyan)' }}>Blog</Link> and{' '}
              <Link href="/essays/" className="link-hover" style={{ color: 'var(--shimmer-cyan)' }}>Essays</Link>.
            </p>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
