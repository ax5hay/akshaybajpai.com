import type { Mode } from './mode';
import { DISCIPLINES, type Discipline, type Plate } from './plates';

/**
 * The set speaks at three levels, one per drawing mode, and this is the
 * vocabulary. Rev A (artifact) is plain language for anyone who was handed
 * the address: a page is a page. Rev B (annotated) is the drawing set's own
 * terms, for a reader who is comfortable with sheets and revisions. Rev C
 * (raw) is fully technical: what a thing is, in the terms of the system that
 * produced it. None of the three is a joke; each is meant to be read.
 *
 * Content, the case studies and essays, is written once. Only the set's own
 * voice (its labels, its notes, its instruments) changes level.
 */
export type Level = 'a' | 'b' | 'c';

export type Said = { a: string; b: string; c: string };

export const LEVEL: Record<Mode, Level> = { artifact: 'a', annotated: 'b', raw: 'c' };

/** The three levels, as the mode switch and the cover describe them. */
export const LEVEL_INFO: Record<Level, { name: string; about: string }> = {
  a: { name: 'Plain', about: 'Plain language. The finished page, as anyone reads it.' },
  b: { name: 'Technical', about: 'The engineering shown: the page as a drawing, with its markup.' },
  c: { name: 'Source', about: 'Fully technical: the structure and the record each page is built from.' },
};

export function say(level: Level, s: Said): string {
  return s[level];
}

/* ---------------------------------------------------------------------------
   The vocabulary. Keys are stable; the three strings may be revised freely.
   ------------------------------------------------------------------------ */
export const V = {
  // The set itself
  set: { a: 'this site', b: 'the set', c: 'the set' },
  setTitle: { a: 'Architecture of Intelligence', b: 'Architecture of Intelligence', c: 'Architecture of Intelligence' },
  setLine: { a: 'Akshay Bajpai', b: 'Drawing set · Akshay Bajpai', c: 'Static export · Akshay Bajpai' },
  page: { a: 'page', b: 'sheet', c: 'route' },
  pages: { a: 'pages', b: 'sheets', c: 'routes' },
  home: { a: 'Home', b: 'Key plan', c: 'G-000 · route map' },
  homeSub: { a: 'Every page on the site, in one view', b: 'General arrangement', c: 'Every route, placed' },
  sheetOf: { a: 'Page 1 of', b: 'Sheet 1 of', c: 'Route 1 of' },

  // Modes
  modeCaption: { a: 'View', b: 'Mode', c: 'Mode' },
  modeGroup: { a: 'How technical the site reads', b: 'Drawing mode', c: 'Render mode' },
  reissued: { a: 'View changed', b: 'Re-issued', c: 'Re-rendered' },

  // Instruments
  index: { a: 'Find a page', b: 'Index', c: 'Index' },
  railIndex: { a: 'Search', b: 'Index', c: 'Index' },
  railLens: { a: 'Inspect', b: 'Lens', c: 'Inspect' },
  indexTitle: { a: 'Find a page', b: 'Sheet index', c: 'Route index' },
  indexNote: { a: 'Search everything on the site', b: 'Jump to any sheet in the set', c: 'Fuzzy match on route, title, body' },
  indexPlaceholder: { a: 'Type a page name or a subject', b: 'Sheet number, title, or subject', c: 'Route id, title, or term' },
  indexEmpty: { a: 'Nothing matches', b: 'No sheet matches', c: 'No route matches' },
  indexTry: { a: 'Try a subject, such as', b: 'Try a sheet number such as W-405, or a subject such as', c: 'Try a route id such as W-405, or a term such as' },
  lens: { a: 'Look closer', b: 'Lens', c: 'Inspect' },
  lensTitle: { a: 'Magnifier', b: 'Inspection lens', c: 'DOM inspector' },
  lensNote: { a: 'See how any part of the page is built', b: 'X-ray anything it covers', c: 'Element names, bounds and sizes under the glass' },
  lensOn: { a: 'On. Drag it over the page.', b: 'Deployed. Drag it over the sheet.', c: 'Active. Drag to move; scroll to resize.' },
  modeTitle: { a: 'Reading level', b: 'Drawing mode', c: 'Render mode' },
  instruments: { a: 'Controls', b: 'Instruments', c: 'Controls' },
  notes: { a: 'Notes', b: 'General Notes', c: 'Notes' },
  legend: { a: 'Key', b: 'Legend', c: 'Legend' },
  tour: { a: '▶ Show me around', b: '▶ Tour the set', c: '▶ Walk the routes' },
  tourStop: { a: '■ Stop', b: '■ Stop the tour', c: '■ Stop' },

  // Opening things
  open: { a: 'Open →', b: 'Open sheet →', c: 'Open route →' },
  write: { a: 'Get in touch →', b: 'Write to me →', c: 'Open form →' },
  read: { a: 'read', b: 'read', c: 'visited' },
  youAreHere: { a: 'You are here', b: 'You are here', c: 'current' },
  nextUnread: { a: 'Next', b: 'Next unread', c: 'Next unvisited' },
  allRead: { a: 'You have seen everything.', b: 'Every sheet read.', c: 'All routes visited.' },
  yourRoute: { a: 'Where you have been', b: 'Your route', c: 'Session route' },
  encloseIt: { a: 'Mention it when you write →', b: 'Enclose it in a message →', c: 'Attach to the form →' },
  stacked: { a: 'pages, below', b: 'sheets, stacked below', c: 'routes, stacked below' },

  // Title block
  copyRef: { a: 'Copy a link to this page', b: 'Copy sheet reference', c: 'Copy route + id' },
  shareSheet: { a: 'Share this page', b: 'Share this sheet', c: 'Share route' },
  pdfSheet: { a: 'Save this page as PDF', b: 'Issue this sheet as PDF', c: 'Print route to PDF' },
  pdfSet: { a: 'Save the whole site as PDF', b: 'Issue the whole set as PDF', c: 'Print /set/ to PDF' },
  cardLink: { a: 'My contact card', b: 'The calling card · C-701', c: 'C-701 · /card/' },
  drawn: { a: 'By', b: 'Drawn', c: 'Author' },
  setCount: { a: 'Pages', b: 'Set', c: 'Routes' },
  rev: { a: 'Version', b: 'Rev', c: 'Rev' },
  issued: { a: 'Published', b: 'Issued', c: 'Issued' },
  scale: { a: 'Scale', b: 'Scale', c: 'Scale' },
  issuedForReview: { a: 'Published', b: 'Issued for review', c: 'Built' },
  type: { a: 'Section', b: 'Discipline', c: 'Discipline' },

  // Cross references
  referTo: { a: 'See also', b: 'Refer to', c: 'Refs' },
  refFollowed: { a: 'You asked for', b: 'Reference followed', c: 'Requested path' },
  nearest: { a: 'Closest pages', b: 'Nearest issued sheets', c: 'Nearest routes' },

  // Correspondence
  transmittal: { a: 'Message', b: 'Transmittal', c: 'POST /contact' },
  from: { a: 'Your email', b: 'From', c: 'from' },
  regarding: { a: 'About', b: 'Regarding', c: 'subject' },
  message: { a: 'Message', b: 'Message', c: 'body' },
  enclosure: { a: 'Pages you read', b: 'Enclosure', c: 'sheets_read' },
  enclose: { a: 'Include the pages I read', b: 'Enclose the sheets I have read', c: 'Attach sheets_read' },
  send: { a: 'Send', b: 'Send transmittal', c: 'Submit' },
  sent: { a: 'Sent', b: 'Transmitted', c: '200 OK' },
  itHasGone: { a: 'Sent. Thank you.', b: 'It has gone.', c: 'Accepted.' },
  logged: { a: 'Message sent', b: 'Transmittal logged', c: 'POST accepted' },
  failed: { a: 'Message not sent', b: 'Transmittal failed', c: 'POST failed' },
  enclosed: { a: 'Pages', b: 'Enclosed', c: 'sheets_read' },

  // Not found
  notFound: { a: 'Page not found', b: 'Sheet Not Issued', c: '404' },
  notFoundSub: { a: 'There is nothing at this address', b: 'This drawing is not part of the current set', c: 'No route exported at this path' },
  notInContract: { a: 'Nothing here', b: 'Not in contract', c: '404' },

  // The calling card
  callingCard: { a: 'Contact card', b: 'Calling card', c: 'C-701 · vCard' },
  linesTitle: { a: 'Ways to reach me', b: 'Schedule of lines', c: 'Contact record' },
  enterKicker: { a: 'The website', b: 'G-000 · The drawing set', c: 'G-000 · /' },
  enterTitle: { a: 'Open the website', b: 'Open the drawing set', c: 'Open the root route' },
  enterNote: { a: 'What I do, the work, and the writing.', b: 'Case studies, research and essays, issued as drawings.', c: '35 static routes: work, research, essays, notes.' },
  reissueCard: { a: 'Reading level', b: 'Re-issue the card', c: 'Render mode' },
  showCode: { a: 'Show QR code', b: 'Show the code', c: 'Show QR' },
  saveNote: { a: 'Saves straight to your contacts', b: 'A vCard, into your address book', c: 'vCard 3.0, text/x-vcard, with PHOTO' },
  cardTicketTitle: { a: 'My contact card', b: 'The card, as scanned', c: 'C-701 · /card/' },
  cardTicketNote: {
    a: 'Save my number and details to your phone in one tap, or pass the card on.',
    b: 'Where the printed card’s code lands. Save the contact in one tap, or hold it up for the next phone.',
    c: 'Target of the printed QR. Serves a vCard and its own QR, for relay.',
  },
  openCard: { a: 'Open the card', b: 'Open the card', c: 'GET /card/' },

  // Cover
  loading: { a: 'Loading…', b: 'Loading the set…', c: 'Fetching routes…' },
  enter: { a: 'Skip intro · Enter', b: 'Skip intro · Enter the set', c: 'Skip · Enter' },
  wayWaits: { a: 'The site opens the moment it has loaded.', b: 'The way in opens the moment the set has loaded.', c: 'Entry enables once all routes are prefetched.' },

  // Key plan headline note
  planNote: {
    a: 'Everything on this site is laid out here as one map.',
    b: 'This site is a drawing set. Every section is a numbered sheet on the plan.',
    c: 'Every route in the static export, placed on one plane. Open any, or search the index.',
  },
  planFoot: {
    a: 'Drag to move · Scroll to zoom · Click a page to open it',
    b: 'Drag to pan · Scroll to zoom · Click any sheet to open it',
    c: 'Drag: pan · Wheel: zoom · Click: navigate',
  },
  legendSheet: { a: 'A page', b: 'Sheet boundary', c: 'Route bounds' },
  legendLeader: { a: 'Related pages', b: 'Cross-reference', c: 'Ref edge' },
  legendRev: { a: 'Latest version', b: 'Current revision', c: 'Current rev' },
  legendDim: { a: 'Measurement', b: 'Dimension, plan units', c: 'Dimension, plan units' },
  legendCloud: { a: 'Recently changed', b: 'Revision cloud', c: 'Revision cloud' },
  legendRecord: { a: 'Page data', b: 'Sheet record, as authored', c: 'Record, from lib/plates.ts' },
  readingPlan: { a: 'Reading the map', b: 'Reading the plan', c: 'Plane controls' },
  readingPlanMsg: {
    a: 'Drag to move around, scroll to zoom, click any page to open it.',
    b: 'Drag to pan, scroll to zoom, click any sheet to open it.',
    c: 'Drag: pan. Wheel: zoom. Click: navigate.',
  },
  reelHelp: {
    a: 'Tap for the next page · hold to pause · swipe down to leave',
    b: 'Tap to turn · hold to pause · swipe down to leave',
    c: 'Tap: next · hold: pause · swipe down: exit',
  },
} satisfies Record<string, Said>;

export type Key = keyof typeof V;

/* ---------------------------------------------------------------------------
   Names of things that are data, not copy: sections and pages.
   ------------------------------------------------------------------------ */

/** What each discipline is called at each level. */
const DISCIPLINE_NAMES: Record<Discipline, Said> = {
  G: { a: 'Overview', b: 'General', c: 'General' },
  A: { a: 'About', b: 'Architectural', c: 'Architectural' },
  S: { a: 'Principles', b: 'Structural', c: 'Structural' },
  R: { a: 'Research', b: 'Research', c: 'Research' },
  W: { a: 'Case studies', b: 'Works', c: 'Works' },
  B: { a: 'Blog', b: 'Field Notes', c: 'Field Notes' },
  E: { a: 'Essays', b: 'Essays', c: 'Essays' },
  C: { a: 'Contact', b: 'Correspondence', c: 'Correspondence' },
  X: { a: 'Not found', b: 'Unissued', c: 'Unissued' },
};

export function disciplineName(d: Discipline, level: Level): string {
  return DISCIPLINE_NAMES[d]?.[level] ?? DISCIPLINES[d].name;
}

/** Index groups, as `lib/sheet-index.ts` names them, at each level. */
const GROUPS: Record<string, Said> = {
  'General arrangement': { a: 'Main pages', b: 'General arrangement', c: 'Section routes' },
  'Works · details': { a: 'Case studies', b: 'Works · details', c: 'work/[slug]' },
  'Essays · details': { a: 'Essays', b: 'Essays · details', c: 'essays/[slug]' },
  'Field notes · details': { a: 'Blog posts', b: 'Field notes · details', c: 'blog/[slug]' },
};

export function groupName(group: string, level: Level): string {
  return GROUPS[group]?.[level] ?? group;
}

/** A plate's title and subtitle at a level: Rev B is the authored one. */
export function plateTitle(plate: Pick<Plate, 'title' | 'voice'>, level: Level): string {
  return (level === 'b' ? undefined : plate.voice?.[level]?.title) ?? plate.title;
}

export function plateSubtitle(plate: Pick<Plate, 'subtitle' | 'voice'>, level: Level): string {
  return (level === 'b' ? undefined : plate.voice?.[level]?.subtitle) ?? plate.subtitle;
}
