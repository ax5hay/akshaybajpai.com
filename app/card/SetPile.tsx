import Link from 'next/link';
import { KEY_PLAN_HEIGHT, KEY_PLAN_SHEETS_WIDTH, keyPlanPlates } from '@/lib/plates';
import { PlateFigure, hasFigure } from '@/components/figures/PlateFigure';
import { Levels, Voice } from '@/components/system/Voice';
import { disciplineName, plateSubtitle, plateTitle } from '@/lib/voice';
import styles from './SetPile.module.css';

/**
 * The site, rising under the card. The card is landscape and the site is
 * portrait, so the join between them is made the way the phone's own home
 * sheet makes it: the seven section sheets as a pile. Each one slides up
 * and rests on the last as the reader scrolls, each is the page it names,
 * and the last of them is the door to the whole set.
 */
export function SetPile() {
  const plates = keyPlanPlates();
  return (
    <section className={styles.pile} aria-labelledby="card-set">
      <h2 id="card-set" className={styles.head}>
        <span className={styles.headKicker}>
          <Voice k="enterKicker" />
        </span>
        <span className={styles.headTitle}>
          <Levels a="What is on the site" b="The sheets of the set" c="Section routes" />
        </span>
        <span className={styles.headNote}>
          <Levels
            a="Seven pages. Tap any one to open it."
            b="Seven sheets on the plan. Tap one to open it."
            c="Seven section routes. Tap to navigate."
          />
        </span>
      </h2>

      {/* On a desk: the plan itself, small, every sheet where it is on the
          home page, so the card shows the shape of the site at a glance. */}
      <nav className={styles.plan} aria-label="The site, as a plan">
        {plates.map((plate) => (
          <Link
            key={plate.sheet}
            href={plate.href}
            className={styles.planSheet}
            data-id={plate.id}
            style={{
              left: `${(plate.rect.x / KEY_PLAN_SHEETS_WIDTH) * 100}%`,
              top: `${(plate.rect.y / KEY_PLAN_HEIGHT) * 100}%`,
              width: `${(plate.rect.w / KEY_PLAN_SHEETS_WIDTH) * 100}%`,
              height: `${(plate.rect.h / KEY_PLAN_HEIGHT) * 100}%`,
            }}
          >
            <span className={styles.planTag}>{plate.sheet}</span>
            <span className={styles.planTitle}>
              <Levels a={plateTitle(plate, 'a')} b={plate.title} c={plateTitle(plate, 'c')} />
            </span>
            {hasFigure(plate.id) && (
              <span className={styles.planFigure} aria-hidden="true">
                <PlateFigure id={plate.id} />
              </span>
            )}
          </Link>
        ))}
      </nav>

      <ol className={styles.sheets}>
        {plates.map((plate, i) => (
          <li key={plate.sheet} className={styles.slot} style={{ '--i': i } as React.CSSProperties}>
            <Link href={plate.href} className={styles.sheet} data-id={plate.id}>
              <span className={styles.tag}>{plate.sheet}</span>
              <span className={styles.series}>
                <Levels
                  a={disciplineName(plate.discipline, 'a')}
                  b={disciplineName(plate.discipline, 'b')}
                  c={disciplineName(plate.discipline, 'c')}
                />
              </span>
              <span className={styles.title}>
                <Levels a={plateTitle(plate, 'a')} b={plate.title} c={plateTitle(plate, 'c')} />
              </span>
              <span className={styles.sub}>
                <Levels a={plateSubtitle(plate, 'a')} b={plate.subtitle} c={plateSubtitle(plate, 'c')} />
              </span>
              {hasFigure(plate.id) && (
                <span className={styles.figure} aria-hidden="true">
                  <PlateFigure id={plate.id} />
                </span>
              )}
              <span className={styles.open}>
                {plate.id === 'contact' ? <Voice k="write" /> : <Voice k="open" />}
              </span>
              <span className={styles.corner} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
