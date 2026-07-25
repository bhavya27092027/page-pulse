# Failure Mode Analysis

| # | Failure | Detection | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| 1 | Target site unreachable (DNS / TCP / TLS) | `fetch` rejects | Single audit returns `reachable:false`, status `null` | Caught in `probeUrl`; surfaced as 200 (not 502) so the row still renders. Not cached. |
| 2 | Target site slow / hangs | `AbortController` fires at `AUDIT_TIMEOUT_MS` | One audit slot held up to 5s | Timeout → `TimeoutError` → 504. Slot is released in `finally`. |
| 3 | Target returns 5xx | `res.status >= 500` | `reachable:false` | Reported faithfully; not cached (transient). |
| 4 | Target returns non-HTML / unreadable body | `res.text()` throws | `title` is `null` | Caught; `title` degrades to `null`, status stays intact. |
| 5 | Malicious URL (SSRF attempt) | zod validation | Rejected before fetch | Only `http`/`https` with a dotted hostname; internal hosts blocked. (Note: a production SSRF hardening pass would add an IP-egress filter.) |
| 6 | Rate limit exceeded | `express-rate-limit` | 429 with `Retry-After` | Structured envelope; client shows a "slow down" toast. |
| 7 | Concurrent flood (>10) | Concurrency queue | Excess requests queue (FIFO) | Bounded concurrency protects the event loop + upstream; queue drains as slots free. |
| 8 | Cache poisoning | n/a — only reachable results cached | A transient failure can't pin a bad value | `if (result.reachable) setCachedAudit(...)` |
| 9 | Backend process crash | Render health check | 502 from platform | `uncaughtException` logged + exit; Render auto-restarts. |
| 10 | Backend unreachable from frontend | axios error | Dashboard dead-ends | **Graceful fallback** to in-browser `no-cors` probe; `requestId` prefixed `client-` so it's distinguishable. |
| 11 | Env misconfiguration | zod parse at boot | Process exits non-zero | Fail-fast at startup; never runs with bad config. |
| 12 | Request body too large | `express.json({limit:'64kb'})` | 413 | Bounded payload prevents memory abuse. |
| 13 | Unhandled route | 404 handler | Structured 404 envelope | No leaked stack; consistent shape. |
| 14 | Unknown thrown error | central error handler | 500 with generic message | Stack logged server-side, not leaked to client. |

## Blast radius

Each failure is scoped to **a single request**. No failure propagates to
other in-flight audits: the concurrency queue's `finally` guarantees slot
release, and the cache/history stores are append/overwrite-only.
