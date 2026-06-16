---
title: "Neural Map Personal Site — Spatial Navigation as Homepage"
description: "A scroll-driven Three.js constellation where clusters replace nav bars — hover, fly-in, and iframe overlays for essays, work, and writing."
pubDate: 2026-02-28
client: "Open source · ax5hay/akshaybajpai.com"
stack: ["Next.js 15", "Three.js", "TypeScript", "remark", "GitHub Pages"]
metrics: ["5 interactive clusters", "Static export to out/", "p99-friendly LineSegments renderer"]
---

## Problem

Personal sites default to the same pattern: hero, grid of cards, footer links. The content is fine; the **metaphor is tired**. This site asks: what if the homepage were a space you move through — where sections are places, not menu items?

Constraints stayed strict: **free hosting** (GitHub Pages), **static export**, **readable labels**, **no laggy WebGL**. The map had to feel alive without becoming an unreadable shader demo.

## Architecture

The homepage is one scene, not a stack of marketing sections.

```
Page load → black cover fades → constellation appears
Scroll    → camera advances into the network (z tied to scrollY)
Hover     → node scales, cluster label, dim overlay, edge highlight
Click     → camera flies to nucleus → fullscreen iframe overlay
Shift+scroll → raw mode (dev snippets instead of section titles)
```

**Five clusters** in a ring — Essays, About, Work, Blog, Contact — each with a nucleus (click target) and orbiting thought-nodes. **InstancedMesh** for nodes; **LineSegments** with in-place buffer updates for edges (no per-frame geometry allocation). Cross-cluster lines appear only when nodes from different clusters drift close, keeping the graph legible.

Inner pages use a conventional **PageShell** — header, placard layout, markdown content collections. The neural map is the front door; everything else is a room you enter through it.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 App Router, `output: 'export'`, `trailingSlash: true` |
| 3D | Three.js — lazy-loaded via `dynamic(..., { ssr: false })` |
| Content | Markdown in `content/` — blog, essays, work; remark + gray-matter |
| SEO | Per-route metadata, JSON-LD, sitemap, post-build RSS |
| Fonts | Instrument Serif, IBM Plex Sans/Mono via `next/font` |
| Deploy | GitHub Actions → `out/` + CNAME → www.akshaybajpai.com |

**Reduced motion:** If `prefers-reduced-motion`, the scene skips orbit/drift but interaction and overlays still work.

## Tradeoffs

- **Iframe overlays vs. SPA transitions:** Sections load in a native fullscreen panel — simple, works with static export, avoids routing the entire site through WebGL.
- **LineSegments vs. tubes/shaders:** An earlier tube-and-shader experiment looked striking but tanked frame times. The current renderer prioritizes stable 60fps on consumer hardware.
- **No header on hero:** Navigation lives in the map; scroll reveals hints, not a nav bar. Inner pages restore standard chrome.

## Metrics & capabilities

- **Clusters:** 5 nuclei, 80 instanced nodes, up to 900 curved edges with 6 samples per segment.
- **Interaction:** Raycast hover, fly-to animation on select, overlay phases `closed → flying → open`.
- **Build:** ~29 static routes; homepage JS kept small by code-splitting Three.js.
- **CI:** Build verifies `out/index.html` and writes CNAME; deploy-pages with retry logic.

## Lessons

1. **Performance is a design constraint.** The beautiful version and the fast version had to be the same version.
2. **Labels must never hide.** Hover text and hints exist because mystery navigation is not immersive — it is hostile.
3. **Static export shapes the UX.** Iframe overlays and client-only Three.js are consequences of GitHub Pages, not accidents.
4. **The map is navigation, not decoration.** Every cluster maps to real content; raw mode is an Easter egg for builders, not the primary UI.

## Source

Live: [www.akshaybajpai.com](https://www.akshaybajpai.com) · Code: [github.com/ax5hay/akshaybajpai.com](https://github.com/ax5hay/akshaybajpai.com)
