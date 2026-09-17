import { notFound } from 'next/navigation';
import { ArticlePlate } from '@/components/plate/ArticlePlate';
import { getAllSlugs, getEntry, estimateReadingTime } from '@/lib/content';
import { adjacentSheets, detailSheetFor } from '@/lib/sheet-index';
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

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getEntry('blog', slug);
  if (!post) notFound();

  const [sheet, adjacent] = await Promise.all([
    detailSheetFor('blog', slug),
    adjacentSheets('blog', slug, 3),
  ]);

  return (
    <ArticlePlate
      sheet={sheet}
      title={post.frontmatter.title}
      description={post.frontmatter.description}
      discipline="B"
      date={post.frontmatter.pubDate}
      html={post.html}
      source={post.content}
      readingTime={estimateReadingTime(post.content)}
      seriesHref="/blog/"
      seriesLabel="Field Notes"
      adjacent={adjacent}
    />
  );
}
