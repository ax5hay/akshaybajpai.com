import { notFound } from 'next/navigation';
import { ArticlePlate } from '@/components/plate/ArticlePlate';
import { getAllSlugs, getEntry, estimateReadingTime } from '@/lib/content';
import { adjacentSheets, detailSheetFor } from '@/lib/sheet-index';
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

export default async function EssayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const essay = await getEntry('essays', slug);
  if (!essay) notFound();

  const [sheet, adjacent] = await Promise.all([
    detailSheetFor('essays', slug),
    adjacentSheets('essays', slug, 3),
  ]);

  return (
    <ArticlePlate
      sheet={sheet}
      title={essay.frontmatter.title}
      description={essay.frontmatter.description}
      discipline="E"
      date={essay.frontmatter.pubDate}
      html={essay.html}
      source={essay.content}
      readingTime={estimateReadingTime(essay.content)}
      seriesHref="/essays/"
      seriesLabel="Essays"
      adjacent={adjacent}
    />
  );
}
