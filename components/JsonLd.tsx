import { graph, identityGraph } from '@/lib/metadata';

/**
 * Structured data. The layout renders the identity graph (the person and
 * the site, each with a stable @id) once; pages render their own graph and
 * refer to those ids, so every article, breadcrumb and page is tied to one
 * entity rather than repeating it.
 */
export function JsonLd({ things }: { things?: Record<string, unknown>[] }) {
  const json = things ? graph(...things) : graph(...identityGraph());
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
