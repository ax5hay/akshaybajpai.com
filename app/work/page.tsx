import { PageShell } from '@/components/PageShell';
import { ContentPage } from '@/components/ContentPage';
import { PageHero } from '@/components/PageHero';
import { WorkIndex } from '@/components/WorkIndex';
import {
  getCollection,
  getAllTagsFromWork,
  parseGithubRepo,
  type WorkFrontmatter,
} from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Work · Akshay Bajpai | AI Architect & Technology Leader',
  description: 'Case studies in AI systems, architecture, and performance.',
  path: '/work/',
});

export default async function WorkIndexPage() {
  const cases = await getCollection<WorkFrontmatter>('work');
  const tags = getAllTagsFromWork(cases);

  const items = cases.map((c) => ({
    slug: c.slug,
    href: `/work/${c.slug}/`,
    title: c.frontmatter.title,
    date: c.frontmatter.pubDate,
    description: c.frontmatter.description,
    meta: c.frontmatter.client,
    githubUrl: parseGithubRepo(c.frontmatter.client) ?? undefined,
    stackTags: c.frontmatter.stack,
    metrics: c.frontmatter.metrics,
  }));

  return (
    <PageShell>
      <ContentPage section="work" wide>
        <PageHero
          section="work"
          title="Work"
          eyebrow={`Work · ${cases.length} case ${cases.length === 1 ? 'study' : 'studies'}`}
          lead={
            <>
              Forward-deployed client systems, open-source platforms, and research builds from{' '}
              <a href="https://github.com/ax5hay" className="link-hover">
                @ax5hay
              </a>
              — architecture, tradeoffs, and lessons from production delivery.
            </>
          }
        />
        <WorkIndex items={items} tags={tags} featuredSlug="forward-deployed-multi-tenant-fertility-ai" />
      </ContentPage>
    </PageShell>
  );
}
