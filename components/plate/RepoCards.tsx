import type { RepoCard } from '@/lib/repos';
import styles from './RepoCards.module.css';

/**
 * Repositories without a full sheet, filed as cards under the schedule on
 * W-400: what each is, what it shows, and where to read the code when the
 * code is public. Static markup, no script.
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
      <ul className={styles.grid}>
        {cards.map((card) => (
          <li key={card.name} className={styles.card}>
            <h3 className={styles.name}>{card.name}</h3>
            <p className={styles.line}>{card.line}</p>
            <p className={styles.shows}>{card.shows}</p>
            <p className={styles.foot}>
              <span>{card.stack}</span>
              {card.href ? (
                <a href={card.href} className={styles.link} rel="noopener">
                  Code ↗<span className="u-visually-hidden"> for {card.name}, on GitHub</span>
                </a>
              ) : (
                <span className={styles.private}>Private</span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
