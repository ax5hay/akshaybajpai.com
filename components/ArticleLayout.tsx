import styles from './ArticleLayout.module.css';

interface Props {
  title: string;
  date: string;
  html: string;
}

export function ArticleLayout({ title, date, html }: Props) {
  return (
    <article className={`section-surface ${styles.article}`}>
      <div className={styles.inner}>
        <header className={`page-header ${styles.header}`} data-reveal>
          <h1 className={styles.title}>{title}</h1>
          <time className={styles.date} dateTime={date}>
            {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </time>
        </header>
        <div className={`prose ${styles.body}`} data-reveal dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </article>
  );
}
