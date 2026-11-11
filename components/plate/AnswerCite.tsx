'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Makes each numbered answer on A-103 citable, as ProseTools does for an
 * article's headings: press its number and the reference (sheet, number,
 * question, link) is on the clipboard. The numbers are plain anchors, so
 * without script they still jump to the answer and put it in the address bar.
 *
 * It confirms in place, on the number itself, rather than through the toast
 * system, which keeps this sheet's script to what it draws.
 */
export function AnswerCite({ sheet, children }: { sheet: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [said, setSaid] = useState('');

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const onClick = async (event: MouseEvent) => {
      const link = (event.target as Element).closest?.('a[data-cite]') as HTMLAnchorElement | null;
      if (!link) return;
      event.preventDefault();
      const id = link.dataset.cite!;
      const question = root.querySelector(`#${id} [data-q]`)?.textContent ?? '';
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      history.replaceState(history.state, '', `#${id}`);
      const label = `${sheet} / ${link.textContent}`;
      const mark = (state: 'copied' | 'blocked') => {
        link.dataset.copied = state;
        setSaid(state === 'copied' ? `Link to ${label} copied` : 'Copy blocked; the link is in the address bar');
        window.setTimeout(() => delete link.dataset.copied, 1600);
      };
      try {
        await navigator.clipboard.writeText(`${label} · ${question} · ${url}`);
        mark('copied');
      } catch {
        mark('blocked');
      }
    };

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [sheet]);

  return (
    <div ref={ref}>
      {children}
      <p className="u-visually-hidden" role="status">
        {said}
      </p>
    </div>
  );
}
