---
title: "Agentic Finance & Multimodal Healthcare AI"
description: "LangGraph workflows across portfolio logic and onboarding, plus QLoRA clinical imaging pipelines on HIPAA-aware AWS with hybrid RAG at sub-800ms p95."
pubDate: 2025-11-01
client: "Consulting · finance & health"
stack: ["LangGraph", "QLoRA", "PyTorch", "AWS", "Python", "RAG", "Hugging Face"]
metrics: ["~60% fewer manual touchpoints", "94% precision on diagnostic imaging", "80% inference cost reduction", "Sub-800ms p95 RAG"]
---

## Problem

Wealth and health domains both punish “helpful” hallucinations. Finance workflows need **stateful tool routing** across risk APIs, rebalancing logic, and onboarding, with retries, fallbacks, and memory that survives multi-step conversations. Healthcare imaging pipelines need **precision and compliance**: fine-tuned models inside HIPAA/GDPR-aware infrastructure, not notebook accuracy.

## Finance: LangGraph agentic workflows

Built stateful multi-agent orchestration:

- Tool routing across risk profiling APIs, portfolio rebalancing, and onboarding utilities
- Fallback handling, retry logic, and cross-step memory persistence
- Approximately **60% reduction in manual touchpoints** for supported journeys

## Healthcare: multimodal pipelines

- EHR and diagnostic image analysis with fine-tuned open-source LLMs via **QLoRA**
- **94% precision** on the targeted imaging tasks within compliant AWS boundaries
- **80% inference cost reduction** through quantization and batching optimizations

## Production RAG

Hybrid retrieval, contextual reranking, and domain guardrails sustaining **sub-800ms p95 latency**: the bar where operators treat the system as interactive, not batch.

## Lessons

1. **Memory and routing are the finance product**: the base model is interchangeable; the graph is not.
2. **Cost is an architecture input**: QLoRA and batching decisions belong beside latency SLOs.
3. **Guardrails beat bigger models**: domain constraints on retrieval and generation outperform raw parameter count for compliance-sensitive text.
