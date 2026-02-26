---
title: "Healthcare AI Pipeline. From Research to Clinician Assist"
description: "Case study: designing an AI pipeline for clinical decision support with auditability, safety, and compliance in mind."
pubDate: 2025-02-12
client: "Healthcare (anonymized)"
stack: ["Python", "ONNX runtime", "PostgreSQL", "HL7/FHIR", "Airflow"]
metrics: ["Under 500ms p99 inference", "100% audit coverage", "Zero PII in logs"]
---

## Problem

A healthcare partner needed an AI-assisted workflow for a specific clinical task. Requirements: (1) inference in under 500 ms p99, (2) every prediction traceable to model version and input hash, (3) no PII in logs or telemetry, (4) clinician always in the loop, system suggests, human decides. We had to integrate with existing EHR-adjacent systems and pass security and compliance review.

## Architecture

Data flows one way: EHR/API → our ingestion layer (de-identify where needed, hash for idempotency) → feature store → model serving → result + metadata stored and returned to the client app. All steps are logged with correlation IDs; no PHI leaves the boundary. Clinician UI shows the suggestion, confidence (when available), and the option to accept, reject, or edit.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 300" role="img" aria-label="Healthcare AI pipeline">
  <defs>
    <style>.b{fill:#141418;stroke:rgba(255,255,255,0.12);stroke-width:1}</style>
  </defs>
  <rect class="b" x="20" y="120" width="80" height="50" rx="4"/>
  <text x="60" y="152" fill="#e8e8ec" font-size="11" text-anchor="middle" font-family="system-ui">EHR / API</text>
  <rect class="b" x="130" y="120" width="90" height="50" rx="4"/>
  <text x="175" y="145" fill="#e8e8ec" font-size="11" text-anchor="middle" font-family="system-ui">Ingestion</text>
  <text x="175" y="160" fill="#9a9aa8" font-size="9" text-anchor="middle" font-family="system-ui">de-id, hash</text>
  <rect class="b" x="250" y="120" width="80" height="50" rx="4"/>
  <text x="290" y="152" fill="#e8e8ec" font-size="11" text-anchor="middle" font-family="system-ui">Features</text>
  <rect class="b" x="360" y="120" width="80" height="50" rx="4"/>
  <text x="400" y="145" fill="#e8e8ec" font-size="11" text-anchor="middle" font-family="system-ui">Model</text>
  <text x="400" y="160" fill="#9a9aa8" font-size="9" text-anchor="middle" font-family="system-ui">ONNX</text>
  <rect class="b" x="360" y="200" width="80" height="50" rx="4"/>
  <text x="400" y="232" fill="#e8e8ec" font-size="11" text-anchor="middle" font-family="system-ui">Audit DB</text>
  <rect class="b" x="200" y="240" width="120" height="45" rx="4"/>
  <text x="260" y="267" fill="#e8e8ec" font-size="11" text-anchor="middle" font-family="system-ui">Clinician UI</text>
  <path d="M100 145 L130 145" stroke="#5c5c6a" stroke-width="1" fill="none"/>
  <path d="M220 145 L250 145" stroke="#5c5c6a" stroke-width="1" fill="none"/>
  <path d="M330 145 L360 145" stroke="#5c5c6a" stroke-width="1" fill="none"/>
  <path d="M400 170 L400 200" stroke="#5c5c6a" stroke-width="1" fill="none"/>
  <path d="M400 250 L260 262" stroke="#5c5c6a" stroke-width="1" fill="none" stroke-dasharray="4 2"/>
  <path d="M440 145 L440 225 L260 262" stroke="#5c5c6a" stroke-width="1" fill="none" stroke-dasharray="4 2"/>
  <text x="115" y="138" fill="#9a9aa8" font-size="9">HL7/FHIR</text>
  <text x="400" y="192" fill="#9a9aa8" font-size="9">result + meta</text>
</svg>
```

Flow: EHR → Ingestion (de-id) → Features → Model → Audit DB; result and metadata to Clinician UI.

## Tech stack

- **Ingestion:** Python service consuming HL7/FHIR messages; de-identification and hashing for idempotency; output to feature store and to audit (hashes only, no PHI).
- **Model serving:** ONNX Runtime for inference; model version pinned and logged with every request.
- **Storage:** PostgreSQL for audit (request ID, model version, input hash, output, timestamp); no PII. Feature store for derived inputs; retention per policy.
- **Orchestration:** Airflow for periodic retraining and evaluation; pipelines versioned in Git.

## Tradeoffs

- **Latency vs. explainability:** We could have added explainability (e.g. feature importance) at the cost of extra compute and latency. We shipped with confidence scores and left full explainability for a later phase when we had latency headroom.
- **Flexibility vs. compliance:** We locked down the production path (no ad-hoc queries, no raw data export) to satisfy compliance. Analytics and research used a separate, approved pipeline with strict access control.
- **Model freshness vs. stability:** We chose scheduled retrains (e.g. monthly) with full validation rather than continuous deployment. That reduced risk of regressions and made audit trails clearer.

## Metrics

- Inference: p99 latency &lt; 500 ms; target met with ONNX and adequate hardware.
- Audit: 100% of predictions written to audit DB with model version and input hash.
- Compliance: zero PII in application logs or telemetry; only hashes and IDs.
- Uptime: 99.95% over the measurement period; incidents were non-AI (e.g. DB failover).

## Lessons

1. **Auditability from day one.** Designing the audit log and correlation IDs into the first version avoided a painful retrofit and made compliance review straightforward.
2. **Clinician in the loop is a product constraint.** The UI had to make it obvious that the AI suggests and the human decides; we avoided any flow that could auto-apply without confirmation.
3. **De-identify at the boundary.** Keeping PHI out of our logs and telemetry required discipline at ingestion; once we had the pattern, it scaled to new data sources.
4. **Version everything.** Model version, pipeline version, and config version in the audit trail made debugging and rollback tractable.
