import { notFound } from 'next/navigation';
import { ArticlePlate } from '@/components/plate/ArticlePlate';
import { getAllSlugs, getEntry, estimateReadingTime } from '@/lib/content';
import { adjacentSheets, crossReferences, detailSheetFor } from '@/lib/sheet-index';
import { article, breadcrumbs, buildMetadata } from '@/lib/metadata';

export async function generateStaticParams() {
  const slugs = await getAllSlugs('essays');
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const essay = await getEntry('essays', slug);
  if (!essay) return {};

  return buildMetadata({
    title: essay.frontmatter.title,
    description: essay.frontmatter.description,
    path: `/essays/${slug}/`,
    type: 'article',
    card: `essays-${slug}`,
    publishedTime: new Date(essay.frontmatter.pubDate).toISOString(),
  });
}

export default async function EssayDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const essay = await getEntry('essays', slug);
  if (!essay) notFound();

  const [sheet, adjacent, xrefs] = await Promise.all([
    detailSheetFor('essays', slug),
    adjacentSheets('essays', slug, 3),
    crossReferences(`/essays/${slug}/`),
  ]);

  return (
    <ArticlePlate
      sheet={sheet}
      title={essay.frontmatter.title}
      description={essay.frontmatter.description}
      discipline="E"
      date={essay.frontmatter.pubDate}
      html={essay.html}
      sections={essay.sections}
      source={essay.content}
      readingTime={estimateReadingTime(essay.content)}
      seriesHref="/essays/"
      seriesLabel="Essays"
      jsonLd={[
        article({
          path: `/essays/${slug}/`,
          title: essay.frontmatter.title,
          description: essay.frontmatter.description,
          published: essay.frontmatter.pubDate,
          words: essay.content.trim().split(/\s+/).length,
          minutes: estimateReadingTime(essay.content),
          section: 'Essays',
          card: `essays-${slug}`,
          kind: 'BlogPosting',
        }),
        breadcrumbs([
          { name: 'E-600 Essays', path: '/essays/' },
          { name: `${sheet} ${essay.frontmatter.title}`, path: `/essays/${slug}/` },
        ]),
      ]}
      adjacent={adjacent}
      xrefs={xrefs}
    />
  );
}
