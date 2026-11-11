import Link from 'next/link';
import { PlateShell } from '@/components/plate/PlateShell';
import { CorrespondenceForm } from '@/components/plate/CorrespondenceForm';
import { CopyValue } from '@/components/kit/CopyValue';
import { LocalTime } from '@/components/plate/LocalTime';
import { CardTicket } from '@/components/plate/CardTicket';
import { PlateFigure } from '@/components/figures/PlateFigure';
import { getPlateByHref } from '@/lib/plates';
import { buildMetadata, breadcrumbs, webPage, PERSON_ID } from '@/lib/metadata';
import { JsonLd } from '@/components/JsonLd';
import { SOCIAL } from '@/lib/constants';
import styles from './contact.module.css';

const PLATE = getPlateByHref('/contact/')!;

const META = {
  title: 'Correspondence · Contact Akshay Bajpai',
  description: 'Write to Akshay Bajpai about technology leadership, an AI platform or agent that has to hold in production, an architecture review, or speaking.',
  path: '/contact/',
  card: 'contact',
  keywords: ['contact Akshay Bajpai', 'hire Akshay Bajpai', 'hire AI architect', 'technology leader', 'forward-deployed AI engineer contact', 'Akshay Bajpai email'],
};

export const metadata = buildMetadata(META);

const CHANNELS = [
  { label: 'Email', value: SOCIAL.email, href: `mailto:${SOCIAL.email}` },
  { label: 'LinkedIn', value: 'linkedin.com/in/ax5hay', href: SOCIAL.linkedin },
  { label: 'GitHub', value: 'github.com/ax5hay', href: SOCIAL.github },
  { label: 'Twitter / X', value: '@ax5hay', href: SOCIAL.twitter },
];

export default function ContactPage() {
  const [primary, ...others] = CHANNELS;

  return (
    <PlateShell
      sheet={PLATE.sheet}
      title={PLATE.title}
      subtitle={PLATE.subtitle}
      discipline={PLATE.discipline}
      scale={PLATE.scale}
      revision={PLATE.revision}
      refs={PLATE.refs}
      jsonLd={[
        webPage({
          path: META.path,
          name: META.title,
          description: META.description,
          type: 'ContactPage',
          card: META.card,
          extra: { mainEntity: { '@id': PERSON_ID } },
        }),
        breadcrumbs([{ name: 'C-700 Correspondence', path: META.path }]),
      ]}
      wide
      lead={<p>Let&apos;s build something that matters.</p>}
      record={CHANNELS.map((c) => ({ k: c.label.toLowerCase(), v: c.value }))}
    >
      <div className={styles.layout}>
        <div className={styles.write}>
          <CorrespondenceForm />
        </div>

        <aside className={styles.lines} aria-label="Direct lines">
          <div className={styles.envelope} aria-hidden="true">
            <PlateFigure id="contact" />
          </div>

          <p className={styles.intro}>
            For technology leadership, an AI platform or agent that has to hold in production,
            an architecture review, or speaking. What I take on is on the{' '}
            <Link href="/engagements/">terms of engagement</Link>. Write here, or use a direct
            line.
          </p>

          {/* The one line most people want, set at the size of a headline. */}
          <div className={styles.primary}>
            <span className={styles.label}>{primary.label}</span>
            <a href={primary.href} className={styles.address}>
              {primary.value}
            </a>
            <CopyValue value={primary.value} className={styles.copy} />
          </div>

          <ul className={styles.channels}>
            {others.map((channel) => (
              <li key={channel.label}>
                <a
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.channel}
                >
                  <span className={styles.label}>{channel.label}</span>
                  <span className={styles.value}>{channel.value}</span>
                  <span className={styles.arrow} aria-hidden="true">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>

          {/* The calling card: the same lines, as a thing to keep or pass on. */}
          <CardTicket />

          <dl className={styles.facts}>
            <div>
              <dt>Based</dt>
              <dd>India</dd>
            </div>
            <div>
              <dt>Local time</dt>
              <dd>
                <LocalTime />
              </dd>
            </div>
            <div>
              <dt>Replies</dt>
              <dd>I read everything and reply to most things.</dd>
            </div>
          </dl>
        </aside>
      </div>
    </PlateShell>
  );
}
