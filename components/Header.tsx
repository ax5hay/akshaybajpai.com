'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_LINKS } from '@/lib/constants';
import styles from './Header.module.css';

export function Header() {
  const pathname = usePathname();

  useEffect(() => {
    const header = document.querySelector(`.${styles.header}`);
    if (!header) return;
    const onScroll = () => header.classList.toggle(styles.scrolled, window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => {
    const path = href.replace(/\/$/, '');
    const current = pathname.replace(/\/$/, '') || '/';
    return current === path || (path !== '' && current.startsWith(path));
  };

  return (
    <header className={`site-header ${styles.header}`} role="banner">
      <Link href="/" className={styles.logo} aria-label="Home · Akshay Bajpai">
        <img src="/logo.png" alt="" width={36} height={36} />
      </Link>
      <nav className={styles.nav} id="primary-nav" aria-label="Primary">
        <ul className={styles.navList}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`link-hover ${styles.navLink} ${isActive(link.href) ? styles.navLinkActive : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button
        type="button"
        className={styles.toggle}
        aria-label="Toggle menu"
        aria-expanded="false"
        aria-controls="primary-nav"
        onClick={() => {
          const nav = document.getElementById('primary-nav');
          const btn = document.querySelector(`.${styles.toggle}`) as HTMLButtonElement;
          if (!nav || !btn) return;
          const open = btn.getAttribute('aria-expanded') === 'true';
          btn.setAttribute('aria-expanded', String(!open));
          nav.setAttribute('aria-hidden', String(open));
          document.body.style.overflow = open ? '' : 'hidden';
        }}
      >
        <span /><span /><span />
      </button>
    </header>
  );
}
