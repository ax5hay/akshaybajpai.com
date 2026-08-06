import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { ArticleLayout } from '@/components/ArticleLayout';
import { getAllSlugs, getEntry, estimateReadingTime, getRelatedPosts } from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';

export async function generateStaticParams() {
  const slugs = await getAllSlugs('essays');
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const essay = await getEntry('essays', slug);
  if (!essay) return {};
  return buildMetadata({
    title: `${essay.frontmatter.title} · Akshay Bajpai`,
    description: essay.frontmatter.description,
    path: `/essays/${slug}/`,
    type: 'article',
    publishedTime: new Date(essay.frontmatter.pubDate).toISOString(),
  });
}

export default async function EssayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const essay = await getEntry('essays', slug);
  if (!essay) notFound();
  const related = await getRelatedPosts('essays', slug, 3);

  return (
    <PageShell>
      <ArticleLayout
        section="essays"
        title={essay.frontmatter.title}
        date={essay.frontmatter.pubDate}
        html={essay.html}
        description={essay.frontmatter.description}
        readingTime={estimateReadingTime(essay.content)}
        backHref="/essays/"
        backLabel="← Essays"
        related={related}
      />
    </PageShell>
  );
}
