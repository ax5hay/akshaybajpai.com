import Link from 'next/link';
import { PlateShell, type PlateFact } from './PlateShell';
import { MetricSchedule } from '@/components/kit/MetricSchedule';
import { Callout } from '@/components/kit/Callout';
import { formatDate } from '@/lib/format';
import { parseGithubRepo, type ContentSection } from '@/lib/content';
import { SheetProfile } from './SheetProfile';
import { ProseTools } from './ProseTools';
import type { Discipline } from '@/lib/plates';
import styles from './ArticlePlate.module.css';

export interface AdjacentSheet {
  sheet: string;
  title: string;
  href: string;
}

interface Props {
  sheet: string;
  title: string;
  description: string;
  discipline: Discipline;
  /** ISO publication date. */
  date: string;
  html: string;
  /** The article's `##` sections, for its profile and margin key. */
  sections?: ContentSection[];
  source: string;
  readingTime: number;
  seriesHref: string;
  seriesLabel: string;
  client?: string;
  stack?: string[];
  metrics?: string[];
  adjacent?: AdjacentSheet[];
  /** Sheets this one's text links to, and sheets whose text links here. */
  xrefs?: { out: AdjacentSheet[]; in: AdjacentSheet[] };
  /**
   * An operable figure for this sheet. Where the article already carries a
   * diagram typed out as a code block, the figure is drawn in its place;
   * otherwise it is set ahead of the prose.
   */
  figure?: React.ReactNode;
  /**
   * For the complete set, where thirty sheets share a page: no back link,
   * section strip, citable headings or onward links, which are all ways of
   * moving about a single sheet on screen.
   */
  compact?: boolean;
}

/** Citable headings on a sheet of its own; a plain wrapper in the set. */
function Sections({
  sheet,
  plain,
  children,
}: {
  sheet: string;
  plain: boolean;
  children: React.ReactNode;
}) {
  return plain ? <div>{children}</div> : <ProseTools sheet={sheet}>{children}</ProseTools>;
}

/** A detail sheet: one article, drawn at full size. */
export function ArticlePlate({
  sheet,
  title,
  description,
  discipline,
  date,
  html,
  sections = [],
  source,
  readingTime,
  seriesHref,
  seriesLabel,
  client,
  stack,
  metrics,
  adjacent = [],
  xrefs,
  figure,
  compact = false,
}: Props) {
  const issued = formatDate(date, 'short');
  const repo = parseGithubRepo(client);

  const facts: PlateFact[] = [
    { k: 'Reading', v: `${readingTime} min` },
    ...(client ? [{ k: 'Engagement', v: client }] : []),
  ];

  return (
    <PlateShell
      sheet={sheet}
      title={title}
      subtitle={description}
      discipline={discipline}
      scale="1:1"
      revision="A"
      issued={issued}
      facts={facts}
      // The verbatim Markdown is for raw mode on screen; the set is for paper.
      source={compact ? undefined : source}
      record={[
        { k: 'series', v: seriesLabel },
        { k: 'words', v: String(source.trim().split(/\s+/).length) },
        ...(stack?.length ? [{ k: 'stack', v: stack.join(', ') }] : []),
        ...(metrics?.length ? [{ k: 'metrics', v: metrics.join(' · ') }] : []),
      ]}
    >
      {!compact && (
      <nav className={styles.back}>
        <Link href={seriesHref} className={styles.backLink}>
          <span aria-hidden="true">←</span> Back to {seriesLabel}
        </Link>
        {repo && (
          <a href={repo} target="_blank" rel="noopener noreferrer" className={styles.repo}>
            Source repository ↗
          </a>
        )}
      </nav>
      )}

      {stack && stack.length > 0 && (
        <ul className={styles.stack} aria-label="Stack">
          {stack.map((item) => (
            <li key={item} className={styles.stackItem}>
              {item}
            </li>
          ))}
        </ul>
      )}

      {metrics && metrics.length > 0 ? (
        <Callout note="Measured in production, not in a benchmark. Each row is the figure the engagement was signed off against.">
          <MetricSchedule metrics={metrics} />
        </Callout>
      ) : (
        <MetricSchedule metrics={metrics} />
      )}

      {!compact && <SheetProfile sections={sections} readingTime={readingTime} />}

      <Sections sheet={sheet} plain={compact}>
      {(() => {
        // An unlabelled code block in a case study is a diagram in ASCII. The
        // verbatim source keeps it; the sheet draws it.
        const typed = figure ? html.match(/<pre><code>[\s\S]*?<\/code><\/pre>/) : null;
        if (!figure || !typed || typed.index === undefined) {
          return (
            <>
              {figure}
              <div className="prose prose-lead" dangerouslySetInnerHTML={{ __html: html }} />
            </>
          );
        }
        return (
          <>
            <div
              className="prose prose-lead"
              dangerouslySetInnerHTML={{ __html: html.slice(0, typed.index) }}
            />
            {figure}
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: html.slice(typed.index + typed[0].length) }}
            />
          </>
        );
      })()}
      </Sections>

      {xrefs && xrefs.out.length + xrefs.in.length > 0 && (
        <nav className={styles.xrefs} aria-label="Cross-references in the text">
          {(
            [
              ['This sheet refers to', xrefs.out],
              ['Referred to from', xrefs.in],
            ] as const
          ).map(
            ([label, list]) =>
              list.length > 0 && (
                <div key={label} className={styles.xrefGroup}>
                  <span className={styles.adjacentLabel}>{label}</span>
                  <ul className={styles.xrefList}>
                    {list.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className={styles.xref}>
                          {/* The split circle a drawing uses to name a
                              reference: this sheet over that one. */}
                          <span className={styles.xrefBubble} aria-hidden="true">
                            <span>{sheet}</span>
                            <span>{item.sheet}</span>
                          </span>
                          <span className={styles.xrefTitle}>{item.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
          )}
        </nav>
      )}

      {!compact && adjacent.length > 0 && (
        <nav className={styles.adjacent} aria-label="Adjacent sheets">
          <span className={styles.adjacentLabel}>Continue through the set</span>
          <ul className={styles.adjacentList}>
            {adjacent.map((item, i) => (
              <li key={item.href} data-next={i === 0 || undefined}>
                <Link href={item.href} className={styles.adjacentLink}>
                  <span className={styles.adjacentSheet}>
                    {i === 0 && <span className={styles.adjacentNext}>Next sheet</span>}
                    {item.sheet}
                  </span>
                  <span className={styles.adjacentTitle}>{item.title}</span>
                  <span className={styles.adjacentArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </PlateShell>
  );
}
