---
title: "DNS-Level Ad Blocking. System Design"
description: "How to design a DNS-based ad blocking system: architecture, tradeoffs, and what you give up when you block at the resolver."
pubDate: 2025-01-22
---

Blocking ads and trackers at the DNS layer is elegant: one place to enforce policy, no per-app logic, and visibility into every name your devices resolve. But the system design is non-trivial. This post outlines how to think about it.

## Why DNS?

DNS is the first step in almost every connection. If you block or redirect a hostname at the resolver, the request never reaches the ad server. That gives you a single point of control, works across devices and apps, and avoids the complexity of per-browser or per-OS extensions. The tradeoff is granularity: you operate at the level of hostnames, not URLs or page elements. For many ads and trackers, that is enough.

## Architecture components

A minimal system has: a resolver (your DNS server), a blocklist (domains to block or sinkhole), and a way to get DNS queries to your resolver (router, VPN, or device config). Optional but valuable: logging (for debugging and analytics), allowlisting (to unbreak sites), and encrypted transport (DoH/DoT) so queries are not visible on the wire.

The resolver can be something like Pi-hole, AdGuard Home, or a custom stub that forwards to an upstream and filters responses. The blocklist is the product of community efforts (e.g. OISD, Steven Black’s list) plus your own rules. Keep the list in a format that your resolver understands and version it like code.

## Tradeoffs

**Latency:** Every query can be checked against the list. Use efficient data structures (trie or hash set) and keep the list in memory. A few milliseconds per query is acceptable for most users.

**Accuracy:** Blocklists can overblock (breaking sites) or underblock (missing trackers). Allowlisting and regular list updates are essential. Prefer lists that are maintained and documented.

**Privacy:** If you log queries, you have sensitive data. Decide retention and access. Prefer not logging by default; add logging only where needed for debugging.

**Single point of failure:** If your resolver is down, clients may fall back to the ISP resolver or fail. Design for fail-open or fail-closed based on your risk model. Many home setups fail-open so the internet still works when the Pi-hole is off.

## Metrics that matter

- Block rate: share of queries that hit a blocked domain.
- False positives: sites or services that break and need allowlisting.
- Resolver latency (p50, p99).
- List size and update frequency.

## Summary

DNS-level ad blocking is a single point of control with clear tradeoffs: hostname-level granularity, need for allowlisting, and operational responsibility for the resolver. Design for latency, accuracy, and privacy from the start, and treat the blocklist as a maintained artifact.
