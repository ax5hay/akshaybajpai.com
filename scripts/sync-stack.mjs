import fs from 'fs';
import path from 'path';

/**
 * Refresh data/stack.json, the source of A-102 Schedule of Materials, from
 * the profile repository (ax5hay/ax5hay), where it is kept and counted. The
 * site never retypes it. Run `npm run sync:stack`, read the diff, commit.
 *
 * A sibling checkout is preferred when one exists, so an unpushed change to
 * the profile can be previewed here; otherwise the published file is fetched.
 */
const OUT = path.join(process.cwd(), 'data', 'stack.json');
const SIBLING = path.join(process.cwd(), '..', 'ax5hay', 'data', 'stack.json');
const RAW = 'https://raw.githubusercontent.com/ax5hay/ax5hay/main/data/stack.json';

let text;
if (fs.existsSync(SIBLING)) {
  text = fs.readFileSync(SIBLING, 'utf8');
  console.log(`Read ${SIBLING}`);
} else {
  const res = await fetch(RAW);
  if (!res.ok) throw new Error(`${RAW}: ${res.status}`);
  text = await res.text();
  console.log(`Fetched ${RAW}`);
}

const data = JSON.parse(text);
if (!Array.isArray(data) || !data.every((c) => c.category && Array.isArray(c.items))) {
  throw new Error('stack.json is not a list of { category, items }');
}
fs.writeFileSync(OUT, text);
const items = data.reduce((n, c) => n + c.items.length, 0);
console.log(`Wrote data/stack.json: ${items} items in ${data.length} disciplines`);
