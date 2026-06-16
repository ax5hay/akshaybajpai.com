import type { MetadataRoute } from 'next';
import { getCollection } from '@/lib/content';
import { SITE_URL } from '@/lib/constants';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes = [
    '',
    '/about/',
    '/blog/',
    '/essays/',
    '/work/',
    '/research/',
    '/architecture/',
    '/contact/',
  ];

  const [blog, essays, work] = await Promise.all([
    getCollection('blog'),
    getCollection('essays'),
    getCollection('work'),
  ]);

  return [
    ...staticRoutes.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
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
