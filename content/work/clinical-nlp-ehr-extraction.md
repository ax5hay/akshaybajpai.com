---
title: "Clinical NLP from Unstructured EHRs"
description: "BioBERT and spaCy NER pipelines extracting 47+ structured variables at 91.5% accuracy, across 5K+ documents/day, with risk scoring at scale."
pubDate: 2022-06-01
client: "Healthcare logistics · contract"
stack: ["BioBERT", "spaCy", "Python", "scikit-learn", "Clinical NLP"]
metrics: ["47+ structured variables", "91.5% extraction accuracy", "5K+ documents/day", "5K+ patient records/day scoring"]
---

## Problem

Clinical research and operations teams sit on **unstructured EHR narratives** (progress notes, discharge summaries, imaging reports) while downstream analytics need **structured variables** and **risk scores**. Manual abstraction does not scale past a few charts per day.

## Systems delivered

As **Senior ML Engineer (contract)**, I built and productionized:

**Clinical NLP extraction**

- **47+ structured variables** from unstructured documents
- **91.5% accuracy** across pipelines processing **5K+ documents per day**
- BioBERT, spaCy NER, and custom sequence-labelling models tuned for clinical entities

**Risk scoring**

- Supervised models (Random Forest, Gradient Boosting, SVM) for clinical risk scoring supporting triage
- **5K+ patient records scored daily** in production configuration

## Lessons

1. **Entity lists are contracts**: forty-seven variables only help if product defines each one defensibly.
2. **Domain embeddings matter**: BioBERT-level priors beat general-language models on shorthand and abbreviations.
3. **Throughput is an NLP architecture problem**: batching, model cascades, and fail-open paths keep 5K/day honest.

## Related reading

Springer chapter on ML for medical diagnosis (see [Research](/research/)) and [Alzheimer's thesis work](/work/alzheimers-ml-thesis-research/) for the research side of the same clinical thread.
