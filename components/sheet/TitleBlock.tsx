'use client';

import { useState } from 'react';
import { DISCIPLINES } from '@/lib/plates';
import { useToast } from '@/components/system/ToastProvider';
import { usePlateMeta, TOTAL_SHEETS } from './PlateMetaProvider';
import styles from './TitleBlock.module.css';

const ISSUE_STAMP = '2026.09';

export function TitleBlock() {
  const { meta } = usePlateMeta();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);

  const copyReference = async () => {
    const reference = `${meta.sheet} — ${meta.title.toUpperCase()} · ${window.location.href}`;
    try {
      await navigator.clipboard.writeText(reference);
      toast({
        kind: 'Reference copied',
        message: `${meta.sheet} — ${meta.title}`,
        detail: 'Sheet number and link are on your clipboard',
        tone: 'revision',
      });
    } catch {
      toast({
        kind: 'Copy blocked',
        message: 'The browser refused clipboard access',
        detail: 'Copy the address bar instead',
        tone: 'issue',
      });
    }
  };

  return (
    <aside className={styles.block} data-expanded={expanded || undefined} aria-label="Title block">
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls="title-block-detail"
      >
        <span className={styles.sheetNo}>{meta.sheet}</span>
        <span className={styles.title}>{meta.title}</span>
        <span className={styles.chevron} aria-hidden="true" />
        <span className="u-visually-hidden">
          {expanded ? 'Collapse title block' : 'Expand title block'}
        </span>
      </button>

      <div className={styles.detail} id="title-block-detail" hidden={!expanded}>
        <dl className={styles.grid}>
          <div className={styles.field}>
            <dt>Discipline</dt>
            <dd>{DISCIPLINES[meta.discipline].name}</dd>
          </div>
          <div className={styles.field}>
            <dt>Scale</dt>
            <dd className="u-tnum">{meta.scale}</dd>
          </div>
          <div className={styles.field}>
            <dt>Rev</dt>
            <dd>{meta.revision}</dd>
          </div>
          <div className={styles.field}>
            <dt>Issued</dt>
            <dd className="u-tnum">{meta.date ?? ISSUE_STAMP}</dd>
          </div>
          <div className={styles.field}>
            <dt>Drawn</dt>
            <dd>A. Bajpai</dd>
          </div>
          <div className={styles.field}>
            <dt>Set</dt>
            <dd className="u-tnum">{TOTAL_SHEETS} sheets</dd>
          </div>
        </dl>

        {meta.subtitle && <p className={styles.subtitle}>{meta.subtitle}</p>}

        <button type="button" className={styles.copy} onClick={copyReference}>
          Copy sheet reference
        </button>
      </div>
    </aside>
  );
}
