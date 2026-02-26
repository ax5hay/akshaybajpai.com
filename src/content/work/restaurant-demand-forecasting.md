---
title: "Restaurant Demand Forecasting — From Spreadsheets to Production"
description: "Building a forecasting system for restaurant prep and ordering: data pipeline, model choice, and operational integration."
pubDate: 2025-03-10
client: "Restaurant chain (anonymized)"
stack: ["Python", "Pandas", "LightGBM", "Cron/Scheduler", "REST API"]
metrics: ["MAPE under 18%", "Daily batch under 5 min", "Adoption by 40+ locations"]
---

## Problem

A restaurant chain was planning prep and ordering using spreadsheets and gut feel. Waste was high and stockouts happened on busy days. We needed a system that: (1) predicted demand (by category or key items) for the next 1–3 days, (2) ran daily with minimal manual work, (3) integrated with existing POS and inventory data, and (4) produced outputs that managers could use (prep lists, suggested order quantities) without needing to understand the model.

## Architecture

Historical data (sales, events, day of week, weather if available) is aggregated to daily or meal-period level. Features are built in a batch job; the model (gradient boosting) is trained periodically (e.g. weekly) and used for inference in a daily run. Predictions are written to a store that the ordering/prep UI and reports consume via a simple REST API. No real-time inference—batch is sufficient and keeps the system simple.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 260" role="img" aria-label="Restaurant demand forecasting">
  <defs>
    <style>.b{fill:#141418;stroke:rgba(255,255,255,0.12);stroke-width:1}</style>
  </defs>
  <rect class="b" x="20" y="80" width="90" height="45" rx="4"/>
  <text x="65" y="108" fill="#e8e8ec" font-size="11" text-anchor="middle" font-family="system-ui">POS / Inventory</text>
  <rect class="b" x="130" y="80" width="90" height="45" rx="4"/>
  <text x="175" y="108" fill="#e8e8ec" font-size="11" text-anchor="middle" font-family="system-ui">Aggregate</text>
  <rect class="b" x="240" y="80" width="90" height="45" rx="4"/>
  <text x="285" y="108" fill="#e8e8ec" font-size="11" text-anchor="middle" font-family="system-ui">Features</text>
  <rect class="b" x="350" y="80" width="90" height="45" rx="4"/>
  <text x="395" y="108" fill="#e8e8ec" font-size="11" text-anchor="middle" font-family="system-ui">Model</text>
  <rect class="b" x="350" y="160" width="90" height="45" rx="4"/>
  <text x="395" y="188" fill="#e8e8ec" font-size="11" text-anchor="middle" font-family="system-ui">Predictions</text>
  <rect class="b" x="180" y="200" width="140" height="45" rx="4"/>
  <text x="250" y="228" fill="#e8e8ec" font-size="11" text-anchor="middle" font-family="system-ui">Prep / Order UI</text>
  <path d="M110 102 L130 102" stroke="#5c5c6a" stroke-width="1" fill="none"/>
  <path d="M220 102 L240 102" stroke="#5c5c6a" stroke-width="1" fill="none"/>
  <path d="M330 102 L350 102" stroke="#5c5c6a" stroke-width="1" fill="none"/>
  <path d="M395 125 L395 160" stroke="#5c5c6a" stroke-width="1" fill="none"/>
  <path d="M395 205 L250 222" stroke="#5c5c6a" stroke-width="1" fill="none"/>
  <path d="M240 102 L240 60 L395 60 L395 80" stroke="#9a9aa8" stroke-width="0.8" fill="none" stroke-dasharray="3 2"/>
  <text x="240" y="52" fill="#9a9aa8" font-size="8">train (weekly)</text>
</svg>
```

Flow: POS/Inventory → Aggregate → Features → Model (train weekly, infer daily) → Predictions → Prep/Order UI.

## Tech stack

- **Data:** POS and inventory exports (CSV/API) pulled into a staging DB or files; Python + Pandas for aggregation and feature engineering. Day of week, lagged sales, rolling averages, and (where available) events or weather.
- **Model:** LightGBM for regression (demand per category or item). Trained weekly on a sliding window (e.g. last 12 months); inference run daily for the next 1–3 days.
- **Scheduling:** Cron or a lightweight scheduler for daily batch (aggregate → features → predict → write). Training on a weekly schedule.
- **Serving:** Predictions stored in DB or blob store; REST API for the prep/order UI to fetch by location and date. No real-time serving required.

## Tradeoffs

- **Granularity vs. noise:** Item-level prediction was noisier; category-level was more stable. We shipped category-level first and added item-level for a subset of high-volume items once we had enough history.
- **Freshness vs. cost:** Daily batch was enough for prep and ordering; real-time would have added complexity without clear benefit. We kept the pipeline simple.
- **Override and trust:** Managers could override predictions. We made overrides visible and fed them back (as “actuals”) for future training so the model could learn from corrections.

## Metrics

- Accuracy: MAPE (mean absolute percentage error) &lt; 18% on holdout; varied by category and location.
- Runtime: Daily batch (aggregate + features + predict) under 5 minutes; weekly training under 30 minutes.
- Adoption: Rolled out to 40+ locations; prep and order suggestions used daily. Qualitative feedback: less waste, fewer stockouts on peak days.

## Lessons

1. **Start with category-level.** Item-level forecasting is harder and noisier; category-level gave most of the value with less complexity.
2. **Data quality is the bottleneck.** Aligning POS and inventory data, handling missing days, and defining “demand” (sold? requested?) took more time than the model. Invest in the pipeline first.
3. **Human override is a feature.** Let managers adjust; surface overrides and use them as signal. The system is decision support, not autopilot.
4. **Simple models first.** LightGBM with a small feature set beat our early attempts with fancier models. Ship simple, iterate with data.
