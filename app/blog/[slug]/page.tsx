import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { ArticleLayout } from '@/components/ArticleLayout';
import { getAllSlugs, getEntry, estimateReadingTime, getRelatedPosts } from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';

export async function generateStaticParams() {
  const slugs = await getAllSlugs('blog');
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getEntry('blog', slug);
  if (!post) return {};
  return buildMetadata({
    title: `${post.frontmatter.title} · Akshay Bajpai`,
    description: post.frontmatter.description,
    path: `/blog/${slug}/`,
    type: 'article',
    publishedTime: new Date(post.frontmatter.pubDate).toISOString(),
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getEntry('blog', slug);
  if (!post) notFound();
  const related = await getRelatedPosts('blog', slug, 3);

  return (
    <PageShell>
      <ArticleLayout
        section="blog"
        title={post.frontmatter.title}
        date={post.frontmatter.pubDate}
        html={post.html}
        description={post.frontmatter.description}
        readingTime={estimateReadingTime(post.content)}
        backHref="/blog/"
        backLabel="← Blog"
        related={related}
      />
    </PageShell>
  );
}
