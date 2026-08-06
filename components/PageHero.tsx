import type { ReactNode } from 'react';
import { SectionOrb } from '@/components/atmosphere/SectionOrb';
import { BackToMap } from '@/components/BackToMap';
import { SECTION_THEMES, type SectionId } from '@/lib/sections';
import styles from './PageHero.module.css';

interface Props {
  section: SectionId;
  title: string;
  lead?: ReactNode;
  eyebrow?: string;
  showOrb?: boolean;
  showBack?: boolean;
  centered?: boolean;
}

export function PageHero({
  section,
  title,
  lead,
  eyebrow,
  showOrb = true,
  showBack = true,
  centered = false,
}: Props) {
  const theme = SECTION_THEMES[section];
  const label = eyebrow ?? theme.label;

  return (
    <header className={`${styles.hero} ${centered ? styles.heroCentered : ''}`} data-section={section} data-reveal>
      {showOrb && <SectionOrb section={section} />}
      <div className={styles.inner}>
        {showBack && <BackToMap />}
        <p className={styles.eyebrow}>{label}</p>
        <h1 className={styles.title}>{title}</h1>
        {lead && <div className={styles.lead}>{lead}</div>}
        <div className={styles.accentLine} aria-hidden="true" />
      </div>
    </header>
  );
}
