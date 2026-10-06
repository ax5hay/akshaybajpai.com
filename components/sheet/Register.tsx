import type { IndexEntry } from './SheetIndex';

/**
 * The sheet register: every sheet in the set, as plain links, on every page.
 *
 * The drawing index a reader uses is a dialog that mounts on demand, so its
 * links are not in the page a crawler is handed; the key plan itself links to
 * the seven section sheets and to none of the detail sheets behind them. This
 * is the same list, issued once in the document as a static `<nav>`, and
 * hidden: the index is the register's screen form, and this is its paper
 * form, kept for whoever reads the HTML rather than the page.
 */
export function Register({ entries }: { entries: IndexEntry[] }) {
  const groups = new Map<string, IndexEntry[]>();
  for (const entry of entries) {
    const rows = groups.get(entry.group) ?? [];
    rows.push(entry);
    groups.set(entry.group, rows);
  }

  return (
    <nav aria-label="Sheet register" hidden>
      {[...groups].map(([group, rows]) => (
        <section key={group}>
          <h2>{group}</h2>
          <ol>
            {rows.map((row) => (
              <li key={row.href}>
                <a href={row.href}>
                  {row.sheet} {row.title}
                </a>
                {row.subtitle && <span> — {row.subtitle}</span>}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </nav>
  );
}
