---
title: "Insurance Document Intelligence on AWS"
description: "Multimodal RAG, Claude and GPT-4 Vision, LayoutLMv3 extraction, and ensemble underwriting models: 95%+ accuracy at 10K+ queries/day."
pubDate: 2024-06-01
client: "Insurance · document AI"
stack: ["AWS Bedrock", "RAG", "Claude", "GPT-4 Vision", "LayoutLMv3", "LightGBM", "Textract", "Python"]
metrics: ["95%+ extraction accuracy", "78% underwriting efficiency gain", "10K+ queries/day"]
---

## Problem

Insurance operations ingest **complex semi-structured documents**: policies, endorsements, scans with tables and handwriting. Manual extraction does not scale; naive OCR misses layout; generic chatbots invent coverage details. The platform needed **multimodal extraction**, **retrieval-grounded Q&A**, and **underwriting models** that improve decisions without bypassing human sign-off.

## Architecture

**Document intelligence pipeline:**

- RAG with Claude 3.5 Sonnet and GPT-4 Vision for multimodal understanding
- LayoutLMv3 for layout-aware extraction on challenging pages
- OCR-to-RAG path using **AWS Textract** and Apache Tika for high-volume ingestion

**Deployed on AWS Bedrock** with hybrid retrieval, reranking, prompt optimization, and automated evaluation loops.

**Downstream ML:** LightGBM, CatBoost, and XGBoost ensembles that improved **underwriting efficiency by ~78%** on the workflows we targeted.

## Scale & accuracy

- **95%+ extraction accuracy** across high-volume ingestion pipelines
- **10K+ queries/day** sustained on the RAG serving path

## Lessons

1. **Layout is signal**: vision + layout models beat text-only pipelines on insurance PDFs.
2. **Evaluation pipelines are production code**: prompt tweaks without regression tests erode the 95% claim.
3. **Ensembles still win tabular underwriting**: LLMs extract; gradient boosting decides when features are structured.

## Related reading

[Architecture Design for Healthcare AI](/blog/healthcare-ai-architecture/): shared themes on auditability and human override, applied across regulated domains.
