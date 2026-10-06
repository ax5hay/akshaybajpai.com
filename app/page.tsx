import { buildMetadata, HOME_KEYWORDS } from '@/lib/metadata';
import { KeyPlan, type KeyPlanContents } from '@/components/keyplan/KeyPlan';
import { getCollection, type WorkFrontmatter } from '@/lib/content';
import { detailSheetNumber, PLATES } from '@/lib/plates';
import { parseContentDate } from '@/lib/format';
import { SITE_URL, SOCIAL } from '@/lib/constants';
import { JsonLd } from '@/components/JsonLd';
import { PERSON_ID, webPage } from '@/lib/metadata';
import { keyPlanPlates } from '@/lib/plates';

export const metadata = buildMetadata({
  title: 'Akshay Bajpai · AI Architect & Forward-Deployed AI Engineer',
  description:
    'Akshay Bajpai (ax5hay): AI architect and forward-deployed AI engineer in New Delhi. LLM platforms, governed agents, hybrid RAG, NL2SQL, clinical and insurance document AI. Case studies, research, essays and field notes, issued as a drawing set.',
  path: '/',
  keywords: HOME_KEYWORDS,
});

/** Year and month, as stamped on a sheet. */
function stamp(date: string): string {
  const d = parseContentDate(date);
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default async function Page() {
  const [work, essays, blog] = await Promise.all([
    getCollection<WorkFrontmatter>('work'),
    getCollection('essays'),
    getCollection('blog'),
  ]);

  const contents: KeyPlanContents = {
    about: [
      { sheet: '2026', title: 'Lead Full-Stack AI Engineer', meta: 'Forward deployment' },
      { sheet: '2026', title: 'AI Lead · video intelligence', meta: 'Defense-adjacent' },
      { sheet: '2025', title: 'Senior AI Consultant', meta: 'Finance & health' },
      { sheet: '2025', title: 'Founding Engineer', meta: 'Restaurant SaaS' },
      { sheet: '2023', title: 'Data Scientist II', meta: 'Insurance' },
      { sheet: '2021', title: 'MSc Artificial Intelligence', meta: 'Distinction' },
    ],

    research: [
      { title: 'ML for Medical Diagnosis, Ch. 17', meta: 'Springer 2024' },
      { title: 'Alzheimer\u2019s classification thesis', meta: 'OASIS' },
      { title: 'MSc AI · 9.8/10, distinction', meta: 'Lviv Poly' },
      { title: 'Governed agentic retrieval', meta: 'Current' },
    ],

    architecture: [
      { title: 'The operator is the final authority', meta: 'Invariant' },
      { title: 'Every output traces to a version', meta: 'Invariant' },
      { title: 'Gateway-first, tiered routing', meta: 'Pattern' },
      { title: 'Services bounded by failure domain', meta: 'Pattern' },
      { title: 'Local parity with production', meta: 'Rule' },
      { title: 'The best dependency is the one you skip', meta: 'Rule' },
    ],

    work: work.map((entry, i) => ({
      sheet: detailSheetNumber('work', i),
      title: entry.frontmatter.title,
      meta: entry.frontmatter.metrics?.[0] ?? stamp(entry.frontmatter.pubDate),
      href: `/work/${entry.slug}/`,
    })),

    essays: essays.map((entry, i) => ({
      sheet: detailSheetNumber('essays', i),
      title: entry.frontmatter.title,
      meta: stamp(entry.frontmatter.pubDate),
      href: `/essays/${entry.slug}/`,
    })),

    blog: blog.map((entry, i) => ({
      sheet: detailSheetNumber('blog', i),
      title: entry.frontmatter.title,
      meta: stamp(entry.frontmatter.pubDate),
      href: `/blog/${entry.slug}/`,
    })),

    contact: [
      { title: SOCIAL.email, meta: 'Email' },
      { title: 'linkedin.com/in/ax5hay', meta: 'LinkedIn' },
      { title: 'github.com/ax5hay', meta: 'GitHub' },
    ],
  };

  return (
    <div className="plate plate-bleed">
      <JsonLd
        things={[
          webPage({
            path: '/',
            name: 'Akshay Bajpai · Key plan',
            description:
              'The general arrangement of the set: every section and sheet of akshaybajpai.com, drawn in place.',
            extra: {
              mainEntity: { '@id': PERSON_ID },
              hasPart: {
                '@type': 'ItemList',
                itemListElement: keyPlanPlates().map((plate, i) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  name: `${plate.sheet} ${plate.title}`,
                  url: `${SITE_URL}${plate.href}`,
                })),
              },
            },
          }),
        ]}
      />
      <KeyPlan
        contents={contents}
        sheetCount={PLATES.length + work.length + essays.length + blog.length}
      />
    </div>
  );
}
