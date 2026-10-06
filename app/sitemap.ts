import type { MetadataRoute } from 'next';
import { getCollection } from '@/lib/content';
import { SITE_URL } from '@/lib/constants';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blog, essays, work] = await Promise.all([
    getCollection('blog'),
    getCollection('essays'),
    getCollection('work'),
  ]);

  // Last modified is the newest sheet in the section, not the build date,
  // so a crawler is not told every page changed on every deploy.
  const newest = (...lists: Array<{ frontmatter: { pubDate: string } }[]>) =>
    new Date(
      Math.max(...lists.flat().map((e) => new Date(e.frontmatter.pubDate).getTime()), 0)
    );
  const issued = new Date('2026-10-06');
  const staticRoutes: Array<[string, Date, number]> = [
    ['/', newest(blog, essays, work), 1],
    ['/about/', issued, 0.9],
    ['/work/', newest(work), 0.9],
    ['/research/', issued, 0.8],
    ['/architecture/', issued, 0.8],
    ['/blog/', newest(blog), 0.8],
    ['/essays/', newest(essays), 0.8],
    ['/contact/', issued, 0.7],
  ];

  return [
    ...staticRoutes.map(([path, lastModified, priority]) => ({
      url: `${SITE_URL}${path}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority,
    })),
    ...blog.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}/`,
      lastModified: new Date(p.frontmatter.pubDate),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...essays.map((e) => ({
      url: `${SITE_URL}/essays/${e.slug}/`,
      lastModified: new Date(e.frontmatter.pubDate),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...work.map((w) => ({
      url: `${SITE_URL}/work/${w.slug}/`,
      lastModified: new Date(w.frontmatter.pubDate),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
