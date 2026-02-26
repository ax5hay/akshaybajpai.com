# akshaybajpai.com

Static site for [akshaybajpai.com](https://www.akshaybajpai.com). Astro 4, TypeScript, Three.js on the homepage. Deploys to GitHub Pages via Actions.

## Stack

- **Astro** — static output, content collections (blog, essays, work)
- **Three.js** — neural map on `/`: 5 clusters (Essays, About, Work, Blog, Contact), instanced nodes, line segments with per-cluster line colors, scroll-driven camera, hover/click overlay
- **CSS** — design tokens in `src/styles/global.css`; Instrument Serif + IBM Plex Sans; no framework
- **Hosting** — GitHub Pages, CNAME for www

## Run

```bash
npm install
npm run dev
```

Dev server on port 4321 (or next free). Build: `npm run build` → `dist/`.

## Homepage behaviour

- Black load → points → constellation fades in; centre copy + “Explore the mind”; scroll prompt and hints (hover/click, Shift+scroll raw mode).
- **Scroll** — camera moves into the net (faster than before); no content section below, just a spacer so scroll has room to drive the camera.
- **Hover** — node scales up, cluster label, dim overlay, line opacity up.
- **Click** — camera flies to cluster, fullscreen overlay opens with that section (essays, about, work, blog, contact). One close (×) returns to the map and resets state.
- **Shift + scroll** — toggles raw mode (node labels show code-style snippets).
- Cursor halo follows the mouse and grows near nodes.

Clusters are laid out in a ring so no side is overloaded; nodes stay inside bounds; inter-cluster lines are drawn so the net reads as one connected graph.

## Content

- **Blog, Essays, Work** — Markdown in `src/content/`. Work case studies are prose only (no diagram/SVG); a remark plugin strips ` ```svg ` blocks.
- **Pages** — about, blog, essays, work, research, architecture, contact. All use the same placard-style layout (serif headings, wide margins, scroll reveal).
- RSS: `/rss.xml`. Sitemap: `/sitemap-index.xml`.

## Deploy

GitHub Actions: `npm ci` → `npm run build` → copy `CNAME` into `dist/` → upload artifact → `deploy-pages`. In repo Settings → Pages, set Source to **GitHub Actions** so this build is served (not branch root).

## Structure

```
src/
  layouts/     BaseLayout, PageLayout, ContentLayout (placard)
  components/  Header, Footer, HeroManifesto, NeuralCanvas, NeuralScene.ts, ScrollProgress
  content/     blog/, essays/, work/
  pages/       index (hero + spacer), about, blog, essays, work, research, architecture, contact, hero-placard, 404
  styles/      global.css
  plugins/     remark-svg-block.mjs (drops ```svg blocks from markdown)
public/        favicon, etc.
.github/       deploy.yml
```

## Licence / contact

Content and design © Akshay Bajpai. Links: [LinkedIn](https://linkedin.com/in/ax5hay), [GitHub](https://github.com/ax5hay), [Twitter](https://twitter.com/ax5hay).
