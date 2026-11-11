import fs from 'fs';
import path from 'path';

/**
 * A-102's source: data/stack.json, copied from the profile repository by
 * `npm run sync:stack` and read here at build time. Never retyped.
 *
 * Each item lists the repositories it was found in (`repos`) or, for the
 * leadership items that no repository can show, the kinds of work it came
 * from (`engagements`). `n` is the count of either.
 */

export interface StackItem {
  name: string;
  repos: string[];
  engagements?: string[];
  n: number;
}

export interface StackDiscipline {
  category: string;
  items: StackItem[];
}

/** Two-letter codes, as a door-and-window schedule marks its types. */
const CODES: Record<string, string> = {
  'Leadership & practice': 'LP',
  Languages: 'LG',
  'Frontend & UI': 'FE',
  'Charts & dataviz': 'CH',
  'Backend & APIs': 'BE',
  'AI & LLM systems': 'AI',
  'Machine learning & data science': 'ML',
  'Vision, audio & documents': 'VA',
  'Data stores & ORMs': 'DS',
  'Infrastructure & delivery': 'IN',
  'Observability & security': 'OS',
  'Testing & code quality': 'TQ',
  'Desktop, edge & automation': 'DE',
  'Integrations & services': 'IS',
};

/**
 * Repository names as the site prints them. Private repositories are named
 * by what they are; nothing here may name a company.
 */
const REPO_NAMES: Record<string, string> = {
  rebo: 'ReBo',
  'DADM-Aiximius': 'DADM',
  'akshay-medha-wedding-2026': 'a wedding site',
  'akshaybajpai.com': 'this site',
  'IBM-TEST-REPO': 'a test repository',
  'id1sas-surveycto': 'a survey data pipeline',
  'ai-automation-main': 'ai-automation',
  'RestroScraper-PY': 'RestroScraper',
};

/** Found in this many places or more, an item is drawn heavier. */
export const HEAVY_AT = 3;

export function codeFor(category: string): string {
  return CODES[category] ?? category.slice(0, 2).toUpperCase();
}

export function repoName(repo: string): string {
  return REPO_NAMES[repo] ?? repo;
}

export function readStack(): StackDiscipline[] {
  const file = path.join(process.cwd(), 'data', 'stack.json');
  return JSON.parse(fs.readFileSync(file, 'utf8')) as StackDiscipline[];
}

/* ------------------------------------------------------------ tracing --- */

/** A token safe to put in a `data-in` list and a CSS attribute selector. */
export function traceId(source: string, kind: 'repo' | 'engagement'): string {
  const slug = source.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return kind === 'engagement' ? `e-${slug}` : `r-${slug}`;
}

export interface TraceSource {
  id: string;
  label: string;
  kind: 'repo' | 'engagement';
  /** Items found in this source. */
  count: number;
  /** Items per discipline code, for the readout. */
  byCode: Record<string, number>;
}

/** Every repository and engagement, with what it contributed, largest first. */
export function traceSources(stack: StackDiscipline[]): TraceSource[] {
  const found = new Map<string, TraceSource>();
  for (const discipline of stack) {
    const code = codeFor(discipline.category);
    for (const item of discipline.items) {
      const sources: Array<[string, 'repo' | 'engagement']> = [
        ...item.repos.map((r) => [r, 'repo'] as [string, 'repo']),
        ...(item.engagements ?? []).map((e) => [e, 'engagement'] as [string, 'engagement']),
      ];
      for (const [raw, kind] of sources) {
        const id = traceId(raw, kind);
        const entry =
          found.get(id) ??
          { id, label: kind === 'repo' ? repoName(raw) : raw, kind, count: 0, byCode: {} };
        entry.count += 1;
        entry.byCode[code] = (entry.byCode[code] ?? 0) + 1;
        found.set(id, entry);
      }
    }
  }
  return [...found.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** The `data-in` value for one item: every source it was found in. */
export function traceList(item: StackItem): string {
  return [
    ...item.repos.map((r) => traceId(r, 'repo')),
    ...(item.engagements ?? []).map((e) => traceId(e, 'engagement')),
  ].join(' ');
}
