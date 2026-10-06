import { notFound } from 'next/navigation';
import { ArticlePlate } from '@/components/plate/ArticlePlate';
import { getAllSlugs, getEntry, estimateReadingTime } from '@/lib/content';
import { adjacentSheets, crossReferences, detailSheetFor } from '@/lib/sheet-index';
import { article, breadcrumbs, buildMetadata } from '@/lib/metadata';

export async function generateStaticParams() {
  const slugs = await getAllSlugs('blog');
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getEntry('blog', slug);
  if (!post) return {};

  return buildMetadata({
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    path: `/blog/${slug}/`,
    type: 'article',
    card: `blog-${slug}`,
    publishedTime: new Date(post.frontmatter.pubDate).toISOString(),
  });
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getEntry('blog', slug);
  if (!post) notFound();

  const [sheet, adjacent, xrefs] = await Promise.all([
    detailSheetFor('blog', slug),
    adjacentSheets('blog', slug, 3),
    crossReferences(`/blog/${slug}/`),
  ]);

  return (
    <ArticlePlate
      sheet={sheet}
      title={post.frontmatter.title}
      description={post.frontmatter.description}
      discipline="B"
      date={post.frontmatter.pubDate}
      html={post.html}
      sections={post.sections}
      source={post.content}
      readingTime={estimateReadingTime(post.content)}
      seriesHref="/blog/"
      seriesLabel="Field Notes"
      jsonLd={[
        article({
          path: `/blog/${slug}/`,
          title: post.frontmatter.title,
          description: post.frontmatter.description,
          published: post.frontmatter.pubDate,
          words: post.content.trim().split(/\s+/).length,
          minutes: estimateReadingTime(post.content),
          section: 'Field Notes',
          card: `blog-${slug}`,
          kind: 'BlogPosting',
        }),
        breadcrumbs([
          { name: 'B-500 Field Notes', path: '/blog/' },
          { name: `${sheet} ${post.frontmatter.title}`, path: `/blog/${slug}/` },
        ]),
      ]}
      adjacent={adjacent}
      xrefs={xrefs}
    />
  );
}
