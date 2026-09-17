<div align="center">

# The Architecture of Intelligence

**A personal site issued as a drawing set.**

Every route is a numbered sheet. The homepage is the key plan those sheets sit on.<br/>
A switch in the rail re-issues the entire set in three states.

<br/>

[![Live site](https://img.shields.io/badge/live-www.akshaybajpai.com-1a1a1e?style=for-the-badge&labelColor=ece6d9&color=8c2f24)](https://www.akshaybajpai.com)
[![Deploy](https://github.com/ax5hay/akshaybajpai.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/ax5hay/akshaybajpai.com/actions/workflows/deploy.yml)

![Next.js](https://img.shields.io/badge/Next.js_15-000?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React_19-20232a?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript_5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Static export](https://img.shields.io/badge/static_export-37_pages-4a4a52?style=flat-square)
![Shared JS](https://img.shields.io/badge/shared_JS-103_kB-2d6a4f?style=flat-square)
![Runtime deps](https://img.shields.io/badge/3D_%2F_animation_libs-none-8c2f24?style=flat-square)

<br/>

**Open a mode directly ·**
[Artifact](https://www.akshaybajpai.com/architecture/?mode=artifact) ·
[Annotated](https://www.akshaybajpai.com/architecture/?mode=annotated) ·
[Raw](https://www.akshaybajpai.com/architecture/?mode=raw)

<br/>

![The key plan — G-000](docs/media/key.png)

<sub><b>G-000 · Key plan.</b> The homepage is a pannable, zoomable general arrangement.<br/>
Every sheet in the set is drawn in place, with leader lines for cross-references.</sub>

</div>

---

```
┌──────────────────────────────────────────────────────────────────────┐
│  ARCHITECTURE OF INTELLIGENCE              SHEET   G-000   REV    D  │
│  Drawing set · Akshay Bajpai               SCALE   1:50    ISSUED    │
│  Next.js 15 · static export · GitHub Pages                 2026.09   │
└──────────────────────────────────────────────────────────────────────┘
```

The previous version of this site had a Three.js neural map on the homepage and
conventional pages everywhere else, joined by an iframe overlay. It read as two
products stapled together. This version commits to **one metaphor, end to end**.

---

## Drawing index

| Sheet | Section | What it covers |
|:------|:--------|:---------------|
| [`G-001`](#the-idea) | **The idea** | Why a drawing set, and what that buys |
| [`G-002`](#drawing-modes) | **Drawing modes** | The three states and why they are CSS-only |
| [`G-003`](#sheet-registry) | **Sheet registry** | Numbering, disciplines, routes |
| [`S-001`](#key-plan) | **Key plan** | Camera, level of detail, leader geometry |
| [`S-002`](#how-a-plate-is-composed) | **Plate composition** | `PlateShell` and the component kit |
| [`S-003`](#interaction-model) | **Interaction** | Keyboard, motion, accessibility |
| [`W-001`](#content-pipeline) | **Content pipeline** | Markdown in, static sheets out |
| [`W-002`](#quick-start) | **Quick start** | Run it locally |
| [`W-003`](#project-structure) | **Project structure** | Where everything lives |
| [`C-001`](#deployment) | **Deployment** | Build, CI, and the live domain |

---

## The idea

The site is a drawing set, and the metaphor is load-bearing rather than decorative.

<table>
<tr><td width="33%">

### Sheets, not pages

Every route carries a number, a discipline, a scale, and a revision — `A-101 The
Architect`, `S-201 Structural Principles`, `W-402 AIDA`. The numbers *are* the
navigation.

</td><td width="33%">

### A key plan, not a landing page

The homepage is `G-000`, a general arrangement showing where every sheet sits.
Clicking one flies the camera to it before the route changes, so the zoom is
continuous rather than a cut.

</td><td width="33%">

### Chrome that never leaves

The drawing frame, zone rulers, trim marks, rail, and title block persist across
navigation. Changing route reads as a new sheet laid on the same board.

</td></tr>
</table>

Cross-references are real links, and the title block always reports the sheet you
are actually on — including detail sheets, which carry their own number rather
than their section's.

---

## Drawing modes

The switch in the rail re-issues the set. This is the *dev-aligned* view of the
site, and it is a first-class state rather than a debug toggle.

<table>
<tr>
<td width="50%" valign="top">

![Annotated mode](docs/media/annot.png)

**`REV B` — Annotated**

Cyanotype. Line work reverses to white and the markup pen turns on: numbered
margin notes on leader lines, dimensions, and labels for the sheet's own anatomy.
The dimension line measures itself and prints the real rendered width.

</td>
<td width="50%" valign="top">

![Raw mode](docs/media/raw.png)

**`REV C` — Raw**

Presentation stripped. The sheet's record — frontmatter, discipline, refs, word
count — followed by the verbatim Markdown it was drawn from.

</td>
</tr>
</table>

`REV A — Artifact` is the drawing as issued: warm stock, dense ink, nothing but
the work. It is the default, and it carries no markup at all.

### Why it is CSS-only

Mode lives in a `data-mode` attribute on `<html>`. Every mode is a palette plus a
set of `display` rules — there are no mode branches in React.

```mermaid
flowchart LR
  QUERY["?mode= in URL"] --> SCRIPT
  STORE[("localStorage<br/>plate.mode")] --> SCRIPT["ModeScript<br/>inline, pre-paint"]
  SCRIPT --> HTML["html[data-mode]"]
  HTML --> CSS["globals.css<br/>palette swap"]
  HTML --> SHOW["PlateShell<br/>show / hide raw record"]
  HTML --> PEN["annotation layer<br/>callouts + dimensions"]
  PROVIDER["ModeProvider"] -. reads back .-> HTML
```

Three consequences worth keeping:

1. **All three modes ship as static markup.** No second render, no hydration
   flash — the server already emitted every mode's content.
2. **The mode resolves before first paint**, so the sheet never renders on paper
   and then re-inks to blueprint.
3. **Switching repaints but never reflows.** The measure is the same width in all
   three modes; annotations are drawn into margin the prose already left empty.

> [!WARNING]
> `ModeScript` is a server component and inlines the storage key **literally**.
> That key therefore lives in `lib/mode.ts`, which deliberately carries no
> `'use client'` directive. Importing it from `ModeProvider` instead yields a
> client-reference stub at build time and silently breaks persistence — the
> shipped script ends up reading `localStorage.getItem('function(){throw ...}')`.

---

## Sheet registry

[`lib/plates.ts`](lib/plates.ts) is the single source of truth. Numbers follow
drawing convention: a discipline letter, then a series where `x00` is the general
arrangement and `x01…` are its detail sheets.

| Sheet | Discipline | Route | Content |
|:------|:-----------|:------|:--------|
| `G-000` | General | `/` | Key plan |
| `A-101` | Architectural | `/about/` | The Architect |
| `S-201` | Structural | `/architecture/` | Structural Principles |
| `R-301` | Research | `/research/` | Research |
| `W-400` | Works | `/work/` | Works index |
| `W-401…` | Works | `/work/[slug]/` | Case studies |
| `B-500` | Field Notes | `/blog/` | Blog index |
| `B-501…` | Field Notes | `/blog/[slug]/` | Posts |
| `E-600` | Essays | `/essays/` | Essays index |
| `E-601…` | Essays | `/essays/[slug]/` | Essays |
| `C-700` | Correspondence | `/contact/` | Contact |
| `X-999` | Unissued | 404 | Sheet Not Issued |

Detail sheets are numbered at build time by [`lib/sheet-index.ts`](lib/sheet-index.ts),
which walks each collection in publication order. **Adding a case study renumbers
the W series automatically** — nothing is hand-maintained.

---

## Key plan

The homepage is rendered in plain DOM with a single CSS transform. No canvas, no
WebGL.

```mermaid
flowchart TD
  REG["lib/plates.ts<br/>authored rects"] --> PLANE["plane<br/>1700 × 900 units"]
  CONTENT["content collections"] --> PLANE
  PLANE --> CAM["camera<br/>scale, x, y"]
  CAM --> XFORM["translate3d + scale<br/>transform-origin 0 0"]
  CAM --> LOD{"scale"}
  LOD -->|"< 0.62"| FAR["far — titles only"]
  LOD -->|"< 1.1"| MID["mid — contents"]
  LOD -->|"≥ 1.1"| NEAR["near — full detail"]
  XFORM --> FLY["click — fly camera to the sheet, then route"]
```

Things to know before editing it:

- **Plate rectangles are authored, not computed.** The general arrangement is a
  designed composition; a force layout would undo that.
- **Only camera state re-renders.** Drag bookkeeping lives in a ref, so
  `pointermove` never triggers a render it does not need.
- **Leaders run between plate *edges*, not centres.** A centre-to-centre line
  would pass under an opaque sheet and never be seen, so each end is pulled back
  to the boundary and the run lives in the gutters.
- **Narrow screens get a stacked index.** Pan and zoom need a pointer and room
  for the plan; below `60rem` the same registry renders as a list.

---

## How a plate is composed

`PlateShell` is the one wrapper every content route uses. It renders the header,
body, cross-references, and raw record together, and lets CSS decide which the
current mode shows.

```mermaid
flowchart TD
  ROUTE["app/*/page.tsx"] --> SHELL["PlateShell"]
  SHELL --> META["SetPlateMeta → title block + rail"]
  SHELL --> HEAD["header — sheet tag, title, lead, sheet data"]
  SHELL --> BODY["body (children)"]
  SHELL --> REFS["cross-references"]
  SHELL --> RAW["raw record + Markdown source"]
  HEAD -. hidden in raw .-> RAW
  BODY -. hidden in raw .-> RAW
```

Detail routes go through `ArticlePlate`, which adds the back link, stack tags,
metric schedule, and adjacent sheets.

### Component kit

| Component | Purpose |
|:----------|:--------|
| `kit/ComparisonSlider` | Two clipped layers in permanent register; the divider is a native range input, so keyboard and screen-reader behaviour come free |
| `kit/Callout` | Keyed margin note, numbered by CSS counter so notes renumber themselves |
| `kit/DimensionLine` | Drafting dimension that measures itself and prints the real rendered width |
| `kit/Controls` | `Button`, `Switch`, `Stamp` |
| `kit/MetricSchedule` | Outcomes as a numbered, ruled schedule |
| `kit/ControlSchedule` | Live specimen panel; its switches write to `<html>` |
| `sheet/SheetRail` | Top rail — breadcrumb, index, lens, mode switch |
| `sheet/TitleBlock` | Expandable bottom-right title block |
| `sheet/SheetIndex` | Full-set search, fuzzy-ranked |
| `sheet/Loupe` | Draggable inspection lens |
| `system/ToastProvider` | Rubber-stamp toasts |

---

## Interaction model

| Key | Action |
|:----|:-------|
| <kbd>/</kbd> | Open the sheet index |
| <kbd>D</kbd> | Cycle drawing mode |
| <kbd>L</kbd> | Toggle the inspection loupe |
| <kbd>Esc</kbd> | Close the index, or stow the loupe |
| <kbd>←</kbd> <kbd>→</kbd> | Move the comparison divider, or walk the mode switch |

Shortcuts are suppressed while typing in a field. Under `prefers-reduced-motion`
all motion is removed — including the key plan's camera fly — and every reveal
falls back to its final state rather than staying invisible.

---

## Content pipeline

Markdown is read at **build time** only. There is no runtime CMS and no database.

```mermaid
flowchart LR
  FM["frontmatter"] --> GM["gray-matter"]
  BODY["Markdown body"] --> RM["remark + gfm"]
  RM --> SVG["remark-svg-block"] --> RH["remark-rehype"] --> RS["rehype-stringify"]
  RS --> HTML["entry.html"]
  GM --> ROUTE["app/.../[slug]/page.tsx"]
  HTML --> ROUTE
  ROUTE --> SHEET["numbered sheet"]
```

The raw Markdown is also handed to `PlateShell` verbatim — that is what raw mode
prints.

| Collection | Path | Frontmatter |
|:-----------|:-----|:------------|
| `blog` | `content/blog/` | `title`, `description`, `pubDate`, `draft?` — included in RSS |
| `essays` | `content/essays/` | same |
| `work` | `content/work/` | + `client?`, `stack?`, `metrics?` |

<details>
<summary><b>Authoring a new sheet</b></summary>

<br/>

1. Add a `.md` file under `content/blog/`, `content/essays/`, or `content/work/`.
2. Include required frontmatter (`title`, `description`, `pubDate`).
3. Set `draft: true` to exclude it from production builds.
4. Run `npm run build` — `generateStaticParams` picks up the slug and the sheet
   number is assigned automatically.

```yaml
---
title: "Healthcare AI Pipeline"
description: "End-to-end ML pipeline for clinical decision support."
pubDate: 2024-11-01
client: "Confidential"
stack: ["Python", "PyTorch", "Kubernetes"]
metrics: ["97% accuracy", "p99 < 120ms"]
---
```

`metrics` entries are split into value and label by `MetricSchedule`, so write
them as `"97% accuracy"` rather than as a sentence.

</details>

---

## Tech stack

| Layer | Technology |
|:------|:-----------|
| Framework | [Next.js 15](https://nextjs.org/) — App Router, SSG, static export |
| UI | React 19 |
| Language | TypeScript 5.7 |
| Styling | CSS Modules + custom properties |
| Markdown | remark, remark-gfm, gray-matter |
| Fonts | Instrument Serif, IBM Plex Sans / Mono via `next/font` |
| CI/CD | GitHub Actions → GitHub Pages |

**No animation library, no state library, no 3D runtime.** The rebuild removed
`three`, `gsap`, and `lenis`. Shared JS is ~**103 kB** across **37** statically
exported pages.

---

## Quick start

```bash
npm ci
npm run dev          # http://localhost:3000
```

| Script | What it does |
|:-------|:-------------|
| `npm run dev` | Dev server |
| `npm run build` | Static export to `out/`, plus `rss.xml` |
| `npm run typecheck` | `tsc --noEmit` |

To preview exactly what ships, serve the export rather than the dev server:

```bash
npm run build
npx serve out
```

> [!WARNING]
> Stop any server holding `out/` before running `npm run build`. The export step
> clears that directory and the build will fail — sometimes quietly — if it is
> locked.

---

## Project structure

```
app/
├── layout.tsx            # sheet chrome: frame, rail, title block, providers
├── template.tsx          # per-navigation enter animation
├── globals.css           # tokens, three mode palettes, annotation layer
├── page.tsx              # G-000 key plan
├── about|research|architecture|contact/
├── work|blog|essays/     # index + [slug] detail sheets
└── not-found.tsx         # X-999

components/
├── keyplan/              # KeyPlan
├── plate/                # PlateShell, ArticlePlate, Chronology, forms
├── kit/                  # sliders, controls, callouts, dimensions, schedules
├── sheet/                # frame, rail, title block, index, loupe, plate meta
└── system/               # mode provider / script / selector, toasts

lib/
├── plates.ts             # sheet registry and key plan geometry
├── sheet-index.ts        # detail sheet numbering and adjacency
├── mode.ts               # mode vocabulary — no 'use client', see warning above
├── content.ts            # Markdown pipeline
└── metadata.ts · format.ts · constants.ts

content/                  # blog, essays, work Markdown
docs/media/               # README screenshots
```

---

## Deployment

Push to `main` triggers the deploy workflow. Nothing manual after the initial
GitHub Pages setup.

```mermaid
flowchart LR
  PUSH["push to main"] --> CI["npm ci"] --> BUILD["npm run build"]
  BUILD --> CNAME["write out/CNAME"] --> VERIFY["verify out/index.html"]
  VERIFY --> UPLOAD["upload-pages-artifact"] --> DEPLOY["deploy-pages"]
  DEPLOY --> LIVE["www.akshaybajpai.com"]
```

<details>
<summary><b>One-time setup, and what not to commit</b></summary>

<br/>

1. **Settings → Pages → Build and deployment:** Source = **GitHub Actions**
2. Ensure the repo-root `CNAME` contains `www.akshaybajpai.com`
3. DNS: `CNAME` record `www` → `<user>.github.io`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full runbook.

`node_modules/`, `.next/`, `out/`, `*.tsbuildinfo`, and `.env*` are ignored.
Static assets are served from `public/` only — the repo root is not a web root.

</details>

<details>
<summary><b>Configuration reference</b></summary>

<br/>

`next.config.ts`:

```ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};
```

</details>

---

<div align="center">

<sub>Content and design © Akshay Bajpai. All rights reserved.</sub>

</div>
