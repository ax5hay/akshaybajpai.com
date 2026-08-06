'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './SearchDialog.module.css';

interface SearchEntry {
  title: string;
  description: string;
  href: string;
  collection: string;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchEntry[]>([]);

  useEffect(() => {
    fetch('/search-index.json')
      .then((r) => r.json())
      .then(setIndex)
      .catch(() => setIndex([]));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = query.trim()
    ? index
        .filter((entry) => {
          const q = query.toLowerCase();
          return (
            entry.title.toLowerCase().includes(q) ||
            entry.description.toLowerCase().includes(q) ||
            entry.collection.includes(q)
          );
        })
        .slice(0, 8)
    : index.slice(0, 6);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)} aria-label="Search site">
        Search ⌘K
      </button>
      {open && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Search site">
          <div className={styles.backdrop} onClick={close} aria-hidden="true" />
          <div className={styles.panel}>
            <input
              type="search"
              className={styles.input}
              placeholder="Search essays, work, blog…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              aria-label="Search query"
            />
            <ul className={styles.results}>
              {results.map((entry) => (
                <li key={entry.href}>
                  <Link href={entry.href} className={styles.result} onClick={close}>
                    <span className={styles.resultTitle}>{entry.title}</span>
                    <span className={styles.resultMeta}>{entry.collection}</span>
                  </Link>
                </li>
              ))}
              {results.length === 0 && <li className={styles.empty}>No results</li>}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
