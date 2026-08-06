import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { ArticleLayout } from '@/components/ArticleLayout';
import { getAllSlugs, getEntry, estimateReadingTime, getRelatedPosts, type WorkFrontmatter } from '@/lib/content';
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

export default async function WorkCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await getEntry<WorkFrontmatter>('work', slug);
  if (!study) notFound();

  const fm = study.frontmatter;
  const tags = [...(fm.stack ?? []), ...(fm.metrics ?? [])].slice(0, 6);
  const related = await getRelatedPosts('work', slug, 3);

  return (
    <PageShell>
      <ArticleLayout
        section="work"
        title={fm.title}
        date={fm.pubDate}
        html={study.html}
        description={fm.description}
        readingTime={estimateReadingTime(study.content)}
        tags={tags}
        backHref="/work/"
        backLabel="← Work"
        related={related}
      />
    </PageShell>
  );
}
