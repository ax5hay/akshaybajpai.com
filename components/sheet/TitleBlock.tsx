'use client';

import { useEffect, useState } from 'react';
import { getPlateBySheet } from '@/lib/plates';
import { useVoice } from '@/components/system/useVoice';
import { disciplineName, plateTitle } from '@/lib/voice';
import { useToast } from '@/components/system/ToastProvider';
import Link from 'next/link';
import { clearRoute, useRoute } from '@/components/system/Route';
import { useSheetSet } from '@/components/system/SheetSet';
import { usePlateMeta } from './PlateMetaProvider';
import styles from './TitleBlock.module.css';

const ISSUE_STAMP = '2026.09';

export function TitleBlock() {
  const sheetCount = useSheetSet().length;
  const route = useRoute();
  const { meta } = usePlateMeta();
  const { toast } = useToast();
  const t = useVoice();
  const plate = getPlateBySheet(meta.sheet);
  const title = plate ? plateTitle(plate, t.level) : meta.title;
  const [expanded, setExpanded] = useState(false);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    document.documentElement.toggleAttribute('data-titleblock', expanded);
    return () => document.documentElement.removeAttribute('data-titleblock');
  }, [expanded]);
  // The system share sheet, where there is one. Known only after mounting.
  const [canShare, setCanShare] = useState(false);
  useEffect(() => setCanShare(typeof navigator.share === 'function'), []);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 64);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const copyReference = async () => {
    const reference = `${meta.sheet} · ${meta.title.toUpperCase()} · ${window.location.href}`;
    try {
      await navigator.clipboard.writeText(reference);
      toast({
        kind: 'Reference copied',
        message: `${meta.sheet} · ${meta.title}`,
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
    <aside
      className={styles.block}
      data-expanded={expanded || undefined}
      data-compact={compact || undefined}
      aria-label="Title block"
    >
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls="title-block-detail"
      >
        <span className={styles.sheetNo}>{meta.sheet}</span>
        <span className={styles.title}>{title}</span>
        {/* Zone under the pointer, written by ZoneCursor. */}
        <span className={styles.gridRef} data-grid-ref aria-hidden="true" />
        <span className={styles.chevron} aria-hidden="true" />
        <span className="u-visually-hidden">
          {expanded ? 'Collapse title block' : 'Expand title block'}
        </span>
      </button>

      <div className={styles.detail} id="title-block-detail" hidden={!expanded}>
        <dl className={styles.grid}>
          <div className={styles.field}>
            <dt>{t('type')}</dt>
            <dd>{disciplineName(meta.discipline, t.level)}</dd>
          </div>
          <div className={styles.field}>
            <dt>{t('scale')}</dt>
            <dd className="u-tnum">{meta.scale}</dd>
          </div>
          <div className={styles.field}>
            <dt>{t('rev')}</dt>
            <dd>{meta.revision}</dd>
          </div>
          <div className={styles.field}>
            <dt>{t('issued')}</dt>
            <dd className="u-tnum">{meta.date ?? ISSUE_STAMP}</dd>
          </div>
          <div className={styles.field}>
            <dt>{t('drawn')}</dt>
            <dd>A. Bajpai</dd>
          </div>
          <div className={styles.field}>
            <dt>{t('setCount')}</dt>
            <dd className="u-tnum">{sheetCount} {t('pages')}</dd>
          </div>
        </dl>

        {meta.subtitle && <p className={styles.subtitle}>{meta.subtitle}</p>}

        <button type="button" className={styles.copy} onClick={copyReference}>
          {t('copyRef')}
        </button>
        {canShare && (
          <button
            type="button"
            className={styles.copy}
            onClick={() => {
              void navigator
                .share({
                  title: `${meta.sheet} · ${meta.title}`,
                  text: meta.subtitle,
                  url: window.location.href,
                })
                .catch(() => {});
            }}
          >
            {t('shareSheet')}
          </button>
        )}
        <button type="button" className={styles.copy} onClick={() => window.print()}>
          {t('pdfSheet')}
        </button>
        <Link href="/set/" className={styles.copy} onClick={() => setExpanded(false)}>
          {t('pdfSet')}
        </Link>
        <Link href="/card/" className={styles.copy} onClick={() => setExpanded(false)}>
          {t('cardLink')}
        </Link>

        {route.length > 0 && (
          <p className={styles.route}>
            <span>
              {t('yourRoute')} · <b>{route.length}</b> of {sheetCount} {t('read')}
            </span>
            <button type="button" onClick={clearRoute}>
              Clear
            </button>
          </p>
        )}
      </div>
    </aside>
  );
}
