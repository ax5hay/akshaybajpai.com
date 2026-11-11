import { Callout } from '@/components/kit/Callout';
import {
  HEAVY_AT,
  codeFor,
  repoName,
  traceList,
  traceSources,
  type StackDiscipline,
} from '@/lib/stack';
import { ScheduleTracer } from './ScheduleTracer';
import styles from './MaterialSchedule.module.css';

/**
 * A-102, drawn as a door-and-window schedule: an elevation of the whole
 * schedule first (one bay per discipline, as tall as its item count, the
 * heavy items set solid at the foot), then one ruled block per discipline,
 * every item a cell. Cells found in HEAVY_AT or more places are drawn
 * heavier, as on the profile README.
 *
 * Everything here is static markup. The one script on the sheet is the
 * tracer, which lights a project's items in place without re-rendering them.
 * Where each item was found rides in a title for a pointer, in visually
 * hidden text for a screen reader, and in the open in Raw.
 */
const ROOT_ID = 'materials';

/* The elevation's own drawing units. */
const BAY = 44;
const GAP = 10;
const LEFT = 46;
const GROUND = 176;
const TALL = 148;

export function MaterialSchedule({ stack }: { stack: StackDiscipline[] }) {
  const total = stack.reduce((n, d) => n + d.items.length, 0);
  const most = Math.max(...stack.map((d) => d.items.length));
  const sources = traceSources(stack);
  const totals: Array<[string, number]> = stack.map((d) => [codeFor(d.category), d.items.length]);
  const width = LEFT + stack.length * (BAY + GAP) + 14;
  const h = (n: number) => (n / most) * TALL;

  let hatch = '';
  for (let x = 12; x < width - 8; x += 9) hatch += `M${x} ${GROUND}l8 8`;

  return (
    <div id={ROOT_ID} className={styles.schedule}>
      <Callout note="Each bay is one discipline, drawn to the number of items in it. The solid part at the foot is what appears in three or more places; the open part above is what appears in one or two.">
        <figure className={styles.elevation}>
          <div className={styles.elevationField}>
            <svg
              viewBox={`0 0 ${width} 214`}
              className={styles.elevationSvg}
              role="group"
              aria-label={`Elevation of the schedule: ${stack.length} disciplines, ${total} items`}
            >
              {/* Datum, hatch, and the dimension up the left side. */}
              <path d={`M8 ${GROUND}H${width - 8}`} className={styles.ground} />
              <path d={hatch} className={styles.hatch} />
              <path
                d={`M22 ${GROUND}V${GROUND - TALL}M17 ${GROUND}h10M17 ${GROUND - TALL}h10`}
                className={styles.dim}
              />
              <text
                x="16"
                y={GROUND - TALL / 2}
                className={styles.dimText}
                transform={`rotate(-90 16 ${GROUND - TALL / 2})`}
                textAnchor="middle"
              >
                {most} items
              </text>

              {stack.map((d, i) => {
                const code = codeFor(d.category);
                const heavy = d.items.filter((item) => item.n >= HEAVY_AT).length;
                const x = LEFT + i * (BAY + GAP);
                const all = h(d.items.length);
                const solid = h(heavy);
                return (
                  <a
                    key={code}
                    href={`#type-${code.toLowerCase()}`}
                    className={styles.bayLink}
                    aria-label={`${d.category}: ${d.items.length} items, ${heavy} heavy`}
                  >
                    <rect x={x - 3} y={8} width={BAY + 6} height={GROUND + 30} className={styles.bayHit} />
                    <rect x={x} y={GROUND - all} width={BAY} height={all} className={styles.bay} />
                    <rect x={x} y={GROUND - solid} width={BAY} height={solid} className={styles.baySolid} />
                    {/* The traced share, scaled from the datum by the tracer. */}
                    <rect
                      x={x + 6}
                      y={GROUND - all}
                      width={BAY - 12}
                      height={all}
                      className={styles.bayTrace}
                      data-bay={code}
                    />
                    <text x={x + BAY / 2} y={GROUND - all - 6} textAnchor="middle" className={styles.bayCount}>
                      {d.items.length}
                    </text>
                    <text x={x + BAY / 2} y={GROUND + 22} textAnchor="middle" className={styles.bayCode}>
                      {code}
                    </text>
                  </a>
                );
              })}
            </svg>
          </div>
          <figcaption className={styles.caption}>
            <span className={styles.captionNo}>Fig. 1</span>
            The schedule in elevation. Choose a bay to go to its discipline; trace a project below
            and each bay fills to that project&rsquo;s share.
          </figcaption>
        </figure>
      </Callout>

      <Callout note="The tracer reads the same record as the cells. Nothing is re-drawn: the items a project did not use simply fall back.">
        <ScheduleTracer sources={sources} totals={totals} rootId={ROOT_ID} />
      </Callout>

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
          <section
            key={discipline.category}
            id={id}
            className={styles.block}
            aria-labelledby={`${id}-name`}
            data-block={code}
          >
            <header className={styles.head}>
              <span className={styles.code}>{code}</span>
              <h2 id={`${id}-name`} className={styles.name}>
                {discipline.category}
              </h2>
              <span className={styles.count}>
                {discipline.items.length} items · {heavy} heavy
                <span className={styles.traceCount} data-trace-count={code} aria-hidden="true" />
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
                    data-cell
                    data-in={traceList(item)}
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
