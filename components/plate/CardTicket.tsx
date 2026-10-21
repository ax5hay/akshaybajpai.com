import type { CSSProperties } from 'react';
import Link from 'next/link';
import { CARD } from '@/lib/card';
import styles from './CardTicket.module.css';

/**
 * The calling card, in miniature, as a way to it from elsewhere in the set.
 * The card's own sheet is reached by scanning the printed card; this is for
 * a reader who is already in the set and wants the card: to keep the
 * contact, or to pass it on.
 */
export function CardTicket({ className }: { className?: string }) {
  return (
    <Link
      href={CARD.path}
      className={`${styles.ticket} ${className ?? ''}`}
      style={{ '--rosette': 'url(/card/rosette.svg)' } as CSSProperties}
    >
      <span className={styles.face} aria-hidden="true">
        <span className={styles.ink} />
        <span className={styles.foil} />
        <img src="/card-mark.png" alt="" width={240} height={240} className={styles.mark} />
        <span className={styles.name}>
          <span>{CARD.given}</span>
          <span>{CARD.family}</span>
        </span>
        <span className={styles.role}>{CARD.role.split(' · ')[0]}</span>
      </span>
      <span className={styles.text}>
        <span className={styles.kicker}>C-701 · Calling card</span>
        <span className={styles.title}>The card, as scanned</span>
        <span className={styles.note}>
          Where the printed card’s code lands. Save the contact in one tap, or hold it up for the
          next phone.
        </span>
        <span className={styles.cta}>
          Open the card
          <span className={styles.arrow} />
        </span>
      </span>
    </Link>
  );
}
