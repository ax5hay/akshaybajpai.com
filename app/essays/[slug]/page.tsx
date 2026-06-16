import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { ArticleLayout } from '@/components/ArticleLayout';
import { getAllSlugs, getEntry } from '@/lib/content';
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

  return (
    <PageShell>
      <ArticleLayout title={essay.frontmatter.title} date={essay.frontmatter.pubDate} html={essay.html} />
    </PageShell>
  );
}
