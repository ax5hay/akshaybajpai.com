'use client';

import { useId, useState, type ReactNode } from 'react';
import styles from './Controls.module.css';

/* ---------------------------------------------------------------- Button */

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  type?: 'button' | 'submit';
  disabled?: boolean;
  full?: boolean;
}

export function Button({
  children,
  onClick,
  variant = 'outline',
  type = 'button',
  disabled = false,
  full = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={styles.button}
      data-variant={variant}
      data-full={full || undefined}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={styles.buttonLabel}>{children}</span>
      <span className={styles.buttonRule} aria-hidden="true" />
    </button>
  );
}

/* ---------------------------------------------------------------- Switch */

interface SwitchProps {
  label: string;
  hint?: string;
  defaultOn?: boolean;
  onChange?: (on: boolean) => void;
}

/**
 * A panel toggle. Uses a real checkbox so it is announced, focusable, and
 * operable by keyboard without any handler of ours.
 */
export function Switch({ label, hint, defaultOn = false, onChange }: SwitchProps) {
  const id = useId();
  const [on, setOn] = useState(defaultOn);

  return (
    <div className={styles.switchRow}>
      <label className={styles.switchLabel} htmlFor={id}>
        <span className={styles.switchName}>{label}</span>
        {hint && <span className={styles.switchHint}>{hint}</span>}
      </label>

      <input
        id={id}
        type="checkbox"
        className={styles.switchInput}
        checked={on}
        onChange={(e) => {
          setOn(e.target.checked);
          onChange?.(e.target.checked);
        }}
      />

      <span className={styles.switchTrack} aria-hidden="true">
        <span className={styles.switchThumb} />
        <span className={styles.switchOn}>On</span>
        <span className={styles.switchOff}>Off</span>
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------- Stamp */

interface StampProps {
  children: ReactNode;
  tone?: 'approved' | 'draft' | 'void';
}

/** An inked rubber stamp, set at a slight angle as if applied by hand. */
export function Stamp({ children, tone = 'approved' }: StampProps) {
  return (
    <span className={styles.stamp} data-tone={tone}>
      <span className={styles.stampInner}>{children}</span>
    </span>
  );
}
