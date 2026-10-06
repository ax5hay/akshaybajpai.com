'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/kit/Controls';
import { useToast } from '@/components/system/ToastProvider';
import { useRoute } from '@/components/system/Route';
import type { CoverSheet } from '@/components/system/Preloader';
import styles from './CorrespondenceForm.module.css';

const ENDPOINT = 'https://formspree.io/f/xlgeqele';
const DRAFT_KEY = 'plate.transmittal';

/** The kinds of correspondence the sheet invites. */
const SUBJECTS = [
  'Forward-deployed AI work',
  'Architecture review',
  'Speaking',
  'Collaboration',
] as const;

type Status = 'idle' | 'sending' | 'sent' | 'failed';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

/**
 * A transmittal: the cover slip a drawing office sends with anything it
 * issues. Printed on reversed stock, like the sheet on the key plan that
 * leads here, because this is the one thing the set asks a reader to do.
 *
 * It keeps what has been typed. A draft is held for the visit, so reading
 * another sheet and coming back, or reloading by accident, loses nothing; it
 * is cleared the moment the transmittal goes. Nothing is stored beyond the
 * tab, and nothing is sent until the reader sends it.
 */
export function CorrespondenceForm({ sheets }: { sheets: CoverSheet[] }) {
  const [status, setStatus] = useState<Status>('idle');
  // The sheets this reader has been through, by number, in the order read.
  // Enclosed only if they tick the box; otherwise it never leaves the tab.
  const route = useRoute();
  const readSheets = route
    .map((href) => sheets.find((s) => s.href === href))
    .filter((s): s is CoverSheet => Boolean(s));
  const [enclose, setEnclose] = useState(false);
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [restored, setRestored] = useState(false);
  const [mac, setMac] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  // Pick the draft back up.
  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
    try {
      const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null') as {
        email?: string;
        subject?: string;
        message?: string;
      } | null;
      if (!draft) return;
      if (draft.email) setEmail(draft.email);
      if (draft.subject && (SUBJECTS as readonly string[]).includes(draft.subject))
        setSubject(draft.subject);
      if (draft.message) {
        setMessage(draft.message);
        setRestored(true);
      }
    } catch {
      /* no draft, or no storage */
    }
  }, []);

  // Keep it. Written after a pause in typing, not on every key.
  useEffect(() => {
    if (status === 'sent') return;
    const timer = setTimeout(() => {
      try {
        if (email || message) {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ email, subject, message }));
        } else {
          sessionStorage.removeItem(DRAFT_KEY);
        }
      } catch {
        /* nothing to persist to */
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [email, subject, message, status]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        body: new FormData(event.currentTarget),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(String(response.status));

      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* nothing to clear */
      }
      setStatus('sent');
      setRestored(false);
      toast({
        kind: 'Transmittal logged',
        message: 'Your message is on its way.',
        detail: 'I read everything and reply to most things',
        tone: 'revision',
      });
    } catch {
      setStatus('failed');
      toast({
        kind: 'Transmittal failed',
        message: 'The form could not reach the server.',
        detail: 'Email hello@akshaybajpai.com directly',
        tone: 'issue',
      });
    }
  };

  const sending = status === 'sending';
  const words = countWords(message);

  if (status === 'sent') {
    return (
      <section className={`${styles.form} ${styles.receipt} reversed`} aria-label="Transmittal sent">
        <div className={styles.head}>
          <span className={styles.headTitle}>Transmittal</span>
          <span className={styles.headNo}>C-700 / 01 · {today()}</span>
        </div>
        <div className={styles.receiptBody} role="status">
          <span className={styles.stamp} aria-hidden="true">
            <span>Transmitted</span>
            <span>{today()}</span>
          </span>
          <p className={styles.receiptTitle}>It has gone.</p>
          <dl className={styles.receiptFacts}>
            <div>
              <dt>From</dt>
              <dd>{email}</dd>
            </div>
            <div>
              <dt>Regarding</dt>
              <dd>{subject}</dd>
            </div>
            {enclose && readSheets.length > 0 && (
              <div>
                <dt>Enclosed</dt>
                <dd>{readSheets.map((s) => s.sheet).join(' → ')}</dd>
              </div>
            )}
            <div>
              <dt>Length</dt>
              <dd>
                {words} {words === 1 ? 'word' : 'words'}
              </dd>
            </div>
          </dl>
          <p className={styles.receiptNote}>I read everything and reply to most things.</p>
          <Button
            onClick={() => {
              setMessage('');
              setStatus('idle');
            }}
          >
            Write another
          </Button>
        </div>
      </section>
    );
  }

  return (
    <form
      ref={formRef}
      className={`${styles.form} reversed`}
      onSubmit={onSubmit}
      aria-label="Correspondence"
      onKeyDown={(event) => {
        // The shortcut every writing tool has, so it is here too.
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          formRef.current?.requestSubmit();
        }
      }}
    >
      <div className={styles.head}>
        <span className={styles.headTitle}>Transmittal</span>
        <span className={styles.headNo} suppressHydrationWarning>
          C-700 / 01 · {today()}
        </span>
      </div>

      <div className={styles.field}>
        <label htmlFor="email">
          <span>
            <span className={styles.no}>01</span> From
          </span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={sending}
        />
      </div>

      <div className={styles.field}>
        <span className={styles.legend} id="regarding">
          <span className={styles.no}>02</span> Regarding
        </span>
        <div className={styles.subjects} role="radiogroup" aria-labelledby="regarding">
          {SUBJECTS.map((s) => (
            <label key={s} className={styles.subject} data-on={s === subject || undefined}>
              <input
                type="radio"
                name="subject"
                value={s}
                checked={s === subject}
                onChange={() => setSubject(s)}
                disabled={sending}
              />
              <span className={styles.tick} aria-hidden="true" />
              {s}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="message">
          <span>
            <span className={styles.no}>03</span> Message
          </span>
          <span className={styles.count} aria-hidden="true">
            {restored && words > 0 ? 'Draft kept · ' : ''}
            {words} {words === 1 ? 'word' : 'words'}
          </span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={8}
          required
          placeholder="What are you building, and where is it stuck?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
        />
      </div>

      {readSheets.length > 0 && (
        <div className={styles.field} data-enclosure>
          <span className={styles.legend}>
            <span className={styles.no}>04</span> Enclosure
          </span>
          <div>
          <label className={styles.subject} data-on={enclose || undefined}>
            <input
              type="checkbox"
              checked={enclose}
              onChange={(e) => setEnclose(e.target.checked)}
              disabled={sending}
            />
            <span className={styles.tick} aria-hidden="true" />
            Enclose the {readSheets.length === 1 ? 'sheet' : `${readSheets.length} sheets`} I have
            read
          </label>
          </div>
          <p className={styles.route}>
            {readSheets.map((s) => (
              <span key={s.href} title={s.title}>
                {s.sheet}
              </span>
            ))}
          </p>
          <p className={styles.routeNote}>
            Your route through the set, kept in this browser only. Tick the box and it goes with
            the message, so I know what you were looking at.
          </p>
          {enclose && (
            <input
              type="hidden"
              name="sheets_read"
              value={readSheets.map((s) => `${s.sheet} ${s.title}`).join(' → ')}
            />
          )}
        </div>
      )}

      <div className={styles.actions}>
        <Button type="submit" variant="solid" disabled={sending}>
          {sending ? 'Sending…' : 'Send transmittal'}
        </Button>
        <span className={styles.shortcut} aria-hidden="true">
          <kbd>{mac ? '⌘' : 'Ctrl'}</kbd>
          <kbd>↵</kbd> to send
        </span>

        {/* Toasts carry the outcome, but status must also reach assistive
            technology and anyone who dismissed the slip. */}
        <p className={styles.status} role="status" aria-live="polite">
          {status === 'failed' && 'Failed. Your message is still here. Email hello@akshaybajpai.com instead.'}
        </p>
      </div>
    </form>
  );
}
