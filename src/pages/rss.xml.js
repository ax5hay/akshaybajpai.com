import rss from '@astrojs/rss';

export const GET = async (context) => {
  const { getCollection } = await import('astro:content');
  const posts = (await getCollection('blog', (p) => !p.data.draft))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 50);
  return rss({
    title: 'Akshay Bajpai — Blog',
    description: 'Technical writing on AI infrastructure, systems design, and performance engineering.',
    site: context.site?.href ?? 'https://www.akshaybajpai.com',
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: `/blog/${p.slug}/`,
    })),
    customData: '<language>en-us</language>',
  });
};
