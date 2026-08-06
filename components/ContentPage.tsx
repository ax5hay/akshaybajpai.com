import type { ReactNode } from 'react';
import type { SectionId } from '@/lib/sections';

interface Props {
  section: SectionId;
  wide?: boolean;
  children: ReactNode;
}

export function ContentPage({ section, wide = false, children }: Props) {
  return (
    <div
      className={`page-shell ${wide ? 'page-shell--wide' : ''} section-surface`}
      data-section={section}
    >
      <div className="page-shell-inner">{children}</div>
    </div>
  );
}
