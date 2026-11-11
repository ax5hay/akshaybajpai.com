'use client';

import { useState } from 'react';
import styles from './CareerElevation.module.css';

/**
 * The career, as an elevation the reader can operate.
 *
 * Each kind of work is a volume standing on the datum, drawn taller than the
 * one before. Selecting a volume reads it out. All six are in the markup, so without script, and on paper, the
 * elevation is followed by the full chronology in order.
 */

interface Role {
  from: number;
  to: number;
  height: number;
  role: string;
  context: string;
  description: string;
}

/* Oldest first: the order they stand in along the datum. Each volume is a
   kind of work. No job titles, employers or years: the work carries it. The
   spans only set each volume's width. */
const ROLES: Role[] = [
  {
    from: 2021,
    to: 2023,
    height: 46,
    role: 'MSc in Artificial Intelligence',
    context: 'Research · with distinction',
    description:
      "Graduated with distinction (9.8/10). The thesis benchmarked nine machine learning models for Alzheimer's classification on longitudinal biomarkers.",
  },
  {
    from: 2023,
    to: 2025,
    height: 70,
    role: 'Insurance document AI',
    context: 'Extraction and underwriting on AWS',
    description:
      'Document intelligence on AWS Bedrock (Claude, LayoutLMv3) at 95%+ extraction accuracy and 10K+ queries a day. Underwriting efficiency up 78%.',
  },
  {
    from: 2025,
    to: 2025.45,
    height: 90,
    role: 'A restaurant platform',
    context: 'Forecasting and event pipelines',
    description:
      'The AI and full-stack engineering, and the team of eight that built it. Forecasting validated across 200+ restaurants cut food waste 32%; event pipelines carry 2M+ events a day under 100 ms.',
  },
  {
    from: 2025.45,
    to: 2026,
    height: 108,
    role: 'Finance and healthcare AI',
    context: 'Agents and clinical pipelines',
    description:
      'LangGraph finance agents with 60% fewer manual touchpoints. Multimodal clinical pipelines on QLoRA-tuned open models in HIPAA- and GDPR-compliant AWS: 94% precision, inference cost down 80%, under 800 ms at p95.',
  },
  {
    from: 2026,
    to: 2026.4,
    height: 124,
    role: 'Defence video intelligence',
    context: 'Government defence deployments',
    description:
      'An agentic platform over round-the-clock CCTV on air-gapped hardware: LangGraph and MCP agents triage and escalate, Kafka feeds the inference. Analyst intervention down 70%; under 200 ms from ingestion to decision.',
  },
  {
    from: 2026.4,
    to: 2026.9,
    height: 142,
    role: 'Multi-tenant health AI',
    context: 'Forward-deployed, several programmes at once',
    description:
      'Lead engineer and the main technical voice to product and executive teams: a governed natural-language-to-SQL agent, three coordinated assistants and the shared LLM layer under them, on AWS CDK. Reporting rebuilt on 8,000+ approved columns across 193 tables.',
  },
];

const X0 = 2021;
const X1 = 2026.9;
const W = 620;
const GROUND = 176;
const x = (year: number) => +(24 + ((year - X0) / (X1 - X0)) * (W - 48)).toFixed(1);

function hatch(left: number, right: number): string {
  let d = '';
  for (let i = left - 8; i < right; i += 9) d += `M${Math.max(left, i)} ${GROUND + (i < left ? left - i : 0)}L${Math.min(right, i + 8)} ${GROUND + Math.min(8, right - i)}`;
  return d;
}

export function CareerElevation() {
  const [at, setAt] = useState(ROLES.length - 1);
  const role = ROLES[at];

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    setAt((i) => Math.min(ROLES.length - 1, Math.max(0, i + step)));
  };

  return (
    <figure className={styles.figure}>
      <div className={styles.field}>
        <svg viewBox={`0 0 ${W} 214`} className={styles.svg} role="group" aria-label="Career, in elevation">
          <path d={`M12 ${GROUND}H${W - 12}`} className={styles.ground} />
          <path d={hatch(12, W - 12)} className={styles.hatch} />

          {ROLES.map((r, i) => {
            const left = x(r.from);
            const right = x(r.to);
            const top = GROUND - r.height;
            let floors = '';
            for (let y = GROUND - 14; y > top + 5; y -= 14) floors += `M${left} ${y}H${right}`;
            return (
              <g
                key={r.role}
                className={styles.volume}
                data-on={i === at || undefined}
                role="button"
                tabIndex={i === at ? 0 : -1}
                aria-label={`${i + 1} of ${ROLES.length}: ${r.role}, ${r.context}`}
                aria-pressed={i === at}
                onClick={() => setAt(i)}
                onMouseEnter={() => setAt(i)}
                onFocus={() => setAt(i)}
                onKeyDown={onKeyDown}
              >
                {/* A generous target: the narrowest roles are a few units wide. */}
                <rect x={left - 2} y={8} width={right - left + 4} height={GROUND - 8} className={styles.hit} />
                <path d={floors} className={styles.floors} />
                <path d={`M${left} ${GROUND}V${top}H${right}V${GROUND}`} className={styles.outline} />
              </g>
            );
          })}

          {/* Level mark on the selected role, read off to the right. */}
          <g className={styles.level} style={{ transform: `translateY(${GROUND - role.height}px)` }}>
            <path d={`M${x(role.to)} 0H${W - 12}`} />
            <path d={`M${W - 30} 0l6 -7h-12z`} className={styles.levelMark} />
          </g>

        </svg>
      </div>

      <ol className={styles.roles}>
        {ROLES.map((r, i) => (
          <li key={r.role} className={styles.role} data-on={i === at || undefined}>
            <span className={styles.roleYear}>{String(i + 1).padStart(2, '0')}</span>
            <h3 className={styles.roleTitle}>{r.role}</h3>
            <span className={styles.roleContext}>{r.context}</span>
            <p className={styles.roleText}>{r.description}</p>
          </li>
        ))}
      </ol>

      <div className={styles.stepper}>
        <button type="button" onClick={() => setAt((i) => Math.max(0, i - 1))} disabled={at === 0}>
          ← Earlier
        </button>
        <span aria-hidden="true">
          {String(at + 1).padStart(2, '0')} / {String(ROLES.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={() => setAt((i) => Math.min(ROLES.length - 1, i + 1))}
          disabled={at === ROLES.length - 1}
        >
          Later →
        </button>
      </div>

      <figcaption className={styles.caption}>
        <span className={styles.captionNo}>Fig. 1</span>
        The record as an elevation. Choose a volume to read what the work was; each stands on
        the one before.
      </figcaption>
    </figure>
  );
}
