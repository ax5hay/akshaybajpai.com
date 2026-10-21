'use client';

import { useCallback } from 'react';
import { useMode } from './ModeProvider';
import { LEVEL, V, say, type Key, type Level, type Said } from '@/lib/voice';

/**
 * The set's voice at the current level, for client components: `t('index')`
 * gives the phrase, `t.level` the level itself for anything keyed on it.
 */
export function useVoice() {
  const { mode } = useMode();
  const level: Level = LEVEL[mode];
  const t = useCallback((k: Key | Said) => say(level, typeof k === 'string' ? V[k] : k), [level]);
  return Object.assign(t, { level });
}
