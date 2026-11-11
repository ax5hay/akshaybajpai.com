import Link from 'next/link';
import { PlateShell } from '@/components/plate/PlateShell';
import { getPlateByHref } from '@/lib/plates';
import { ENGAGEMENTS } from '@/lib/engagements';
import { SITE_URL, SOCIAL } from '@/lib/constants';
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

export default function EngagementsPage() {
  const { lead, offers, method, questions } = ENGAGEMENTS;

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
          mainEntity: questions.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        },
        breadcrumbs([{ name: 'A-103 Terms of Engagement', path: META.path }]),
      ]}
      facts={[
        { k: 'Offers', v: String(offers.length) },
        { k: 'Method', v: `${method.length} steps` },
      ]}
      record={[
        { k: 'source', v: 'data/engagements.json' },
        { k: 'schema', v: 'FAQPage · Person.makesOffer' },
      ]}
      lead={<p>{lead}</p>}
    >
      <section className={styles.section} aria-labelledby="take-on">
        <header className={styles.head}>
          <h2 id="take-on" className={styles.title}>
            What I take on
          </h2>
          <span className={styles.count}>{offers.length} kinds of work</span>
        </header>
        <ol className={styles.offers}>
          {offers.map((offer) => (
            <li key={offer.code} className={styles.offer}>
              <span className={styles.code} aria-hidden="true">
                {offer.code}
              </span>
              <h3 className={styles.name}>{offer.name}</h3>
              <p className={styles.text}>{offer.text}</p>
              <p className={styles.proof}>
                <span>As built:</span>
                {offer.proof.map((p) => (
                  <Link key={p.href} href={p.href}>
                    {p.label}
                  </Link>
                ))}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="method">
        <header className={styles.head}>
          <h2 id="method" className={styles.title}>
            How the work runs
          </h2>
          <span className={styles.count}>{method.length} steps</span>
        </header>
        <ol className={styles.method}>
          {method.map((step) => (
            <li key={step.name} className={styles.step}>
              <h3 className={styles.stepName}>{step.name}</h3>
              <p className={styles.stepText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="questions">
        <header className={styles.head}>
          <h2 id="questions" className={styles.title}>
            Questions, answered plainly
          </h2>
          <span className={styles.count}>{questions.length} answers</span>
        </header>
        <dl className={styles.questions}>
          {questions.map((item) => (
            <div key={item.q} className={styles.qa}>
              <dt className={styles.q}>{item.q}</dt>
              <dd className={styles.a}>{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className={styles.close}>
        To start, write to <a href={`mailto:${SOCIAL.email}`}>{SOCIAL.email}</a> with what you are
        building and what it has to survive, or use the <Link href="/contact/">correspondence
        sheet</Link>.
      </p>
    </PlateShell>
  );
}
