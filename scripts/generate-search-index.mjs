import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, 'content');
const PUBLIC = path.join(ROOT, 'public');

const collections = ['blog', 'essays', 'work'];

const entries = [];

for (const collection of collections) {
  const dir = path.join(CONTENT, collection);
  if (!fs.existsSync(dir)) continue;
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data } = matter(raw);
    if (data.draft) continue;
    entries.push({
      title: data.title,
      description: data.description,
      href: `/${collection}/${file.replace(/\.md$/, '')}/`,
      collection,
    });
  }
}

const staticPages = [
  { title: 'About', description: 'Architect of systems. Builder of intelligence.', href: '/about/', collection: 'page' },
  { title: 'Contact', description: 'Get in touch for collaboration.', href: '/contact/', collection: 'page' },
  { title: 'Research', description: 'Published work and experimental directions.', href: '/research/', collection: 'page' },
  { title: 'Architecture', description: 'System design and infrastructure patterns.', href: '/architecture/', collection: 'page' },
];

const index = [...entries, ...staticPages];
fs.writeFileSync(path.join(PUBLIC, 'search-index.json'), JSON.stringify(index, null, 2));
console.log(`Generated public/search-index.json (${index.length} entries)`);
