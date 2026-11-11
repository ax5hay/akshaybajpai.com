import Link from 'next/link';
import type { Constraint, Offer, SheetRef } from '@/lib/engagements';
import { Say } from './Say';
import { BriefControl, type BriefData } from './BriefControl';
import styles from './BriefComposer.module.css';

/**
 * Start a brief: the reader says what they are building and what it has to
 * survive, and the sheet drafts the transmittal for them, with the case
 * studies that show the same thing done. Nothing leaves the tab until the
 * reader sends it: "Open in correspondence" hands the draft to C-700 through
 * the form's own draft store, and "Email it" opens their mail client.
 *
 * Every control, every note and every possible precedent is rendered here,
 * on the server. BriefControl only presses buttons, shows what applies and
 * writes the few lines of the slip that depend on the choice.
 */
const ROOT_ID = 'brief-composer';
const EMAIL = 'hello@akshaybajpai.com';

interface Props {
  offers: Pick<Offer, 'code' | 'name' | 'subject' | 'proof'>[];
  constraints: Constraint[];
  sheets: Record<string, SheetRef>;
}

export function BriefComposer({ offers, constraints, sheets }: Props) {
  // Every case study an offer or a load can point at, once, in set order.
  const candidates = Object.keys(sheets).filter(
    (href) => offers.some((o) => o.proof.some((p) => p.href === href)) || constraints.some((c) => c.proof.includes(href))
  );

  const data: BriefData = {
    offers: offers.map((o) => ({ code: o.code, name: o.name, subject: o.subject, proof: o.proof.map((p) => p.href) })),
    constraints: constraints.map((c) => ({ id: c.id, name: c.name, proof: c.proof })),
    sheets: Object.fromEntries(candidates.map((href) => [href, sheets[href]])),
  };

  return (
    <div id={ROOT_ID} className={styles.composer}>
      <div className={styles.head}>
        <span className={styles.headTitle}>
          <Say s={{ a: 'Start a brief', b: 'Brief · transmittal draft', c: '<BriefComposer>' }} />
        </span>
        <span className={styles.headNote}>
          <Say
            s={{
              a: 'Three choices, then it is written for you',
              b: 'Drafted on the sheet; nothing is sent from here',
              c: "sessionStorage['plate.transmittal'] → /contact/",
            }}
          />
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.questions}>
          <fieldset className={styles.group}>
            <legend className={styles.legend}>
              <span className={styles.legendNo}>01</span>
              <Say s={{ a: 'What are you building?', b: 'Regarding', c: 'offer' }} />
            </legend>
            <div className={styles.offers} role="radiogroup" aria-label="What are you building?">
              {offers.map((o) => (
                <button key={o.code} type="button" role="radio" aria-checked="false" className={styles.offer} data-offer={o.code}>
                  <span className={styles.offerNo}>{o.code}</span>
                  {o.name}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>
              <span className={styles.legendNo}>02</span>
              <Say s={{ a: 'New, or something that exists?', b: 'Scope of the engagement', c: 'kind' }} />
            </legend>
            <div className={styles.segment} role="radiogroup" aria-label="New, or something that exists?">
              <button type="button" role="radio" aria-checked="true" className={styles.segmentButton} data-kind="build">
                <Say s={{ a: 'Build it with me', b: 'New work', c: "'build'" }} />
              </button>
              <button type="button" role="radio" aria-checked="false" className={styles.segmentButton} data-kind="review">
                <Say s={{ a: 'Review what exists', b: 'Architecture review', c: "'review'" }} />
              </button>
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>
              <span className={styles.legendNo}>03</span>
              <Say s={{ a: 'What does it have to survive?', b: 'Loads it must carry', c: 'constraints[]' }} />
            </legend>
            <div className={styles.chips}>
              {constraints.map((c) => (
                <button key={c.id} type="button" aria-pressed="false" className={styles.chip} data-load={c.id} title={c.note}>
                  <span className={styles.chipBox} aria-hidden="true" />
                  {c.name}
                </button>
              ))}
            </div>
            <ul className={styles.notes} data-notes hidden>
              {constraints.map((c) => (
                <li key={c.id} data-note={c.id} hidden>
                  <b>{c.name}.</b> {c.note}
                </li>
              ))}
            </ul>
          </fieldset>

          <label className={styles.group}>
            <span className={styles.legend}>
              <span className={styles.legendNo}>04</span>
              <Say s={{ a: 'In a line, if you like', b: 'Note on the transmittal', c: 'line?' }} />
            </span>
            <input type="text" className={styles.line} maxLength={200} placeholder="What it is, and why now" data-line />
          </label>
        </div>

        <div className={styles.slipWrap}>
          <section className={`${styles.slip} reversed`} aria-label="Transmittal preview" aria-live="polite">
            <div className={styles.slipHead}>
              <span>
                <Say s={{ a: 'Your note', b: 'Transmittal', c: 'draft' }} />
              </span>
              <span>
                A-103 / <span data-date>····.··.··</span>
              </span>
            </div>
            <dl className={styles.slipFacts}>
              <div>
                <dt>
                  <Say s={{ a: 'About', b: 'Regarding', c: 'subject' }} />
                </dt>
                <dd data-out="subject">Technology leadership</dd>
              </div>
              <div>
                <dt>
                  <Say s={{ a: 'Building', b: 'Offer', c: 'offer' }} />
                </dt>
                <dd data-out="offer" data-empty="Choose what you are building">
                  <span className={styles.blank}>Choose what you are building</span>
                </dd>
              </div>
              <div>
                <dt>
                  <Say s={{ a: 'Must survive', b: 'Loads', c: 'constraints' }} />
                </dt>
                <dd data-out="loads" data-empty="None chosen yet">
                  <span className={styles.blank}>None chosen yet</span>
                </dd>
              </div>
              <div data-row="line" hidden>
                <dt>
                  <Say s={{ a: 'In a line', b: 'Note', c: 'line' }} />
                </dt>
                <dd data-out="line" />
              </div>
            </dl>
            <div className={styles.precedents}>
              <span className={styles.precedentsHead}>
                <Say s={{ a: 'Done before, read these', b: 'Precedents in the set', c: 'precedents[]' }} />
              </span>
              <ul data-precedents>
                {candidates.map((href) => (
                  <li key={href} data-precedent={href} hidden>
                    <Link href={href}>
                      <span className={styles.precedentNo}>{sheets[href].sheet}</span>
                      <span>{sheets[href].title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className={styles.blank} data-none>
                The matching case studies appear here.
              </p>
            </div>
            <span className={styles.stamp} aria-hidden="true" data-stamp>
              <span>
                <span className={styles.stampDraft}>
                  <Say s={{ a: 'Draft', b: 'Draft', c: 'null' }} />
                </span>
                <span className={styles.stampReady}>
                  <Say s={{ a: 'Ready', b: 'Drafted', c: 'ok' }} />
                </span>
              </span>
              <span data-date />
            </span>
          </section>

          <div className={styles.actions}>
            <Link href="/contact/" className={styles.primary} data-act="open" aria-disabled="true">
              <Say s={{ a: 'Open it as a message', b: 'Open in correspondence', c: 'push(/contact/)' }} /> →
            </Link>
            <a className={styles.secondary} href={`mailto:${EMAIL}`} data-act="mail" aria-disabled="true">
              <Say s={{ a: 'Email it', b: 'Email it', c: 'mailto:' }} />
            </a>
          </div>
          <p className={styles.fallback}>
            Or write to <a href={`mailto:${EMAIL}`}>{EMAIL}</a> directly.
          </p>
          <pre className={styles.raw} aria-hidden="true" data-out="raw" hidden />
        </div>
      </div>

      <p className={styles.foot} aria-hidden="true">
        {offers.length} offers · {constraints.length} loads · <span data-out="count">0</span> precedents
      </p>

      <BriefControl rootId={ROOT_ID} data={data} />
    </div>
  );
}
