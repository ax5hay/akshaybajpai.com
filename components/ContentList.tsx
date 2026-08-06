import Link from 'next/link';
import { formatDate } from '@/lib/format';
import type { SectionId } from '@/lib/sections';
import styles from './ContentList.module.css';

export interface ContentListItem {
  slug: string;
  href: string;
  title: string;
  date: string;
  description?: string;
  meta?: string;
  githubUrl?: string;
  stackTags?: string[];
  metrics?: string[];
}

interface Props {
  items: ContentListItem[];
  section: SectionId;
  ariaLabel: string;
}

export function ContentList({ items, section, ariaLabel }: Props) {
  return (
    <ul className={styles.list} aria-label={ariaLabel} data-reveal-stagger data-section={section}>
      {items.map((item) => (
        <li key={item.slug} className={styles.item}>
          <div className={styles.card}>
            <span className={styles.accentBar} aria-hidden="true" />
            <div className={styles.body}>
              <h2 className={styles.title}>
                <Link href={item.href} className={styles.titleLink}>
                  {item.title}
                </Link>
              </h2>
              {item.description && <p className={styles.description}>{item.description}</p>}
              <div className={styles.footer}>
                {item.meta && <span className={styles.meta}>{item.meta}</span>}
                {item.githubUrl && (
                  <a
                    href={item.githubUrl}
                    className={styles.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub
                  </a>
                )}
                <time className={styles.date} dateTime={item.date}>
                  {formatDate(item.date, 'short')}
                </time>
              </div>
            </div>
            <Link href={item.href} className={styles.arrow} aria-label={`Read ${item.title}`}>
              →
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
