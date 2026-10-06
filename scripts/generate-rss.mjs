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
    <description>Essays, field notes and case studies on AI systems, forward-deployed engineering, world models and reinforcement learning, by Akshay Bajpai.</description>
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

/* ---- llms.txt: the set, as a text index for language-model crawlers ---- */
const sections = [
  ['/about/', 'A-101 The Architect', 'Biography, trajectory, and operating principles.'],
  ['/research/', 'R-301 Research', 'Springer chapter on ML for medical diagnosis, MSc thesis on Alzheimer’s classification, current interests.'],
  ['/architecture/', 'S-201 Structural Principles', 'How the platforms are designed: governed agents, hybrid retrieval, gateway-first routing, infrastructure as product.'],
  ['/work/', 'W-400 Works', 'Case studies in forward-deployed AI, each with an operable schematic.'],
  ['/blog/', 'B-500 Field Notes', 'Shorter technical pieces.'],
  ['/essays/', 'E-600 Essays', 'Longer arguments about systems, cost, and trust.'],
  ['/contact/', 'C-700 Correspondence', 'How to reach Akshay Bajpai.'],
];
const byCat = (name) => items.filter((p) => p.category === name).map((p) => `- [${p.sheet} ${p.title}](${p.link}): ${p.description}`).join('\n');
const llms = `# Akshay Bajpai · The Architecture of Intelligence

> Akshay Bajpai (ax5hay) is an AI architect and forward-deployed AI engineer based in New Delhi, India: multi-tenant LLM platforms, governed agents, hybrid RAG, NL2SQL, clinical and insurance document AI. Springer author (ML for Medical Diagnosis, 3rd ed., 2024); MSc Artificial Intelligence with distinction. This site is issued as an architectural drawing set: every page is a numbered sheet.

Site: ${SITE}/ · Email: hello@akshaybajpai.com · GitHub: https://github.com/ax5hay · LinkedIn: https://linkedin.com/in/ax5hay

## Sheets

${sections.map(([p, t, d]) => `- [${t}](${SITE}${p}): ${d}`).join('\n')}

## Case studies (Works)

${byCat('Works')}

## Essays

${byCat('Essays')}

## Field notes

${byCat('Field Notes')}

## Feeds and data

- [RSS](${SITE}/rss.xml)
- [Sitemap](${SITE}/sitemap.xml)
- [The complete set as one printable document](${SITE}/set/)
`;
fs.writeFileSync(path.join(OUT, 'llms.txt'), llms);
console.log('Generated out/llms.txt');
