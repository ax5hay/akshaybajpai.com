# Deployment

## GitHub Pages (recommended)

1. **Repo settings:** Settings → Pages → Build and deployment → Source: **GitHub Actions**.
2. Push to `main`. The workflow `.github/workflows/deploy.yml` will:
   - Install deps, build, run Lighthouse CI (performance ≥ 90, accessibility 100)
   - Copy `CNAME` into `dist/`
   - Upload `dist/` and deploy via `actions/deploy-pages`
3. Custom domain: ensure `CNAME` in repo root contains `www.akshaybajpai.com` (or your domain). It is copied into `dist/` so the deployed site keeps the custom domain.

## Build locally

```bash
npm ci
npm run build
```

Output is in `dist/`. To preview:

```bash
npm run preview
```

## Lighthouse CI

- Runs in the same job as build. Uses `lighthouserc.js`: collects from `dist/`, asserts performance ≥ 0.9 and accessibility = 1.
- If assertions fail, the workflow fails and nothing is deployed.
- To relax: edit `lighthouserc.js` (e.g. change `minScore` or switch to `warn`).

## OG image

Default OG image is `/og-default.jpg`. Add a 1200×630 image at `public/og-default.jpg` for social previews. If missing, links may show no image.

## Sitemap and RSS

- Sitemap: built by `@astrojs/sitemap` at `/sitemap-index.xml`.
- RSS: `/rss.xml` (blog posts).
- `public/robots.txt` points to the sitemap.
