import { PageShell } from '@/components/PageShell';
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
      <article className="page-shell section-surface">
        <div className="page-shell-inner">
          <header className="page-header" data-reveal>
            <h1 className="page-title">Contact</h1>
            <p className="page-lead">Let&apos;s build something that matters.</p>
          </header>
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
            <form className={styles.form} action="https://formspree.io/f/xlgeqele" method="POST" aria-label="Contact form" data-reveal>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required autoComplete="email" />
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={5} required />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </article>
    </PageShell>
  );
}
