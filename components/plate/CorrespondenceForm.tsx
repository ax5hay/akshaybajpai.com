'use client';

import { useState } from 'react';
import { Button } from '@/components/kit/Controls';
import { useToast } from '@/components/system/ToastProvider';
import styles from './CorrespondenceForm.module.css';

const ENDPOINT = 'https://formspree.io/f/xlgeqele';

type Status = 'idle' | 'sending' | 'sent' | 'failed';

export function CorrespondenceForm() {
  const [status, setStatus] = useState<Status>('idle');
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
    <form className={styles.form} onSubmit={onSubmit} aria-label="Correspondence">
      <div className={styles.head}>
        <span className={styles.headTitle}>Transmittal</span>
        <span className={styles.headNo}>C-700 / 01</span>
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
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder="What are you building, and where is it stuck?"
          disabled={sending}
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
      </div>
    </form>
  );
}
