import type { CSSProperties } from 'react';
import Link from 'next/link';
import { CARD } from '@/lib/card';
import { Voice } from '@/components/system/Voice';
import styles from './CardTicket.module.css';

/** The face of the card, small: the mark, the engraving, the name. */
export function CardFace({ className }: { className?: string }) {
  return (
    <span
      className={`${styles.face} ${className ?? ''}`}
      aria-hidden="true"
      style={{ '--rosette': 'url(/card/rosette.svg)' } as CSSProperties}
    >
      <span className={styles.ink} />
      <span className={styles.foil} />
      <img src="/card-mark.png" alt="" width={240} height={240} className={styles.mark} />
      <span className={styles.name}>
        <span>{CARD.given}</span>
        <span>{CARD.family}</span>
      </span>
      <span className={styles.role}>{CARD.role.split(' · ')[0]}</span>
    </span>
  );
}

/**
 * The calling card, in miniature, as a way to it from elsewhere in the set.
 * The card's own sheet is reached by scanning the printed card; this is for
 * a reader who is already in the set and wants the card: to keep the
 * contact, or to pass it on.
 */
export function CardTicket({ className }: { className?: string }) {
  return (
    <Link href={CARD.path} className={`${styles.ticket} ${className ?? ''}`}>
      <CardFace />
      <span className={styles.text}>
        <span className={styles.kicker}>
          C-701 · <Voice k="callingCard" />
        </span>
        <span className={styles.title}>
          <Voice k="cardTicketTitle" />
        </span>
        <span className={styles.note}>
          <Voice k="cardTicketNote" />
        </span>
        <span className={styles.cta}>
          <Voice k="openCard" />
          <span className={styles.arrow} />
        </span>
      </span>
    </Link>
  );
}
