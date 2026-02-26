const SITE = 'https://www.akshaybajpai.com';

const STATIC_PATHS = [
  '',
  '/about',
  '/blog',
  '/essays',
  '/work',
  '/research',
  '/architecture',
  '/contact',
];

const BLOG_SLUGS = [
  'ai-infrastructure-philosophy',
  'ai-restaurant-automation',
  'dns-ad-blocking-system-design',
  'experimental-ui-engineering',
  'healthcare-ai-architecture',
  'performance-engineering-static-hosting',
  'systems-thinking-for-founders',
  'zero-dependency-saas-mindset',
];

const ESSAY_SLUGS = [
  'minimalism-as-engineering',
  'the-architecture-of-trust',
  'the-cost-of-convenience',
  'what-systems-thinking-actually-is',
  'why-performance-is-a-feature',
];

const WORK_SLUGS = [
  'dns-ad-blocking-at-scale',
  'healthcare-ai-pipeline',
  'restaurant-demand-forecasting',
];

function url(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE}${p}/`;
}

export const GET = (): Response => {
  const urls = [
    ...STATIC_PATHS.map((p) => url(p)),
    ...BLOG_SLUGS.map((s) => url(`blog/${s}`)),
    ...ESSAY_SLUGS.map((s) => url(`essays/${s}`)),
    ...WORK_SLUGS.map((s) => url(`work/${s}`)),
  ];
  const lastmod = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}
</urlset>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
