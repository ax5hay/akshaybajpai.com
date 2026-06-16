export const SITE_URL = 'https://www.akshaybajpai.com';
export const SITE_NAME = 'Akshay Bajpai | AI Architect & Technology Leader';
export const SITE_TAGLINE = 'The Architecture of Intelligence';

export const NAV_LINKS = [
  { href: '/about/', label: 'About' },
  { href: '/work/', label: 'Work' },
  { href: '/blog/', label: 'Blog' },
  { href: '/essays/', label: 'Essays' },
  { href: '/research/', label: 'Research' },
  { href: '/architecture/', label: 'Architecture' },
  { href: '/contact/', label: 'Contact' },
] as const;

export const CLUSTER_CONFIG = [
  { title: 'Essays', href: '/essays/', raw: 'model = load(embedding); index.add(vectors);' },
  { title: 'About', href: '/about/', raw: 'constraints → invariants → feedback loops' },
  { title: 'Work', href: '/work/', raw: 'latency_p99 < 50ms; throughput 10k/s' },
  { title: 'Blog', href: '/blog/', raw: 'auth, billing, webhooks, docs' },
  { title: 'Contact', href: '/contact/', raw: 'scroll-linked camera; instanced mesh' },
] as const;

export const SOCIAL = {
  linkedin: 'https://linkedin.com/in/ax5hay',
  github: 'https://github.com/ax5hay',
  twitter: 'https://twitter.com/ax5hay',
  email: 'hello@akshaybajpai.com',
} as const;
