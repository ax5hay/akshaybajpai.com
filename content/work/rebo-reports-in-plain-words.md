---
title: "ReBo: Reports in Plain Words, from Any SQL Database"
description: "A self-learning reports bot behind five walls against a write. 44 of 48 matching numbers at about two cents a question, and every claim cites a results file."
pubDate: 2026-11-11T12:00:00Z
client: "Private repository · reports agent"
stack: ["Python 3.13", "Pydantic AI", "sqlglot", "SQLAlchemy", "FastAPI", "MCP", "Postgres", "pgvector", "React 19", "OpenTelemetry"]
metrics: ["44 of 48 matching numbers", "About two cents a question", "Five walls against a write"]
---

## What it is

Ask ReBo for a report in plain words. It writes one read-only query, runs it, and hands back the rows, a few plain steps saying what the query does, and how it read your question.

It works against any relational database. `rebo bootstrap` reads the structure, the statistics, the stored values and the joins it can infer. There is no semantic layer to build, no glossary to fill in and no prompt written per customer. The first schema it was tested on was a production-shaped one, and nothing about it was special-cased.

## How it learns

Confirm an answer, or correct it in a sentence, and ReBo remembers it for you at once. It reaches everyone else only when three people independently agree and an admin approves.

Nothing is deleted. Every learned item has a history and an undo. Saved queries are re-checked when the schema under them changes, and paused if they no longer hold.

## Five walls against a write

Any one of these would stop a write on its own. I built all five because a reports bot that can change the books is not a reports bot.

| Wall | What it does |
|---|---|
| Database user | The connection logs in as a user granted SELECT and nothing else |
| Session | Every transaction is opened read-only |
| Timeout | A statement timeout ends any query that runs long |
| Syntax-tree guard | sqlglot parses the query: one SELECT, no locks, no INTO, no server functions, no unknown tables or columns |
| Rollback | Every run ends in a rollback, with a cap on rows fetched |

Secrets, ciphertext, hashes and bank or identity numbers are detected at bootstrap and never reach the model. On Postgres, each person's queries run as their own role under row-level security, so the database decides what they may see, not the prompt.

## Cost

The cheapest route that can answer wins. Saved reports and repeated questions rerun on today's data with zero model calls. Prompt caching took one benchmark from $2.68 to $1.22 with identical answers, and a Haiku-to-Sonnet cascade runs 5.7× cheaper.

## Measured

On a made-up company of enterprise size, ReBo matched 44 of 48 numbers at about two cents a question. On 18 prompts written by product owners against a production-shaped schema it returned 13 reports, asked 5 clarifying questions that were justified, and made 0 errors.

Every claim in the repository cites a results file. That is the rule I hold the README to as well.

## How it is built

Python 3.13 and Pydantic AI, with Claude, Gemini, OpenAI or LM Studio behind it. sqlglot and SQLAlchemy on the database side. FastAPI serves an AG-UI event stream and an MCP server. Retrieval is SQLite FTS5 or Postgres full text, with fastembed and pgvector, fused by reciprocal rank. The front end is React 19. Arize Phoenix reads the traces over OpenTelemetry, and oauth2-proxy stands at the door.

It ships as one container, with 179 tests and 27 design documents.

## What it proves

An LLM system can be trusted by a finance or operations team with real data, as long as the safety is structural and the receipts are kept.
