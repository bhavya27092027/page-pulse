# Scalability Plan

Page Pulse ships as a single-instance service — appropriate for the
assessment's traffic profile and zero-ops to run. This document records
the upgrade path as load grows.

## Stage 0 — current (single instance)

- In-memory `node-cache` (TTL 10m), in-memory history ring buffer,
  in-process concurrency queue, in-memory rate-limit store.
- Handles hundreds of concurrent users comfortably on a small container.

## Stage 1 — vertical scale

- Bump `MAX_CONCURRENT_AUDITS` and container CPU/memory.
- Node 20's native `fetch` is efficient; the queue is the real limiter.

## Stage 2 — horizontal scale (multiple instances)

When a single instance saturates, the in-memory primitives must become
shared:

| Component | Shared replacement | Notes |
| --- | --- | --- |
| Cache | **Redis** (`@redis/client`) | Same TTL semantics; `GET`/`SET` with `EX`. Identical cache hits across instances. |
| Rate limit store | `rate-limit-redis` store | Distributed counter — accurate per-IP limiting across instances. |
| History | Redis list (`LPUSH` + `LTRIM`) or a Postgres table | Becomes a true "recent audits" feed. |
| Concurrency | Distributed semaphore (Redis) or a work queue (BullMQ) | Bounds total concurrency *across* instances, not per process. |

A sticky-session load balancer is **not** required — the API is
stateless apart from the shared stores above.

## Stage 3 — queue + workers

For very high throughput, split ingest from execution:

```
Client → API (enqueue) → Redis queue → Worker pool (audit probes) → Result store
```

The API returns immediately with a `202 + jobId`; the client polls or
subscribes (SSE/WebSocket) for the result. This decouples user-facing
latency from probe latency.

## Capacity assumptions

- One audit ≈ 1 outbound request, ≤ 5s, ≤ a few hundred KB of HTML.
- Concurrency cap of 10 → ~2–10 audits/sec sustained per instance.
- With a 10-minute cache and a popular-URL long tail, effective throughput
  is multiples higher thanks to cache hits.

## What does NOT need to change

- The API contract, the error envelope, the request-ID plumbing, and the
  frontend are all scale-agnostic — only the store implementations swap.
