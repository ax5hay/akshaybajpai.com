import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { remarkSvgBlock } from './remark-svg-block';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export type CollectionName = 'blog' | 'essays' | 'work';

export interface BaseFrontmatter {
  title: string;
  description: string;
  pubDate: string;
  draft?: boolean;
}

export interface WorkFrontmatter extends BaseFrontmatter {
  client?: string;
  stack?: string[];
  metrics?: string[];
}

/** One `##` section of an article: where it is, what it is called, how long. */
export interface ContentSection {
  id: string;
  title: string;
  words: number;
}

export interface ContentEntry<T = BaseFrontmatter> {
  slug: string;
  frontmatter: T;
  content: string;
  html: string;
  sections: ContentSection[];
}

/** Heading text to an anchor: lower case, words joined by hyphens. */
function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}

/** Slugs in document order, with repeats numbered so every anchor is unique. */
function uniqueSlugs(titles: string[]): string[] {
  const seen = new Map<string, number>();
  return titles.map((title) => {
    const base = slugify(title);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n ? `${base}-${n + 1}` : base;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const headingText = (node: any): string =>
  node.value ?? (node.children ?? []).map(headingText).join('');

/**
 * Give every `##` heading an id, so a section can be linked to, jumped to
 * from the sheet's profile, and tracked as the reader passes it.
 */
function remarkSectionIds() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (tree: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const headings = tree.children.filter((n: any) => n.type === 'heading' && n.depth === 2);
    const ids = uniqueSlugs(headings.map(headingText));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headings.forEach((node: any, i: number) => {
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id: ids[i] } };
    });
  };
}

/**
 * The sections of an article and the words in each, read off the Markdown.
 * Fenced code is skipped when looking for headings, so a `##` inside a code
 * block is not mistaken for one.
 */
function readSections(markdown: string): ContentSection[] {
  const found: Array<{ title: string; words: number }> = [];
  let fenced = false;
  for (const line of markdown.split('\n')) {
    if (/^```/.test(line)) fenced = !fenced;
    const heading = !fenced && line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      found.push({ title: heading[1].replace(/[*_`]/g, ''), words: 0 });
    } else if (found.length) {
      found[found.length - 1].words += line.split(/\s+/).filter(Boolean).length;
    }
  }
  const ids = uniqueSlugs(found.map((s) => s.title));
  return found.map((s, i) => ({ id: ids[i], ...s }));
}

const markdownProcessor = remark()
  .use(remarkGfm)
  .use(remarkSvgBlock)
  .use(remarkSectionIds)
  .use(remarkRehype)
  .use(rehypeStringify);

async function parseMarkdownFile<T>(filePath: string, slug: string): Promise<ContentEntry<T>> {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const html = String(await markdownProcessor.process(content));

  return {
    slug,
    frontmatter: data as T,
    content,
    html,
    sections: readSections(content),
  };
}

function getCollectionDir(collection: CollectionName): string {
  return path.join(CONTENT_DIR, collection);
}

export async function getCollection<T extends BaseFrontmatter = BaseFrontmatter>(
  collection: CollectionName,
  includeDrafts = false
): Promise<ContentEntry<T>[]> {
  const dir = getCollectionDir(collection);
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  const entries = await Promise.all(
    files.map((file) => parseMarkdownFile<T>(path.join(dir, file), file.replace(/\.md$/, '')))
  );

  return entries
    .filter((e) => includeDrafts || !e.frontmatter.draft)
    .sort((a, b) => new Date(b.frontmatter.pubDate).getTime() - new Date(a.frontmatter.pubDate).getTime());
}

export async function getEntry<T extends BaseFrontmatter = BaseFrontmatter>(
  collection: CollectionName,
  slug: string
): Promise<ContentEntry<T> | null> {
  const filePath = path.join(getCollectionDir(collection), `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const entry = await parseMarkdownFile<T>(filePath, slug);
  if (entry.frontmatter.draft) return null;
  return entry;
}

export async function getAllSlugs(collection: CollectionName): Promise<string[]> {
  const entries = await getCollection(collection);
  return entries.map((e) => e.slug);
}

export { formatDate } from '@/lib/format';

export function estimateReadingTime(text: string): number {
  const words = text.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function parseGithubRepo(client?: string): string | null {
  if (!client) return null;
  const match = client.match(/ax5hay\/([\w.-]+)/i);
  return match ? `https://github.com/ax5hay/${match[1]}` : null;
}

export async function getRelatedPosts(
  collection: CollectionName,
  slug: string,
  limit = 3
): Promise<Array<{ slug: string; title: string; href: string; description: string }>> {
  const entries = await getCollection(collection);
  return entries
    .filter((e) => e.slug !== slug)
    .slice(0, limit)
    .map((e) => ({
      slug: e.slug,
      title: e.frontmatter.title,
      description: e.frontmatter.description,
      href: `/${collection}/${e.slug}/`,
    }));
}

export function getAllTagsFromWork(entries: ContentEntry<WorkFrontmatter>[]): string[] {
  const tags = new Set<string>();
  for (const e of entries) {
    e.frontmatter.stack?.forEach((t) => tags.add(t));
  }
  return [...tags].sort();
}
