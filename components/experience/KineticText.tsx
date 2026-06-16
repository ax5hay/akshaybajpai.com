'use client';

import { useMemo } from 'react';
import styles from './KineticText.module.css';

interface Props {
  text: string;
  as?: 'h1' | 'p' | 'span';
  className?: string;
  dataExp?: string;
}

export function KineticText({ text, as: Tag = 'span', className = '', dataExp }: Props) {
  const chars = useMemo(() => text.split(''), [text]);

  return (
    <Tag className={`${styles.root} ${className}`}>
      {chars.map((char, i) => (
        <span
          key={`${char}-${i}`}
          className={styles.char}
          data-exp={dataExp}
          style={{ '--char-i': i } as React.CSSProperties}
          aria-hidden={char === ' ' ? true : undefined}
        >
          {char === ' ' ? '\u00a0' : char}
        </span>
      ))}
    </Tag>
  );
}
