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
  artifact: { label: 'Artifact', rev: 'A', blurb: 'Plain language, the finished page' },
  annotated: { label: 'Annotated', rev: 'B', blurb: 'Technical: the engineering shown' },
  raw: { label: 'Raw', rev: 'C', blurb: 'Fully technical: source and structure' },
};

export const MODE_STORAGE_KEY = 'plate.mode';

export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && (MODES as string[]).includes(value);
}
