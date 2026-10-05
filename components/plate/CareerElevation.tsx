'use client';

import { useState } from 'react';
import styles from './CareerElevation.module.css';

/**
 * The career, as an elevation the reader can operate.
 *
 * Each role is a volume standing on the datum, set out along the years it
 * ran and drawn taller than the one before. Selecting a volume reads out the
 * role. All six are in the markup, so without script, and on paper, the
 * elevation is followed by the full chronology in order.
 */

interface Role {
  from: number;
  to: number;
  height: number;
  year: string;
  role: string;
  context: string;
  description: string;
}

/* Oldest first: the order they stand in along the datum. */
const ROLES: Role[] = [
  {
    from: 2021,
    to: 2023,
    height: 46,
    year: '2021–2023',
    role: 'MSc Artificial Intelligence',
    context: 'Lviv Polytechnic National University',
    description:
      "Graduated with Distinction (9.8/10). Master's thesis on Alzheimer's disease classification benchmarking 9 machine learning models on longitudinal biomarkers.",
  },
  {
    from: 2023,
    to: 2025,
    height: 70,
    year: '2023–2025',
    role: 'Data Scientist II',
    context: 'Insurance · Document Intelligence',
    description:
      'Shipped document intelligence on AWS Bedrock (Claude, LayoutLMv3) achieving 95%+ extraction accuracy. Built ensemble underwriting models improving efficiency by 78%.',
  },
  {
    from: 2025,
    to: 2025.45,
    height: 90,
    year: '2025',
    role: 'Founding Engineer',
    context: 'Restaurant SaaS',
    description:
      'Validated demand forecasting across 200+ pilot sites using XGBoost and Prophet, reducing food waste by 32%. Scaled event-driven pipelines to process 2M+ events/day.',
  },
  {
    from: 2025.45,
    to: 2026,
    height: 108,
    year: '2025–2026',
    role: 'Senior AI Consultant',
    context: 'Finance & Healthcare',
    description:
      'Built stateful LangGraph finance workflows reducing manual touchpoints by 60%. Deployed multimodal clinical pipelines (QLoRA, hybrid RAG) on HIPAA-aware AWS, maintaining sub-800ms p95 latency.',
  },
  {
    from: 2026,
    to: 2026.4,
    height: 124,
    year: '2026',
    role: 'AI Lead',
    context: 'Defense-Adjacent · Video Intelligence',
    description:
      'Architected an agentic video-intelligence platform over 24/7 CCTV using LangGraph and MCP, cutting analyst intervention by ~70%. Engineered Kafka ingestion for sub-200ms latency on air-gapped infrastructure.',
  },
  {
    from: 2026.4,
    to: 2026.9,
    height: 142,
    year: '2026–Present',
    role: 'Lead Full-Stack AI Engineer',
    context: 'Forward Deployment · Multi-Tenant AI',
    description:
      'Owning roadmap-to-production across multiple client programs. Architecting shared LLM gateways, governed reporting agents, and Python microservices on AWS CDK. Delivering multi-tenant workflows that survive C-suite UAT.',
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
                key={r.year + r.role}
                className={styles.volume}
                data-on={i === at || undefined}
                role="button"
                tabIndex={i === at ? 0 : -1}
                aria-label={`${r.year}: ${r.role}, ${r.context}`}
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

          {[2021, 2023, 2025, 2026].map((year) => (
            <g key={year}>
              <path d={`M${x(year)} ${GROUND + 10}v6`} className={styles.tick} />
              <text x={x(year)} y={GROUND + 28} textAnchor="middle" className={styles.year}>
                {year}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <ol className={styles.roles}>
        {ROLES.map((r, i) => (
          <li key={r.year + r.role} className={styles.role} data-on={i === at || undefined}>
            <span className={styles.roleYear}>{r.year}</span>
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
        Elevation along the career datum. Choose a volume to read the role; each stands on the
        one before.
      </figcaption>
    </figure>
  );
}
