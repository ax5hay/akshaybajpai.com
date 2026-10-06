import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

/**
 * A share card for every sheet, drawn in the set's own style: the sheet as a
 * piece of white stock on the kraft board, its number reversed out in the
 * corner, the title in the serif, and a ruled title strip along the foot.
 * Rendered to PNG at build time, so a link to any page previews as that page.
 *
 * Names are deterministic and mirrored in lib/metadata.ts: section sheets by
 * plate id, articles by `${collection}-${slug}`.
 */

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out', 'og');
const FONTS = path.join(ROOT, 'scripts', 'fonts');

const font = (file) => fs.readFileSync(path.join(FONTS, file));
const fonts = [
  { name: 'Instrument Serif', data: font('InstrumentSerif-Regular.ttf'), weight: 400, style: 'normal' },
  { name: 'IBM Plex Sans', data: font('IBMPlexSans-Regular.ttf'), weight: 400, style: 'normal' },
  { name: 'IBM Plex Mono', data: font('IBMPlexMono-Regular.ttf'), weight: 400, style: 'normal' },
  { name: 'IBM Plex Mono', data: font('IBMPlexMono-SemiBold.ttf'), weight: 600, style: 'normal' },
];

const PAPER = '#ded2b8';
const STOCK = '#fcfaf4';
const INK = '#141417';
const INK2 = '#413c34';
const INK3 = '#5c5548';
const ACCENT = '#983729';

/** satori takes React-shaped objects; this is the whole of JSX it needs. */
const h = (type, props = {}, ...children) => ({
  type,
  props: { ...props, children: children.length === 1 ? children[0] : children },
});

const mono = (size, extra = {}) => ({
  fontFamily: 'IBM Plex Mono',
  fontSize: size,
  letterSpacing: size * 0.14,
  textTransform: 'uppercase',
  ...extra,
});

function card({ sheet, discipline, title, description, kicker, issued }) {
  const long = title.length > 48;
  return h(
    'div',
    {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        background: PAPER,
        padding: '44px 56px',
        fontFamily: 'IBM Plex Sans',
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: STOCK,
          border: `2px solid ${INK}`,
          boxShadow: '0 24px 60px -24px rgba(46,35,18,0.55)',
          position: 'relative',
        },
      },
      // Sheet tag, reversed out in the corner.
      h(
        'div',
        {
          style: {
            position: 'absolute',
            top: -2,
            left: -2,
            display: 'flex',
            padding: '14px 26px',
            background: INK,
            color: STOCK,
            ...mono(26, { fontWeight: 600, letterSpacing: 4 }),
          },
        },
        sheet
      ),
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', flex: 1, padding: '96px 72px 0' } },
        h('div', { style: { display: 'flex', color: INK3, ...mono(20) } }, kicker),
        h(
          'div',
          {
            style: {
              display: 'flex',
              marginTop: 22,
              fontFamily: 'Instrument Serif',
              fontSize: long ? 60 : 74,
              lineHeight: 1.02,
              letterSpacing: -1.2,
              color: INK,
              maxWidth: 1000,
            },
          },
          title
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              marginTop: 26,
              fontSize: 27,
              lineHeight: 1.4,
              color: INK2,
              maxWidth: 940,
            },
          },
          description
        )
      ),
      // Title strip along the foot.
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            borderTop: `3px solid ${INK}`,
            padding: '0 72px',
            height: 92,
            color: INK3,
            ...mono(17),
          },
        },
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          h('div', { style: { display: 'flex', color: INK, fontWeight: 600 } }, 'Architecture of Intelligence'),
          h('div', { style: { display: 'flex' } }, 'Drawing set · Akshay Bajpai')
        ),
        h('div', { style: { display: 'flex', flex: 1 } }),
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' } },
          h('div', { style: { display: 'flex' } }, `${discipline} · Issued ${issued}`),
          h('div', { style: { display: 'flex', color: ACCENT, fontWeight: 600 } }, 'akshaybajpai.com')
        )
      ),
      // The one hot rule, as on every sheet.
      h('div', {
        style: { position: 'absolute', left: 72, top: 70, width: 110, height: 6, background: ACCENT, display: 'flex' },
      })
    )
  );
}

async function render(name, props) {
  const svg = await satori(card(props), { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  fs.writeFileSync(path.join(OUT, `${name}.png`), png);
}

const SECTIONS = [
  { id: 'about', sheet: 'A-101', discipline: 'Architectural', title: 'The Architect', description: 'Biography, trajectory, and operating principles. Forward-deployed AI engineering: multi-tenant platforms, governed agents, clinical and operational intelligence.' },
  { id: 'research', sheet: 'R-301', discipline: 'Research', title: 'Research', description: 'Published medical AI research, a Master’s thesis on dementia classification, and ongoing work in governed agentic retrieval.' },
  { id: 'architecture', sheet: 'S-201', discipline: 'Structural', title: 'Structural Principles', description: 'The decisions that outlast implementation: governed agents, hybrid retrieval, event-driven inference, and infrastructure as product.' },
  { id: 'work', sheet: 'W-400', discipline: 'Works', title: 'Works', description: 'Case studies in forward-deployed AI, as built: what was made, the constraints it was made under, and the numbers it was measured by.' },
  { id: 'blog', sheet: 'B-500', discipline: 'Field Notes', title: 'Field Notes', description: 'What the work taught, written down while it was fresh: AI infrastructure, healthcare AI, performance engineering, world models, reinforcement learning.' },
  { id: 'essays', sheet: 'E-600', discipline: 'Essays', title: 'Essays', description: 'Longer arguments about systems, cost, and trust.' },
  { id: 'contact', sheet: 'C-700', discipline: 'Correspondence', title: 'Correspondence', description: 'Open a line. Forward-deployed AI work, architecture reviews, speaking, or collaboration on systems design and performance engineering.' },
];

const SERIES = {
  work: { discipline: 'W', base: 400, name: 'Works' },
  blog: { discipline: 'B', base: 500, name: 'Field Notes' },
  essays: { discipline: 'E', base: 600, name: 'Essays' },
};

const stamp = (d) => {
  const date = new Date(d);
  return `${date.getUTCFullYear()}.${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

fs.mkdirSync(OUT, { recursive: true });
let n = 0;
for (const s of SECTIONS) {
  await render(s.id, { ...s, kicker: `${s.discipline} · General arrangement`, issued: '2026.09' });
  n += 1;
}
for (const [collection, series] of Object.entries(SERIES)) {
  const dir = path.join(ROOT, 'content', collection);
  const docs = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => ({ slug: file.replace(/\.md$/, ''), data: matter(fs.readFileSync(path.join(dir, file), 'utf8')).data }))
    .filter(({ data }) => !data.draft)
    .sort((a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate));
  for (const [i, { slug, data }] of docs.entries()) {
    await render(`${collection}-${slug}`, {
      sheet: `${series.discipline}-${series.base + i + 1}`,
      discipline: series.name,
      kicker: `${series.name} · Detail sheet`,
      title: data.title,
      description: data.description,
      issued: stamp(data.pubDate),
    });
    n += 1;
  }
}
console.log(`Drew ${n} share cards into out/og/`);
