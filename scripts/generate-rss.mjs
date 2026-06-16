import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const SITE = 'https://www.akshaybajpai.com';
const CONTENT = path.join(process.cwd(), 'content', 'blog');
const OUT = path.join(process.cwd(), 'out', 'rss.xml');

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const files = fs.readdirSync(CONTENT).filter((f) => f.endsWith('.md'));
const posts = files
  .map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT, file), 'utf-8');
    const { data } = matter(raw);
    if (data.draft) return null;
    return {
      title: data.title,
      description: data.description,
      pubDate: new Date(data.pubDate).toUTCString(),
      link: `${SITE}/blog/${file.replace(/\.md$/, '')}/`,
    };
  })
  .filter(Boolean)
  .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
  .slice(0, 50);

const items = posts
  .map(
    (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <description>${escapeXml(p.description)}</description>
      <link>${p.link}</link>
      <guid>${p.link}</guid>
      <pubDate>${p.pubDate}</pubDate>
    </item>`
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Akshay Bajpai | AI Architect &amp; Technology Leader — Blog</title>
    <description>Technical writing on AI infrastructure, systems design, and performance engineering.</description>
    <link>${SITE}/blog/</link>
    <language>en-us</language>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, xml);
console.log('Generated out/rss.xml');
