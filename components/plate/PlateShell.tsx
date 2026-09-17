import type { ReactNode } from 'react';
import Link from 'next/link';
import { DISCIPLINES, getPlateBySheet, type Discipline } from '@/lib/plates';
import { SetPlateMeta } from '@/components/sheet/PlateMetaProvider';
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

      <header className={styles.head} data-reveal>
        <p className={styles.eyebrow}>
          <span className={styles.sheetTag}>{sheet}</span>
          <span className={styles.hairline} aria-hidden="true" />
          <span className={styles.disciplineName}>{DISCIPLINES[discipline].name}</span>
        </p>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        {lead && <div className={styles.lead}>{lead}</div>}

        <dl className={styles.facts} aria-label="Sheet data">
          {headFacts.map((f) => (
            <div key={f.k} className={styles.fact}>
              <dt>{f.k}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.headRule} aria-hidden="true" />
      </header>

      <div className={styles.body}>{children}</div>

      {refs.length > 0 && (
        <nav className={styles.refs} aria-label="Cross-references">
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

      {/* Raw record — the sheet stripped to the data it was drawn from. */}
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
            { k: 'discipline', v: `${discipline} — ${DISCIPLINES[discipline].name}` },
            { k: 'scale', v: scale },
            { k: 'revision', v: revision },
            { k: 'issued', v: issued },
            { k: 'refs', v: refs.join(', ') || '—' },
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
