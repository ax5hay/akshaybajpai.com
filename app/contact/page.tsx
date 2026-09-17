import { PlateShell } from '@/components/plate/PlateShell';
import { CorrespondenceForm } from '@/components/plate/CorrespondenceForm';
import { getPlateByHref } from '@/lib/plates';
import { buildMetadata } from '@/lib/metadata';
import { SOCIAL } from '@/lib/constants';
import styles from './contact.module.css';

const PLATE = getPlateByHref('/contact/')!;

export const metadata = buildMetadata({
  title: 'Contact · Akshay Bajpai | AI Architect & Technology Leader',
  description: 'Get in touch for AI systems, architecture, or performance-critical product work.',
  path: '/contact/',
});

const CHANNELS = [
  { label: 'Email', value: SOCIAL.email, href: `mailto:${SOCIAL.email}` },
  { label: 'LinkedIn', value: 'linkedin.com/in/ax5hay', href: SOCIAL.linkedin },
  { label: 'GitHub', value: 'github.com/ax5hay', href: SOCIAL.github },
  { label: 'Twitter / X', value: '@ax5hay', href: SOCIAL.twitter },
];

export default function ContactPage() {
  return (
    <PlateShell
      sheet={PLATE.sheet}
      title={PLATE.title}
      subtitle={PLATE.subtitle}
      discipline={PLATE.discipline}
      scale={PLATE.scale}
      revision={PLATE.revision}
      refs={PLATE.refs}
      lead={<p>Let&apos;s build something that matters.</p>}
      record={CHANNELS.map((c) => ({ k: c.label.toLowerCase(), v: c.value }))}
    >
      <div className="prose prose-lead">
        <p>
          For forward-deployed AI work, architecture reviews, speaking, or collaboration on
          systems design and performance engineering, use the form below or connect on LinkedIn
          and GitHub.
        </p>
      </div>

      <dl className={styles.channels}>
        {CHANNELS.map((channel) => (
          <div key={channel.label} className={styles.channel}>
            <dt>{channel.label}</dt>
            <dd>
              <a
                href={channel.href}
                target={channel.href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
              >
                {channel.value}
              </a>
            </dd>
          </div>
        ))}
      </dl>

      <CorrespondenceForm />
    </PlateShell>
  );
}
