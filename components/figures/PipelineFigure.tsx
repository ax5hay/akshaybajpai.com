'use client';

import { useState } from 'react';
import styles from './PipelineFigure.module.css';

/**
 * AURIXA's request pipeline, as an operable schematic. Choosing a request
 * traces the path it takes through the services; every node, port and branch
 * is the one the case study describes, so the figure can be checked against
 * the text beside it.
 */

type NodeId = 'gateway' | 'orch' | 'router' | 'agent' | 'exec' | 'rag' | 'guard';

const NODES: Record<NodeId, { x: number; y: number; w: number; name: string; port: number }> = {
  gateway: { x: 60, y: 30, w: 110, name: 'Gateway', port: 3000 },
  orch: { x: 200, y: 30, w: 130, name: 'Orchestration', port: 8001 },
  router: { x: 360, y: 30, w: 110, name: 'LLM Router', port: 8002 },
  agent: { x: 60, y: 110, w: 130, name: 'Agent Runtime', port: 8003 },
  exec: { x: 220, y: 110, w: 130, name: 'Execution Engine', port: 8007 },
  rag: { x: 380, y: 110, w: 130, name: 'RAG Service', port: 8004 },
  guard: { x: 220, y: 180, w: 130, name: 'Guardrails', port: 8005 },
};

const EDGES = {
  in: 'M32 45H60',
  gatewayOrch: 'M170 45H200',
  orchRouter: 'M330 45H360',
  routerAgent: 'M415 60V85H125V110',
  routerRag: 'M415 60V85H445V110',
  agentExec: 'M190 125H220',
  execGuard: 'M285 140V180',
  ragGuard: 'M445 140V160H310V180',
  out: 'M350 195H398',
} as const;

type EdgeId = keyof typeof EDGES;

interface Request {
  id: string;
  label: string;
  says: string;
  nodes: NodeId[];
  edges: EdgeId[];
  escalates: boolean;
  note: string;
}

const COMMON: EdgeId[] = ['in', 'gatewayOrch', 'orchRouter'];

const REQUESTS: Request[] = [
  {
    id: 'agent',
    label: 'Book an appointment',
    says: '“Can I see someone on Thursday?”',
    nodes: ['gateway', 'orch', 'router', 'agent', 'exec', 'guard'],
    edges: [...COMMON, 'routerAgent', 'agentExec', 'execGuard', 'out'],
    escalates: false,
    note: 'Agent branch. The execution engine reads and writes tenant-scoped rows, so the answer is a real slot.',
  },
  {
    id: 'rag',
    label: 'Ask about cover',
    says: '“Is physiotherapy covered on my plan?”',
    nodes: ['gateway', 'orch', 'router', 'rag', 'guard'],
    edges: [...COMMON, 'routerRag', 'ragGuard', 'out'],
    escalates: false,
    note: 'RAG branch. Hybrid BM25 and vector retrieval over the tenant’s own knowledge articles.',
  },
  {
    id: 'flag',
    label: 'Mention chest pain',
    says: '“I’ve had chest pain since this morning.”',
    nodes: ['gateway', 'orch', 'router', 'rag', 'guard'],
    edges: [...COMMON, 'routerRag', 'ragGuard', 'out'],
    escalates: true,
    note: 'Same path, different exit. Guardrails sets requires_escalation instead of letting the model play clinician.',
  },
];

export function PipelineFigure() {
  const [active, setActive] = useState(0);
  const request = REQUESTS[active];

  return (
    <figure className={styles.figure}>
      <div className={styles.picker} role="radiogroup" aria-label="Request to trace">
        {REQUESTS.map((r, i) => (
          <button
            key={r.id}
            type="button"
            role="radio"
            aria-checked={i === active}
            className={styles.pick}
            onClick={() => setActive(i)}
          >
            <span className={styles.pickNo}>{String(i + 1).padStart(2, '0')}</span>
            {r.label}
          </button>
        ))}
      </div>

      <div className={styles.field}>
        <svg viewBox="0 0 540 262" className={styles.svg} role="img" aria-label={`Path of the request: ${request.nodes.map((n) => NODES[n].name).join(', ')}`}>
          {/* Observability sits under every hop, whichever way the request goes. */}
          <rect x="60" y="232" width="450" height="18" className={styles.base} />
          <text x="285" y="244.5" textAnchor="middle" className={styles.baseText}>
            OBSERVABILITY CORE :8008 · TELEMETRY FROM EVERY HOP
          </text>

          {(Object.keys(EDGES) as EdgeId[]).map((id) => (
            <path
              key={id}
              d={EDGES[id]}
              className={styles.edge}
              data-on={request.edges.includes(id) || undefined}
            />
          ))}

          <circle cx="24" cy="45" r="8" className={styles.user} />
          <text x="24" y="68" textAnchor="middle" className={styles.port}>
            USER
          </text>

          {(Object.keys(NODES) as NodeId[]).map((id) => {
            const n = NODES[id];
            const on = request.nodes.includes(id);
            return (
              <g key={id} className={styles.node} data-on={on || undefined}>
                <rect x={n.x} y={n.y} width={n.w} height="30" />
                <text x={n.x + 9} y={n.y + 13} className={styles.name}>
                  {n.name.toUpperCase()}
                </text>
                <text x={n.x + 9} y={n.y + 24} className={styles.port}>
                  :{n.port}
                </text>
              </g>
            );
          })}

          <g className={styles.exit} data-escalated={request.escalates || undefined}>
            <rect x="398" y="180" width="112" height="30" />
            <text x="454" y="199" textAnchor="middle">
              {request.escalates ? 'ESCALATED' : 'RESPONSE'}
            </text>
          </g>
        </svg>
      </div>

      <div className={styles.readout} aria-live="polite">
        <p className={styles.says}>{request.says}</p>
        <p className={styles.path}>
          {request.nodes.map((n) => `${NODES[n].name} :${NODES[n].port}`).join('  ›  ')}
        </p>
        <p className={styles.flags}>
          <span>{request.nodes.length} services</span>
          <span data-hot={request.escalates || undefined}>
            requires_escalation: {String(request.escalates)}
          </span>
        </p>
        <p className={styles.note}>{request.note}</p>
      </div>

      <figcaption className={styles.caption}>
        <span className={styles.captionNo}>Fig. 1</span>
        Choose a request. The path it takes is traced through the services named in the
        architecture section below.
      </figcaption>
    </figure>
  );
}
