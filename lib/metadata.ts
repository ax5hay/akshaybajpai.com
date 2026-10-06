import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, SOCIAL } from './constants';

/* ---------------------------------------------------------------- identity --- */

export const PERSON_ID = `${SITE_URL}/#person`;
export const SITE_ID = `${SITE_URL}/#website`;
export const NAME = 'Akshay Bajpai';
export const HANDLE = 'ax5hay';
export const ROLE = 'AI Architect · Forward-Deployed AI Engineer';
export const ONE_LINE =
  'Akshay Bajpai is an AI architect and forward-deployed AI engineer: multi-tenant LLM platforms, governed agents, hybrid RAG, NL2SQL, clinical and insurance document AI. Springer author; MSc AI with distinction.';

/** What the key plan is filed under; the sheets each carry their own. */
export const HOME_KEYWORDS = [
  'Akshay Bajpai',
  'ax5hay',
  'AI architect',
  'forward-deployed AI engineer',
  'LLM platforms',
  'RAG',
  'agentic AI',
  'NL2SQL',
  'healthcare AI',
  'New Delhi',
];

/* ------------------------------------------------------------- page metadata --- */

export interface PageMeta {
  title: string;
  description: string;
  path?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  /** Name of the share card under /og/, without extension. Home uses og.jpg. */
  card?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function cardUrl(card?: string): string {
  return card ? `${SITE_URL}/og/${card}.png` : `${SITE_URL}/og.jpg`;
}

export function buildMetadata({
  title,
  description,
  path = '',
  type = 'website',
  publishedTime,
  modifiedTime,
  card,
  keywords,
  noIndex = false,
}: PageMeta): Metadata {
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const image = cardUrl(card);

  return {
    title,
    description,
    keywords,
    authors: [{ name: NAME, url: SITE_URL }],
    creator: NAME,
    publisher: NAME,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      types: { 'application/rss+xml': `${SITE_URL}/rss.xml` },
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title.includes(NAME) ? title : `${title} · ${NAME}`,
        },
      ],
      locale: 'en_US',
      ...(type === 'article'
        ? { publishedTime, modifiedTime: modifiedTime ?? publishedTime, authors: [SITE_URL] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: `@${HANDLE}`,
      creator: `@${HANDLE}`,
      title,
      description,
      images: [image],
    },
  };
}

/* ------------------------------------------------------------- structured data --- */

type Thing = Record<string, unknown>;

/** The site's two root entities, referenced by `@id` from every page. */
export function identityGraph(): Thing[] {
  return [
    {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: NAME,
      givenName: 'Akshay',
      familyName: 'Bajpai',
      alternateName: [HANDLE, 'Akshay Bajpai AI'],
      url: SITE_URL,
      image: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png`, width: 1024, height: 1024 },
      jobTitle: 'Lead Full-Stack AI Engineer · Forward Deployment',
      description: ONE_LINE,
      email: SOCIAL.email,
      sameAs: [SOCIAL.linkedin, SOCIAL.github, SOCIAL.twitter],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'New Delhi',
        addressRegion: 'Delhi',
        addressCountry: 'IN',
      },
      alumniOf: [
        {
          '@type': 'CollegeOrUniversity',
          name: 'Lviv Polytechnic National University',
          sameAs: 'https://en.wikipedia.org/wiki/Lviv_Polytechnic',
        },
        {
          '@type': 'CollegeOrUniversity',
          name: 'Rajiv Gandhi Proudyogiki Vishwavidyalaya',
          sameAs: 'https://en.wikipedia.org/wiki/Rajiv_Gandhi_Proudyogiki_Vishwavidyalaya',
        },
      ],
      hasCredential: [
        {
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: 'degree',
          name: 'MSc Artificial Intelligence & Intelligent Systems, with distinction',
          recognizedBy: { '@type': 'CollegeOrUniversity', name: 'Lviv Polytechnic National University' },
        },
        {
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: 'degree',
          name: 'B.Tech Computer Science & Engineering, with honours',
          recognizedBy: { '@type': 'CollegeOrUniversity', name: 'Rajiv Gandhi Proudyogiki Vishwavidyalaya' },
        },
      ],
      knowsAbout: [
        'Large language models',
        'Forward-deployed AI engineering',
        'Retrieval-augmented generation',
        'Agentic AI and LangGraph',
        'NL2SQL and governed data agents',
        'Clinical NLP and healthcare AI',
        'Document intelligence',
        'MLOps on AWS',
        'World models and reinforcement learning',
        'FastAPI',
        'React and Next.js',
        'System architecture',
      ],
      knowsLanguage: ['en'],
    },
    {
      '@type': 'WebSite',
      '@id': SITE_ID,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: ['The Architecture of Intelligence', 'akshaybajpai.com'],
      description: ONE_LINE,
      inLanguage: 'en',
      publisher: { '@id': PERSON_ID },
      author: { '@id': PERSON_ID },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

export function breadcrumbs(trail: Array<{ name: string; path: string }>): Thing {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Key plan', path: '/' }, ...trail].map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function webPage(args: {
  path: string;
  name: string;
  description: string;
  type?: 'WebPage' | 'ProfilePage' | 'CollectionPage' | 'ContactPage' | 'AboutPage';
  card?: string;
  extra?: Thing;
}): Thing {
  const url = `${SITE_URL}${args.path}`;
  return {
    '@type': args.type ?? 'WebPage',
    '@id': `${url}#page`,
    url,
    name: args.name,
    description: args.description,
    isPartOf: { '@id': SITE_ID },
    about: { '@id': PERSON_ID },
    primaryImageOfPage: { '@type': 'ImageObject', url: cardUrl(args.card) },
    inLanguage: 'en',
    ...args.extra,
  };
}

export function article(args: {
  path: string;
  title: string;
  description: string;
  published: string;
  words: number;
  minutes: number;
  section: string;
  keywords?: string[];
  card: string;
  kind?: 'BlogPosting' | 'TechArticle' | 'Article';
}): Thing {
  const url = `${SITE_URL}${args.path}`;
  const iso = new Date(args.published).toISOString();
  return {
    '@type': args.kind ?? 'TechArticle',
    '@id': `${url}#article`,
    headline: args.title,
    description: args.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    datePublished: iso,
    dateModified: iso,
    image: { '@type': 'ImageObject', url: cardUrl(args.card), width: 1200, height: 630 },
    wordCount: args.words,
    timeRequired: `PT${args.minutes}M`,
    articleSection: args.section,
    keywords: args.keywords?.join(', '),
    inLanguage: 'en',
    isPartOf: { '@id': SITE_ID },
    isAccessibleForFree: true,
  };
}

/** One script tag carrying a graph. */
export function graph(...things: Thing[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': things });
}
