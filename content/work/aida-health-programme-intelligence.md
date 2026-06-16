---
title: "AIDA — Health Programme Intelligence You Can Brief From"
description: "Turning facility assessment rows into screening rates, management gaps, and district rollups — with optional LLM narratives that never invent the numbers."
pubDate: 2026-04-20
client: "Open source · ax5hay/AIDA"
stack: ["NestJS", "Next.js", "Prisma", "PostgreSQL", "TypeScript", "npm workspaces"]
metrics: ["Deterministic KPI engine", "Parity ANC workspace in same monorepo", "Live demo at aida-demo.merakiel.in"]
---

## Problem

State and district health programmes collect **monthly assessment data per facility** — who was identified vs managed, ANC screening counts, delivery signals, neonatal follow-up. The raw tables are unusable in a briefing unless you can defend **rates**, **gaps** (identified minus managed on the same condition keys), and **time-bounded views** filtered by period, district, and facility.

Spreadsheets break at scale. Dashboards that let the UI compute rates diverge from the API. Narrative “AI insights” that hallucinate counts destroy trust with programme officers.

## Architecture

AIDA enforces a strict boundary: **the UI never opens a database connection.**

```
PostgreSQL → Prisma (@aida/db) → Nest API → Next.js
                    ↑
        @aida/analytics-engine (sums, rates, validation)
        @aida/ml-engine (correlations, z-score anomalies)
        @aida/ai-engine (optional OpenAI-compatible narratives)
```

The same monorepo ships **Parity** — an ANC capture, analytics, and observation workspace (`parity-web`, `parity-api`, `@aida/parity-core`). A product hub links the two apps via configurable `PARITY_WEB_URL` / `AIDA_WEB_URL`, so one deployment can expose both surfaces without rebuilding for new demo hosts.

| Package | Responsibility |
|---------|----------------|
| `analytics-engine` | Mortality, LBW, preterm, institutional delivery mix, screening rates, management gaps |
| `ml-engine` | Pearson correlations, z-score anomaly flags on delivery metrics |
| `ai-engine` | `POST /v1/ai/insights` — narrates a JSON snapshot the API already computed |
| `parity-core` | ANC indicator schema, validation, analytics bundle |

## Tech stack

- **API:** NestJS modules — analytics, metrics, facilities, ingestion, optional AI
- **Web:** Next.js App Router — overview, analytics suite, explorer, correlations, help
- **Data:** Prisma schema as source of truth; identified vs managed in parallel section tables
- **Deploy:** Docker Compose for Postgres + API + web; `demo-start.sh` for full Parity + AIDA stack
- **Demo:** [aida-demo.merakiel.in](https://aida-demo.merakiel.in)

Query params (`from`, `to`, `district`, `facilityId`) slice every analytics endpoint consistently — shareable URLs for filtered views.

## Tradeoffs

- **Deterministic KPIs vs. ML flourishes:** Correlations and anomalies are clearly separated from headline rates so officers know what is policy-grade math vs exploratory stats.
- **Optional LLM:** The product is fully usable with no model server. Narratives only activate when `AI_INSIGHTS_ENABLED` and an OpenAI-compatible endpoint are configured — and the model receives counts, not raw PHI lists.
- **Monorepo complexity:** Two APIs and two web apps share one database package. The cost is wiring CORS (`WEB_ORIGIN`, `PARITY_WEB_ORIGIN`) correctly; the win is one schema and one analytics definition.

## Metrics & capabilities

- **Screening coverage:** e.g. `hiv_tested` ÷ summed `total_anc_registered` via `screeningRates` in the analytics engine.
- **Management gaps:** Identified vs managed section tables with validation that managed ≤ identified where schema implies it.
- **API surface:** Overview KPIs, district rollup, clinical cross-section, assessment explorer, ingestion with server-side validation.
- **Performance:** Gzip on JSON, 30s in-memory cache on hot analytics paths, narrow Prisma selects, TanStack Query with `keepPreviousData` on filter changes.

## Lessons

1. **Keep derived definitions in one engine.** Rate math duplicated in SQL and React is how programmes lose faith in dashboards.
2. **Thin UI, fat API.** The web app mirrors query params; it does not re-derive epidemiology.
3. **LLM as narrator, not author.** Insights POST sends the same JSON shape as `/analytics/overview` — the model explains, it does not count.
4. **Parity extends capture, not replacement.** ANC field discipline and AIDA rollups address different moments in the same programme workflow.

## Source

Setup, API routes, and Parity docs: [github.com/ax5hay/AIDA](https://github.com/ax5hay/AIDA)
