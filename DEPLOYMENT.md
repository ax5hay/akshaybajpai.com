# Deployment

## GitHub Pages

1. **Repo settings:** Settings → Pages → Source: **GitHub Actions**
2. Push to `main`. Workflow `.github/workflows/deploy.yml`:
   - `npm ci` → `npm run build` (Next.js static export → `out/`)
   - Writes `CNAME` into `out/`
   - Uploads and deploys via `actions/deploy-pages`
3. Custom domain: `CNAME` in repo root contains `www.akshaybajpai.com`; copied into `out/` at deploy time.

## Build locally

```bash
npm ci
npm run build
```

Output is in `out/`.

## Sitemap & RSS

- Sitemap: auto-generated at `/sitemap.xml` via `app/sitemap.ts`
- RSS: generated post-build at `/rss.xml` via `scripts/generate-rss.mjs`
- `public/robots.txt` points to the sitemap
