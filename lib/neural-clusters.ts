/** Shared neural map cluster config — used by WebGL scene and accessible UI fallbacks */

export const NEURAL_CLUSTER_COUNT = 5;

export const NEURAL_CLUSTERS = [
  { title: 'Essays', href: '/essays/', slug: 'essays', raw: 'model = load(embedding); index.add(vectors);', accent: '#c9a227' },
  { title: 'About', href: '/about/', slug: 'about', raw: 'constraints → invariants → feedback loops', accent: '#a89b6a' },
  { title: 'Work', href: '/work/', slug: 'work', raw: 'latency_p99 < 50ms; throughput 10k/s', accent: '#b8a85a' },
  { title: 'Blog', href: '/blog/', slug: 'blog', raw: 'auth, billing, webhooks, docs', accent: '#9a9a7a' },
  { title: 'Contact', href: '/contact/', slug: 'contact', raw: 'scroll-linked camera; instanced mesh', accent: '#a89bb8' },
] as const;

/** Sections reachable via nav but not neural clusters */
export const SECONDARY_SECTIONS = [
  { title: 'Research', href: '/research/', slug: 'research' },
  { title: 'Architecture', href: '/architecture/', slug: 'architecture' },
] as const;

export function clusterIndexFromSlug(slug: string): number | null {
  const i = NEURAL_CLUSTERS.findIndex((c) => c.slug === slug.toLowerCase());
  return i >= 0 ? i : null;
}

export function clusterTitle(index: number): string {
  return NEURAL_CLUSTERS[index]?.title ?? 'Section';
}

export function clusterHref(index: number): string {
  return NEURAL_CLUSTERS[index]?.href ?? '/';
}

export function titleFromPath(path: string): string {
  const normalized = path.endsWith('/') ? path : `${path}/`;
  const cluster = NEURAL_CLUSTERS.find((c) => c.href === normalized);
  if (cluster) return cluster.title;
  const secondary = SECONDARY_SECTIONS.find((s) => s.href === normalized);
  if (secondary) return secondary.title;
  if (normalized.includes('/work/')) return 'Work';
  if (normalized.includes('/blog/')) return 'Blog';
  if (normalized.includes('/essays/')) return 'Essays';
  return 'Section';
}
