import { PageShell } from '@/components/PageShell';
import { ContentPage } from '@/components/ContentPage';
import { PageHero } from '@/components/PageHero';
import { ContentList } from '@/components/ContentList';
import { getCollection } from '@/lib/content';
import { buildMetadata } from '@/lib/metadata';

export const metadata = buildMetadata({
  title: 'Essays · Akshay Bajpai | AI Architect & Technology Leader',
  description: 'Long-form thinking on AI, systems, and the discipline of building.',
  path: '/essays/',
});

export default async function EssaysIndexPage() {
  const essays = await getCollection('essays');

  return (
    <PageShell>
      <ContentPage section="essays" wide>
        <PageHero
          section="essays"
          title="Essays"
          eyebrow={`Essays · ${essays.length} ${essays.length === 1 ? 'piece' : 'pieces'}`}
          lead="Deep thinking on systems, intelligence, and engineering."
        />
        <ContentList
          section="essays"
          ariaLabel="Essays"
          items={essays.map((essay) => ({
            slug: essay.slug,
            href: `/essays/${essay.slug}/`,
            title: essay.frontmatter.title,
            date: essay.frontmatter.pubDate,
            description: essay.frontmatter.description,
          }))}
        />
      </ContentPage>
    </PageShell>
  );
}
