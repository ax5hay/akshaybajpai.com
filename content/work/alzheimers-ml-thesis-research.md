---
title: "Alzheimer's Classification — Master's Thesis Research"
description: "Benchmarking nine machine learning models on OASIS longitudinal biomarkers for dementia detection — rigorous preprocessing, grid search, and clinical interpretability."
pubDate: 2026-01-25
client: "Master's thesis · ax5hay/AlzheimersDiagnosis"
stack: ["Python", "scikit-learn", "pandas", "Jupyter", "OASIS dataset"]
metrics: ["9 models compared", "5-fold cross-validation", "ROC-AUC + recall for clinical sensitivity"]
---

## Problem

Early cognitive decline is easy to miss in routine care. The research question: **can a small set of clinical and neuroimaging biomarkers reliably separate demented from non-demented patients** in a cross-sectional snapshot, and which algorithms balance accuracy with recall for disease detection?

This was not a production deployment — it was **thesis-grade methodology**: explicit preprocessing choices, imputation strategies compared side by side, and nine models tuned through grid search with held-out test evaluation.

## Dataset & features

**Source:** OASIS Longitudinal Dataset — 150 subjects at first clinical visit, 8 predictive variables.

| Category | Features |
|----------|----------|
| Clinical | Gender, age, years of education (EDUC), socioeconomic status (SES) |
| Cognitive | MMSE (Mini-Mental State Examination) |
| Neuroimaging | Estimated intracranial volume (eTIV), normalized whole brain volume (nWBV), atlas scaling factor (ASF) |

MMSE and brain volume metrics showed the strongest separation between groups — MMSE ranges clustered around 25–30 for non-demented vs 17–30 for demented cohorts.

## Methodology

1. **Selection:** First-visit rows only for cross-sectional analysis.
2. **Encoding:** Binary gender; dementia label standardized to binary target.
3. **Missing values:** Strategy A — drop rows with missing SES (8 rows). Strategy B — EDUC-stratified median imputation.
4. **Scaling:** MinMax normalization on training folds.
5. **Split:** 75% train/validation (5-fold CV), 25% held-out test; `random_state=0` for reproducibility.

## Models evaluated

Nine distinct approaches with grid-search hyperparameters:

- Logistic Regression (with and without imputation)
- SVM — RBF, linear, polynomial, sigmoid kernels
- Decision Tree (max depth search)
- Random Forest (estimators, features, depth)
- AdaBoost (estimators, learning rate)

**Metrics:** Accuracy, recall (dementia sensitivity), ROC-AUC, confusion matrices. Feature importance from tree-based models; Graphviz export of optimal decision tree structure.

## Results & insights

- Class imbalance required emphasizing **recall**, not accuracy alone — missing dementia is costlier than a false alarm in screening context.
- **MMSE dominated feature importance** across tree ensembles; neuroimaging ratios added signal but cognitive score carried most discriminative power.
- **SVM and ensemble methods** (Random Forest, AdaBoost) competed on AUC; logistic regression anchored interpretability.
- Imputation strategy materially shifted performance — documenting both paths was essential for thesis rigor.

## Lessons

1. **Preprocessing is the experiment.** Imputation vs complete-case analysis is a scientific choice, not a footnote.
2. **Recall is the clinical metric.** Optimize for the error you cannot afford.
3. **Interpretability has value.** Decision trees and feature importance charts support clinician conversation even when ensembles win on AUC.
4. **Reproducibility is non-negotiable.** Fixed random seeds and explicit train/test walls keep thesis results defensible.

## Source

Notebook, methodology, and dataset notes: [github.com/ax5hay/AlzheimersDiagnosis](https://github.com/ax5hay/AlzheimersDiagnosis)
