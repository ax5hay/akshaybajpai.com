'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import styles from './Hints.module.css';

/**
 * Margin notes: how the reader learns the set can be operated.
 *
 * One note at a time, keyed like a note on a drawing, saying one thing the
 * reader can do where they are, on the device they are holding. Each is shown
 * once, ever; a page shows at most three; and one press turns them all off.
 * They wait for the cover sheet to lift before the first is written.
 *
 * The dwell is the note's own depletion rule, a CSS animation, and the note
 * leaves on its `animationend`. So hovering or holding a note pauses the rule
 * and the dwell with it, with no timer to keep in step.
 */

interface Note {
  id: string;
  text: ReactNode;
}

const K = ({ children }: { children: ReactNode }) => <kbd className={styles.key}>{children}</kbd>;

type Where = 'plan' | 'study' | 'article' | 'about' | 'works' | 'architecture' | 'sheet';

/**
 * What there is to say on one kind of sheet, most particular first. A page
 * shows the first three it has not shown before, so the things only this
 * sheet can do are said ahead of the things every sheet can.
 */
function notesFor(where: Where, phone: boolean, docked: boolean): Note[] {
  const tap = phone ? 'Tap' : 'Click';

  // ---- Particular to the sheet -------------------------------------------
  const profile: Note = {
    id: phone ? 'phone-profile' : 'profile',
    text: phone ? (
      <>
        The strip under the title is a <b>section through this sheet</b>. It follows you down the
        page; tap a segment to jump to that section.
      </>
    ) : (
      <>
        The strip under the title is a <b>section through this sheet</b>, one segment per section.
        Click a segment to jump; the margin key on the left does the same.
      </>
    ),
  };
  const cite: Note = {
    id: phone ? 'phone-cite' : 'cite',
    text: <>{tap} any numbered heading to copy a reference to that section: sheet, number and link.</>,
  };
  const schematic: Note = {
    id: phone ? 'phone-schematic' : 'schematic',
    text: phone ? (
      <>
        <b>Fig. 1</b> on this sheet is operable. Choose a scenario, then swipe the drawing to follow
        its path.
      </>
    ) : (
      <>
        <b>Fig. 1</b> on this sheet is operable. Choose a scenario and its path is traced through
        the system.
      </>
    ),
  };

  const particular: Record<Where, Note[]> = {
    plan: phone
      ? [
          {
            id: 'phone-pile',
            text: <>Scroll. The seven sheets are a pile: each one slides up and rests on the last.</>,
          },
          {
            id: 'phone-mini',
            text: (
              <>
                Tap any sheet on the small key plan and the pile turns to it, or tap{' '}
                <b>▶ Tour the set</b> to be walked through.
              </>
            ),
          },
        ]
      : [
          {
            id: 'tour',
            text: (
              <>
                New here? Press <b>▶ Tour</b>, bottom left, and the plan walks you through every
                sheet. Touch anything to take over.
              </>
            ),
          },
          {
            id: 'plan-camera',
            text: (
              <>
                Drag to pan, scroll to zoom, or walk the plan with <K>←</K> <K>→</K> <K>↑</K>{' '}
                <K>↓</K>. Click a sheet and it grows into its page.
              </>
            ),
          },
        ],
    study: [schematic, profile, cite],
    article: [profile, cite],
    about: [
      {
        id: phone ? 'phone-elevation' : 'elevation',
        text: phone ? (
          <>
            The <b>elevation</b> under Chronology is operable. Tap a volume, or use Earlier and
            Later, to read each role.
          </>
        ) : (
          <>
            The <b>elevation</b> under Chronology is operable. Hover or click a volume, or step
            through with <K>←</K> <K>→</K>, to read each role.
          </>
        ),
      },
    ],
    works: [
      {
        id: phone ? 'phone-stack' : 'stack',
        text: phone ? (
          <>
            The <b>stack key</b> filters the schedule. Swipe it, tap a tag, and the other sheets
            fall back; tap it again to clear.
          </>
        ) : (
          <>
            The <b>stack key</b> above the schedule filters it. Click a tag and the other sheets
            fall back; click it again to clear.
          </>
        ),
      },
    ],
    architecture: [
      {
        id: phone ? 'phone-figures' : 'figures',
        text: (
          <>
            Three things on this sheet are operable: drag the divider on <b>Fig. 1</b>, choose a
            request on <b>Fig. 2</b>, and the switches further down change this very page.
          </>
        ),
      },
    ],
    sheet: [],
  };

  // ---- True of every sheet --------------------------------------------------
  const general: Note[] = phone
    ? docked
      ? [
          {
            id: 'phone-dock',
            text: (
              <>
                The bar at the foot is the instrument dock: the index, the lens, and{' '}
                <b>A · B · C</b> to re-issue the whole set in another mode.
              </>
            ),
          },
          {
            id: 'phone-titleblock',
            text: (
              <>Tap the sheet number in the dock for its title block, and to issue it as a PDF.</>
            ),
          },
        ]
      : []
    : [
        {
          id: 'modes',
          text: (
            <>
              Press <K>D</K> to re-issue the whole set: as issued, with the markup pen on, or
              stripped to its source.
            </>
          ),
        },
        {
          id: 'lens',
          text: (
            <>
              Press <K>L</K> for the lens. Drag it over anything to look through to the blueprint.
            </>
          ),
        },
        {
          id: 'index',
          text: (
            <>
              Press <K>/</K> to find any of the sheets by number, title or subject.
            </>
          ),
        },
      ];

  return [...particular[where], ...general];
}

const SEEN_KEY = 'plate.notes';
const OFF_KEY = 'plate.notes.off';
const PER_PAGE = 3;
const FIRST_AFTER_MS = 1900;
const BETWEEN_MS = 1100;

function readSeen(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

export function Hints() {
  const pathname = usePathname();
  const [queue, setQueue] = useState<Note[]>([]);
  const [at, setAt] = useState(-1);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A new sheet: work out what there is still to say about it.
  useEffect(() => {
    setAt(-1);
    setLeaving(false);

    let off = true;
    try {
      off = localStorage.getItem(OFF_KEY) === '1';
    } catch {
      // No storage: say nothing, since nothing could be remembered as said.
    }
    if (off) {
      setQueue([]);
      return;
    }

    const parts = pathname.split('/').filter(Boolean);
    const where: Where =
      parts.length === 0
        ? 'plan'
        : parts.length > 1
          ? parts[0] === 'work'
            ? 'study'
            : 'article'
          : parts[0] === 'about'
            ? 'about'
            : parts[0] === 'work'
              ? 'works'
              : parts[0] === 'architecture'
                ? 'architecture'
                : 'sheet';
    // `phone`: the stacked plan and no keyboard to speak of. `docked`: narrow
    // enough that the instruments have moved to the bar at the foot.
    const phone = window.matchMedia('(max-width: 59.999rem), (hover: none)').matches;
    const docked = window.matchMedia('(max-width: 40rem)').matches;
    const seen = readSeen();
    const fresh = notesFor(where, phone, docked)
      .filter((n) => !seen.has(n.id))
      .slice(0, PER_PAGE);
    setQueue(fresh);
    if (!fresh.length) return;

    // Not while the cover sheet is up.
    const root = document.documentElement;
    const covered = () => 'cover' in root.dataset && !('issued' in root.dataset);
    const begin = () => {
      timer.current = setTimeout(() => setAt(0), FIRST_AFTER_MS);
    };
    const watch = new MutationObserver(() => {
      if (covered()) return;
      watch.disconnect();
      begin();
    });
    if (covered()) watch.observe(root, { attributes: true });
    else begin();

    return () => {
      watch.disconnect();
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pathname]);

  const note = at >= 0 ? queue[at] : undefined;

  // Written down as said the moment it is shown, so a reader who leaves
  // mid-note is not told the same thing on the next sheet.
  useEffect(() => {
    if (!note) return;
    const seen = readSeen();
    seen.add(note.id);
    try {
      localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
    } catch {
      /* nothing to persist to */
    }
  }, [note]);

  const next = useCallback(() => {
    setLeaving(true);
    timer.current = setTimeout(() => {
      setLeaving(false);
      setAt(-1);
      timer.current = setTimeout(() => setAt((i) => (at + 1 < queue.length ? at + 1 : i)), BETWEEN_MS);
    }, 260);
  }, [at, queue.length]);

  const silence = () => {
    try {
      localStorage.setItem(OFF_KEY, '1');
    } catch {
      /* nothing to persist to */
    }
    if (timer.current) clearTimeout(timer.current);
    setLeaving(true);
    timer.current = setTimeout(() => {
      setQueue([]);
      setAt(-1);
    }, 260);
  };

  if (!note) return null;

  return (
    <aside
      key={note.id}
      className={styles.note}
      data-leaving={leaving || undefined}
      data-lens-skip
      role="status"
      aria-label="Note"
    >
      <span className={styles.bubble} aria-hidden="true">
        {String(at + 1).padStart(2, '0')}
      </span>
      <span className={styles.kicker} aria-hidden="true">
        Note {at + 1} of {queue.length}
      </span>
      <p className={styles.text}>{note.text}</p>
      <span className={styles.actions}>
        <button type="button" className={styles.ok} onClick={next}>
          Got it
        </button>
        <button type="button" className={styles.off} onClick={silence}>
          No more notes
        </button>
      </span>
      <span
        className={styles.dwell}
        aria-hidden="true"
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) next();
        }}
      />
    </aside>
  );
}
