---
title: "Agentic Video Intelligence for 24/7 Operations"
description: "Real-time CCTV triage with LangGraph and MCP: Kafka ingestion, sub-200ms paths, and defense-grade on-prem deployment."
pubDate: 2026-04-01
client: "Defense-adjacent · video intelligence"
stack: ["LangGraph", "MCP", "FastAPI", "Kafka", "WebSockets", "React", "Next.js", "Python"]
metrics: ["~70% less analyst intervention", "Sub-200ms ingestion-to-decision", "On-prem defense deployments"]
---

## Problem

Security and defense operators cannot watch every feed. Analysts burn out on false positives; true incidents arrive late because triage is manual. The platform targets **real-time video intelligence**: detect, classify, escalate, and drive downstream workflows without requiring a human on every frame.

## Architecture

Stateful **multi-agent orchestration** with LangGraph and MCP:

- Detection and event classification agents with persistent memory and tool use
- Alert escalation pipelines that respect operational playbooks
- FastAPI microservices behind **WebSocket** event streams for live dashboards

**Ingestion:** Kafka-based pipelines with asynchronous inference, engineered for **sub-200ms ingestion-to-decision latency** on hot paths.

**Deployment modes:** Cloud-native for iteration; **self-contained inference stacks** for air-gapped, on-premise defense infrastructure where outbound cloud calls are not an option.

## Outcomes

- Analyst intervention reduced by approximately **70%** through automated detection triage and workflow handoff
- End-to-end ownership of **defense-sector** deployments: infrastructure, inference, and React/Next.js operational dashboards

## Lessons

1. **Agents need state, not just prompts**: classification and escalation are graphs, not single-shot completions.
2. **Latency is a trust metric**: operators abandon dashboards that lag the wall of cameras.
3. **Design for disconnected environments early**: packaging models and brokers for on-prem avoids a rewrite when classification moves to classified networks.
