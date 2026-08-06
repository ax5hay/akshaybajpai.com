'use client';

import { useState } from 'react';
import styles from './ContactForm.module.css';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch('https://formspree.io/f/xlgeqele', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) throw new Error('Send failed');
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Email hello@akshaybajpai.com directly.');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Contact form" data-reveal>
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required autoComplete="email" disabled={status === 'loading'} />

      <label htmlFor="message">Message</label>
      <textarea id="message" name="message" rows={5} required disabled={status === 'loading'} />

      <button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Send'}
      </button>

      {status === 'success' && (
        <p className={styles.success} role="status">
          Message sent — I&apos;ll get back to you soon.
        </p>
      )}
      {status === 'error' && (
        <p className={styles.error} role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
