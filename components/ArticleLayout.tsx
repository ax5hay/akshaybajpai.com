import { BackToMap } from '@/components/BackToMap';
import { RelatedPosts } from '@/components/RelatedPosts';
import { formatDate } from '@/lib/format';
import { SECTION_THEMES, type SectionId } from '@/lib/sections';
import styles from './ArticleLayout.module.css';

interface RelatedItem {
  slug: string;
  title: string;
  href: string;
  description: string;
}

interface Props {
  title: string;
  date: string;
  html: string;
  section: SectionId;
  description?: string;
  readingTime?: number;
  tags?: string[];
  backHref?: string;
  backLabel?: string;
  related?: RelatedItem[];
}

export function ArticleLayout({
  title,
  date,
  html,
  section,
  description,
  readingTime,
  tags = [],
  backHref,
  backLabel,
  related = [],
}: Props) {
  const theme = SECTION_THEMES[section];
  const indexHref = backHref ?? theme.indexHref;
  const indexLabel = backLabel ?? `← ${theme.label}`;

  return (
    <article className={styles.article} data-section={section}>
      <div className={styles.inner}>
        <BackToMap href={indexHref} label={indexLabel} embeddedAction="close" />

        <header className={styles.header} data-reveal>
          <p className={styles.eyebrow}>{theme.label}</p>
          <h1 className={styles.title}>{title}</h1>

          <div className={styles.metaStrip}>
            <time dateTime={date}>{formatDate(date, 'long')}</time>
            {readingTime != null && (
              <>
                <span className={styles.metaSep} aria-hidden="true">·</span>
                <span>{readingTime} min read</span>
              </>
            )}
          </div>

          {tags.length > 0 && (
            <ul className={styles.tags} aria-label="Tags">
              {tags.map((tag) => (
                <li key={tag} className={styles.tag}>
                  {tag}
                </li>
              ))}
            </ul>
          )}

          {description && <p className={styles.description}>{description}</p>}

          <div className={styles.accentLine} aria-hidden="true" />
        </header>

        <div
          className={`prose prose-article ${styles.body}`}
          data-reveal
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <RelatedPosts items={related} />
      </div>
    </article>
  );
}
