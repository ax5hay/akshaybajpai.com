import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { getCollection, formatDate, type WorkFrontmatter } from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Work · Akshay Bajpai | AI Architect & Technology Leader',
  description: 'Case studies in AI systems, architecture, and performance.',
  path: '/work/',
});

export default async function WorkIndexPage() {
  const cases = await getCollection<WorkFrontmatter>('work');

  return (
    <PageShell>
      <div className="page-shell page-shell--wide section-surface">
        <div className="page-shell-inner" style={{ maxWidth: 'var(--content-width)' }}>
          <header className="page-header" data-reveal>
            <h1 className="page-title">Work</h1>
            <p className="page-lead">
              Open-source systems and research from{' '}
              <a href="https://github.com/ax5hay" className="link-hover" style={{ color: 'var(--accent)' }}>
                @ax5hay
              </a>
              — architecture, tradeoffs, and lessons from each build.
            </p>
          </header>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Case studies" data-reveal-stagger>
            {cases.map((c) => (
              <li key={c.slug} className="list-item">
                <Link href={`/work/${c.slug}/`} className="list-link link-hover" style={{ flexWrap: 'wrap' }}>
                  <span className="list-link-title">{c.frontmatter.title}</span>
                  {c.frontmatter.client && (
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{c.frontmatter.client}</span>
                  )}
                  <time className="list-link-meta" dateTime={c.frontmatter.pubDate} style={{ marginLeft: 'auto' }}>
                    {formatDate(c.frontmatter.pubDate, 'short')}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
