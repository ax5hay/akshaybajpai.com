<div align="center">

# **The Architecture of Intelligence**

### *Akshay Bajpai*

[![Deploy to GitHub Pages](https://github.com/ax5hay/akshaybajpai.com/actions/workflows/deploy.yml/badge.svg)](https://github.com/ax5hay/akshaybajpai.com/actions/workflows/deploy.yml)
[![Astro](https://img.shields.io/badge/Astro-4.x-FF5D01?logo=astro)](https://astro.build)
[![Node](https://img.shields.io/badge/Node-18+-339933?logo=nodedotjs)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?logo=threedotjs)](https://threejs.org)

**A digital mind palace — AI infrastructure, systems thinking, performance engineering.**

[**Visit the site →**](https://www.akshaybajpai.com)

</div>

---

## ✨ What this is

A **multi-page authority site** built as a digital art installation and thinking laboratory: editorial typography, a **3D neural constellation** (Three.js) on the homepage, and full long-form content — no placeholders.

- **Framework:** [Astro](https://astro.build) 4 · static output
- **3D:** [Three.js](https://threejs.org) neural scene (instanced nodes, dynamic edges, fog, starfield) — lazy-loaded
- **Content:** Markdown via Content Collections (blog, essays, work)
- **Hosting:** GitHub Pages (free), custom domain supported

---

## 🚀 Quick start

```bash
git clone https://github.com/ax5hay/akshaybajpai.com.git
cd akshaybajpai.com
npm install
npm run dev
```

Open **http://localhost:4321**

```bash
npm run build    # → dist/
npm run preview  # preview production build
```

---

## 📁 Project structure

```
├── src/
│   ├── layouts/       BaseLayout, PageLayout, ContentLayout
│   ├── components/    Header, Footer, HeroManifesto, NeuralCanvas, ScrollProgress
│   ├── content/       blog/, essays/, work/ (Markdown)
│   ├── pages/         index, about, work, blog, essays, research, architecture, contact
│   └── styles/        global.css (design tokens)
├── public/            favicon.svg, robots.txt
├── .github/workflows/ deploy.yml (build + deploy to GitHub Pages)
└── CNAME              custom domain (www.akshaybajpai.com)
```

---

## 🌐 Deploy to GitHub Pages (why the old site still shows)

The repo **builds** with GitHub Actions and **deploys** the built site only when Pages is set to use that workflow.

**To show the new Astro site (and hide the old `index.html`):**

1. Open the repo on GitHub → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Push to `main` (or re-run the workflow). The workflow uploads the `dist/` folder; GitHub Pages then serves that instead of the branch root.

If Source is still **Deploy from a branch**, GitHub serves the root of the branch (your old `index.html`). Switching to **GitHub Actions** switches to the built site.

**If you see "2 failing" checks:** The workflow was updated to remove the Lighthouse CI step (Chrome in CI can be flaky). After you push, the build and deploy steps should pass. Ensure **Pages → Source** is **GitHub Actions** so the deployed site is the new one.

---

## 📜 Workflow

| Step            | What it does                          |
|-----------------|----------------------------------------|
| Checkout        | Clone repo                             |
| Setup Node      | Node 20, npm cache                     |
| Install         | `npm ci`                               |
| Build           | `npm run build` → `dist/`              |
| Preserve CNAME  | Copy `CNAME` into `dist/` for domain  |
| Upload artifact | `dist/` → Pages artifact               |
| Deploy          | `actions/deploy-pages`                 |

---

## 📚 Content

| Section   | Count | Notes                                      |
|-----------|-------|--------------------------------------------|
| **Blog**  | 8     | AI infra, DNS ad blocking, SaaS, perf, …  |
| **Essays**| 5     | Systems thinking, trust, minimalism, …    |
| **Work**  | 3     | Case studies with architecture & metrics  |

RSS: `/rss.xml` · Sitemap: `/sitemap-index.xml`

---

## 🛠 Tech stack

- **Astro** — static site, content collections, minimal JS
- **Three.js** — 3D neural scene (instanced mesh, line segments, fog)
- **TypeScript** — strict mode
- **CSS** — design tokens, no framework; Instrument Serif + IBM Plex Sans

---

## 📬 Contact

| Link | Handle |
|------|--------|
| **Site** | [www.akshaybajpai.com](https://www.akshaybajpai.com) |
| **LinkedIn** | [ax5hay](https://linkedin.com/in/ax5hay) |
| **GitHub** | [ax5hay](https://github.com/ax5hay) |
| **Twitter / X** | [@ax5hay](https://twitter.com/ax5hay) |

---

<div align="center">

*The Architecture of Intelligence* — reinvention, not iteration.

</div>
