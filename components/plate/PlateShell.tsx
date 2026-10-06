import type { ReactNode } from 'react';
import Link from 'next/link';
import { DISCIPLINES, getPlateBySheet, type Discipline } from '@/lib/plates';
import { SetPlateMeta } from '@/components/sheet/PlateMetaProvider';
import { PlateFigure, figureCaption, hasFigure } from '@/components/figures/PlateFigure';
import { JsonLd } from '@/components/JsonLd';
import styles from './PlateShell.module.css';

export interface PlateFact {
  k: string;
  v: string;
}

export interface PlateShellProps {
  sheet: string;
  title: string;
  subtitle: string;
  discipline: Discipline;
  scale?: string;
  revision?: string;
  /** Printed in the title block and the header table. */
  issued?: string;
  lead?: ReactNode;
  facts?: PlateFact[];
  /** Sheet numbers cross-referenced from this plate. */
  refs?: string[];
  /** Verbatim source shown in raw mode, e.g. the Markdown behind an article. */
  source?: string;
  /** Extra key/value rows for the raw record. */
  record?: PlateFact[];
  wide?: boolean;
  /** Id of the drafted figure this sheet carries, as on the key plan. */
  figure?: string;
  /** Structured data for this sheet, rendered as one JSON-LD graph. */
  jsonLd?: Record<string, unknown>[];
  children: ReactNode;
}

/**
 * A content plate. The three drawing modes are switched entirely in CSS from
 * `html[data-mode]`, so the artifact, the annotation layer, and the raw record
 * all ship as static markup with no client work and no hydration flash.
 */
export function PlateShell({
  sheet,
  title,
  subtitle,
  discipline,
  scale = '1:1',
  revision = 'A',
  issued = '2026.09',
  lead,
  facts = [],
  refs = [],
  source,
  record = [],
  wide = false,
  figure,
  jsonLd,
  children,
}: PlateShellProps) {
  const headFacts: PlateFact[] = [
    { k: 'Scale', v: scale },
    { k: 'Rev', v: revision },
    { k: 'Issued', v: issued },
    ...facts,
  ];

  return (
    <article className={`plate ${wide ? 'plate-wide' : ''} ${styles.plate}`}>
      {jsonLd && <JsonLd things={jsonLd} />}
      <SetPlateMeta
        sheet={sheet}
        title={title}
        subtitle={subtitle}
        discipline={discipline}
        scale={scale}
        revision={revision}
        date={issued}
        refs={refs}
      />

      {/* Not scroll-revealed: this is the first thing on every sheet, and
          holding it invisible until hydration made it the last thing to
          paint. The template's settle animation carries the entrance. */}
      <header className={styles.head}>
        <p className={styles.eyebrow}>
          <span className={styles.sheetTag}>{sheet}</span>
          <span className={styles.hairline} aria-hidden="true" />
          <span className={styles.disciplineName}>{DISCIPLINES[discipline].name}</span>
        </p>

        {/* Annotated mode labels the sheet's anatomy in the left margin the
            way a drawing keys its parts; raw mode names the element and the
            prop it was built from. */}
        <h1 className={styles.title} data-annotate="Sheet title" data-raw="h1.title ← props.title">
          {title}
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>

        {lead && (
          <div className={styles.lead} data-annotate="Lead" data-raw="div.lead ← props.lead">
            {lead}
          </div>
        )}

        <dl
          className={styles.facts}
          aria-label="Sheet data"
          data-annotate="Sheet data"
          data-raw="dl.facts ← props.facts[]"
        >
          {headFacts.map((f) => (
            <div key={f.k} className={styles.fact}>
              <dt>{f.k}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.headRule} aria-hidden="true" />
      </header>

      {/* The sheet's drawing: the same figure the key plan shows in miniature,
          here at the size it was drafted for. */}
      {figure && hasFigure(figure) && (
        <figure
          className={styles.figure}
          data-annotate="Figure"
          data-raw="figure ← props.figure"
          data-bound
        >
          <div className={styles.figureField}>
            <PlateFigure id={figure} />
          </div>
          <figcaption className={styles.figureCaption}>
            <span className={styles.figureNo}>1</span>
            <span className={styles.figureTitle}>{figureCaption(figure)}</span>
            <span className={styles.figureScale}>
              {sheet} · {scale}
            </span>
          </figcaption>
        </figure>
      )}

      <div className={styles.body} data-annotate="Body" data-raw="div.body ← props.children">
        {children}
      </div>

      {refs.length > 0 && (
        <nav
          className={styles.refs}
          aria-label="Cross-references"
          data-annotate="Refs"
          data-raw="nav.refs ← props.refs[]"
        >
          <span className={styles.refsLabel}>Refer to</span>
          <ul className={styles.refsList}>
            {refs.map((ref) => {
              const plate = getPlateBySheet(ref);
              if (!plate) return null;
              return (
                <li key={ref}>
                  <Link href={plate.href} className={styles.ref}>
                    <span className={styles.refSheet}>{plate.sheet}</span>
                    <span className={styles.refTitle}>{plate.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Title strip for the printed sheet. On screen the fixed title block
          does this job; on paper every page needs its own. */}
      <footer className={styles.printBlock} aria-hidden="true">
        <span className={styles.printSet}>
          Architecture of Intelligence
          <span>Drawing set · Akshay Bajpai · akshaybajpai.com</span>
        </span>
        <span className={styles.printCell}>
          <span>Title</span>
          {title}
        </span>
        <span className={styles.printCell}>
          <span>Rev</span>
          {revision}
        </span>
        <span className={styles.printCell}>
          <span>Issued</span>
          {issued}
        </span>
        <span className={styles.printSheet}>{sheet}</span>
      </footer>

      {/* Raw record: the sheet stripped to the data it was drawn from. */}
      <div className={styles.raw}>
        <p className={styles.rawHead}>
          <span>{sheet}</span>
          <span>record</span>
        </p>

        <dl className={styles.rawTable}>
          {[
            { k: 'sheet', v: sheet },
            { k: 'title', v: title },
            { k: 'subtitle', v: subtitle },
            { k: 'discipline', v: `${discipline} · ${DISCIPLINES[discipline].name}` },
            { k: 'scale', v: scale },
            { k: 'revision', v: revision },
            { k: 'issued', v: issued },
            { k: 'refs', v: refs.join(', ') || 'none' },
            ...record,
          ].map((row) => (
            <div key={row.k} className={styles.rawRow}>
              <dt>{row.k}</dt>
              <dd>{row.v}</dd>
            </div>
          ))}
        </dl>

        {source && (
          <>
            <p className={styles.rawHead}>
              <span>source</span>
              <span>markdown</span>
            </p>
            <pre className={styles.rawSource}>
              <code>{source}</code>
            </pre>
          </>
        )}
      </div>
    </article>
  );
}
