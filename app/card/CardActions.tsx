'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useToast } from '@/components/system/ToastProvider';
import { useMode } from '@/components/system/ModeProvider';
import { MODES, MODE_INFO } from '@/lib/mode';
import { useVoice } from '@/components/system/useVoice';
import { LEVEL_INFO, LEVEL } from '@/lib/voice';
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
    // Seen once, the card is never forced on this session again.
    try {
      sessionStorage.setItem('card.seen', '1');
    } catch {
      // Private mode: the scan check needs storage too, so it cannot loop.
    }
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
 * The card as an object. It leans toward a pointer, toward a finger dragged
 * across it, and toward the tilt of a phone where the phone reports one
 * without asking (Android does; iOS asks for permission, and a first contact
 * is no place for a permission prompt, so there it drifts on its own). It
 * turns over when pressed, to show the code on its back.
 *
 * Everything that moves is a transform written straight onto the element
 * that moves: the card, the foil's sheen, the light. Nothing is written to a
 * custom property, which would restyle the whole card, and no mask or
 * gradient is touched, which would repaint it. Sensor and pointer only set
 * a target; one animation frame eases toward it and stops when it arrives,
 * so a noisy gyroscope reads as a hand, not a tremor.
 */
export function CardObject({ front, back }: { front: ReactNode; back: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const [turned, setTurned] = useState(false);
  // Whether this reader has turned the card before. Until they have, the
  // card shows them it turns; once they have, it never does again.
  const [taught, setTaught] = useState(true);
  useEffect(() => {
    try {
      setTaught(localStorage.getItem('card.taught') === '1');
    } catch {
      setTaught(false);
    }
  }, []);
  useEffect(() => {
    if (!turned || taught) return;
    setTaught(true);
    try {
      localStorage.setItem('card.taught', '1');
    } catch {
      // Not remembered; the hint returns on the next visit, which is harmless.
    }
  }, [turned, taught]);
  const [stamped, setStamped] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const sheens = el.querySelectorAll<HTMLElement>('[data-sheen]');
    const lights = el.querySelectorAll<HTMLElement>('[data-light]');

    // Where the card is leaning, and where it is asked to lean: -1 to 1.
    const now = { x: 0, y: 0 };
    const want = { x: 0, y: 0 };
    let frame = 0;

    const draw = () => {
      now.x += (want.x - now.x) * 0.14;
      now.y += (want.y - now.y) * 0.14;
      el.style.transform = `rotateX(${(-now.y * 9).toFixed(2)}deg) rotateY(${(now.x * 13).toFixed(2)}deg)`;
      for (const s of sheens) s.style.opacity = Math.min(1, Math.abs(now.x) * 1.3 + Math.abs(now.y) * 0.4).toFixed(3);
      for (const l of lights) l.style.transform = `translate3d(${(now.x * 30).toFixed(2)}%, ${(now.y * 30).toFixed(2)}%, 0)`;
      // Stop as soon as it is close enough to see no difference, so a card at
      // rest costs nothing between movements.
      if (Math.abs(want.x - now.x) + Math.abs(want.y - now.y) > 0.01) frame = requestAnimationFrame(draw);
      else frame = 0;
    };
    const aim = (x: number, y: number) => {
      want.x = Math.max(-1, Math.min(1, x));
      want.y = Math.max(-1, Math.min(1, y));
      if (!frame) frame = requestAnimationFrame(draw);
    };

    // A mouse or a pen: lean toward it.
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const box = el.getBoundingClientRect();
      aim(((event.clientX - box.left) / box.width) * 2 - 1, ((event.clientY - box.top) / box.height) * 2 - 1);
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') aim(0, 0);
    };

    // A finger: dragged sideways, the card follows it; up and down is the
    // page's, and scrolls. A drag is not a press, so it does not turn it.
    let start: { x: number; y: number } | null = null;
    const onDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      start = { x: event.clientX, y: event.clientY };
      dragged.current = false;
    };
    const onTouchMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || !start) return;
      const dx = event.clientX - start.x;
      if (Math.abs(dx) > 8) dragged.current = true;
      aim(dx / 140, (event.clientY - start.y) / 240);
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      start = null;
      aim(0, 0);
    };

    // The phone's tilt, measured from however it was held when the page
    // opened, so holding it at any angle reads as level.
    let base: { beta: number; gamma: number } | null = null;
    // A phone in the hand is never still: it trembles by a degree or so all
    // the time. Below that the card is told nothing, or it would be redrawn
    // on every frame for a movement nobody can see.
    let last = { x: 0, y: 0 };
    const onTilt = (event: DeviceOrientationEvent) => {
      if (start || event.beta == null || event.gamma == null) return;
      base ??= { beta: event.beta, gamma: event.gamma };
      const x = (event.gamma - base.gamma) / 20;
      const y = (event.beta - base.beta) / 20;
      if (Math.abs(x - last.x) + Math.abs(y - last.y) < 0.06) return;
      last = { x, y };
      aim(x, y);
    };

    // Off the screen, the card's own motion stops: nothing is composited for
    // a card nobody can see.
    // Marked on the stage, so the peeks around the card pause with it.
    const stage = el.closest<HTMLElement>('[data-card-stage]') ?? el;
    const seen = new IntersectionObserver(([entry]) => {
      stage.toggleAttribute('data-offscreen', !entry.isIntersecting);
    });
    seen.observe(el);

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onTouchMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    const asks = typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission === 'function';
    if (!asks) window.addEventListener('deviceorientation', onTilt);
    return () => {
      cancelAnimationFrame(frame);
      seen.disconnect();
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onTouchMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, []);

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
    };
    window.addEventListener(TURN_EVENT, onTurn);
    window.addEventListener(STAMP_EVENT, onStamp);
    return () => {
      window.removeEventListener(TURN_EVENT, onTurn);
      window.removeEventListener(STAMP_EVENT, onStamp);
    };
  }, []);

  return (
    <div className={styles.stage} data-card-stage data-taught={taught ? '' : undefined}>
      {/* Its own layer for the peek, a plain transform the compositor runs. */}
      <div className={styles.peek}>
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
        {/* Under the faces, which let every press through to it except on
            the lines that can be pressed themselves: the number, the seal,
            the address. So a press on the card turns it, and a press on a
            line does what the line says, and nothing is pressable that
            cannot be seen. */}
        <button
          type="button"
          className={styles.turnButton}
          aria-pressed={turned}
          aria-label={turned ? 'Turn the card face up' : 'Turn the card over to show its QR code'}
          onClick={() => {
            if (dragged.current) {
              dragged.current = false;
              return;
            }
            tick();
            setTurned((t) => !t);
          }}
        />
      </div>
      </div>
      <p className={styles.caption} aria-hidden="true">
        <span className={styles.captionTurn}>
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v2.8h-2.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          {turned ? (
            'Tap to turn it back'
          ) : taught ? (
            'Tap the card for its QR code'
          ) : (
            <span>
              Tap the card to turn it over
              <span className={styles.captionMore}> · QR code on the back</span>
            </span>
          )}
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

/**
 * The card arrives the way it is held: on its side, filling the phone, the
 * long edge down the screen. The page under it is portrait, so the first
 * scroll stands the card up, brings it down to the width of the column and
 * lets the page rise under it: one continuous turn, driven by the scroll.
 *
 * The turn is a CSS scroll-driven animation of `transform` and `opacity`,
 * which the browser runs on the compositor, off the main thread, and runs
 * backwards as faithfully as forwards. This component only measures, once,
 * how far and how large the card has to start (--dy, --s), from layout that
 * scrolling and the collapsing address bar do not change. Where scroll-driven
 * animations are not supported it also drives --p from the scroll itself.
 *
 * Only on a phone held upright, and never for a reader who asks for less
 * motion; everywhere else the card simply sits at the head of the column.
 */
export function CardIntro({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const t = useVoice();

  useEffect(() => {
    const intro = ref.current;
    if (!intro) return;
    const when = matchMedia('(max-width: 40rem) and (orientation: portrait) and (prefers-reduced-motion: no-preference)');
    const native = CSS.supports('animation-timeline: scroll()');
    const pin = intro.firstElementChild as HTMLElement;
    const stage = intro.querySelector<HTMLElement>('[data-card-stage]');
    const object = stage?.firstElementChild as HTMLElement | null;
    const probe = intro.querySelector<HTMLElement>('[data-probe]');
    if (!pin || !stage || !object || !probe) return;

    let frame = 0;
    let run = 1;
    let dy = 0;
    let scale = 1;
    const risers = [...pin.querySelectorAll<HTMLElement>(':scope > p, :scope > a, :scope > nav')];
    const light = pin.querySelector<HTMLElement>('[data-intro-light]');
    const hint = pin.querySelector<HTMLElement>('[data-intro-hint]');
    const caption = stage.querySelector<HTMLElement>('p');

    // From offsets, which neither the scroll nor the sticky pin moves.
    const measure = () => {
      if (!when.matches) return;
      const vh = probe.offsetHeight;
      const center = stage.offsetTop + object.offsetTop + object.offsetHeight / 2;
      const top = intro.getBoundingClientRect().top + window.scrollY;
      // As large as it will go on its side, with the nudge kept clear below.
      const room = 132;
      const s = Math.min(
        (vh * 0.78) / object.offsetWidth,
        (window.innerWidth - 28) / object.offsetHeight,
        (vh - 2 * room) / object.offsetWidth
      );
      intro.style.setProperty('--hint-top', `${(vh / 2 + (object.offsetWidth * s) / 2 + 22).toFixed(0)}px`);
      // And the turn helper, as far above the card as the nudge is below.
      intro.style.setProperty('--flip-top', `${(vh / 2 - (object.offsetWidth * s) / 2 - 46).toFixed(0)}px`);
      dy = vh / 2 - top - center;
      scale = s;
      intro.style.setProperty('--dy', `${dy.toFixed(1)}px`);
      intro.style.setProperty('--s', s.toFixed(3));
      intro.style.setProperty('--oy', `${(object.offsetTop + object.offsetHeight / 2).toFixed(1)}px`);
      run = Math.max(1, intro.offsetHeight - pin.offsetHeight);
      update();
    };

    // The page under the card cannot be pressed until it can be seen: below
    // the threshold it is transparent, and a tap on the card would otherwise
    // land on the Call and WhatsApp tiles lying invisible over it.
    let up = false;
    let moved = false;
    const settle = (raw: number) => {
      // While the card is turning under the scroll, it does not peek; back at
      // the top it does again.
      const nowMoved = raw > 0.01;
      if (nowMoved !== moved) {
        moved = nowMoved;
        intro.toggleAttribute('data-moved', moved);
      }
      const next = raw > 0.62;
      if (next !== up) {
        up = next;
        intro.toggleAttribute('data-up', up);
      }
    };

    // Where the browser cannot run the turn from the scroll, the same turn
    // written straight onto the elements that move: transforms and opacity,
    // nothing inherited, so nothing else is restyled.
    const draw = (raw: number) => {
      const p = 1 - Math.pow(1 - raw, 1.7);
      const q = 1 - p;
      stage.style.transform = `translate3d(0, ${(q * dy).toFixed(1)}px, 0) rotate(${(q * 90).toFixed(2)}deg) scale(${(1 + q * (scale - 1)).toFixed(4)})`;
      const rise = Math.min(1, Math.max(0, (p - 0.55) / 0.45));
      for (const r of risers) {
        r.style.opacity = rise.toFixed(3);
        r.style.transform = `translate3d(0, ${((1 - rise) * 24).toFixed(1)}px, 0)`;
      }
      if (light) light.style.opacity = q.toFixed(3);
      if (hint) hint.style.opacity = Math.max(0, 1 - p * 4).toFixed(3);
      if (caption) caption.style.opacity = Math.min(1, Math.max(0, (p - 0.92) * 12.5)).toFixed(3);
    };

    const update = () => {
      if (frame || !when.matches) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const raw = Math.min(1, Math.max(0, window.scrollY / run));
        settle(raw);
        if (!native) draw(raw);
      });
    };

    measure();
    document.fonts?.ready.then(measure);
    when.addEventListener('change', measure);
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      when.removeEventListener('change', measure);
      window.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <div ref={ref} className={styles.intro}>
      <div className={styles.pin}>
        <span className={styles.light} data-intro-light aria-hidden="true" />
        {children}
        {/* While the card lies on its side, what a press on it does. */}
        <p className={styles.introFlip} data-intro-flip aria-hidden="true">
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v2.8h-2.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          {t('introFlip')}
        </p>
        {/* The nudge, and a way to do it without scrolling: press it and the
            page scrolls the card upright. */}
        <button
          type="button"
          className={styles.introHint}
          data-intro-hint
          onClick={() => {
            const intro = ref.current;
            if (!intro) return;
            const run = intro.offsetHeight - (intro.firstElementChild as HTMLElement).offsetHeight;
            window.scrollTo({ top: run, behavior: 'smooth' });
          }}
        >
          <span className={styles.introPill}>
            <span className={styles.introArrow} aria-hidden="true" />
            <span className={styles.introHintLead}>{t('introLead')}</span>
          </span>
          <span className={styles.introHintLine}>{t('introLine')}</span>
        </button>
      </div>
      <span className={styles.probe} data-probe aria-hidden="true" />
    </div>
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
  const t = useVoice();
  return (
    <div className={styles.reissue} role="radiogroup" aria-label={t('reissueCard')}>
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          className={styles.rev}
          data-rev={m}
          onClick={() => setMode(m)}
          title={LEVEL_INFO[LEVEL[m]].about}
        >
          <span className={styles.revSwatch} aria-hidden="true" />
          <span className={styles.revLetter}>{MODE_INFO[m].rev}</span>
          <span className={styles.revName}>{t.level === 'a' ? LEVEL_INFO[LEVEL[m]].name : MODE_INFO[m].label}</span>
        </button>
      ))}
    </div>
  );
}
