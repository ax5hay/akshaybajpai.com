'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ContentSection } from '@/lib/content';
import styles from './SheetProfile.module.css';

/**
 * A section through the sheet being read.
 *
 * Every article is drawn as a strip cut along its length: one segment per
 * `##` section, each as wide as the words in it. It is a true drawing of the
 * article (the figures come from the Markdown at build time), and it is the
 * article's navigation: a segment jumps to its section, the one being read is
 * inked, the ones behind are hatched, and a cursor rides the strip at the
 * reader's exact position.
 *
 * On a wide board the same sections are also keyed down the margin beside the
 * sheet, and stay there as it scrolls.
 *
 * One passive scroll listener, coalesced to a frame. The cursor is written
 * straight to a custom property; React only re-renders when the section
 * changes.
 */
export function SheetProfile({
  sections,
  readingTime,
}: {
  sections: ContentSection[];
  readingTime: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(-1);
  const [peek, setPeek] = useState<number | null>(null);

  const total = sections.reduce((sum, s) => sum + s.words, 0) || 1;

  const jump = useCallback((id: string) => {
    const heading = document.getElementById(id);
    if (!heading) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    heading.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    // The address bar follows, so the place can be shared.
    history.replaceState(history.state, '', `#${id}`);
  }, []);

  useEffect(() => {
    if (!sections.length) return;
    const root = ref.current;
    let tops: number[] = [];
    let end = 0;
    let frame = 0;

    const measure = () => {
      tops = sections.map((s) => {
        const el = document.getElementById(s.id);
        return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
      });
      // The last section runs to the foot of the prose it sits in.
      const last = document.getElementById(sections[sections.length - 1].id);
      const prose = last?.parentElement;
      end = prose ? prose.getBoundingClientRect().bottom + window.scrollY : tops[tops.length - 1];
    };

    const read = () => {
      frame = 0;
      const line = window.scrollY + window.innerHeight * 0.3;
      let at = -1;
      for (let i = 0; i < tops.length; i += 1) if (tops[i] <= line) at = i;
      setCurrent(at);

      // Position along the strip: whole sections behind, plus the share of
      // the current one already read.
      let done = 0;
      for (let i = 0; i < at; i += 1) done += sections[i].words;
      if (at >= 0) {
        const from = tops[at];
        const to = at + 1 < tops.length ? tops[at + 1] : end;
        const within = to > from ? Math.min(1, Math.max(0, (line - from) / (to - from))) : 0;
        done += sections[at].words * within;
      }
      root?.style.setProperty('--at', String(done / total));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    read();
    document.fonts.ready.then(onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [sections, total]);

  if (sections.length < 2) return null;

  const shown = peek ?? (current >= 0 ? current : 0);
  const minutes = (words: number) => {
    const m = words / 200;
    return m < 0.75 ? 'under a minute' : `${Math.round(m)} min`;
  };

  return (
    <nav ref={ref} className={styles.profile} aria-label="Sections of this sheet" data-lens-skip>
      <header className={styles.head}>
        <span className={styles.headTitle}>Section through this sheet</span>
        <span className={styles.headMeta}>
          {sections.length} sections · {readingTime} min
        </span>
      </header>

      <ol className={styles.strip} onMouseLeave={() => setPeek(null)}>
        {sections.map((section, i) => (
          <li
            key={section.id}
            className={styles.cell}
            style={{ flexGrow: Math.max(section.words, total * 0.05) }}
          >
            <button
              type="button"
              className={styles.segment}
              data-state={i === current ? 'on' : i < current ? 'done' : undefined}
              aria-current={i === current ? 'location' : undefined}
              onClick={() => jump(section.id)}
              onMouseEnter={() => setPeek(i)}
              onFocus={() => setPeek(i)}
              onBlur={() => setPeek(null)}
            >
              <span className={styles.segNo} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="u-visually-hidden">
                Section {i + 1}: {section.title}
              </span>
            </button>
          </li>
        ))}
        <span className={styles.cursor} aria-hidden="true" />
      </ol>

      <p className={styles.readout} aria-hidden="true">
        <span className={styles.readoutNo}>{String(shown + 1).padStart(2, '0')}</span>
        <span className={styles.readoutTitle}>{sections[shown].title}</span>
        <span className={styles.readoutMeta}>
          {sections[shown].words} words · {minutes(sections[shown].words)}
        </span>
      </p>

      {/* The same sections, keyed down the margin of a wide board. */}
      <div className={styles.rail} aria-hidden="true">
        <ol className={styles.outline}>
          <li className={styles.outlineHead}>Contents</li>
          {sections.map((section, i) => (
            <li key={section.id}>
              <button
                type="button"
                tabIndex={-1}
                className={styles.outlineItem}
                data-state={i === current ? 'on' : i < current ? 'done' : undefined}
                onClick={() => jump(section.id)}
              >
                <span className={styles.outlineNo}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.outlineTitle}>{section.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
