'use client';

import { useEffect } from 'react';

/**
 * Drives A-103's brief composer. The composer is rendered on the server with
 * every control, note and possible precedent in place; this presses buttons,
 * shows what applies, and writes the lines of the slip that depend on the
 * choice. Nothing is sent: "Open in correspondence" is a link to C-700 that
 * writes the draft into the form's own draft store first; "Email it" is a
 * mailto.
 */

/** The correspondence sheet's draft store (see CorrespondenceForm). */
const DRAFT_KEY = 'plate.transmittal';
const EMAIL = 'hello@akshaybajpai.com';
const MOST = 4;

export interface BriefData {
  offers: { code: string; name: string; subject: string; proof: string[] }[];
  constraints: { id: string; name: string; proof: string[] }[];
  sheets: Record<string, { sheet: string; title: string }>;
}

export function BriefControl({ rootId, data }: { rootId: string; data: BriefData }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel);
    const $$ = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel));
    const out = (name: string) => $(`[data-out="${name}"]`);
    const input = $<HTMLInputElement>('[data-line]');
    const open = $<HTMLAnchorElement>('[data-act="open"]');
    const mail = $<HTMLAnchorElement>('[data-act="mail"]');

    let code: string | null = null;
    let kind: 'build' | 'review' = 'build';
    const picked = new Set<string>();
    let message = '';
    let subject = 'Technology leadership';

    const d = new Date();
    const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    $$('[data-date]').forEach((el) => (el.textContent = date));

    // The class the server gave the empty placeholders, read once, so an
    // emptied field is set back exactly as it was drawn.
    const blank = (out('offer')?.firstElementChild as HTMLElement | null)?.className ?? '';
    const empty = (el: HTMLElement) => (el.innerHTML = `<span class="${blank}">${el.dataset.empty}</span>`);

    const render = () => {
      const offer = data.offers.find((o) => o.code === code) ?? null;
      const chosen = data.constraints.filter((c) => picked.has(c.id));
      subject = kind === 'review' ? 'Architecture review' : (offer?.subject ?? 'Technology leadership');
      const line = input?.value.trim() ?? '';

      // Most relevant precedents first: an offer's own sheets count double.
      const score = new Map<string, number>();
      const add = (href: string, w: number) => data.sheets[href] && score.set(href, (score.get(href) ?? 0) + w);
      offer?.proof.forEach((href) => add(href, 2));
      chosen.forEach((c) => c.proof.forEach((href) => add(href, 1)));
      const ranked = [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, MOST).map(([href]) => href);

      $$('[data-offer]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.offer === code)));
      $$('[data-kind]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.kind === kind)));
      $$('[data-load]').forEach((b) => b.setAttribute('aria-pressed', String(picked.has(b.dataset.load!))));
      $$('[data-note]').forEach((li) => (li.hidden = !picked.has(li.dataset.note!)));
      const notes = $('[data-notes]');
      if (notes) notes.hidden = picked.size === 0;

      const subjectOut = out('subject');
      if (subjectOut) subjectOut.textContent = subject;
      const offerOut = out('offer');
      if (offerOut) {
        if (offer) offerOut.textContent = offer.name;
        else empty(offerOut);
      }
      const loadsOut = out('loads');
      if (loadsOut) {
        if (chosen.length) loadsOut.textContent = chosen.map((c) => c.name).join(' · ');
        else empty(loadsOut);
      }
      const lineRow = $('[data-row="line"]');
      if (lineRow) lineRow.hidden = !line;
      const lineOut = out('line');
      if (lineOut) lineOut.textContent = line;

      $$('[data-precedent]').forEach((li) => {
        const rank = ranked.indexOf(li.dataset.precedent!);
        li.hidden = rank === -1;
        li.style.order = String(rank);
      });
      const none = $('[data-none]');
      if (none) none.hidden = ranked.length > 0;
      const count = out('count');
      if (count) count.textContent = String(ranked.length);

      const stamp = $('[data-stamp]');
      if (stamp) stamp.toggleAttribute('data-ready', Boolean(offer));

      message = offer
        ? [
            `What I am building: ${offer.name.toLowerCase()}.`,
            kind === 'review' ? 'Something already exists; I would like it reviewed.' : '',
            chosen.length ? `It has to survive: ${chosen.map((c) => c.name.toLowerCase()).join(', ')}.` : '',
            line,
            ranked.length
              ? `\nSheets I read first: ${ranked.map((h) => `${data.sheets[h].sheet} ${data.sheets[h].title}`).join('; ')}.`
              : '',
          ]
            .filter(Boolean)
            .join('\n')
        : '';

      if (open) open.toggleAttribute('aria-disabled', !offer);
      if (mail) {
        mail.toggleAttribute('aria-disabled', !offer);
        mail.href = offer
          ? `mailto:${EMAIL}?subject=${encodeURIComponent(`${subject} · ${offer.name}`)}&body=${encodeURIComponent(message)}`
          : `mailto:${EMAIL}`;
      }
      const raw = out('raw');
      if (raw) {
        raw.hidden = !offer;
        raw.textContent = offer ? `${DRAFT_KEY} ← ${JSON.stringify({ subject, message }, null, 1)}` : '';
      }
    };

    const onClick = (event: MouseEvent) => {
      const el = (event.target as Element).closest?.('[data-offer],[data-kind],[data-load],[data-act]') as HTMLElement | null;
      if (!el) return;
      if (el.dataset.offer) code = code === el.dataset.offer ? null : el.dataset.offer;
      else if (el.dataset.kind) kind = el.dataset.kind as typeof kind;
      else if (el.dataset.load) {
        const id = el.dataset.load;
        if (picked.has(id)) picked.delete(id);
        else picked.add(id);
      } else if (el.dataset.act === 'mail') {
        if (!code) event.preventDefault();
        return;
      } else if (el.dataset.act === 'open') {
        // A real link to C-700: the draft is written before it navigates.
        if (!code) {
          event.preventDefault();
          return;
        }
        let email = '';
        try {
          email = (JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null') as { email?: string } | null)?.email ?? '';
        } catch {
          /* no earlier draft */
        }
        try {
          sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ email, subject, message }));
        } catch {
          /* no storage: the mail link still works */
        }
        return;
      }
      render();
    };

    root.addEventListener('click', onClick);
    input?.addEventListener('input', render);
    render();
    return () => {
      root.removeEventListener('click', onClick);
      input?.removeEventListener('input', render);
    };
  }, [rootId, data]);

  return null;
}
