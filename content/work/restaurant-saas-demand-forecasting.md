---
title: "Restaurant SaaS Forecasting at Scale"
description: "Founding-engineer delivery for inventory and demand sensing: XGBoost and Prophet, Node APIs, Next.js ops dashboard, and 2M+ events/day pipelines."
pubDate: 2025-03-01
client: "Restaurant SaaS · founding engineer"
stack: ["Node.js", "Next.js", "XGBoost", "Prophet", "Event-driven architecture", "Python"]
metrics: ["200+ restaurant pilot", "32% food waste reduction", "2M+ events/day", "Sub-100ms pipeline latency"]
---

## Problem

Restaurant groups run on thin margins and volatile demand. A SaaS pilot needed to prove **forecasting-driven inventory** and **real-time demand sensing** across hundreds of sites, not a dashboard demo, but operators trusting prep and order quantities daily.

## What we built

As **founding engineer**, I led AI and full-stack delivery:

- **Forecasting:** XGBoost and Prophet models for inventory optimization, validated across **200+ restaurants**, with roughly **32% reduction in food waste** in the pilot metrics we tracked
- **APIs & UX:** Node.js services and a Next.js operator dashboard for franchise and central teams
- **Pipelines:** Event-driven architecture load-tested at **2M+ events per day** with **sub-100ms latency** on demand-sensing paths

## Lessons

1. **Start with one workflow**: prep and ordering beats “AI everywhere” on the menu.
2. **Event volume exposes design errors early**: sub-100ms claims require honest partitioning and backpressure.
3. **Waste percentage is the executive metric**: accuracy charts alone do not close restaurant pilots.

## Related reading

Broader industry framing: [AI in Restaurant Automation](/blog/ai-restaurant-automation/).
