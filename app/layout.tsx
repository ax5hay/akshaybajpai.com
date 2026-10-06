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
import { SheetTransitionProvider } from '@/components/system/SheetTransition';
import { SheetSetProvider } from '@/components/system/SheetSet';
import { Register } from '@/components/sheet/Register';
import { Preloader } from '@/components/system/Preloader';
import { Hints } from '@/components/system/Hints';
import { RouteTracker } from '@/components/system/Route';
import { PlateMetaProvider } from '@/components/sheet/PlateMetaProvider';
import { SheetFrame } from '@/components/sheet/SheetFrame';
import { ZoneCursor } from '@/components/sheet/ZoneCursor';
import { SheetRail } from '@/components/sheet/SheetRail';
import { TitleBlock } from '@/components/sheet/TitleBlock';
import { buildSheetIndex } from '@/lib/sheet-index';
import { buildMetadata, HOME_KEYWORDS, ONE_LINE } from '@/lib/metadata';
import { SITE_TAGLINE } from '@/lib/constants';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal'],
  variable: '--font-serif',
  display: 'swap',
});

// Only the regular weight is ever set in the sans; the headings and labels
// take their weight from the mono and the serif.
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Akshay Bajpai · AI Architect & Forward-Deployed AI Engineer',
    description: ONE_LINE,
    path: '/',
    keywords: HOME_KEYWORDS,
  }),
  title: {
    default: 'Akshay Bajpai · AI Architect & Forward-Deployed AI Engineer',
    template: '%s · Akshay Bajpai',
  },
  applicationName: SITE_TAGLINE,
  // Ownership tokens arrive from the deploy workflow's variables; locally
  // they are unset and the tags are not issued.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
  category: 'technology',
  formatDetection: { email: false, address: false, telephone: false },
};

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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ded2b8" />
        <JsonLd />
      </head>
      <body suppressHydrationWarning>
        <SheetSetProvider entries={sheetIndex}>
        <Preloader />
        <ToastProvider>
          <ModeProvider>
            <InstrumentProvider>
              <PlateMetaProvider>
                <SheetTransitionProvider>
                <SkipLink />
                <RevealObserver />
                <SheetFrame />
                <ZoneCursor />
                <SheetRail />
                <main id="main-content" className="plate-main">
                  {children}
                </main>
                <TitleBlock />
                <Hints />
                <RouteTracker />
                <Register entries={sheetIndex} />
                </SheetTransitionProvider>
              </PlateMetaProvider>
            </InstrumentProvider>
          </ModeProvider>
        </ToastProvider>
        </SheetSetProvider>
      </body>
    </html>
  );
}
