import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { getCollection, formatDate } from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Essays · Akshay Bajpai | AI Architect & Technology Leader',
  description: 'Long-form thinking on AI, systems, and the discipline of building.',
  path: '/essays/',
});

export default async function EssaysIndexPage() {
  const essays = await getCollection('essays');

  return (
    <PageShell>
      <div className="page-shell page-shell--wide section-surface">
        <div className="page-shell-inner" style={{ maxWidth: 'var(--content-width)' }}>
          <header className="page-header" data-reveal>
            <h1 className="page-title">Essays</h1>
            <p className="page-lead">Deep thinking on systems, intelligence, and engineering.</p>
          </header>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Essays" data-reveal-stagger>
            {essays.map((essay) => (
              <li key={essay.slug} className="list-item">
                <Link href={`/essays/${essay.slug}/`} className="list-link link-hover">
                  <span className="list-link-title">{essay.frontmatter.title}</span>
                  <time className="list-link-meta" dateTime={essay.frontmatter.pubDate}>
                    {formatDate(essay.frontmatter.pubDate, 'short')}
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
