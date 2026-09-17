/**
 * Drawing-mode vocabulary, kept free of `'use client'` on purpose.
 *
 * The pre-paint inline script is a server component and needs the literal
 * storage key at build time. Importing it from a client module yields a
 * client-reference stub, not the string, so these values must live here.
 */

export type Mode = 'artifact' | 'annotated' | 'raw';

export const MODES: Mode[] = ['artifact', 'annotated', 'raw'];

export const MODE_INFO: Record<Mode, { label: string; rev: string; blurb: string }> = {
  artifact: { label: 'Artifact', rev: 'A', blurb: 'The drawing as issued' },
  annotated: { label: 'Annotated', rev: 'B', blurb: 'Engineering markup exposed' },
  raw: { label: 'Raw', rev: 'C', blurb: 'Source, stripped of presentation' },
};

export const MODE_STORAGE_KEY = 'plate.mode';

export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && (MODES as string[]).includes(value);
}
