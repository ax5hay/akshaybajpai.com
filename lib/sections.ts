export type SectionId =
  | 'essays'
  | 'about'
  | 'work'
  | 'blog'
  | 'contact'
  | 'research'
  | 'architecture';

export interface SectionTheme {
  id: SectionId;
  label: string;
  indexHref: string;
  accent: string;
  accentSoft: string;
  accentGlow: string;
  orbHue: number;
}

/** Neural cluster colors from NeuralScene + extended palette for other pages */
export const SECTION_THEMES: Record<SectionId, SectionTheme> = {
  essays: {
    id: 'essays',
    label: 'Essays',
    indexHref: '/essays/',
    accent: '#c9a227',
    accentSoft: 'rgba(201, 162, 39, 0.22)',
    accentGlow: 'rgba(201, 162, 39, 0.4)',
    orbHue: 42,
  },
  about: {
    id: 'about',
    label: 'About',
    indexHref: '/about/',
    accent: '#a89b6a',
    accentSoft: 'rgba(168, 155, 106, 0.22)',
    accentGlow: 'rgba(168, 155, 106, 0.35)',
    orbHue: 38,
  },
  work: {
    id: 'work',
    label: 'Work',
    indexHref: '/work/',
    accent: '#b8a85a',
    accentSoft: 'rgba(184, 168, 90, 0.22)',
    accentGlow: 'rgba(184, 168, 90, 0.38)',
    orbHue: 45,
  },
  blog: {
    id: 'blog',
    label: 'Blog',
    indexHref: '/blog/',
    accent: '#9a9a7a',
    accentSoft: 'rgba(154, 154, 122, 0.22)',
    accentGlow: 'rgba(154, 154, 122, 0.35)',
    orbHue: 55,
  },
  contact: {
    id: 'contact',
    label: 'Contact',
    indexHref: '/contact/',
    accent: '#a89bb8',
    accentSoft: 'rgba(168, 155, 184, 0.22)',
    accentGlow: 'rgba(168, 155, 184, 0.38)',
    orbHue: 280,
  },
  research: {
    id: 'research',
    label: 'Research',
    indexHref: '/research/',
    accent: '#7a9a8a',
    accentSoft: 'rgba(122, 154, 138, 0.22)',
    accentGlow: 'rgba(122, 154, 138, 0.35)',
    orbHue: 160,
  },
  architecture: {
    id: 'architecture',
    label: 'Architecture',
    indexHref: '/architecture/',
    accent: '#6b8a9a',
    accentSoft: 'rgba(107, 138, 154, 0.22)',
    accentGlow: 'rgba(107, 138, 154, 0.35)',
    orbHue: 200,
  },
};

export function getSectionFromPath(pathname: string): SectionId | null {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === '/') return null;

  const entries = Object.values(SECTION_THEMES).sort(
    (a, b) => b.indexHref.length - a.indexHref.length
  );

  for (const theme of entries) {
    const base = theme.indexHref.replace(/\/$/, '');
    if (path === base || path.startsWith(`${base}/`)) return theme.id;
  }

  return null;
}

export function applySectionTheme(section: SectionId | null) {
  const root = document.documentElement;
  if (!section) {
    root.style.removeProperty('--section-accent');
    root.style.removeProperty('--section-accent-soft');
    root.style.removeProperty('--section-accent-glow');
    delete root.dataset.section;
    return;
  }

  const theme = SECTION_THEMES[section];
  root.style.setProperty('--section-accent', theme.accent);
  root.style.setProperty('--section-accent-soft', theme.accentSoft);
  root.style.setProperty('--section-accent-glow', theme.accentGlow);
  root.dataset.section = section;
}
