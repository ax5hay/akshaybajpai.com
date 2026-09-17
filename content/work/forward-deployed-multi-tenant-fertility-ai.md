---
title: "Forward-Deployed: Multi-Tenant Fertility & Surrogacy AI"
description: "Three coordinated chatbots, a governed NL-to-SQL reporting agent, and a shared LLM platform layer across multiple client programs, with a roadmap to production on AWS CDK."
pubDate: 2026-05-01
client: "Forward deployment · health platform"
stack: ["Python", "FastAPI", "React", "Vite", "AWS CDK", "Lambda", "RDS", "Redis", "OpenRouter", "Playwright"]
metrics: ["3 coordinated AI surfaces", "8000+ validated schema columns", "100+ legacy prompts retired", "Human-in-the-loop NL2SQL"]
---

## Problem

Fertility and surrogacy operations run on sensitive intake, deep domain knowledge, and reporting that must survive audit, not on a single generic chatbot. Product needed **three coordinated experiences**: intake assistance, knowledge support for staff, and administrative reporting. Executives needed confidence that database-facing AI would not hallucinate joins or execute destructive SQL. Engineering needed one authentication model, shared APIs, and release governance across multiple client brands.

## Role & delivery model

Forward-deployed as **lead full-stack AI engineer**, I owned architecture through UAT: workbook reviews with product, Jira and Slack decision logs, SQL reviews with product owners, and evidence-backed scope negotiation when stakeholders disagreed. I also extended a personal real-estate AI prototype into a **production SaaS platform for a US federal use case**: prototype to deployed product across workflows, application architecture, and infrastructure.

## Platform architecture

**Shared LLM layer** for all client bots:

- Central gateway with tiered routing: exact match → classifier → composed retrieval
- Hybrid dense + sparse retrieval with cross-encoder reranking
- OpenRouter-based model selection, per-bot keys, caching, fallback handling for cost- and latency-aware inference

**Application stack:** FastAPI microservices, React/Vite administration UX, JWT-based multi-bot routing, Docker local parity with **AWS CDK**-managed Lambda, API Gateway, RDS, Redis, secrets, and storage. Regression coverage via Playwright and pytest.

**Multi-tenant product surface:** Intake, knowledge, and admin reporting bots sharing auth and integration patterns, not three forked codebases.

## Governed NL-to-SQL reporting agent

The hardest wedge was **schema ambiguity**: complex multi-join questions where a wrong table choice looks plausible. Architecture:

1. Schema-grounded routing and intent classification
2. Query preview and disambiguation when joins are under-specified
3. **Mandatory human confirmation** before execution
4. Audit-friendly execution path suitable for C-suite and product readouts

I presented this design to executive stakeholders and aligned teams on risk, scope, timeline, and UAT acceptance criteria.

## Schema corpus reset

With client product we retired a **100+ prompt** legacy catalog in favor of a stakeholder-validated reporting corpus: roughly **8000+ approved columns across 193 operational tables**. Deliverables included manifest SQL, LLM intent routing, schema-coverage tooling, and staging sign-off harnesses that achieved **full automated pass** on the validated batch.

## Lessons

1. **Human confirmation is a feature, not friction**: for NL2SQL in regulated domains, the confirm step is the product.
2. **One gateway beats N bespoke bots**: per-bot keys and routing tiers share cost controls and observability.
3. **Forward deployment is translation**: the same technical decision must read as risk reduction for executives and as a sprint plan for engineers.
4. **Schema work is product work**: eight thousand columns of agreement is what makes the agent trustworthy.
