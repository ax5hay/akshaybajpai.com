import { SITE_URL, SOCIAL } from './constants';
import { NAME, ROLE } from './metadata';

/**
 * C-701, the calling card.
 *
 * The printed card carries a QR code, and the code resolves to `/card/`. This
 * is the one record that sheet, the vCard it offers and the printed card are
 * all issued from, so the number on the page, the number in the contact and
 * the number on the card cannot disagree.
 *
 * `phone` is printed as written and dialled as digits: "+91 98765 43210" is
 * shown as that and called as tel:+919876543210. Leave it empty and the
 * sheet simply does not offer a call: nothing on the page or in the vCard
 * refers to a number that is not there.
 */
export const CARD = {
  name: NAME,
  given: 'Akshay',
  family: 'Bajpai',
  role: ROLE,
  /** TODO: the number on the printed card, with its country code. */
  phone: '' as string,
  email: SOCIAL.email,
  city: 'New Delhi',
  region: 'Delhi',
  country: 'India',
  site: SITE_URL,
  /** Where the card points. The vqr.vc code should redirect here. */
  path: '/card/',
  links: [
    { label: 'LinkedIn', value: 'linkedin.com/in/ax5hay', href: SOCIAL.linkedin, type: 'linkedin' },
    { label: 'GitHub', value: 'github.com/ax5hay', href: SOCIAL.github, type: 'github' },
    { label: 'X', value: '@ax5hay', href: SOCIAL.twitter, type: 'twitter' },
  ],
  /** Stamped on the sheet and written into the vCard as its revision. */
  issued: '2026-10-21',
} as const;

/** The vCard, as a file on the site. The name is what a phone will save it as. */
export const VCARD_PATH = '/akshay-bajpai.vcf';

/** Digits only, with the leading plus: what tel: and wa.me take. */
export function phoneDigits(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

export function telHref(phone: string): string {
  return `tel:+${phoneDigits(phone)}`;
}

export function whatsappHref(phone: string): string {
  return `https://wa.me/${phoneDigits(phone)}`;
}

/* ------------------------------------------------------------------- vCard --- */

/** RFC 2426: escape the characters that mean something in a text value. */
function text(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

/**
 * RFC 2426 §2.6: lines are at most 75 octets, continued with CRLF and one
 * space. Folded on octets, not characters, so a multibyte character is never
 * split; the fold is simply made early.
 */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let cursor = 0;
  let width = 75;
  while (cursor < bytes.length) {
    let end = Math.min(cursor + width, bytes.length);
    // Step back off the middle of a multibyte sequence.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end -= 1;
    out.push(new TextDecoder().decode(bytes.slice(cursor, end)));
    cursor = end;
    width = 74;
  }
  return out.join('\r\n ');
}

/**
 * The contact, as a vCard 3.0, which is the version every phone's address
 * book imports without complaint. `photo` is a base64 PNG; the address book
 * shows it as the contact's picture.
 */
export function vCard({ photo }: { photo?: string } = {}): string {
  const c = CARD;
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${text(c.family)};${text(c.given)};;;`,
    `FN:${text(c.name)}`,
    `TITLE:${text(c.role)}`,
  ];
  if (c.phone) lines.push(`TEL;TYPE=CELL,VOICE:+${phoneDigits(c.phone)}`);
  lines.push(
    `EMAIL;TYPE=INTERNET,PREF:${c.email}`,
    `URL:${c.site}`,
    `ADR;TYPE=WORK:;;;${text(c.city)};${text(c.region)};;${text(c.country)}`,
    ...c.links.map((l) => `X-SOCIALPROFILE;TYPE=${l.type}:${l.href}`),
    `NOTE:${text(`${c.site}${c.path} · the card, as scanned`)}`
  );
  if (photo) lines.push(`PHOTO;ENCODING=b;TYPE=PNG:${photo}`);
  lines.push(`REV:${c.issued}T00:00:00Z`, 'END:VCARD');
  return lines.map(fold).join('\r\n') + '\r\n';
}
