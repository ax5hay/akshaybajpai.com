'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { AtmosphereCanvas } from './AtmosphereCanvas';
import { KineticText } from './KineticText';
import { SiteDock } from './SiteDock';
import { useExperienceMotion } from './useExperienceMotion';
import styles from './ExperienceHome.module.css';

export interface WritingEntry {
  slug: string;
  title: string;
  description: string;
  href: string;
  kind: 'essay' | 'blog' | 'work';
  date: string;
}

interface Props {
  entries: WritingEntry[];
}

const KIND_LABEL: Record<WritingEntry['kind'], string> = {
  essay: 'Essay',
  blog: 'Blog',
  work: 'Work',
};

export function ExperienceHome({ entries }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  useExperienceMotion(rootRef);

  return (
    <div className={styles.world}>
      <AtmosphereCanvas />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />

      <svg className={styles.thread} viewBox="0 0 120 2400" preserveAspectRatio="none" aria-hidden="true">
        <path
          data-home="thread"
          d="M60 0 C 20 200, 100 400, 60 600 S 10 1000, 60 1200 S 110 1600, 60 1800 S 15 2200, 60 2400"
          fill="none"
          stroke="url(#threadGrad)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
        <defs>
          <linearGradient id="threadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(42 55% 55% / 0.15)" />
            <stop offset="40%" stopColor="hsl(42 55% 55% / 0.55)" />
            <stop offset="100%" stopColor="hsl(172 50% 55% / 0.35)" />
          </linearGradient>
        </defs>
      </svg>

      <main ref={rootRef} className={styles.main}>
        <section className={styles.hero} data-home="hero">
          <div className={styles.rings} aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={styles.ring}
                data-home="ring"
                style={{ width: `${88 - i * 16}%`, height: `${88 - i * 16}%`, opacity: 0.12 - i * 0.02 }}
              />
            ))}
          </div>

          <p className={styles.eyebrow} data-home="hero-in">
            The Architecture of Intelligence
          </p>
          <h1 className={styles.title} data-home="hero-title">
            <KineticText text="Akshay" as="span" className={styles.titleWord} dataExp="hero-char" />
            <KineticText text="Bajpai" as="span" className={styles.titleWord} dataExp="hero-char" />
          </h1>
          <p className={styles.lede} data-home="hero-in">
            AI Architect · Systems Builder · Published Researcher
          </p>
        </section>

        <section className={styles.manifesto}>
          <svg className={styles.rays} viewBox="0 0 600 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
              <linearGradient id="rayFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(96 60% 70% / 0.25)" />
                <stop offset="100%" stopColor="hsl(96 40% 50% / 0)" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                data-home="ray"
                d={`M${260 + i * 18} 0 L${180 + i * 32} 800 L${300 + i * 10} 800 Z`}
                fill="url(#rayFill)"
                opacity={0.08}
              />
            ))}
          </svg>

          <div className={styles.manifestoPanel} data-home="reveal">
            <p className={styles.manifestoText}>
              I design AI systems with the same discipline as architecture — clear structure,
              honest constraints, room for ideas to breathe. Every layer earns its place.
              Performance is not polish; it is the foundation everything else stands on.
            </p>
          </div>
        </section>

        <section className={styles.writing} data-home="writing">
          <header className={styles.writingHead} data-home="reveal">
            <h2 className={styles.sectionTitle}>Recent writing &amp; work</h2>
            <p className={styles.sectionLead}>
              Essays, case studies, and dispatches from building intelligence at scale.
            </p>
          </header>

          <ul className={styles.entries}>
            {entries.map((entry) => (
              <li key={entry.href}>
                <Link href={entry.href} className={styles.entry} data-home="entry">
                  <span className={styles.entryMeta}>
                    <span className={styles.entryKind}>{KIND_LABEL[entry.kind]}</span>
                    <time className={styles.entryDate} dateTime={entry.date}>
                      {new Date(entry.date).toLocaleDateString('en-GB', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </span>
                  <span className={styles.entryTitle}>{entry.title}</span>
                  <span className={styles.entryDesc}>{entry.description}</span>
                  <span className={styles.entryArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.closing} data-home="reveal">
          <p className={styles.closingText}>
            Building systems where trust, latency, and clarity are non-negotiable.
          </p>
          <div className={styles.closingActions}>
            <Link href="/about/" className={styles.textLink}>
              About
            </Link>
            <Link href="/contact/" className={styles.cta}>
              Get in touch
            </Link>
          </div>
        </section>
      </main>

      <SiteDock />
    </div>
  );
}
