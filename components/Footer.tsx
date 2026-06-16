import Link from 'next/link';
import { SOCIAL, SITE_TAGLINE } from '@/lib/constants';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <p className={styles.tagline}>{SITE_TAGLINE}</p>
        <nav className={styles.nav} aria-label="Footer">
          <Link href="/about/" className="link-hover">About</Link>
          <Link href="/work/" className="link-hover">Work</Link>
          <Link href="/blog/" className="link-hover">Blog</Link>
          <Link href="/essays/" className="link-hover">Essays</Link>
          <Link href="/contact/" className="link-hover">Contact</Link>
          <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" className="link-hover">LinkedIn</a>
          <a href={SOCIAL.github} target="_blank" rel="noopener noreferrer" className="link-hover">GitHub</a>
        </nav>
        <p className={styles.copy}>&copy; {year} Akshay Bajpai. All rights reserved.</p>
      </div>
    </footer>
  );
}
