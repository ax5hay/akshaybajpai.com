'use client';

import styles from './CoachMark.module.css';

interface Props {
  onDismiss: () => void;
}

export function CoachMark({ onDismiss }: Props) {
  return (
    <div className={styles.mark} role="status">
      <p>Tap a section below or explore the glowing nodes</p>
      <button type="button" onClick={onDismiss}>
        Got it
      </button>
    </div>
  );
}
