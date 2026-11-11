import Link from 'next/link';
import type { RepoCard } from '@/lib/repos';
import { traceId } from '@/lib/stack';
import { Callout } from '@/components/kit/Callout';
import styles from './RepoCards.module.css';

/**
 * Repositories without a full sheet, filed as cards under the schedule on
 * W-400. Each is a small title block: what it is, what it shows, the stack,
 * and two ways on, to the code when it is public and to A-102 with the
 * repository already traced through the schedule of materials.
 *
 * Static markup, no script. On hover the card's crop marks ink in, the way
 * a sheet is marked up for cutting.
 */
export function RepoCards({ cards }: { cards: RepoCard[] }) {
  return (
    <section className={styles.cards} aria-labelledby="repo-cards">
      <header className={styles.head}>
        <h2 id="repo-cards" className={styles.title}>
          Repositories without a sheet
        </h2>
        <span className={styles.count}>{cards.length} cards</span>
      </header>
      <Callout note="Cards, not sheets: each says what the code is and what it shows. Trace one through A-102 to see every tool and practice it used.">
        <ul className={styles.grid}>
          {cards.map((card, i) => (
            <li key={card.name} className={styles.card}>
              <span className={styles.crop} aria-hidden="true" />
              <div className={styles.strip}>
                <span className={styles.no}>W-4·C{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.access} data-private={!card.href || undefined}>
                  {card.href ? 'Public' : 'Private'}
                </span>
              </div>
              <h3 className={styles.name}>
                {card.href ? (
                  <a href={card.href} className={styles.cover} rel="noopener">
                    {card.name}
                    <span className="u-visually-hidden">, code on GitHub</span>
                  </a>
                ) : (
                  card.name
                )}
              </h3>
              <p className={styles.line}>{card.line}</p>
              <p className={styles.shows}>{card.shows}</p>
              <p className={styles.record} aria-hidden="true">
                {card.href ?? 'private · described, never linked'}
              </p>
              <dl className={styles.block}>
                <div>
                  <dt>Stack</dt>
                  <dd>{card.stack}</dd>
                </div>
                <div className={styles.links}>
                  <dt className="u-visually-hidden">Go to</dt>
                  <dd>
                    <Link
                      href={`/schedule/?trace=${traceId(card.repo, 'repo')}`}
                      className={styles.trace}
                    >
                      Trace in A-102
                    </Link>
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </Callout>
    </section>
  );
}
