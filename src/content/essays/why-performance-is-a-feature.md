---
title: "Why Performance Is a Feature"
description: "Performance is not a nice-to-have. It’s a product requirement that affects conversion, retention, and trust. Here’s the case and the practice."
pubDate: 2025-02-05
---

Performance is often relegated to “we’ll optimize later.” Later never comes, or it comes as a fire drill when users complain or when a competitor is faster. This essay makes the case that performance is a feature—one that should be specified, measured, and shipped like any other—and outlines how to treat it that way.

## The case for performance as feature

Users notice slow. They might not articulate “LCP” or “TTI,” but they feel lag, they feel jank, and they leave. The data is clear: every 100ms delay in load time can cost conversion; every extra second increases bounce. On mobile and on slow networks, the effect is larger. So performance is not a technical detail; it’s a direct input to business outcomes. That makes it a feature: something we promise to the user. “This site loads quickly and responds when you tap” is a promise. We should design for it, test for it, and ship it.

Performance also affects perception of quality. A fast, smooth experience feels more trustworthy and more polished. A slow, janky one feels broken even if the content is good. So performance is part of the product’s personality. Treat it that way.

## Specify it

If performance is a feature, it needs a spec. That means: define the metrics (e.g. LCP, FID, CLS, TTI), set targets (e.g. LCP under 2.5s on 4G, CLS under 0.1), and make them part of the definition of done. Without a number, “fast” is vague. With a number, you can measure, track, and regress. Put the targets in the product or engineering doc. Make them visible in dashboards and in CI.

## Measure and enforce

Measurement has to be continuous. Use Lighthouse in CI and fail or warn when scores drop below the bar. Use real-user metrics (e.g. CrUX) when you can, so you see what users actually experience. Track trends: are we getting faster or slower over time? If a release regresses performance, it’s a bug, not a tradeoff—unless the tradeoff is explicit and agreed.

Enforcement means: no ship if we’re below the bar, unless there’s an exception and a plan to fix. That sounds strict, but it’s the only way to prevent the slow creep of “we’ll fix it later.” Performance regressions are easy to introduce and painful to fix in bulk. Catching them at merge time is cheap.

## Design for performance from the start

The best way to hit performance targets is to design for them from the start. That means: a performance budget (so much JS, so much CSS, so many images), critical path awareness (what blocks first paint?), and a default of “small and fast.” If you add a heavy library or a big image, the budget should complain. If you block the main thread for hundreds of milliseconds, the metrics should show it. Making performance visible in the development loop prevents the “big rewrite to make it fast” later.

## Summary

Performance is a feature: it affects conversion, retention, and trust, and it should be specified, measured, and enforced like any other feature. Specify with metrics and targets; measure continuously in CI and in the field; enforce by failing the build or blocking the ship when we’re below the bar. Design for performance from the start with budgets and critical-path discipline. When we do that, “we’ll optimize later” becomes “we’re already fast.”
