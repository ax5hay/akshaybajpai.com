'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './SiteDock.module.css';

const DOCK = [
  { href: '/essays/', label: 'Essays' },
  { href: '/work/', label: 'Work' },
  { href: '/blog/', label: 'Blog' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
] as const;

export function SiteDock() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    const path = href.replace(/\/$/, '');
    const current = pathname.replace(/\/$/, '') || '/';
    return current === path || (path !== '' && current.startsWith(path));
  };

  return (
    <nav className={styles.dock} data-home="dock" aria-label="Site">
      <Link href="/" className={styles.brand} aria-label="Home">
        <img src="/logo.png" alt="" width={22} height={22} />
      </Link>
      <ul className={styles.links}>
        {DOCK.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`${styles.link} ${isActive(item.href) ? styles.active : ''}`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
