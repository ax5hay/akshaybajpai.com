import Link from 'next/link';
import { PlateShell, type PlateFact } from './PlateShell';
import { MetricSchedule } from '@/components/kit/MetricSchedule';
import { Callout } from '@/components/kit/Callout';
import { formatDate } from '@/lib/format';
import { parseGithubRepo } from '@/lib/content';
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
  source: string;
  readingTime: number;
  seriesHref: string;
  seriesLabel: string;
  client?: string;
  stack?: string[];
  metrics?: string[];
  adjacent?: AdjacentSheet[];
}

/** A detail sheet: one article, drawn at full size. */
export function ArticlePlate({
  sheet,
  title,
  description,
  discipline,
  date,
  html,
  source,
  readingTime,
  seriesHref,
  seriesLabel,
  client,
  stack,
  metrics,
  adjacent = [],
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
      source={source}
      record={[
        { k: 'series', v: seriesLabel },
        { k: 'words', v: String(source.trim().split(/\s+/).length) },
        ...(stack?.length ? [{ k: 'stack', v: stack.join(', ') }] : []),
        ...(metrics?.length ? [{ k: 'metrics', v: metrics.join(' · ') }] : []),
      ]}
    >
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

      <div className="prose prose-lead" dangerouslySetInnerHTML={{ __html: html }} />

      {adjacent.length > 0 && (
        <nav className={styles.adjacent} aria-label="Adjacent sheets">
          <span className={styles.adjacentLabel}>Adjacent sheets</span>
          <ul className={styles.adjacentList}>
            {adjacent.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.adjacentLink}>
                  <span className={styles.adjacentSheet}>{item.sheet}</span>
                  <span className={styles.adjacentTitle}>{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </PlateShell>
  );
}
