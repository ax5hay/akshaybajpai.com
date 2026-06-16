---
title: "BookLeaf AI Automation — Publishing Support at Scale"
description: "Multi-channel author query automation with intent classification, hybrid RAG, unified identity across WhatsApp and email, and confidence-gated human escalation."
pubDate: 2025-09-17
client: "BookLeaf Publishing"
stack: ["Node.js", "TypeScript", "Express", "Supabase", "OpenAI GPT-4", "Redis", "Docker"]
metrics: ["5 communication channels", "Hybrid semantic + keyword RAG", "Entity extraction for ISBNs and titles"]
---

## Problem

A publishing house fields the same questions across **WhatsApp, Instagram, email, web, and SMS** — order status, manuscript guidelines, ISBN lookups, royalty queries. Agents context-switch between channels; answers drift from the knowledge base; low-confidence guesses erode author trust.

The goal was not a chatbot widget. It was an **automation platform**: classify intent, retrieve the right policy paragraph, score confidence, escalate to humans when unsure, and keep one identity graph so “the same author” is recognized whether they DM or email.

## Architecture

```
Inbound (webhook / API)
  → Query processor (intent + entities + confidence)
  → Knowledge layer (hybrid RAG: semantic + keyword)
  → Identity unification (fuzzy match across channels)
  → Response generator (channel-specific templates + GPT-4)
  → Escalation queue if confidence below threshold
```

**Identity unification** normalizes handles and fuzzy-matches profiles so a WhatsApp thread and an email thread can attach to one author record. **Platform-specific formatters** adapt the same factual answer to WhatsApp brevity vs email structure without maintaining five separate bots.

## Tech stack

| Component | Implementation |
|-----------|----------------|
| API | Express + TypeScript — queries, webhooks, health |
| Core | `queryProcessor.ts` — pipeline orchestration |
| Knowledge | `ragSystem.ts` — hybrid search over knowledge base documents |
| Database | Supabase (PostgreSQL) — profiles, conversations, audit |
| AI | OpenAI GPT-4 — intent classification, response drafting |
| Cache | Redis — session and hot retrieval paths |
| Ops | Docker Compose; optional Prometheus/Grafana hooks |

Structured logging with **request correlation IDs** ties a webhook receipt to its RAG retrieval and final response for support debugging.

## Tradeoffs

- **Custom code vs. no-code:** Full control over confidence thresholds, Supabase schema, and channel formatters — at the cost of owning the integration layer instead of a SaaS bot builder.
- **GPT-4 for intent + generation:** Higher quality for messy author language; mitigated by retrieval-first answers and escalation on low scores.
- **Supabase as backend:** Fast iteration for a single-tenant publisher deployment; not multi-tenant SaaS out of the box without further isolation work.

## Metrics & capabilities

- **Channels:** WhatsApp, Instagram, Email, Web, SMS — unified identity layer across all five.
- **Entities:** Extraction for ISBNs, emails, book titles from free-text queries.
- **RAG:** Hybrid search — semantic embeddings plus keyword fallback for exact policy clauses.
- **Reliability:** Health checks, graceful degradation, human escalation path for low-confidence classifications.

## Lessons

1. **Confidence scores are a product feature.** Authors prefer a human handoff over a wrong answer about royalties.
2. **Identity is the hidden integration cost.** Channel-specific IDs must collapse to one profile or context is lost on every new message.
3. **Formatters ≠ models.** Keep facts in one place; let the formatter adapt tone and length per channel.
4. **Observability beats prompt tweaking.** Correlation IDs surfaced more failures than any single prompt revision.

## Source

Repository and setup: [github.com/ax5hay/ai-automation-main](https://github.com/ax5hay/ai-automation-main)
