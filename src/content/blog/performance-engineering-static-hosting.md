---
title: "Performance Engineering on Static Hosting"
description: "How to hit Lighthouse 95+ and sub-second FCP when you have no server: budgets, critical path, and discipline."
pubDate: 2025-02-10
---

Static hosting—GitHub Pages, Netlify, Cloudflare Pages—gives you global edge delivery and no server to maintain. It also means every byte and every request is visible to the user. Performance is not optional; it is the product. Here is how to treat it as engineering.

## Budgets first

Set a performance budget before you build. For example: JS under 70 KB (gzipped), CSS under 20 KB, images optimized and lazy-loaded. Make the build fail or warn when the budget is exceeded. That forces tradeoffs up front instead of “we’ll fix it later.”

## Critical path

The only thing that must block first paint is the HTML and the minimal CSS needed above the fold. Fonts should load with `font-display: swap` or optional; non-critical CSS can be deferred or inlined only for the first screen. Scripts should be deferred or loaded as modules so parsing does not block rendering. Measure FCP and LCP on real devices and on 3G; if it’s slow, something is on the critical path that does not need to be.

## Static does not mean dumb

Use preloading for key resources (e.g. LCP image, main font). Use `loading="lazy"` for below-the-fold images. Preconnect to origins you will hit (e.g. fonts, API). All of this is static configuration; no server required. Sitemaps and meta tags are free; use them for SEO and crawlers.

## No layout thrashing

If you add client-side interactivity, avoid layout thrashing: batch reads and writes, use `requestAnimationFrame` for visual updates, and prefer `transform` and `opacity` for animations so the compositor does the work. Respect `prefers-reduced-motion` and pause or simplify animations when the user prefers it.

## Measure and enforce

Run Lighthouse in CI. Set a minimum performance score (e.g. 95) and fail the build if it drops. Use real-user metrics if you can (e.g. CrUX) to catch regressions in the field. Performance engineering on static hosting is mostly discipline: budgets, critical path, and measurement. Do it from day one.
