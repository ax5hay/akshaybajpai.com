'use client';

import { useState } from 'react';
import { Button } from '@/components/kit/Controls';
import { useToast } from '@/components/system/ToastProvider';
import styles from './CorrespondenceForm.module.css';

const ENDPOINT = 'https://formspree.io/f/xlgeqele';

/** The kinds of correspondence the sheet above this form invites. */
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

/**
 * A transmittal: the cover slip a drawing office sends with anything it
 * issues. Who it is from, what it concerns, the message, and a stamp when it
 * has gone.
 */
export function CorrespondenceForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [words, setWords] = useState(0);
  const { toast } = useToast();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');

    const form = event.currentTarget;

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(String(response.status));

      form.reset();
      setWords(0);
      setStatus('sent');
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

  return (
    <form className={styles.form} onSubmit={onSubmit} aria-label="Correspondence" data-status={status}>
      <div className={styles.head}>
        <span className={styles.headTitle}>Transmittal</span>
        <span className={styles.headNo} suppressHydrationWarning>
          C-700 / 01 · {today()}
        </span>
      </div>

      <div className={styles.field}>
        <label htmlFor="email">From</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          disabled={sending}
        />
      </div>

      <div className={styles.field}>
        <span className={styles.legend} id="regarding">
          Regarding
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
          Message
          <span className={styles.count} aria-hidden="true">
            {words} {words === 1 ? 'word' : 'words'}
          </span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={7}
          required
          placeholder="What are you building, and where is it stuck?"
          disabled={sending}
          onChange={(e) => setWords(e.target.value.trim().split(/\s+/).filter(Boolean).length)}
        />
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant="solid" disabled={sending}>
          {sending ? 'Sending…' : 'Send transmittal'}
        </Button>

        {/* Toasts carry the outcome, but status must also reach assistive
            technology and anyone who dismissed the slip. */}
        <p className={styles.status} role="status" aria-live="polite">
          {status === 'sent' && 'Sent. I will come back to you.'}
          {status === 'failed' && 'Failed. Email hello@akshaybajpai.com instead.'}
        </p>

        {status === 'sent' && (
          <span className={styles.stamp} aria-hidden="true">
            <span>Transmitted</span>
            <span suppressHydrationWarning>{today()}</span>
          </span>
        )}
      </div>
    </form>
  );
}
