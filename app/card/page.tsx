import type { CSSProperties } from 'react';
import { SetPlateMeta } from '@/components/sheet/PlateMetaProvider';
import { LocalTime } from '@/components/plate/LocalTime';
import { buildMetadata } from '@/lib/metadata';
import { CARD, VCARD_PATH, telHref, whatsappHref, phoneDigits } from '@/lib/card';
import { cardCode } from '@/lib/card-art';
import { CardFlag, CardIntro, CardObject, CopyLine, Reissue, SaveContact, ShareCard, ShowCode } from './CardActions';
import { Voice } from '@/components/system/Voice';
import styles from './card.module.css';

const SHEET = 'C-701';
const TITLE = 'Calling Card';
const ISSUED = CARD.issued.slice(0, 7).replace('-', '.');
const ROSETTE = '/card/rosette.svg';

/**
 * Kept out of the index and the sitemap on purpose: it carries a phone
 * number, and it is reached by scanning the card, not by searching for it.
 */
export const metadata = buildMetadata({
  title: `${CARD.name} · Calling card`,
  description: `${CARD.role}. Call, write, save the contact, or open the drawing set.`,
  path: CARD.path,
  card: 'contact',
  noIndex: true,
});

/* ---- Glyphs, drawn as the set draws its instruments: square ends, one weight. */

type GlyphKind = 'call' | 'chat' | 'mail' | 'save' | 'link' | 'out';

function Glyph({ kind, className }: { kind: GlyphKind; className?: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'square' } as const;
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" className={className}>
      {kind === 'call' && (
        <path d="M4 3.5h3.5l1.5 4-2 1.5a9 9 0 0 0 4 4l1.5-2 4 1.5v3.5a1 1 0 0 1-1 1A13 13 0 0 1 3 4.5a1 1 0 0 1 1-1z" {...common} />
      )}
      {kind === 'chat' && <path d="M3.5 4.5h13v9h-7l-3.5 3v-3h-2.5z" {...common} />}
      {kind === 'mail' && (
        <>
          <rect x="3" y="5" width="14" height="10" {...common} />
          <path d="M3 5.5l7 5.5 7-5.5" {...common} />
        </>
      )}
      {kind === 'save' && (
        <>
          <circle cx="9" cy="7" r="3" {...common} />
          <path d="M3 17a6 6 0 0 1 10.5-4M15.5 12v6M12.5 15h6" {...common} />
        </>
      )}
      {kind === 'link' && (
        <>
          <rect x="2.5" y="2.5" width="15" height="15" {...common} />
          <path d="M6.5 9v5.5M6.5 6.2v.1M9.5 14.5V9M9.5 11.2a2.2 2.2 0 0 1 4.4 0v3.3" {...common} />
        </>
      )}
      {kind === 'out' && <path d="M7 4.5h8.5V13M15 5L5 15" {...common} />}
    </svg>
  );
}

/** The set's own monogram, drafted, as it is on the favicon. */
function Monogram({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" fill="#141417" />
      <g fill="none" stroke="#fcfaf4" strokeWidth="1.7" strokeLinecap="square">
        <path d="M5.5 24.5L12.5 7.5L19.5 24.5" />
        <path d="M19.5 7.5h3.2a3.3 3.3 0 0 1 0 6.6h-3.2M19.5 14.1h3.9a3.6 3.6 0 0 1 0 7.2h-3.9" />
        <path d="M8.2 18.5H26.5M8.2 16.8v3.4M26.5 16.8v3.4" strokeWidth="0.9" opacity="0.7" />
      </g>
      <circle cx="26.5" cy="24.5" r="1.6" fill="#983729" />
    </svg>
  );
}

/* ---- The two faces of the card. ------------------------------------------- */

function Front() {
  const c = CARD;
  return (
    <>
      <span className={styles.ink} aria-hidden="true" />
      <span className={styles.foil} aria-hidden="true">
        <span className={styles.foilSheen} data-sheen />
      </span>
      <span className={styles.glare} aria-hidden="true">
        <span className={styles.glareLight} data-light />
      </span>

      {/* The same mark that is on the card in their hand, at the heart of the rosette. */}
      <img src="/card-mark.png" alt="" width={240} height={240} className={styles.mark} />

      <span className={styles.frontTop}>
        <span className={styles.crop} aria-hidden="true" />
        <span>{SHEET}</span>
        <span className={styles.frontTopRule} aria-hidden="true" />
        <span>Rev A</span>
      </span>

      <span className={styles.frontBody}>
        <h1 className={styles.name}>
          <span>{c.given}</span>
          <span>{c.family}</span>
        </h1>
        {/* One part to a line, so the role never breaks on its own hyphen. */}
        <span className={styles.role}>
          {c.role.split(' · ').map((part) => (
            <span key={part}>{part}</span>
          ))}
        </span>
        <span className={styles.site}>{c.site.replace('https://', '')}</span>
      </span>

      {/* Microprint, as on any document worth forging: legible under a loupe. */}
      <span className={styles.micro} aria-hidden="true">
        {Array.from({ length: 4 }, () => `${c.name} · ${c.site.replace('https://', '')} · ${c.city} · ${SHEET} · `).join('')}
      </span>
    </>
  );
}

function Back({ url }: { url: string }) {
  const code = cardCode(url);
  const quiet = 2;
  const box = code.size + quiet * 2;
  const { at, size } = code.clear;
  return (
    <>
      <span className={styles.ink} aria-hidden="true" />
      <span className={styles.backBody}>
        <span className={styles.plate}>
          <svg viewBox={`${-quiet} ${-quiet} ${box} ${box}`} className={styles.qr} role="img" aria-label={`QR code for ${url}`}>
            <rect x={-quiet} y={-quiet} width={box} height={box} fill="#fcfaf4" />
            <path d={code.path} fill="#141417" shapeRendering="crispEdges" />
            <svg x={at + 0.5} y={at + 0.5} width={size - 1} height={size - 1} viewBox="0 0 32 32">
              <Monogram size={32} />
            </svg>
          </svg>
        </span>
        <span className={styles.backText}>
          <span className={styles.backKicker}>Scan to keep</span>
          <span className={styles.backTitle}>Hold this up to another phone.</span>
          <span className={styles.backUrl}>{url.replace('https://', '')}</span>
        </span>
      </span>
    </>
  );
}

/**
 * C-701. The sheet behind the QR code on the printed card.
 *
 * Somebody has just been handed the card, pointed a camera at it, and
 * followed the link. It is a first meeting, they are on a phone, most likely
 * standing up, and the errand is short: keep the number, or use it. So the
 * sheet opens on the card itself, drawn as an object at its printed size,
 * engraved like a document and foiled so it catches the light as the phone
 * moves; under it the one thing most people came to do, saving the contact,
 * then the other ways in as tiles a thumb can find, the record, and at the
 * foot the way into the set proper.
 *
 * The card turns over. Its back carries this page's own code, so the person
 * holding the phone can pass the card on to the next phone in the room.
 *
 * It does not open on the cover: ModeScript skips it for this address, and
 * the rail, the title block and the margin notes are struck for as long as
 * the sheet is up. The way in is a full navigation, so the set opens the way
 * it opens for anyone, cover and all.
 */
export default function CardPage() {
  const c = CARD;
  const url = `${c.site}${c.path}`;
  const lines = [
    ...(c.phone ? [{ label: 'Phone', value: c.phone, href: telHref(c.phone), copy: `+${phoneDigits(c.phone)}` }] : []),
    { label: 'Email', value: c.email, href: `mailto:${c.email}`, copy: c.email },
    ...c.links.map((l) => ({ label: l.label, value: l.value, href: l.href, copy: undefined })),
    { label: 'Site', value: c.site.replace('https://', ''), href: '/', copy: c.site },
  ];
  const linkedin = c.links.find((l) => l.type === 'linkedin');

  return (
    <article className={styles.sheet} data-lens-skip style={{ '--rosette': `url(${ROSETTE})` } as CSSProperties}>
      <SetPlateMeta
        sheet={SHEET}
        title={TITLE}
        subtitle="The card, as scanned"
        discipline="C"
        scale="1:1"
        revision="A"
        date={ISSUED}
        refs={['C-700', 'G-000']}
      />
      <CardFlag />

      <CardIntro>
      <p className={styles.strip}>
        <span className={styles.stripTag}>{SHEET}</span>
        <span className={styles.stripName}>
          <Voice k="callingCard" />
        </span>
        <span className={styles.stripRule} aria-hidden="true" />
        <a href="/" className={styles.stripLive}>
          <span className={styles.pulse} aria-hidden="true" />
          {c.site.replace('https://www.', '')}
        </a>
      </p>

      <CardObject front={<Front />} back={<Back url={url} />} />

      <p className={styles.when} data-rise="1">
        <LocalTime className={styles.clock} />
      </p>

      {/* ---- What most people came to do ----------------------------------- */}
      <SaveContact href={VCARD_PATH} className={styles.save}>
        <span className={styles.saveIcon}>
          <Glyph kind="save" />
        </span>
        <span className={styles.saveText}>
          <span className={styles.saveLabel}>Save contact</span>
          <span className={styles.saveNote}>
            <Voice k="saveNote" />
          </span>
        </span>
        <span className={styles.saveArrow} aria-hidden="true" />
      </SaveContact>

      {/* ---- The other ways in --------------------------------------------- */}
      <nav className={styles.ways} aria-label="Reach me" data-rise="3" data-count={c.phone ? 3 : 2}>
        {c.phone && (
          <a href={telHref(c.phone)} className={styles.way}>
            <Glyph kind="call" className={styles.wayGlyph} />
            <span className={styles.wayLabel}>Call</span>
          </a>
        )}
        {c.phone && (
          <a href={whatsappHref(c.phone)} className={styles.way} target="_blank" rel="noopener noreferrer">
            <Glyph kind="chat" className={styles.wayGlyph} />
            <span className={styles.wayLabel}>WhatsApp</span>
          </a>
        )}
        <a href={`mailto:${c.email}`} className={styles.way}>
          <Glyph kind="mail" className={styles.wayGlyph} />
          <span className={styles.wayLabel}>Email</span>
        </a>
        {!c.phone && linkedin && (
          <a href={linkedin.href} className={styles.way} target="_blank" rel="noopener noreferrer">
            <Glyph kind="link" className={styles.wayGlyph} />
            <span className={styles.wayLabel}>LinkedIn</span>
          </a>
        )}
      </nav>
      </CardIntro>

      {/* ---- The way into the set: the cover, in miniature -------------------
          The set opens on three states of one drawing laid side by side:
          paper, cyanotype, source. Here they are again, as the door. */}
      <a href="/" className={styles.enter} data-rise="4">
        <span className={styles.bands} aria-hidden="true">
          {(['a', 'b', 'c'] as const).map((band) => (
            <span key={band} className={styles.band} data-band={band}>
              <span className={styles.bandTitle}>
                Architecture
                <br />
                of Intelligence
              </span>
            </span>
          ))}
          <span className={styles.bandRevs}>
            <span>Rev A</span>
            <span>Rev B</span>
            <span>Rev C</span>
          </span>
        </span>
        <span className={styles.enterFoot}>
          <span className={styles.enterText}>
            <span className={styles.enterKicker}>
              <Voice k="enterKicker" />
            </span>
            <span className={styles.enterTitle}>
              <Voice k="enterTitle" />
            </span>
            <span className={styles.enterNote}>
              <Voice k="enterNote" />
            </span>
          </span>
          <span className={styles.enterArrow} aria-hidden="true" />
        </span>
      </a>

      {/* ---- The record ---------------------------------------------------- */}
      <section className={styles.record} aria-labelledby="card-record" data-rise="6">
        <h2 id="card-record" className={styles.recordHead}>
          <span>
            <Voice k="linesTitle" />
          </span>
          <span className={styles.recordCount}>{String(lines.length).padStart(2, '0')}</span>
        </h2>
        <ul>
          {lines.map((l, i) => {
            const external = l.href.startsWith('http');
            return (
              <li key={l.label} className={styles.line}>
                <a
                  href={l.href}
                  className={styles.lineLink}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <span className={styles.lineNo}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.lineLabel}>{l.label}</span>
                  <span className={styles.lineValue}>{l.value}</span>
                </a>
                {l.copy ? (
                  <CopyLine value={l.copy} label={l.label} className={styles.lineAction} />
                ) : (
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.lineAction}
                    aria-label={`Open ${l.label}`}
                  >
                    <Glyph kind="out" />
                    <span>Open</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <footer className={styles.foot} data-rise="7">
        <div className={styles.footActions}>
          <ShareCard url={url} title={c.name} text={`${c.name} · ${c.role}`} className={styles.footButton} />
          <ShowCode className={styles.footButton}>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M2.5 2.5h4v4h-4zM9.5 2.5h4v4h-4zM2.5 9.5h4v4h-4zM9.5 9.5h1.5v1.5M12.5 12.5h1M9.5 13.5h1" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            <Voice k="showCode" />
          </ShowCode>
        </div>
        <Reissue />
        <p className={styles.stamp}>
          {SHEET} · Rev A · Issued {ISSUED}
        </p>
      </footer>
    </article>
  );
}
