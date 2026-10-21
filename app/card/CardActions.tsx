'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useToast } from '@/components/system/ToastProvider';
import { useMode } from '@/components/system/ModeProvider';
import { MODES, MODE_INFO } from '@/lib/mode';
import styles from './card.module.css';

/**
 * Marks the document as the calling card for as long as that sheet is
 * mounted, so the instruments stay struck through a client-side arrival and
 * come back the moment the reader goes on to any other sheet. The first
 * paint is handled before this runs: ModeScript sets the same flag from the
 * address, which is what keeps the rail from flashing in.
 */
export function CardFlag() {
  useEffect(() => {
    document.documentElement.dataset.card = '';
    return () => {
      delete document.documentElement.dataset.card;
    };
  }, []);
  return null;
}

/** Asked for by "Show the code" at the foot; answered by the card. */
const TURN_EVENT = 'card:turn';
/** Sent by "Save contact"; the card takes a received stamp. */
const STAMP_EVENT = 'card:stamp';

/** A tick through the hand, where the phone has one. Android does; iOS does not. */
function tick(ms = 8) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // Not every browser lets a page do this.
  }
}

/** Today, the way the sheet dates things: 2026.10.21. */
function today(): string {
  const d = new Date();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map((n) => String(n).padStart(2, '0')).join('.');
}

/**
 * The card as an object. It leans toward a pointer, toward the tilt of a
 * phone where the phone reports one without asking (Android does; iOS asks
 * for permission, and a first contact is no place for a permission prompt,
 * so there it drifts on its own), and it turns over when pressed, to show
 * the code on its back.
 *
 * The lean is written as four custom properties on the card and nothing else
 * re-renders: --rx and --ry tilt it, --gx and --gy place the light on it,
 * and the foil reads the same numbers so the engraving catches the light as
 * the card moves.
 */
export function CardObject({ front, back }: { front: ReactNode; back: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [turned, setTurned] = useState(false);
  const [stamped, setStamped] = useState<string | null>(null);

  const lean = useCallback((x: number, y: number) => {
    const el = ref.current;
    if (!el) return;
    // x and y run from -1 to 1 across the card.
    el.style.setProperty('--rx', `${(-y * 9).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * 13).toFixed(2)}deg`);
    el.style.setProperty('--gx', `${(50 + x * 45).toFixed(1)}%`);
    el.style.setProperty('--gy', `${(50 + y * 45).toFixed(1)}%`);
    el.style.setProperty('--tx', x.toFixed(3));
  }, []);

  const rest = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    for (const name of ['--rx', '--ry', '--gx', '--gy', '--tx']) el.style.removeProperty(name);
    delete el.dataset.live;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const schedule = (x: number, y: number) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.dataset.live = '';
        lean(x, y);
      });
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const box = el.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width) * 2 - 1;
      const y = ((event.clientY - box.top) / box.height) * 2 - 1;
      schedule(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)));
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      rest();
    };

    // The phone's tilt, measured from however it was held when the page
    // opened, so holding it at any angle reads as level.
    let base: { beta: number; gamma: number } | null = null;
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.beta == null || event.gamma == null) return;
      base ??= { beta: event.beta, gamma: event.gamma };
      const x = Math.max(-1, Math.min(1, (event.gamma - base.gamma) / 22));
      const y = Math.max(-1, Math.min(1, (event.beta - base.beta) / 22));
      schedule(x, y);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    const asks = typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function';
    if (!asks) window.addEventListener('deviceorientation', onTilt);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, [lean, rest]);

  useEffect(() => {
    const onTurn = () => {
      setTurned(true);
      tick();
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    // The stamp lands on the front, so the card comes back round for it.
    const onStamp = () => {
      setTurned(false);
      setStamped(today());
      tick(18);
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    window.addEventListener(TURN_EVENT, onTurn);
    window.addEventListener(STAMP_EVENT, onStamp);
    return () => {
      window.removeEventListener(TURN_EVENT, onTurn);
      window.removeEventListener(STAMP_EVENT, onStamp);
    };
  }, []);

  return (
    <div className={styles.stage}>
      <div
        ref={ref}
        className={styles.object}
        data-turned={turned ? '' : undefined}
        data-stamped={stamped ? '' : undefined}
      >
        <div className={styles.drift}>
          <div className={styles.turn}>
            <div className={`${styles.face} ${styles.front}`} aria-hidden={turned}>
              {front}
              {stamped && (
                <span className={styles.stampMark} key={stamped} aria-hidden="true">
                  <span>Received</span>
                  <span>{stamped}</span>
                </span>
              )}
            </div>
            <div className={`${styles.face} ${styles.back}`} aria-hidden={!turned}>
              {back}
            </div>
          </div>
        </div>
        {/* Over the whole card, so a press anywhere on it turns it. */}
        <button
          type="button"
          className={styles.turnButton}
          aria-pressed={turned}
          aria-label={turned ? 'Turn the card face up' : 'Turn the card over to show its QR code'}
          onClick={() => {
            tick();
            setTurned((t) => !t);
          }}
        />
      </div>
      <p className={styles.caption} aria-hidden="true">
        <span className={styles.captionTurn}>
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v2.8h-2.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          {turned ? 'Tap to turn back' : 'Tap to turn over'}
        </span>
        <span className={styles.captionDim}>
          <i />
          85 × 55 mm
          <i />
        </span>
      </p>
    </div>
  );
}

/**
 * "Save contact". The link hands the phone the vCard; the page, which stays
 * where it is, stamps the card received, so there is no doubt it went.
 */
export function SaveContact({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      download="akshay-bajpai.vcf"
      className={className}
      onClick={() => window.dispatchEvent(new Event(STAMP_EVENT))}
    >
      {children}
    </a>
  );
}

/** "Show the code": turns the card over and brings it into view. */
export function ShowCode({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(TURN_EVENT))}>
      {children}
    </button>
  );
}

/**
 * Copies a value and says so where the thumb is, not in a toast at the far
 * end of the screen: the control itself reads "Copied" for a moment.
 */
export function CopyLine({ value, label, className }: { value: string; label: string; className?: string }) {
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(timer);
  }, [done]);

  return (
    <button
      type="button"
      className={className}
      data-done={done ? '' : undefined}
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
        } catch {
          toast({
            kind: 'Copy blocked',
            message: 'The browser refused clipboard access',
            tone: 'issue',
            group: 'copy',
          });
        }
      }}
    >
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        {done ? (
          <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        ) : (
          <>
            <rect x="5.5" y="5.5" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10.5 3.5v-1h-8v8h1" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </>
        )}
      </svg>
      <span aria-live="polite">{done ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

/**
 * Passing the card on. The system share sheet where there is one, which on
 * a phone is every messaging app at once; a copied link where there is not.
 */
export function ShareCard({
  url,
  title,
  text,
  className,
}: {
  url: string;
  title: string;
  text: string;
  className?: string;
}) {
  const [canShare, setCanShare] = useState(false);
  const { toast } = useToast();
  useEffect(() => setCanShare(typeof navigator.share === 'function'), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ kind: 'Link copied', message: url, tone: 'revision', group: 'copy' });
    } catch {
      toast({
        kind: 'Copy blocked',
        message: 'The browser refused clipboard access',
        detail: 'Copy the address bar instead',
        tone: 'issue',
        group: 'copy',
      });
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title, text, url });
    } catch (error) {
      // Closing the share sheet is not a failure; anything else falls back.
      if ((error as DOMException)?.name !== 'AbortError') await copy();
    }
  };

  return (
    <button type="button" className={className} onClick={canShare ? share : copy}>
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path d="M8 10V2.5M5 5.2L8 2.2l3 3M3.5 8v5.5h9V8" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      {canShare ? 'Share card' : 'Copy link'}
    </button>
  );
}

/**
 * The card re-issued in any of the set's three states, the same switch the
 * set's instrument dock carries: paper, cyanotype, source.
 */
export function Reissue() {
  const { mode, setMode } = useMode();
  return (
    <div className={styles.reissue} role="radiogroup" aria-label="Re-issue the card">
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          className={styles.rev}
          data-rev={m}
          onClick={() => setMode(m)}
          title={`${MODE_INFO[m].label}: ${MODE_INFO[m].blurb}`}
        >
          <span className={styles.revSwatch} aria-hidden="true" />
          <span className={styles.revLetter}>{MODE_INFO[m].rev}</span>
          <span className={styles.revName}>{MODE_INFO[m].label}</span>
        </button>
      ))}
    </div>
  );
}
