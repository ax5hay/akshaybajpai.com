import type { Metadata } from 'next';
import { Instrument_Serif, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { JsonLd } from '@/components/JsonLd';
import { RevealObserver } from '@/components/RevealObserver';
import { HomeHeroBodyClass } from '@/components/HomeHeroBodyClass';
import { buildMetadata } from '@/lib/metadata';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = buildMetadata({
  title: 'Akshay Bajpai | AI Architect & Technology Leader — LLMs, RAG, ML Systems',
  description:
    'Akshay Bajpai — AI Architect & Technology Leader. Expert in LLMs, RAG pipelines, scalable AI systems. Published researcher, 97.5% Master\'s distinction.',
  path: '/',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0a0a0c" />
        <JsonLd />
      </head>
      <body>
        <HomeHeroBodyClass />
        <RevealObserver />
        {children}
      </body>
    </html>
  );
}
