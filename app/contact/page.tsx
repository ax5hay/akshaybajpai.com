import { PageShell } from '@/components/PageShell';
import { ContentPage } from '@/components/ContentPage';
import { PageHero } from '@/components/PageHero';
import { ContactForm } from '@/components/ContactForm';
import { buildMetadata } from '@/lib/metadata';
import { SOCIAL } from '@/lib/constants';
import styles from './contact.module.css';

export const metadata = buildMetadata({
  title: 'Contact · Akshay Bajpai | AI Architect & Technology Leader',
  description: 'Get in touch for AI systems, architecture, or performance-critical product work.',
  path: '/contact/',
});

export default function ContactPage() {
  return (
    <PageShell>
      <ContentPage section="contact">
        <PageHero section="contact" title="Contact" lead="Let's build something that matters." />
        <div data-reveal>
          <p className={styles.prose}>
            For consulting, speaking, or collaboration on AI infrastructure, systems design, or
            performance engineering, reach out.
          </p>
          <nav className={styles.links} aria-label="Contact links" data-reveal-stagger>
            <a href={`mailto:${SOCIAL.email}`} className="link-hover">{SOCIAL.email}</a>
            <a href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" className="link-hover">LinkedIn</a>
            <a href={SOCIAL.github} target="_blank" rel="noopener noreferrer" className="link-hover">GitHub</a>
            <a href={SOCIAL.twitter} target="_blank" rel="noopener noreferrer" className="link-hover">Twitter / X</a>
          </nav>
          <ContactForm />
        </div>
      </ContentPage>
    </PageShell>
  );
}
