'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useToast } from '@/components/system/ToastProvider';

/**
 * Makes the numbered section headings of an article citable: press one and
 * its reference (sheet number, section number, link) is on the clipboard.
 *
 * The prose is static HTML set by the server. Nothing is injected into it and
 * nothing in it is re-rendered; this is one delegated listener on the wrapper.
 */
export function ProseTools({ sheet, children }: { sheet: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const cite = async (heading: HTMLElement) => {
      const all = Array.from(root.querySelectorAll('h2[id]'));
      const number = String(all.indexOf(heading) + 1).padStart(2, '0');
      const url = `${window.location.origin}${window.location.pathname}#${heading.id}`;
      history.replaceState(history.state, '', `#${heading.id}`);
      try {
        await navigator.clipboard.writeText(`${sheet} / ${number} · ${heading.textContent} · ${url}`);
        toast({
          kind: 'Section reference copied',
          message: `${sheet} / ${number} · ${heading.textContent}`,
          detail: 'Sheet, section and link are on your clipboard',
          tone: 'revision',
          group: 'cite',
        });
      } catch {
        toast({
          kind: 'Copy blocked',
          message: 'The browser refused clipboard access',
          detail: 'The link is in the address bar instead',
          tone: 'issue',
          group: 'cite',
        });
      }
    };

    const onClick = (event: MouseEvent) => {
      const heading = (event.target as Element).closest?.('h2[id]') as HTMLElement | null;
      // Not while the reader is selecting the heading's text.
      if (!heading || window.getSelection()?.toString()) return;
      void cite(heading);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const heading = event.target as HTMLElement;
      if (heading.tagName !== 'H2' || !heading.id) return;
      event.preventDefault();
      void cite(heading);
    };

    // Reachable, and announced as something that can be pressed.
    root.querySelectorAll<HTMLElement>('h2[id]').forEach((h) => {
      h.tabIndex = 0;
      h.title = 'Copy a reference to this section';
    });

    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('click', onClick);
      root.removeEventListener('keydown', onKey);
    };
  }, [sheet, toast]);

  return (
    <div ref={ref} data-sections>
      {children}
    </div>
  );
}
