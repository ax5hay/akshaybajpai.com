import styles from './SkipLink.module.css';

export function SkipLink() {
  return (
    <a href="#main-content" className={`skip-link ${styles.skip}`}>
      Skip to main content
    </a>
  );
}
