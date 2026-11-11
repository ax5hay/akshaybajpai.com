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
