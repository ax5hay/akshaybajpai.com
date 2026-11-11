import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * One feed for everything written here, newest first: essays, field notes
 * and case studies. Each item carries its share card and sheet number.
 */
const SITE = 'https://www.akshaybajpai.com';
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');

const escapeXml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SERIES = {
  essays: { discipline: 'E', base: 600, name: 'Essays' },
  blog: { discipline: 'B', base: 500, name: 'Field Notes' },
  work: { discipline: 'W', base: 400, name: 'Works' },
};

const items = [];
for (const [collection, series] of Object.entries(SERIES)) {
  const dir = path.join(ROOT, 'content', collection);
  const docs = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => ({ slug: file.replace(/\.md$/, ''), data: matter(fs.readFileSync(path.join(dir, file), 'utf-8')).data }))
    .filter(({ data }) => !data.draft)
    .sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate));
  docs.forEach(({ slug, data }, i) => {
    items.push({
      sheet: `${series.discipline}-${series.base + i + 1}`,
      category: series.name,
      title: data.title,
      description: data.description,
      metric: data.metrics?.[0],
      date: new Date(data.pubDate),
      link: `${SITE}/${collection}/${slug}/`,
      image: `${SITE}/og/${collection}-${slug}.png`,
    });
  });
}
items.sort((a, b) => b.date - a.date);

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Akshay Bajpai · The Architecture of Intelligence</title>
    <link>${SITE}/</link>
    <description>Case studies, essays and field notes on systems architecture, AI in production, world models and reinforcement learning, by Akshay Bajpai.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <image><url>${SITE}/apple-touch-icon.png</url><title>Akshay Bajpai</title><link>${SITE}/</link></image>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    (p) => `    <item>
      <title>${escapeXml(`${p.sheet} · ${p.title}`)}</title>
      <link>${p.link}</link>
      <guid isPermaLink="true">${p.link}</guid>
      <pubDate>${p.date.toUTCString()}</pubDate>
      <dc:creator>Akshay Bajpai</dc:creator>
      <category>${escapeXml(p.category)}</category>
      <description>${escapeXml(p.description)}</description>
      <media:content url="${p.image}" type="image/png" width="1200" height="630"/>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>
`;
fs.writeFileSync(path.join(OUT, 'rss.xml'), rss);
console.log(`Generated out/rss.xml with ${items.length} items`);

/* ---- llms.txt: the set, as plain text for language-model crawlers ----
 *
 * Order matters and is shared with the Person node (lib/identity.ts ONE_LINE)
 * and the first paragraph of the About sheet: the entity sentence, the facts,
 * the work with its strongest number, then the sheets. Change them together.
 */
// What he takes on, and the questions answered plainly: the same file A-103
// is drawn from, so the page and this text cannot drift apart.
const ENGAGE = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'engagements.json'), 'utf-8'));
const ENTITY =
  'Akshay Bajpai is a technology leader and systems architect in New Delhi. He leads technology end to end, from client and executive strategy to production code: multi-tenant LLM platforms, governed natural-language-to-SQL agents, agentic video intelligence for government defence deployments, document AI on AWS, and native desktop software in Rust. He has run engineering as CTO. Springer author; MSc in Artificial Intelligence with distinction.';
const sections = [
  ['/about/', 'A-101 Boardroom to bare metal', 'Who Akshay Bajpai is, the record of his work by kind, and how he works.'],
  ['/engagements/', 'A-103 Terms of Engagement', 'What he takes on, how the work runs, and questions answered plainly.'],
  ['/schedule/', 'A-102 Schedule of Materials', 'Every tool and practice, counted from every repository and engagement: 352 items in 14 disciplines, leadership first.'],
  ['/research/', 'R-301 Research', 'Springer chapter on ML for medical diagnosis, MSc thesis on Alzheimer’s classification, current interests.'],
  ['/architecture/', 'S-201 Structural Principles', 'How the platforms are designed: governed agents, hybrid retrieval, gateway-first routing, infrastructure as product.'],
  ['/work/', 'W-400 Works', 'Case studies, each with an operable figure.'],
  ['/blog/', 'B-500 Field Notes', 'Shorter technical pieces.'],
  ['/essays/', 'E-600 Essays', 'Longer arguments about systems, cost, and trust.'],
  ['/contact/', 'C-700 Correspondence', 'How to reach Akshay Bajpai.'],
];
const byCat = (name) =>
  items
    .filter((p) => p.category === name)
    .map((p) => `- [${p.sheet} ${p.title}](${p.link}): ${p.metric ? `${p.metric}. ` : ''}${p.description}`)
    .join('\n');
const llms = `# Akshay Bajpai

> ${ENTITY}

## Facts

- Based in: New Delhi, India
- Role: Technology leader and systems architect. Leads technology end to end: clients, teams, architecture, AI and code.
- Education: MSc in Artificial Intelligence and Intelligent Systems, with distinction (Lviv Polytechnic National University); B.Tech in Computer Science and Engineering, with honours
- Publication: Chapter 17, "Machine learning approaches to medical diagnosis", in ML for Medical Diagnosis in Data-Centric Business and Application, 3rd edition, Springer, 2024 (ISBN 978-3-031-60815-5)
- Contact: hello@akshaybajpai.com · ${SITE}/contact/
- Profiles: https://github.com/ax5hay · https://linkedin.com/in/ax5hay · https://x.com/ax5hay

## What he takes on

${ENGAGE.offers.map((o) => `- **${o.name}.** ${o.text}`).join('\n')}

How the work runs, in his words:

${ENGAGE.method.map((m, i) => `${i + 1}. **${m.name}.** ${m.text}`).join('\n')}

To engage him: ${SITE}/engagements/

## Work

${byCat('Works')}

## Sheets

${sections.map(([p, t, d]) => `- [${t}](${SITE}${p}): ${d}`).join('\n')}

## Questions

${ENGAGE.questions.map((x) => `### ${x.q}\n\n${x.a}`).join('\n\n')}

## Essays

${byCat('Essays')}

## Field notes

${byCat('Field Notes')}

## Feeds and data

- [RSS](${SITE}/rss.xml)
- [Sitemap](${SITE}/sitemap.xml)
- [The complete set as one printable document](${SITE}/set/)

This site is issued as an architectural drawing set: every page is a numbered sheet. Company and client names are left out on purpose; the numbers are as measured.
`;
fs.writeFileSync(path.join(OUT, 'llms.txt'), llms);
console.log('Generated out/llms.txt');
