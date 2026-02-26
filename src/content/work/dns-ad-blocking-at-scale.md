---
title: "DNS-Level Ad Blocking at Scale"
description: "Designing a DNS-based ad and tracker blocking system for a distributed fleet: architecture, tradeoffs, and operational lessons."
pubDate: 2025-01-20
client: "Internal / Product"
stack: ["CoreDNS", "Redis", "Blocklist pipelines", "DoH/DoT"]
metrics: ["~2M queries/day", "p99 latency under 50ms", "Block rate ~25%"]
---

## Problem

We needed a single point of control for blocking ads and trackers across devices and networks, without per-device apps or browser extensions. The system had to handle high query volume, support encrypted DNS (DoH/DoT), allow custom allowlists, and degrade gracefully when blocklists were stale or the resolver was under load.

## Architecture

The system has three layers: (1) clients send DNS over DoH/DoT to (2) a resolver layer that checks each query against a blocklist and either returns NXDOMAIN/sinkhole or forwards to (3) upstream resolvers. Blocklists are compiled offline and loaded into the resolver’s memory; updates are periodic (e.g. daily) with a hot-reload path.

Below is a simplified architecture diagram.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320" role="img" aria-label="DNS ad blocking architecture">
  <defs>
    <style>.box{fill:#141418;stroke:rgba(255,255,255,0.12);stroke-width:1}</style>
  </defs>
  <rect class="box" x="20" y="40" width="120" height="50" rx="4"/>
  <text x="80" y="72" fill="#e8e8ec" font-size="12" text-anchor="middle" font-family="system-ui">Clients (DoH/DoT)</text>
  <rect class="box" x="180" y="120" width="120" height="70" rx="4"/>
  <text x="240" y="150" fill="#e8e8ec" font-size="12" text-anchor="middle" font-family="system-ui">Resolver</text>
  <text x="240" y="168" fill="#9a9aa8" font-size="10" text-anchor="middle" font-family="system-ui">Blocklist check</text>
  <rect class="box" x="180" y="220" width="120" height="50" rx="4"/>
  <text x="240" y="252" fill="#e8e8ec" font-size="12" text-anchor="middle" font-family="system-ui">Upstream DNS</text>
  <path d="M80 90 L80 120 L240 155" stroke="#5c5c6a" stroke-width="1" fill="none" stroke-dasharray="4 2"/>
  <path d="M240 190 L240 220" stroke="#5c5c6a" stroke-width="1" fill="none"/>
  <path d="M180 80 L160 120" stroke="#5c5c6a" stroke-width="1" fill="none" stroke-dasharray="4 2"/>
  <text x="100" y="105" fill="#9a9aa8" font-size="9">query</text>
  <text x="240" y="208" fill="#9a9aa8" font-size="9">forward / NX</text>
</svg>
```

Flow: Clients → Resolver (blocklist check) → Upstream DNS or NXDOMAIN.

## Tech stack

- **Resolver:** CoreDNS with a custom plugin (or blocklist middleware) that looks up each query in an in-memory set. Trie or hash set depending on list size.
- **Blocklist:** Curated lists (e.g. OISD, Steven Black) plus custom rules. Pipeline: fetch → parse → dedupe → compile to binary format → deploy. Versioned and auditable.
- **Storage:** Blocklist loaded at startup; optional Redis for allowlist overrides and rate limits if needed.
- **Transport:** DoH/DoT termination at the edge; TLS certs via Let’s Encrypt or internal CA.

## Tradeoffs

- **Latency vs. coverage:** Checking every query adds a few ms. We kept the list in memory and used efficient lookups so p99 stayed under 50 ms. Larger lists require more memory; we capped list size and accepted slightly lower block rate in exchange for predictability.
- **Accuracy vs. maintenance:** Aggressive lists break sites; we maintained an allowlist and updated it from support tickets. We chose slightly under-blocking over breaking critical domains.
- **Single point of failure:** Resolver failure could mean no DNS. We ran multiple replicas and had a documented fail-open to ISP DNS so users could still get online during outages.

## Metrics

- Query volume: ~2M queries/day at steady state.
- Block rate: ~25% of queries hit a blocked domain.
- Latency: p50 &lt; 10 ms, p99 &lt; 50 ms.
- Availability: 99.9% over a quarter; incidents were mostly blocklist reloads and cert renewals.

## Lessons

1. **Blocklist quality matters more than size.** A smaller, well-maintained list with an allowlist process beat a huge list that broke sites.
2. **Hot-reload is essential.** Restarting the resolver for every list update caused brief outages; hot-reload (load new list, swap pointer) eliminated them.
3. **Observability from day one.** Query logs (aggregated, not per-user) and latency metrics made debugging and tuning possible. We kept retention short for privacy.
4. **Document fail-open.** When the resolver was down, clients fell back to upstream; we documented this so no one was surprised and so we could tune timeouts.
