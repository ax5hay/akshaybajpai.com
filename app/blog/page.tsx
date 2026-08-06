import { PageShell } from '@/components/PageShell';
import { ContentPage } from '@/components/ContentPage';
import { PageHero } from '@/components/PageHero';
import { ContentList } from '@/components/ContentList';
import { getCollection } from '@/lib/content';
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
      <ContentPage section="blog" wide>
        <PageHero
          section="blog"
          title="Blog"
          eyebrow={`Blog · ${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}
          lead="Technical writing on systems, infrastructure, and engineering discipline."
        />
        <ContentList
          section="blog"
          ariaLabel="Blog posts"
          items={posts.map((post) => ({
            slug: post.slug,
            href: `/blog/${post.slug}/`,
            title: post.frontmatter.title,
            date: post.frontmatter.pubDate,
            description: post.frontmatter.description,
          }))}
        />
      </ContentPage>
    </PageShell>
  );
}
