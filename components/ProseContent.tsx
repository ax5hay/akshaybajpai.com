import type { ReactNode } from 'react';
import type { SectionId } from '@/lib/sections';
import styles from './ProseContent.module.css';

interface Props {
  section?: SectionId;
  children: ReactNode;
  stagger?: boolean;
}

export function ProseContent({ section, children, stagger = true }: Props) {
  return (
    <div
      className={styles.content}
      data-section={section}
      {...(stagger ? { 'data-reveal-stagger': true } : { 'data-reveal': true })}
    >
      {children}
    </div>
  );
}
