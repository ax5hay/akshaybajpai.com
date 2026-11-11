import { HEAVY_AT, codeFor, repoName, type StackDiscipline } from '@/lib/stack';
import styles from './MaterialSchedule.module.css';

/**
 * A-102, drawn as a door-and-window schedule: one ruled block per discipline,
 * marked with its type code, and every item a cell in the block. Cells found
 * in HEAVY_AT or more places are drawn heavier, as on the profile README.
 *
 * Static markup only. Where each item was found rides in a title for a
 * pointer, in visually hidden text for a screen reader, and in the open in
 * Raw mode, where the record is the point.
 */
export function MaterialSchedule({ stack }: { stack: StackDiscipline[] }) {
  const total = stack.reduce((n, d) => n + d.items.length, 0);

  return (
    <div className={styles.schedule}>
      <div className={styles.key} aria-hidden="true">
        <span className={styles.keyCell} data-heavy>
          Item
        </span>
        <span>in {HEAVY_AT} or more repositories or engagements</span>
        <span className={styles.keyCell}>Item</span>
        <span>in one or two</span>
        <span className={styles.keyCell} data-led>
          Item
        </span>
        <span>from the work I led, not a repository</span>
      </div>

      {stack.map((discipline) => {
        const code = codeFor(discipline.category);
        const heavy = discipline.items.filter((i) => i.n >= HEAVY_AT).length;
        const id = `type-${code.toLowerCase()}`;
        return (
          <section key={discipline.category} className={styles.block} aria-labelledby={id}>
            <header className={styles.head}>
              <span className={styles.code}>{code}</span>
              <h2 id={id} className={styles.name}>
                {discipline.category}
              </h2>
              <span className={styles.count}>
                {discipline.items.length} items · {heavy} heavy
              </span>
            </header>
            <ul className={styles.cells}>
              {discipline.items.map((item) => {
                const led = Boolean(item.engagements?.length);
                const where = led ? item.engagements! : item.repos.map(repoName);
                const said = led ? `from ${where.join(', ')}` : `in ${where.join(', ')}`;
                return (
                  <li
                    key={item.name}
                    className={styles.cell}
                    data-heavy={item.n >= HEAVY_AT || undefined}
                    data-led={led || undefined}
                    title={said}
                  >
                    <span className={styles.item}>{item.name}</span>
                    <span className={styles.n} aria-hidden="true">
                      {item.n}
                    </span>
                    <span className="u-visually-hidden">, {said}</span>
                    <span className={styles.where} aria-hidden="true">
                      {where.join(' · ')}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <p className={styles.foot}>
        {total} items in {stack.length} disciplines · source: data/stack.json, kept in the profile
        repository and counted from every repository and engagement
      </p>
    </div>
  );
}
