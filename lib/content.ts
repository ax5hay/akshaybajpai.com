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

export interface ContentEntry<T = BaseFrontmatter> {
  slug: string;
  frontmatter: T;
  content: string;
  html: string;
}

const markdownProcessor = remark()
  .use(remarkGfm)
  .use(remarkSvgBlock)
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

export function formatDate(dateStr: string, style: 'long' | 'short' = 'long'): string {
  const date = new Date(dateStr);
  if (style === 'short') {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
