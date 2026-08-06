import Link from 'next/link';
import styles from './RelatedPosts.module.css';

interface RelatedItem {
  slug: string;
  title: string;
  href: string;
  description: string;
}

interface Props {
  items: RelatedItem[];
  label?: string;
}

export function RelatedPosts({ items, label = 'Continue reading' }: Props) {
  if (items.length === 0) return null;

  return (
    <aside className={styles.related} data-reveal aria-label={label}>
      <h2 className={styles.heading}>{label}</h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={item.href} className={styles.link}>
              <span className={styles.title}>{item.title}</span>
              <span className={styles.description}>{item.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
