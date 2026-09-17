import { notFound } from 'next/navigation';
import { ArticlePlate } from '@/components/plate/ArticlePlate';
import {
  getAllSlugs,
  getEntry,
  estimateReadingTime,
  type WorkFrontmatter,
} from '@/lib/content';
import { adjacentSheets, detailSheetFor } from '@/lib/sheet-index';
import { buildMetadata } from '@/lib/metadata';

export async function generateStaticParams() {
  const slugs = await getAllSlugs('work');
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await getEntry('work', slug);
  if (!study) return {};

  return buildMetadata({
    title: `${study.frontmatter.title} · Akshay Bajpai`,
    description: study.frontmatter.description,
    path: `/work/${slug}/`,
    type: 'article',
    publishedTime: new Date(study.frontmatter.pubDate).toISOString(),
  });
}

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await getEntry<WorkFrontmatter>('work', slug);
  if (!study) notFound();

  const fm = study.frontmatter;
  const [sheet, adjacent] = await Promise.all([
    detailSheetFor('work', slug),
    adjacentSheets('work', slug, 3),
  ]);

  return (
    <ArticlePlate
      sheet={sheet}
      title={fm.title}
      description={fm.description}
      discipline="W"
      date={fm.pubDate}
      html={study.html}
      source={study.content}
      readingTime={estimateReadingTime(study.content)}
      seriesHref="/work/"
      seriesLabel="Works"
      client={fm.client}
      stack={fm.stack}
      metrics={fm.metrics}
      adjacent={adjacent}
    />
  );
}
