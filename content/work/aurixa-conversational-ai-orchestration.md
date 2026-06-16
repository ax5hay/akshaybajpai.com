---
title: "AURIXA — Conversational AI Orchestration at Scale"
description: "Multi-tenant microservices platform for real-time LLM routing, RAG, agent execution, safety guardrails, and voice — built as a production Turborepo monorepo."
pubDate: 2026-02-18
client: "Open source · ax5hay/AURIXA"
stack: ["TypeScript", "Python", "FastAPI", "Fastify", "Next.js 15", "PostgreSQL", "Redis", "Docker", "Turborepo"]
metrics: ["8 Python services + API gateway", "Pluggable OpenAI / Claude / Gemini / local LLMs", "E2E pipeline with emergency escalation"]
---

## Problem

Most “chat with your data” demos collapse under real constraints: multiple tenants, provider failover, cost-aware routing, tool execution against real databases, safety checks before a response ships, and observability when eight services are in the path. AURIXA exists to answer a single question — *how do you run conversational AI like infrastructure, not like a script?*

The platform targets healthcare-adjacent workflows (appointments, insurance checks, prescription refills) but the architecture is domain-agnostic: stateless services, async orchestration, and a gateway that can scale each concern independently.

## Architecture

Every request enters through a **Fastify API Gateway** (rate limits, CORS, WebSocket proxy, structured logging), then flows into an **Orchestration Engine** that coordinates the pipeline:

```
User → Gateway (:3000)
  → Orchestration (:8001)
      ├─ Intent → LLM Router (:8002)     — semantic + keyword routing, cost-aware model pick
      ├─ Agent path → Agent Runtime (:8003) + Execution Engine (:8007) — DB-backed tools
      ├─ RAG path   → RAG Service (:8004) — hybrid BM25 + vector retrieval
      ├─ Safety     → Guardrails (:8005)  — validation, clinical keyword escalation
      └─ Voice      → Streaming Voice (:8006) — ASR / audio path when needed
  → Observability Core (:8008)
```

**Execution Engine** actions are not mocks — they read and write tenant-scoped records: `get_appointments`, `create_appointment`, `check_insurance`, `get_availability`, `request_prescription_refill`. **Safety Guardrails** flag phrases like chest pain or stroke and set `requires_escalation` rather than pretending the model is a clinician.

Frontends ship in the same monorepo: unified admin dashboard (playground, tenants, service health), patient portal, and hospital portal — all Next.js 15.

## Tech stack

| Layer | Choices |
|-------|---------|
| Monorepo | Turborepo + pnpm workspaces |
| Gateway | Fastify 5, TypeScript |
| Services | FastAPI (Python 3.11+) — orchestration, LLM router, RAG, agents, safety, voice, execution, observability |
| Data | PostgreSQL 16, Redis 7 |
| LLM layer | Shared `llm-clients` package — OpenAI, Anthropic, Gemini, local models |
| Infra | Docker Compose locally; K8s + Terraform templates for AWS |
| UI | Next.js 15 dashboards, shared `ui-kit` |

Response caching (TTL 300s) and telemetry emission on orchestration, routing, and RAG reduce cost and make the playground’s “Run All Tests” panel meaningful.

## Tradeoffs

- **Microservices vs. velocity:** Eight services plus three frontends is heavy for a solo builder, but it mirrors how production AI platforms actually fail — at routing, safety, and observability boundaries. The split buys independent deploy and clear ownership per concern.
- **Healthcare demo data vs. generic core:** Sample patients and appointments anchor the execution engine, yet the gateway–orchestration–router pattern transfers to any vertical with tool calls and RAG.
- **Python + TypeScript split:** Gateway and auth stay in Node; ML-heavy paths stay in FastAPI. Two runtimes, one contract: Pydantic schemas and shared auth utilities.

## Metrics & capabilities

- **Services:** API Gateway + 8 FastAPI microservices, each with health endpoints and playground coverage.
- **Pipeline:** Intent classification → RAG or agent branch → generation → safety validation in one orchestrated pass.
- **Multi-tenant:** Admin API for tenant and patient creation; knowledge articles scoped per tenant for RAG.
- **Ops:** Playground dashboard runs full E2E tests, surfaces per-service latency, and visualizes Intent → RAG/Agent → Generate → Safety steps.

## Lessons

1. **Orchestration is the product.** Routing and RAG are commodities; the engine that sequences them, caches, and escalates is what makes the system trustworthy.
2. **Safety belongs in the graph, not in the prompt.** A dedicated guardrails service with explicit escalation flags beats hoping the LLM self-censors.
3. **DB-backed tools ground agents.** Appointment and insurance actions against real rows prevent the “helpful but fictional” failure mode.
4. **Observability from service one.** When eight hops are normal, per-service metrics and audit logs are not optional.

## Source

Full architecture, service ports, and setup: [github.com/ax5hay/AURIXA](https://github.com/ax5hay/AURIXA)
