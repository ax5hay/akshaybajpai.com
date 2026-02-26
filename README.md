# The Architecture of Intelligence

[![Deploy to GitHub Pages](https://github.com/ax5hay/akshaybajpai.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/ax5hay/akshaybajpai.com/actions/workflows/deploy.yml)
[![Node 18+](https://img.shields.io/badge/node-18%2B-brightgreen?logo=node.js)](https://nodejs.org/)
[![Astro](https://img.shields.io/badge/Astro-4-FF5D01?logo=astro)](https://astro.build/)
[![License](https://img.shields.io/badge/license-All%20rights%20reserved-lightgrey)]()

**Live:** [www.akshaybajpai.com](https://www.akshaybajpai.com)

Personal site and neural map. Not a list of links — a spatial system you move through. The homepage is one scroll-driven scene: you scroll in, the camera flies into a constellation of nodes; you hover and click to open sections. No nav bar on the hero, no “sections” below the fold. Content lives inside the map.

---

## What’s in here

**Homepage**

- Black load → tiny points fade in → full constellation (Three.js). Center copy: name, tagline, “Explore the mind,” and a scroll prompt.
- **Neural map:** Five clusters in a ring (Essays, About, Work, Blog, Contact). Each cluster has a nucleus and orbiting thought-nodes. Instanced mesh for nodes; line segments for edges. Within-cluster lines are dense and tinted per cluster (gold, olive, warm greys). Cross-cluster lines only appear when nodes from different clusters get close — so the net stays readable and the “bridges” feel dynamic as everything orbits.
- **Scroll:** Drives the camera forward into the net. No content block below; a tall spacer gives scroll room. Hints at the bottom (“Hover nodes to reveal · Click to enter”, “Shift + scroll for raw mode”) appear as you scroll.
- **Hover:** Node scales up, cluster label shows (title or, in raw mode, a code-style snippet), dim overlay, line opacity bumps.
- **Click:** Camera flies to the cluster; fullscreen overlay opens with that section (essays, about, work, blog, contact) in an iframe. One close button (×) and you’re back on the map.
- **Cursor halo:** Follows the mouse, grows when you’re near a node. Subtle gold radial gradient.
- **Raw mode:** Shift + scroll toggles it; labels switch from section names to dev-style one-liners (e.g. `latency_p99 < 50ms; throughput 10k/s`).
- **Reduced motion:** If the user prefers reduced motion, the scene doesn’t animate (no orbit, no drift); layout and interaction still work.

**Content & layout**

- **Blog, Essays, Work** — Markdown in content collections. Work case studies are prose-only; a custom Remark plugin strips ` ```svg ` blocks so diagrams don’t render in the built site.
- **Placard layout:** Serif headlines, wide margins, scroll-triggered reveal (Intersection Observer). Same treatment for about, blog index, essays index, work index, research, architecture, contact.
- **Scroll progress:** Thin accent bar at the top; only transform/opacity, respects reduced motion.
- **Header/Footer:** Fixed header with logo and nav (About, Work, Blog, Essays, Research, Architecture, Contact); mobile hamburger. Footer repeats key links plus LinkedIn/GitHub. Both hidden on the homepage hero.

**SEO & meta**

- Canonical URLs, Open Graph, Twitter cards, theme-color.
- JSON-LD: Person and WebSite schema.
- RSS at `/rss.xml`, sitemap at `/sitemap-index.xml`.
- Fonts: Instrument Serif, IBM Plex Sans, IBM Plex Mono — preconnect and preload, with `media="print"` swap so they don’t block.

**Design system**

- Tokens in `src/styles/global.css`: palette (deep bg, platinum text, gold accent), typography scale, spacing, motion (ease-out-expo, durations), no framework.
- 404 page: serif “404”, short copy, link back home.

**Build & deploy**

- Astro 4, static output. Vite: Three.js and NeuralScene in separate chunks; inline stylesheets auto; HTML compressed.
- GitHub Actions: `npm ci` → `npm run build` → write CNAME into `dist/` → verify artifact → upload → deploy-pages. Source set to GitHub Actions in repo Settings → Pages. Custom domain via CNAME.

---

## Stack

| Layer   | Choice |
|--------|--------|
| Framework | Astro 4 |
| Runtime | Node 18+ |
| 3D / map | Three.js (instanced mesh, LineSegments, raycaster, fog) |
| Content | Markdown, content collections (blog, essays, work) |
| Styles | Vanilla CSS, design tokens, no Tailwind/Bootstrap |
| Hosting | GitHub Pages |

---

## Run it

```bash
npm install
npm run dev
```

Dev server on port 4321 (or next available). Build: `npm run build` → output in `dist/`.

---

## Project layout

```
src/
  layouts/       BaseLayout (meta, fonts, reveal script), PageLayout (header/footer/scroll bar), ContentLayout (placard)
  components/   Header, Footer, HeroManifesto, NeuralCanvas, NeuralScene.ts, ScrollProgress
  content/      blog/, essays/, work/ + config
  pages/        index (hero + spacer), about, blog, essays, work, research, architecture, contact, hero-placard, 404, rss.xml, sitemap-index.xml
  styles/       global.css
  plugins/      remark-svg-block.mjs
public/         favicon, apple-touch-icon, etc.
.github/        deploy.yml
```

---

## License & contact

Content and design © Akshay Bajpai. All rights reserved.

[LinkedIn](https://linkedin.com/in/ax5hay) · [GitHub](https://github.com/ax5hay) · [Twitter](https://twitter.com/ax5hay)
