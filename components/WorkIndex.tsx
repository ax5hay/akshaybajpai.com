'use client';

import { useMemo, useState } from 'react';
import { ContentList, type ContentListItem } from '@/components/ContentList';
import styles from './WorkIndex.module.css';

interface Props {
  items: ContentListItem[];
  tags: string[];
  featuredSlug: string;
}

export function WorkIndex({ items, tags, featuredSlug }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const featured = items.find((i) => i.slug === featuredSlug) ?? items[0];
  const filtered = useMemo(() => {
    if (!activeTag) return items.filter((i) => i.slug !== featured?.slug);
    return items.filter(
      (i) => i.slug !== featured?.slug && (i.stackTags?.includes(activeTag) ?? false)
    );
  }, [activeTag, featured?.slug, items]);

  return (
    <>
      {featured && (
        <article className={styles.featured} data-reveal>
          <p className={styles.featuredLabel}>Featured</p>
          <h2 className={styles.featuredTitle}>
            <a href={featured.href}>{featured.title}</a>
          </h2>
          {featured.description && <p className={styles.featuredDesc}>{featured.description}</p>}
          {featured.metrics && featured.metrics.length > 0 && (
            <ul className={styles.metrics} aria-label="Key metrics">
              {featured.metrics.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
          <div className={styles.featuredActions}>
            <a href={featured.href} className={styles.primary}>
              Read case study
            </a>
            {featured.githubUrl && (
              <a href={featured.githubUrl} target="_blank" rel="noopener noreferrer" className={styles.secondary}>
                View on GitHub
              </a>
            )}
          </div>
        </article>
      )}

      {tags.length > 0 && (
        <div className={styles.filters} data-reveal aria-label="Filter by stack">
          <button
            type="button"
            className={`${styles.filter} ${activeTag === null ? styles.filterActive : ''}`}
            onClick={() => setActiveTag(null)}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`${styles.filter} ${activeTag === tag ? styles.filterActive : ''}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <ContentList section="work" ariaLabel="Case studies" items={filtered} />
    </>
  );
}
