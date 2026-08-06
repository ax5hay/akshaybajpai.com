'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './BackToMap.module.css';

interface Props {
  href?: string;
  label?: string;
  embeddedAction?: 'close' | 'link';
}

export function BackToMap({ href = '/', label = '← Neural map', embeddedAction = 'close' }: Props) {
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setEmbedded(window.self !== window.top);
  }, []);

  const handleClose = () => {
    window.parent.postMessage({ type: 'neural-close' }, '*');
  };

  if (embedded && embeddedAction === 'close') {
    return (
      <button type="button" className={styles.link} onClick={handleClose}>
        {label}
      </button>
    );
  }

  return (
    <Link href={href} className={styles.link}>
      {label}
    </Link>
  );
}
