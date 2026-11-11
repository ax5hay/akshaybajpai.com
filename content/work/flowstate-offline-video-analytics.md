---
title: "FlowState: Offline Video Analytics for Machines That May Not Call Home"
description: "Fifteen detectors, up to six cameras and one fused 0 to 100 threat index, shipped air-gapped. A missing model greys out one detector; the console stays up."
pubDate: 2026-11-11T10:00:00Z
client: "Private repository · edge vision"
stack: ["Python", "FastAPI", "Electron", "React", "YOLO", "SQLite", "RTSP"]
metrics: ["Fifteen detectors, six cameras", "No telemetry, no runtime downloads", "One fused 0 to 100 threat index"]
---

## What it is

A Python analysis engine under an Electron and React console. The engine is FastAPI on loopback, with the detectors in worker threads. Files, webcams or RTSP cameras go in; annotated video and one fused 0 to 100 threat index come out.

I rebuilt it in October 2026 from an older Qt desktop app.

## What it watches

Fifteen detectors: weapons, fire, harmful objects, banners, crowd size and behaviour, head count, masks, face covering, age and gender, audio noise, general objects, pose and posture, PPE and number plates.

Up to six cameras run at once. Each detector has one inference worker, and that worker serves every camera.

## How it decides

Each channel has a weight the operator tunes, and each level has its band. A ten-minute trace shows what contributed to the number on screen. Alerts keep an evidence frame and are journaled to SQLite.

## How it fails

Each detector loads lazily, in its own thread, and fails alone. A missing model, package or camera greys out one detector and names the reason. The console never goes down.

## How it ships

Air-gapped. A relocatable CPython runtime, bundled weights with their provenance recorded, no telemetry and no downloads at run time. Per-OS installers come from one release workflow.

Thirteen documents ship with it, including the engine API, the threat formula, an operator guide and a runbook.

Every tool it uses is on the [schedule of materials, traced](/schedule/?trace=r-flowstate).

## What it proves

Computer vision can live where the data lives, with nothing leaving the building.
