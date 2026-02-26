# Akshay Bajpai — The Architecture of Intelligence

A world-class, multi-page authority site: digital art installation, thinking laboratory, and high-performance interactive manifesto. Built with **Astro**, fully static, deployed on **GitHub Pages**.

## Stack

- **Framework:** Astro 4 (static output)
- **Content:** Markdown via Content Collections (blog, essays, work)
- **Styling:** Global CSS with design tokens (no previous palette or typography)
- **Enhancement:** Lightweight canvas constellation (lazy-loaded), scroll progress, no heavy WebGL

## Structure

```
src/
  layouts/     BaseLayout, PageLayout, ContentLayout
  components/  Header, Footer, HeroManifesto, NeuralCanvas, ScrollProgress
  content/     blog/, essays/, work/ (Markdown)
  pages/       index, about, work, blog, essays, research, architecture, contact, 404, rss
  styles/      global.css (tokens, reset)
public/        favicon.svg, robots.txt
```

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:4321

## Build

```bash
npm run build
```

Output: `dist/` (fully static). The workflow copies `CNAME` into `dist/` so the custom domain is preserved when deploying.

## Deployment (GitHub Pages)

1. **Repository settings:** Settings → Pages → Source: **GitHub Actions**.
2. Push to `main`. The workflow `.github/workflows/deploy.yml` will:
   - Install dependencies
   - Run `npm run build`
   - Copy `CNAME` into `dist/`
   - Upload `dist/` and deploy via `actions/deploy-pages`.

No need to use the `gh-pages` branch manually; the artifact is deployed by GitHub.

## Performance targets

- **JS:** Initial load kept minimal; constellation script lazy-loaded on idle.
- **Lighthouse:** Performance ≥ 95, Accessibility 100, CLS = 0.
- **Animations:** Transform + opacity only; `prefers-reduced-motion` respected.
- **Fonts:** Preconnect + swap; critical CSS inlined by Astro.

## Content

- **Blog:** 8 posts (AI infrastructure, DNS ad blocking, zero-dependency SaaS, performance, systems thinking, restaurant AI, healthcare AI, experimental UI).
- **Essays:** 5 long-form pieces (systems thinking, cost of convenience, performance as feature, architecture of trust, minimalism as engineering).
- **Work:** 3 case studies with problem, architecture (diagram), stack, tradeoffs, metrics, lessons.

No placeholders. All copy is production-ready.

## Custom domain

`CNAME` contains `www.akshaybajpai.com`. It is copied into `dist/` during build so Pages serves the site on your domain.

## Validation checklist

- [ ] `npm run build` succeeds
- [ ] All routes load (/, /about, /work, /blog, /essays, /research, /architecture, /contact)
- [ ] Blog, essays, and work listing and detail pages render
- [ ] RSS at `/rss.xml`
- [ ] Sitemap at `/sitemap-index.xml`
- [ ] 404 at `/404`
- [ ] Lighthouse Performance ≥ 95, Accessibility 100
- [ ] CNAME in repo root for deploy workflow

## Contact

- Email: hello@akshaybajpai.com
- LinkedIn: [linkedin.com/in/ax5hay](https://linkedin.com/in/ax5hay)
- GitHub: [github.com/ax5hay](https://github.com/ax5hay)
- Twitter: [@ax5hay](https://twitter.com/ax5hay)

---

*The Architecture of Intelligence* — reinvention, not iteration.
