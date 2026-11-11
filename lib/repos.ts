/**
 * Repositories that do not have a full sheet, printed as cards on W-400.
 * Public ones link to GitHub; private ones are described and never linked.
 * Every line here is from the repository itself; add nothing it cannot show.
 */
export interface RepoCard {
  name: string;
  /** The repository's own name, as data/stack.json records it; drives the A-102 trace link. */
  repo: string;
  line: string;
  shows: string;
  stack: string;
  /** Omitted for private repositories. */
  href?: string;
}

export const REPO_CARDS: RepoCard[] = [
  {
    name: 'Vigilix',
    repo: 'Vigilix',
    line: 'A live multi-camera video wall: RTSP ingest, YOLO overlays, incident alerts, a patrol view and multi-tenant licensing.',
    shows: 'Vision as a multi-tenant product',
    stack: 'Python · TypeScript · YOLO · RTSP',
    href: 'https://github.com/ax5hay/Vigilix',
  },
  {
    name: 'DADM',
    repo: 'DADM-Aiximius',
    line: 'A distributed defensive-AI mesh: on-device anomaly detection in a Rust agent, encrypted federated updates, a Neo4j ontology. Offline-first, zero-trust, air-gap capable.',
    shows: 'Security architecture at the edge',
    stack: 'Rust · Neo4j · federated learning',
    href: 'https://github.com/ax5hay/DADM-Aiximius',
  },
  {
    name: 'MirrorState',
    repo: 'MirrorState',
    line: 'A behavioural enforcement system built on operational evidence instead of self-report.',
    shows: 'Product thinking with a point of view',
    stack: 'Next.js 15 · Fastify · Prisma · BullMQ · Socket.IO',
    href: 'https://github.com/ax5hay/MirrorState',
  },
  {
    name: 'GHDA-SaaS',
    repo: 'GHDA-SaaS',
    line: 'Turns messy Hinglish and Roman-Hindi health survey reports into structured JSON, gap analysis and compliance insight.',
    shows: 'Schema-first microservices for government data',
    stack: 'Python · TypeScript · microservices',
    href: 'https://github.com/ax5hay/GHDA-SaaS',
  },
  {
    name: 'JobSlave',
    repo: 'JobSlave',
    line: 'Queue roles once; a local LLM answers the screening questions while Playwright applies end to end.',
    shows: 'Local-only LLM automation',
    stack: 'TypeScript · Playwright · local LLM',
    href: 'https://github.com/ax5hay/JobSlave',
  },
  {
    name: 'OCR-LLM-DIST',
    repo: 'OCR-LLM-DIST',
    line: 'Document chat that never leaves the machine, on Ollama or LM Studio.',
    shows: 'Private RAG, deployable in Docker',
    stack: 'OCR · Ollama · LM Studio · Docker',
    href: 'https://github.com/ax5hay/OCR-LLM-DIST',
  },
  {
    name: 'TracePulse',
    repo: 'TracePulse',
    line: 'One decorator for execution tracing in sync and async Python.',
    shows: 'A small library done properly',
    stack: 'Python · asyncio',
    href: 'https://github.com/ax5hay/TracePulse',
  },
  {
    name: 'shelf',
    repo: 'shelf',
    line: 'An offline-first family reading server, with decision records and a runbook.',
    shows: 'Range beyond Python and TypeScript',
    stack: 'ASP.NET Core · Angular',
  },
];
