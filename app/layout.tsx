import type { Metadata } from 'next';
import { Instrument_Serif, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

import { JsonLd } from '@/components/JsonLd';
import { SkipLink } from '@/components/SkipLink';
import { RevealObserver } from '@/components/RevealObserver';
import { ModeScript } from '@/components/system/ModeScript';
import { InstrumentProvider } from '@/components/system/InstrumentProvider';
import { ModeProvider } from '@/components/system/ModeProvider';
import { ToastProvider } from '@/components/system/ToastProvider';
import { PlateMetaProvider } from '@/components/sheet/PlateMetaProvider';
import { SheetFrame } from '@/components/sheet/SheetFrame';
import { SheetRail } from '@/components/sheet/SheetRail';
import { TitleBlock } from '@/components/sheet/TitleBlock';
import { buildSheetIndex } from '@/lib/sheet-index';
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
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = buildMetadata({
  title: 'Akshay Bajpai | AI Architect & Technology Leader · LLMs, RAG, ML Systems',
  description:
    'Akshay Bajpai, forward-deployed AI engineer and architect. LLM platforms, governed agents, hybrid RAG, NL2SQL, clinical & insurance document AI. Springer author; MSc AI with distinction.',
  path: '/',
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sheetIndex = await buildSheetIndex();

  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ModeScript />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ece6d9" />
        <JsonLd />
      </head>
      <body suppressHydrationWarning>
        <ToastProvider>
          <ModeProvider>
            <InstrumentProvider>
              <PlateMetaProvider>
                <SkipLink />
                <RevealObserver />
                <SheetFrame />
                <SheetRail entries={sheetIndex} />
                <main id="main-content" className="plate-main">
                  {children}
                </main>
                <TitleBlock />
              </PlateMetaProvider>
            </InstrumentProvider>
          </ModeProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
