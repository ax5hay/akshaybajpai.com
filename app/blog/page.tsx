import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { getCollection, formatDate } from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Blog · Akshay Bajpai | AI Architect & Technology Leader',
  description: 'Technical writing on AI infrastructure, systems design, and performance engineering.',
  path: '/blog/',
});

export default async function BlogIndexPage() {
  const posts = await getCollection('blog');

  return (
    <PageShell>
      <div className="page-shell page-shell--wide section-surface">
        <div className="page-shell-inner" style={{ maxWidth: 'var(--content-width)' }}>
          <header className="page-header" data-reveal>
            <h1 className="page-title">Blog</h1>
            <p className="page-lead">Technical writing on systems, infrastructure, and engineering discipline.</p>
          </header>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }} aria-label="Blog posts" data-reveal-stagger>
            {posts.map((post) => (
              <li key={post.slug} className="list-item">
                <Link href={`/blog/${post.slug}/`} className="list-link link-hover">
                  <span className="list-link-title">{post.frontmatter.title}</span>
                  <time className="list-link-meta" dateTime={post.frontmatter.pubDate}>
                    {formatDate(post.frontmatter.pubDate, 'short')}
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
