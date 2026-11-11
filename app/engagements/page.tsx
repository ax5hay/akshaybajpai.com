import Link from 'next/link';
import { PlateShell } from '@/components/plate/PlateShell';
import { Callout } from '@/components/kit/Callout';
import { Voice } from '@/components/system/Voice';
import { ConstructionSequence } from '@/components/plate/ConstructionSequence';
import { BriefComposer } from '@/components/plate/BriefComposer';
import { AnswerCite } from '@/components/plate/AnswerCite';
import { getPlateByHref, detailSheetNumber, PLATES } from '@/lib/plates';
import { getCollection } from '@/lib/content';
import { ENGAGEMENTS, questionId, type SheetRef } from '@/lib/engagements';
import { SITE_URL } from '@/lib/constants';
import { buildMetadata, breadcrumbs, webPage, PERSON_ID } from '@/lib/metadata';
import styles from './engagements.module.css';

const PLATE = getPlateByHref('/engagements/')!;

const META = {
  title: 'Work with Akshay Bajpai · terms of engagement',
  description:
    'What Akshay Bajpai takes on: technology leadership end to end, AI platforms in production, governed text-to-SQL agents, computer vision on air-gapped hardware, document AI and native software in Rust. How the work runs, and questions answered plainly.',
  path: '/engagements/',
  card: 'engagements',
  keywords: [
    'hire Akshay Bajpai',
    'AI consultant',
    'technology leader',
    'AI architect',
    'text-to-SQL',
    'computer vision air-gapped',
    'LLM platform architecture',
  ],
};

export const metadata = buildMetadata(META);

/** Every sheet an offer or a load can point at, by href, with its number. */
async function sheetRefs(): Promise<Record<string, SheetRef>> {
  const work = await getCollection('work');
  const refs: Record<string, SheetRef> = {};
  for (const plate of PLATES) refs[plate.href] = { sheet: plate.sheet, title: plate.title };
  work.forEach((entry, i) => {
    refs[`/work/${entry.slug}/`] = { sheet: detailSheetNumber('work', i), title: entry.frontmatter.title };
  });
  // Where an offer already names a sheet ("ReBo", "Clinical NLP"), the short
  // name is used; anything else keeps its full title.
  for (const offer of ENGAGEMENTS.offers) {
    for (const p of offer.proof) if (refs[p.href]) refs[p.href] = { ...refs[p.href], title: p.label };
  }
  return refs;
}

export default async function EngagementsPage() {
  const { lead, offers, method, constraints, questions } = ENGAGEMENTS;
  const sheets = await sheetRefs();
  const workSheets = Object.fromEntries(Object.entries(sheets).filter(([href]) => href.startsWith('/work/')));

  return (
    <PlateShell
      sheet={PLATE.sheet}
      title={PLATE.title}
      subtitle={PLATE.subtitle}
      discipline={PLATE.discipline}
      scale={PLATE.scale}
      revision={PLATE.revision}
      issued="2026.11"
      refs={PLATE.refs}
      jsonLd={[
        webPage({
          path: META.path,
          name: META.title,
          description: META.description,
          card: META.card,
          extra: { about: { '@id': PERSON_ID } },
        }),
        {
          '@type': 'FAQPage',
          '@id': `${SITE_URL}${META.path}#questions`,
          url: `${SITE_URL}${META.path}`,
          about: { '@id': PERSON_ID },
          mainEntity: questions.map((item, i) => ({
            '@type': 'Question',
            '@id': `${SITE_URL}${META.path}#${questionId(i)}`,
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        },
        breadcrumbs([{ name: 'A-103 Terms of Engagement', path: META.path }]),
      ]}
      facts={[
        { k: 'Offers', v: String(offers.length) },
        { k: 'Method', v: `${method.length} stages` },
        { k: 'Answers', v: String(questions.length) },
      ]}
      record={[
        { k: 'source', v: 'data/engagements.json' },
        { k: 'schema', v: 'FAQPage · Person.makesOffer' },
        { k: 'client', v: 'ConstructionSequence · BriefComposer · AnswerCite' },
      ]}
      wide
      lead={<p>{lead}</p>}
    >
      {/* ---------------------------------------------------- What I take on --- */}
      <section className={styles.section} aria-labelledby="take-on">
        <header className={styles.head}>
          <h2 id="take-on" className={styles.title}>
            <Voice s={{ a: 'What I take on', b: 'Schedule of offers', c: 'offers[]' }} />
          </h2>
          <span className={styles.count}>
            <Voice s={{ a: `${offers.length} kinds of work`, b: `${offers.length} offers · as built`, c: `length ${offers.length}` }} />
          </span>
        </header>
        <Callout note="Each offer is drawn to the sheets that prove it. Follow a leader to read the work it rests on.">
          <ol className={styles.offers}>
            {offers.map((offer) => (
              <li key={offer.code} className={styles.offer}>
                <span className={styles.rail} aria-hidden="true" />
                <span className={styles.code} aria-hidden="true">
                  {offer.code}
                </span>
                <div className={styles.offerMain}>
                  <h3 className={styles.name}>{offer.name}</h3>
                  <p className={styles.text}>{offer.text}</p>
                </div>
                <span className={styles.leader} aria-hidden="true" />
                <ul className={styles.built} aria-label={`${offer.name}, as built`}>
                  {offer.proof.map((p) => (
                    <li key={p.href}>
                      <Link href={p.href} className={styles.builtLink}>
                        <span className={styles.builtNo}>{sheets[p.href]?.sheet ?? '·'}</span>
                        <span className={styles.builtName}>{p.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Callout>
      </section>

      {/* ------------------------------------------------ How the work runs --- */}
      <section className={styles.section} aria-labelledby="method">
        <header className={styles.head}>
          <h2 id="method" className={styles.title}>
            <Voice s={{ a: 'How the work runs', b: 'Construction sequence', c: 'method[]' }} />
          </h2>
          <span className={styles.count}>{method.length} stages</span>
        </header>
        <Callout note="Read as a construction sequence: each stage bears on the one below, and each is issued with the document it leaves.">
          <ConstructionSequence steps={method} />
        </Callout>
      </section>

      {/* ------------------------------------------- Questions, answered plainly --- */}
      <section className={styles.section} aria-labelledby="questions">
        <header className={styles.head}>
          <h2 id="questions" className={styles.title}>
            <Voice s={{ a: 'Questions, answered plainly', b: 'Questions on the record', c: 'FAQPage.mainEntity[]' }} />
          </h2>
          <span className={styles.count}>{questions.length} answers</span>
        </header>
        <Callout note="Written to be quoted whole. Each answer stands on its own and names the work it rests on; press a number to copy a link to it.">
          <AnswerCite sheet={PLATE.sheet}>
            <dl className={styles.questions}>
              {questions.map((item, i) => {
                const id = questionId(i);
                return (
                  <div key={item.q} id={id} className={styles.qa}>
                    <dt className={styles.q}>
                      <a href={`#${id}`} data-cite={id} className={styles.qNo} title="Copy a link to this answer">
                        Q-{String(i + 1).padStart(2, '0')}
                      </a>
                      <span data-q>{item.q}</span>
                    </dt>
                    <dd className={styles.a}>{item.a}</dd>
                  </div>
                );
              })}
            </dl>
          </AnswerCite>
        </Callout>
      </section>

      {/* ---------------------------------------------------------- Start a brief --- */}
      <section className={styles.section} aria-labelledby="brief">
        <header className={styles.head}>
          <h2 id="brief" className={styles.title}>
            <Voice s={{ a: 'Start a brief', b: 'Transmittal', c: 'brief' }} />
          </h2>
          <span className={styles.count}>
            <Voice s={{ a: 'Nothing is sent from here', b: 'Drafted on the sheet', c: 'client only' }} />
          </span>
        </header>
        <Callout note="Nothing leaves this sheet. The draft goes to the correspondence sheet, or to your own mail client, and you send it from there.">
          <BriefComposer
            offers={offers.map(({ code, name, subject, proof }) => ({ code, name, subject, proof }))}
            constraints={constraints}
            sheets={workSheets}
          />
        </Callout>
      </section>
    </PlateShell>
  );
}
