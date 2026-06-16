import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from './constants';

export interface PageMeta {
  title: string;
  description: string;
  path?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path = '',
  type = 'website',
  publishedTime,
  noIndex = false,
}: PageMeta): Metadata {
  const url = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const image = `${SITE_URL}/logo.png`;

  return {
    title,
    description,
    authors: [{ name: 'Akshay Bajpai' }],
    creator: 'Akshay Bajpai',
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: 'Akshay Bajpai — AI Architect & Technology Leader' }],
      locale: 'en_US',
      ...(publishedTime && type === 'article' ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ax5hay',
      creator: '@ax5hay',
      title,
      description,
      images: [image],
    },
  };
}

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Akshay Bajpai',
    alternateName: ['ax5hay', 'Akshay Bajpai AI'],
    url: SITE_URL,
    image: `${SITE_URL}/logo.png`,
    jobTitle: 'AI Architect & Technology Leader',
    description:
      "Akshay Bajpai — AI Architect and Technology Leader. Expert in LLMs, RAG pipelines, and scalable AI systems.",
    sameAs: [
      'https://linkedin.com/in/ax5hay',
      'https://github.com/ax5hay',
      'https://twitter.com/ax5hay',
    ],
    email: 'hello@akshaybajpai.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'New Delhi',
      addressRegion: 'Delhi',
      addressCountry: 'India',
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Akshay Bajpai — AI Architect and Technology Leader. LLMs, RAG systems, intelligent system design.',
    author: { '@type': 'Person', name: 'Akshay Bajpai' },
    inLanguage: 'en-US',
  };
}
