/**
 * Operable schematics, one per case study, keyed by slug.
 *
 * Each is a small node-and-wire drawing on a 540-unit-wide field plus the
 * scenarios a reader can trace through it. Everything named here comes from
 * the case study it belongs to: the stages, the branches, the outcomes. Where
 * a study gives a figure (a port, a row count, a threshold it calls out) the
 * schematic repeats it; where it does not, the schematic does not supply one.
 *
 * Nodes sit on a loose three-column, three-row grid. Wires are authored paths,
 * not routed, for the same reason the key plan's rectangles are: a drawing
 * this small is composed, and an autorouter would not compose it.
 */

export interface SchematicNode {
  x: number;
  y: number;
  /** Width in units; 130 unless stated. Every node is 30 tall. */
  w?: number;
  name: string;
  /** Second line: a port, a tool, a count. */
  sub?: string;
}

export interface SchematicScenario {
  /** Button label. */
  label: string;
  /** What the scenario is, in the reader's terms. */
  says: string;
  nodes: string[];
  edges: string[];
  /** Label for the outcome box. */
  exit?: string;
  /** The outcome is the loud one: an escalation, a refusal. */
  hot?: boolean;
  /** Short facts printed under the path. The last is accented when `hot`. */
  flags: string[];
  note: string;
}

export interface SchematicSpec {
  /** Accessible name for the scenario picker. */
  pick: string;
  caption: string;
  nodes: Record<string, SchematicNode>;
  edges: Record<string, string>;
  scenarios: SchematicScenario[];
  /** Where a request enters. Top-left by default. */
  input?: { x: number; y: number; label: string };
  /** Outcome box. Bottom-right by default; `null` for none. */
  exit?: { x: number; y: number; w: number } | null;
  /** A layer drawn under everything, when the study has one. */
  base?: string;
  /** Print each node's second line in the path readout too. */
  pathWithSub?: boolean;
}

/* Wires that recur between the standard grid positions. */
const IN = 'M32 45H60';
const R1_AB = 'M190 45H220';
const R1_BC = 'M350 45H380';
const R2_DE = 'M190 125H220';
const R2_EF = 'M350 125H380';
const C_DOWN_F = 'M445 60V110';
const B_DOWN_E = 'M285 60V110';
const A_DOWN_D = 'M125 60V110';
const E_DOWN_G = 'M285 140V180';
const G_EXIT = 'M350 195H398';

/* Standard grid positions. */
const A = { x: 60, y: 30 };
const B = { x: 220, y: 30 };
const C = { x: 380, y: 30 };
const D = { x: 60, y: 110 };
const E = { x: 220, y: 110 };
const F = { x: 380, y: 110 };
const G = { x: 220, y: 180 };

export const SCHEMATICS: Record<string, SchematicSpec> = {
  /* ------------------------------------------------------------ AURIXA --- */
  'aurixa-conversational-ai-orchestration': {
    pick: 'Request to trace',
    caption:
      'Choose a request. The path it takes is traced through the services and ports this section names.',
    base: 'OBSERVABILITY CORE :8008 · TELEMETRY FROM EVERY HOP',
    pathWithSub: true,
    nodes: {
      gateway: { x: 60, y: 30, w: 110, name: 'Gateway', sub: ':3000' },
      orch: { x: 200, y: 30, name: 'Orchestration', sub: ':8001' },
      router: { x: 360, y: 30, w: 110, name: 'LLM Router', sub: ':8002' },
      agent: { ...D, name: 'Agent Runtime', sub: ':8003' },
      exec: { ...E, name: 'Execution Engine', sub: ':8007' },
      rag: { ...F, name: 'RAG Service', sub: ':8004' },
      guard: { ...G, name: 'Guardrails', sub: ':8005' },
    },
    edges: {
      in: IN,
      gatewayOrch: 'M170 45H200',
      orchRouter: 'M330 45H360',
      routerAgent: 'M415 60V85H125V110',
      routerRag: 'M415 60V85H445V110',
      agentExec: R2_DE,
      execGuard: E_DOWN_G,
      ragGuard: 'M445 140V160H310V180',
      out: G_EXIT,
    },
    scenarios: [
      {
        label: 'Book an appointment',
        says: '“Can I see someone on Thursday?”',
        nodes: ['gateway', 'orch', 'router', 'agent', 'exec', 'guard'],
        edges: ['in', 'gatewayOrch', 'orchRouter', 'routerAgent', 'agentExec', 'execGuard', 'out'],
        exit: 'RESPONSE',
        flags: ['6 services', 'requires_escalation: false'],
        note: 'Agent branch. The execution engine reads and writes tenant-scoped rows, so the answer is a real slot.',
      },
      {
        label: 'Ask about cover',
        says: '“Is physiotherapy covered on my plan?”',
        nodes: ['gateway', 'orch', 'router', 'rag', 'guard'],
        edges: ['in', 'gatewayOrch', 'orchRouter', 'routerRag', 'ragGuard', 'out'],
        exit: 'RESPONSE',
        flags: ['5 services', 'requires_escalation: false'],
        note: 'RAG branch. Hybrid BM25 and vector retrieval over the tenant’s own knowledge articles.',
      },
      {
        label: 'Mention chest pain',
        says: '“I’ve had chest pain since this morning.”',
        nodes: ['gateway', 'orch', 'router', 'rag', 'guard'],
        edges: ['in', 'gatewayOrch', 'orchRouter', 'routerRag', 'ragGuard', 'out'],
        exit: 'ESCALATED',
        hot: true,
        flags: ['5 services', 'requires_escalation: true'],
        note: 'Same path, different exit. Guardrails sets requires_escalation instead of letting the model play clinician.',
      },
    ],
  },

  /* --------------------------------------------- Forward-deployed NL2SQL --- */
  'forward-deployed-multi-tenant-fertility-ai': {
    pick: 'Reporting question to trace',
    caption:
      'The governed NL-to-SQL agent. Choose a question; whatever path it takes, nothing runs until a person confirms it.',
    input: { x: 24, y: 45, label: 'ADMIN' },
    nodes: {
      route: { ...A, name: 'Schema routing', sub: '8000+ approved columns' },
      intent: { ...B, name: 'Intent classification' },
      disambig: { ...C, name: 'Disambiguation', sub: 'under-specified joins' },
      preview: { ...E, name: 'Query preview' },
      confirm: { ...F, name: 'Human confirmation', sub: 'mandatory' },
      run: { ...G, name: 'Audited execution' },
    },
    edges: {
      in: IN,
      routeIntent: R1_AB,
      intentDisambig: R1_BC,
      intentPreview: B_DOWN_E,
      disambigPreview: 'M445 60V85H310V110',
      previewConfirm: R2_EF,
      confirmRun: 'M445 140V160H310V180',
      runOut: G_EXIT,
      refuse: 'M478 140V180',
    },
    scenarios: [
      {
        label: 'A clear question',
        says: 'A question whose tables and joins are unambiguous.',
        nodes: ['route', 'intent', 'preview', 'confirm', 'run'],
        edges: ['in', 'routeIntent', 'intentPreview', 'previewConfirm', 'confirmRun', 'runOut'],
        exit: 'RESULT',
        flags: ['previewed before running', 'executed after confirmation'],
        note: 'Even the easy case stops at a person. The confirm step is the product, not friction on top of it.',
      },
      {
        label: 'An ambiguous join',
        says: 'A multi-join question where a wrong table choice would look plausible.',
        nodes: ['route', 'intent', 'disambig', 'preview', 'confirm', 'run'],
        edges: [
          'in',
          'routeIntent',
          'intentDisambig',
          'disambigPreview',
          'previewConfirm',
          'confirmRun',
          'runOut',
        ],
        exit: 'RESULT',
        flags: ['disambiguated first', 'executed after confirmation'],
        note: 'The agent asks which join was meant instead of guessing, then shows the query it would run.',
      },
      {
        label: 'Operator declines',
        says: 'The preview is not what the operator meant.',
        nodes: ['route', 'intent', 'preview', 'confirm'],
        edges: ['in', 'routeIntent', 'intentPreview', 'previewConfirm', 'refuse'],
        exit: 'NOT EXECUTED',
        hot: true,
        flags: ['previewed before running', 'executed: never'],
        note: 'No confirmation, no execution. There is no path from a question to the database that skips this box.',
      },
    ],
  },

  /* ------------------------------------------------- Video intelligence --- */
  'agentic-video-intelligence-operations': {
    pick: 'Event to trace',
    caption:
      'Choose what a camera sees. Triage is a graph with state, so a routine frame and an incident leave by different doors.',
    input: { x: 24, y: 45, label: 'FEED' },
    base: 'LANGGRAPH + MCP · PERSISTENT MEMORY AND TOOL USE ACROSS STEPS',
    nodes: {
      ingest: { ...A, name: 'Kafka ingestion', sub: 'asynchronous inference' },
      detect: { ...B, name: 'Detection agent' },
      classify: { ...C, name: 'Event classification' },
      stream: { ...D, name: 'WebSocket stream', sub: 'live dashboard' },
      escalate: { ...E, name: 'Alert escalation', sub: 'operational playbooks' },
    },
    edges: {
      in: IN,
      ingestDetect: R1_AB,
      detectClassify: R1_BC,
      classifyEscalate: 'M425 60V85H285V110',
      escalateStream: 'M220 125H190',
      streamOut: 'M125 140V195H398',
      routine: 'M478 60V180',
    },
    scenarios: [
      {
        label: 'Nothing of note',
        says: 'An ordinary frame on an ordinary feed.',
        nodes: ['ingest', 'detect', 'classify'],
        edges: ['in', 'ingestDetect', 'detectClassify', 'routine'],
        exit: 'NO ALERT',
        flags: ['no analyst involved'],
        note: 'This is most of the footage, and it is the part that used to burn analysts out. It is classified and let go.',
      },
      {
        label: 'An incident',
        says: 'Something on a feed that the playbook says a person must see.',
        nodes: ['ingest', 'detect', 'classify', 'escalate', 'stream'],
        edges: [
          'in',
          'ingestDetect',
          'detectClassify',
          'classifyEscalate',
          'escalateStream',
          'streamOut',
        ],
        exit: 'ANALYST ALERTED',
        hot: true,
        flags: ['sub-200ms ingestion to decision', 'escalated per playbook'],
        note: 'The hot path. The decision reaches the dashboard over a WebSocket while the event is still happening.',
      },
      {
        label: 'On an air-gapped site',
        says: 'The same incident, on infrastructure with no route out.',
        nodes: ['ingest', 'detect', 'classify', 'escalate', 'stream'],
        edges: [
          'in',
          'ingestDetect',
          'detectClassify',
          'classifyEscalate',
          'escalateStream',
          'streamOut',
        ],
        exit: 'ANALYST ALERTED',
        hot: true,
        flags: ['self-contained inference stack', 'outbound cloud calls: none'],
        note: 'Identical graph. Models and brokers are packaged to run on-premise, so nothing in the path assumes a cloud control plane.',
      },
    ],
  },

  /* --------------------------------------------------------------- AIDA --- */
  'aida-health-programme-intelligence': {
    pick: 'What a programme officer asks for',
    caption:
      'Choose a request. Whichever engine answers it, the numbers are computed behind the API and the web app only displays them.',
    input: { x: 24, y: 45, label: 'ROWS' },
    base: 'THE UI NEVER OPENS A DATABASE CONNECTION',
    nodes: {
      pg: { ...A, name: 'PostgreSQL', sub: 'monthly assessments' },
      prisma: { ...B, name: 'Prisma', sub: '@aida/db' },
      api: { ...C, name: 'Nest API' },
      analytics: { ...D, name: 'analytics-engine', sub: 'rates · validation' },
      ml: { ...E, name: 'ml-engine', sub: 'correlations · z-scores' },
      ai: { ...F, name: 'ai-engine', sub: 'optional narratives' },
      web: { ...G, name: 'Next.js' },
    },
    edges: {
      in: IN,
      pgPrisma: R1_AB,
      prismaApi: R1_BC,
      apiAnalytics: 'M425 60V85H125V110',
      apiMl: 'M425 60V85H285V110',
      apiAi: 'M425 60V110',
      analyticsWeb: 'M125 140V195H220',
      mlWeb: E_DOWN_G,
      aiWeb: 'M445 140V160H310V180',
      out: G_EXIT,
    },
    scenarios: [
      {
        label: 'A screening rate',
        says: 'HIV tested, as a share of everyone registered for ANC, for one district and period.',
        nodes: ['pg', 'prisma', 'api', 'analytics', 'web'],
        edges: ['in', 'pgPrisma', 'prismaApi', 'apiAnalytics', 'analyticsWeb', 'out'],
        exit: 'BRIEFING FIGURE',
        flags: ['deterministic', 'model involved: no'],
        note: 'Policy-grade math. The rate is defined once, in the analytics engine, and nowhere else.',
      },
      {
        label: 'An anomaly check',
        says: 'Which facilities’ delivery metrics are out of line this month?',
        nodes: ['pg', 'prisma', 'api', 'ml', 'web'],
        edges: ['in', 'pgPrisma', 'prismaApi', 'apiMl', 'mlWeb', 'out'],
        exit: 'FLAGGED FACILITIES',
        flags: ['exploratory statistics', 'kept apart from headline rates'],
        note: 'Correlations and z-score flags are labelled as exploratory, so an officer knows which numbers they can defend.',
      },
      {
        label: 'A narrated summary',
        says: 'The same overview, explained in prose for a briefing.',
        nodes: ['pg', 'prisma', 'api', 'analytics', 'ai', 'web'],
        edges: ['in', 'pgPrisma', 'prismaApi', 'apiAnalytics', 'apiAi', 'aiWeb', 'out'],
        exit: 'NARRATIVE',
        flags: ['model receives counts, not patient lists', 'the model explains; it does not count'],
        note: 'The model is handed the JSON the API already computed. It can describe the numbers; it has no way to make new ones.',
      },
    ],
  },

  /* ---------------------------------------------------- Alzheimer's thesis --- */
  'alzheimers-ml-thesis-research': {
    pick: 'Missing-value strategy',
    caption:
      'The thesis pipeline. Choose how missing socioeconomic status is handled; it is a scientific choice, and it changes the result.',
    input: { x: 24, y: 45, label: 'OASIS' },
    nodes: {
      select: { ...A, name: 'First visit only', sub: '150 subjects' },
      encode: { ...B, name: 'Encode', sub: 'binary gender + label' },
      missing: { ...C, name: 'Missing SES' },
      drop: { ...D, name: 'Drop rows', sub: 'strategy A · 8 rows' },
      impute: { ...E, name: 'Median impute', sub: 'strategy B · by EDUC' },
      split: { ...G, name: 'Scale and split', sub: '75/25 · 5-fold CV' },
    },
    edges: {
      in: IN,
      selectEncode: R1_AB,
      encodeMissing: R1_BC,
      missingDrop: 'M445 60V85H125V110',
      missingImpute: 'M445 60V85H285V110',
      dropSplit: 'M125 140V195H220',
      imputeSplit: E_DOWN_G,
      out: G_EXIT,
    },
    scenarios: [
      {
        label: 'Complete cases',
        says: 'Strategy A: drop the rows where SES is missing.',
        nodes: ['select', 'encode', 'missing', 'drop', 'split'],
        edges: ['in', 'selectEncode', 'encodeMissing', 'missingDrop', 'dropSplit', 'out'],
        exit: '9 MODELS',
        flags: ['8 rows removed', 'random_state=0'],
        note: 'Nothing is invented, at the cost of a smaller sample from an already small cohort.',
      },
      {
        label: 'Imputation',
        says: 'Strategy B: fill missing SES with the median for that education level.',
        nodes: ['select', 'encode', 'missing', 'impute', 'split'],
        edges: ['in', 'selectEncode', 'encodeMissing', 'missingImpute', 'imputeSplit', 'out'],
        exit: '9 MODELS',
        flags: ['all subjects kept', 'random_state=0'],
        note: 'Every subject stays in. The two strategies gave materially different results, which is why both are documented.',
      },
    ],
  },

  /* ---------------------------------------------------------- Clinical NLP --- */
  'clinical-nlp-ehr-extraction': {
    pick: 'How far a document goes',
    caption:
      'Choose how far a clinical narrative is taken: to structured variables, or on to a risk score.',
    input: { x: 24, y: 45, label: 'NOTE' },
    exit: { x: 220, y: 180, w: 130 },
    nodes: {
      ner: { ...A, name: 'Clinical NER', sub: 'BioBERT · spaCy' },
      vars: { ...B, name: 'Structured variables', sub: '47+ per document' },
      risk: { ...C, name: 'Risk scoring', sub: 'RF · boosting · SVM' },
    },
    edges: {
      in: IN,
      nerVars: R1_AB,
      varsRisk: R1_BC,
      varsOut: 'M285 60V180',
      riskOut: 'M445 60V195H350',
    },
    scenarios: [
      {
        label: 'Extract',
        says: 'A progress note, discharge summary or imaging report, abstracted into fields.',
        nodes: ['ner', 'vars'],
        edges: ['in', 'nerVars', 'varsOut'],
        exit: 'STRUCTURED RECORD',
        flags: ['91.5% extraction accuracy', '5K+ documents a day'],
        note: 'What manual abstraction could do for a few charts a day, done for every document that arrives.',
      },
      {
        label: 'Extract and score',
        says: 'The same document, carried through to a risk score for triage.',
        nodes: ['ner', 'vars', 'risk'],
        edges: ['in', 'nerVars', 'varsRisk', 'riskOut'],
        exit: 'TRIAGE SCORE',
        flags: ['5K+ patient records scored a day'],
        note: 'Supervised models score on the extracted variables, so the score is only as defensible as each variable’s definition.',
      },
    ],
  },

  /* -------------------------------------------------- Insurance documents --- */
  'insurance-document-intelligence-aws': {
    pick: 'Document and task',
    caption:
      'Choose a document and what is wanted from it. Language models extract and answer; gradient boosting decides.',
    input: { x: 24, y: 85, label: 'PDF' },
    nodes: {
      ocr: { ...A, name: 'Textract + Tika', sub: 'OCR, high volume' },
      layout: { ...D, name: 'LayoutLMv3', sub: 'layout-aware' },
      retrieve: { ...B, name: 'Hybrid retrieval', sub: 'reranked · Bedrock' },
      llm: { ...C, name: 'Multimodal LLM', sub: 'Claude · GPT-4 Vision' },
      features: { ...E, name: 'Structured features' },
      boost: { ...G, name: 'Boosted ensemble', sub: 'LightGBM, CatBoost, XGB' },
    },
    edges: {
      inOcr: 'M32 85H44V45H60',
      inLayout: 'M32 85H44V125H60',
      ocrRetrieve: R1_AB,
      layoutRetrieve: 'M190 118H205V52H220',
      retrieveLlm: R1_BC,
      llmOut: 'M454 60V180',
      layoutFeatures: 'M190 132H220',
      featuresBoost: E_DOWN_G,
      boostOut: G_EXIT,
    },
    scenarios: [
      {
        label: 'A clean scan, a question',
        says: 'A typed policy, and someone asking what it covers.',
        nodes: ['ocr', 'retrieve', 'llm'],
        edges: ['inOcr', 'ocrRetrieve', 'retrieveLlm', 'llmOut'],
        exit: 'GROUNDED ANSWER',
        flags: ['10K+ queries a day on this path'],
        note: 'The high-volume road. The answer is written from retrieved clauses, not from what a model remembers about insurance.',
      },
      {
        label: 'Tables and handwriting',
        says: 'An endorsement with a table, a stamp and a handwritten amendment.',
        nodes: ['layout', 'retrieve', 'llm'],
        edges: ['inLayout', 'layoutRetrieve', 'retrieveLlm', 'llmOut'],
        exit: 'GROUNDED ANSWER',
        flags: ['layout-aware extraction'],
        note: 'Plain OCR loses the layout, and on these pages the layout is the meaning. A layout-aware model reads them first.',
      },
      {
        label: 'An underwriting call',
        says: 'The same document, feeding a decision.',
        nodes: ['layout', 'features', 'boost'],
        edges: ['inLayout', 'layoutFeatures', 'featuresBoost', 'boostOut'],
        exit: 'HUMAN SIGN-OFF',
        hot: true,
        flags: ['~78% underwriting efficiency gain', 'decision: signed off by a person'],
        note: 'Once the features are structured, an ensemble of boosted trees does the deciding, and a person still signs it.',
      },
    ],
  },

  /* ------------------------------------------------------------ Neural map --- */
  'neural-map-personal-site': {
    pick: 'Input to the map',
    caption:
      'The previous version of this site, as its interaction model. Choose an input and see what the scene did with it.',
    input: { x: 24, y: 45, label: 'READER' },
    exit: null,
    nodes: {
      camera: { ...A, name: 'Scroll camera', sub: 'z tied to scrollY' },
      raycast: { ...B, name: 'Raycast hover' },
      nucleus: { ...C, name: 'Cluster nucleus', sub: '5 click targets' },
      raw: { ...D, name: 'Raw mode', sub: 'dev snippets as labels' },
      label: { ...E, name: 'Label and dim', sub: 'node scales, edges lit' },
      fly: { ...F, name: 'Fly-to, then overlay', sub: 'closed → flying → open' },
    },
    edges: {
      in: IN,
      inPointer: 'M24 37V14H285V30',
      cameraRaw: A_DOWN_D,
      raycastLabel: B_DOWN_E,
      raycastNucleus: R1_BC,
      nucleusFly: C_DOWN_F,
    },
    scenarios: [
      {
        label: 'Scroll',
        says: 'The reader scrolls the page.',
        nodes: ['camera'],
        edges: ['in'],
        flags: ['camera advances into the network'],
        note: 'There were no sections to scroll past. Scrolling moved you through one scene.',
      },
      {
        label: 'Hover',
        says: 'The pointer crosses a node.',
        nodes: ['raycast', 'label'],
        edges: ['inPointer', 'raycastLabel'],
        flags: ['cluster label shown', 'labels never hidden'],
        note: 'Mystery navigation is not immersive, it is hostile. Every hover named what it was over.',
      },
      {
        label: 'Click',
        says: 'The reader clicks the centre of a cluster.',
        nodes: ['raycast', 'nucleus', 'fly'],
        edges: ['inPointer', 'raycastNucleus', 'nucleusFly'],
        flags: ['section opens in a fullscreen iframe'],
        note: 'The iframe is what static hosting allowed. It is also the seam the current drawing-set design was built to remove.',
      },
      {
        label: 'Shift + scroll',
        says: 'A builder holds shift.',
        nodes: ['camera', 'raw'],
        edges: ['in', 'cameraRaw'],
        flags: ['an easter egg then, a first-class mode now'],
        note: 'Raw mode began here as a hidden extra. In this version it is one of the three drawing modes.',
      },
    ],
  },

  /* ------------------------------------------------------------ Publishing --- */
  'publishing-query-automation': {
    pick: 'Message to trace',
    caption:
      'Choose an incoming message. One pipeline serves all five channels, and a low-confidence answer goes to a person instead of the author.',
    input: { x: 24, y: 45, label: 'AUTHOR' },
    nodes: {
      process: { ...A, name: 'Query processor', sub: 'intent · entities' },
      rag: { ...B, name: 'Knowledge layer', sub: 'semantic + keyword' },
      identity: { ...C, name: 'Identity unification', sub: 'fuzzy match, 5 channels' },
      escalate: { ...E, name: 'Escalation queue' },
      respond: { ...F, name: 'Response generator', sub: 'templates + GPT-4' },
    },
    edges: {
      in: IN,
      processRag: R1_AB,
      ragIdentity: R1_BC,
      identityRespond: C_DOWN_F,
      respondOut: 'M454 140V180',
      respondEscalate: 'M380 125H350',
      escalateOut: 'M285 140V195H398',
    },
    scenarios: [
      {
        label: 'ISBN lookup, WhatsApp',
        says: 'An author sends an ISBN and asks where their order is.',
        nodes: ['process', 'rag', 'identity', 'respond'],
        edges: ['in', 'processRag', 'ragIdentity', 'identityRespond', 'respondOut'],
        exit: 'SENT · WHATSAPP',
        flags: ['ISBN extracted from free text', 'confidence: above threshold'],
        note: 'The formatter keeps it short for WhatsApp. The facts come from the knowledge base, not from the formatter.',
      },
      {
        label: 'Same author, by email',
        says: 'The same author follows up from their email address.',
        nodes: ['process', 'rag', 'identity', 'respond'],
        edges: ['in', 'processRag', 'ragIdentity', 'identityRespond', 'respondOut'],
        exit: 'SENT · EMAIL',
        flags: ['matched to the same author record', 'confidence: above threshold'],
        note: 'Identity is the hidden cost. Without the match, every new channel starts the conversation from nothing.',
      },
      {
        label: 'An unclear royalty query',
        says: 'A question about royalties that the knowledge base does not clearly answer.',
        nodes: ['process', 'rag', 'identity', 'respond', 'escalate'],
        edges: [
          'in',
          'processRag',
          'ragIdentity',
          'identityRespond',
          'respondEscalate',
          'escalateOut',
        ],
        exit: 'HUMAN HANDOFF',
        hot: true,
        flags: ['draft withheld', 'confidence: below threshold'],
        note: 'Authors prefer a handoff to a wrong answer about money. The confidence score is the feature.',
      },
    ],
  },

  /* ------------------------------------------------------------ Restaurant --- */
  'restaurant-saas-demand-forecasting': {
    pick: 'What an operator needs',
    caption:
      'Choose what an operator needs to know. The live view and the forecast share one event pipeline and part ways after it.',
    input: { x: 24, y: 45, label: 'SITES' },
    nodes: {
      events: { ...A, name: 'Event pipeline', sub: '2M+ events a day' },
      sense: { ...B, name: 'Demand sensing' },
      api: { ...C, name: 'Node.js services' },
      forecast: { ...E, name: 'XGBoost + Prophet', sub: 'inventory forecasting' },
      prep: { ...G, name: 'Order quantities', sub: 'prep and ordering' },
    },
    edges: {
      in: IN,
      eventsSense: R1_AB,
      senseApi: R1_BC,
      apiOut: 'M454 60V180',
      senseForecast: B_DOWN_E,
      forecastPrep: E_DOWN_G,
      prepOut: G_EXIT,
    },
    scenarios: [
      {
        label: 'What is happening now',
        says: 'Demand across the group, as it moves.',
        nodes: ['events', 'sense', 'api'],
        edges: ['in', 'eventsSense', 'senseApi', 'apiOut'],
        exit: 'OPS DASHBOARD',
        flags: ['sub-100ms on this path'],
        note: 'The fast road. Holding that latency at this volume is a matter of partitioning and backpressure, not of the model.',
      },
      {
        label: 'What to prep and order',
        says: 'Quantities for the kitchen and the supplier.',
        nodes: ['events', 'sense', 'forecast', 'prep'],
        edges: ['in', 'eventsSense', 'senseForecast', 'forecastPrep', 'prepOut'],
        exit: 'OPS DASHBOARD',
        flags: ['validated across 200+ restaurants', '~32% less food waste in the pilot'],
        note: 'The one workflow the pilot was built around. Waste percentage, not model accuracy, is what closed it.',
      },
    ],
  },

  /* -------------------------------------------------- Finance and health --- */
  'agentic-finance-healthcare-ai': {
    pick: 'Step in a client journey',
    caption:
      'The finance graph. Choose a step; the router picks the tool, and what it learns is kept for the steps that follow.',
    input: { x: 24, y: 45, label: 'CLIENT' },
    nodes: {
      router: { ...A, name: 'LangGraph router', sub: 'stateful tool routing' },
      risk: { ...B, name: 'Risk profiling API' },
      rebalance: { ...E, name: 'Portfolio rebalancing' },
      onboard: { ...G, name: 'Onboarding utilities' },
      memory: { ...C, name: 'Cross-step memory', sub: 'kept across steps' },
    },
    edges: {
      in: IN,
      routerRisk: R1_AB,
      routerRebalance: 'M125 60V125H220',
      routerOnboard: 'M125 60V195H220',
      riskMemory: R1_BC,
      rebalanceMemory: 'M350 125H365V52H380',
      onboardMemory: 'M350 195H365V52H380',
      out: 'M454 60V180',
    },
    scenarios: [
      {
        label: 'Open an account',
        says: 'A new client starts onboarding.',
        nodes: ['router', 'onboard', 'memory'],
        edges: ['in', 'routerOnboard', 'onboardMemory', 'out'],
        exit: 'NEXT STEP',
        flags: ['retries and fallbacks on tool failure'],
        note: 'What onboarding collects is written to memory, so the client is not asked for it again two steps later.',
      },
      {
        label: 'Profile their risk',
        says: 'The journey reaches the risk questionnaire.',
        nodes: ['router', 'risk', 'memory'],
        edges: ['in', 'routerRisk', 'riskMemory', 'out'],
        exit: 'NEXT STEP',
        flags: ['retries and fallbacks on tool failure'],
        note: 'A call to a real risk API. The base model is interchangeable here; the graph around it is not.',
      },
      {
        label: 'Rebalance',
        says: 'Later, the portfolio drifts and needs rebalancing.',
        nodes: ['router', 'rebalance', 'memory'],
        edges: ['in', 'routerRebalance', 'rebalanceMemory', 'out'],
        exit: 'NEXT STEP',
        flags: ['~60% fewer manual touchpoints on supported journeys'],
        note: 'Rebalancing reads the profile the earlier step stored. That memory is what makes three tools one journey.',
      },
    ],
  },
};
