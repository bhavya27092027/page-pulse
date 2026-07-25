# Caching Strategy

## Summary

Audit results are cached in memory keyed by the **normalized URL** with a
configurable TTL (default **10 minutes** via `CACHE_TTL_SECONDS`).

## Why cache?

- Identical URLs audited in quick succession (a common UX pattern) should
  not re-probe the target.
- The audit is expensive (an outbound request + HTML parse + title regex)
  and the result is stable over short windows.

## What is cached?

| Result shape | Cached? | Why |
| --- | --- | --- |
| `reachable: true` | ✅ | Stable signal; safe to serve again. |
| `reachable: false` (DNS/conn error) | ❌ | Transient — could be a blip. Re-probe next time. |
| `status >= 500` | ❌ | Transient server error. |
| `status 4xx` | ✅ (reachable) | A stable 404 is a legitimate answer. |
| Timeout | ❌ | Transient. |

The rule is encoded in `audit.service.ts`:
```ts
if (result.reachable) setCachedAudit(url, { ...result, cached: false });
```

## Cache key

The normalized URL string (scheme + host + path + query). The zod schema
normalizes scheme-less input to `https://` before it reaches the service,
so `openai.com` and `https://openai.com` share a cache entry.

## TTL & expiry

- `stdTTL` = `CACHE_TTL_SECONDS` (default 600).
- `checkperiod` = TTL/2 — `node-cache` proactively evicts expired keys.
- `useClones: false` — we store immutable result objects; avoids deep
  clones on every get (the caller flips `cached` on a shallow copy).

## Cache status in the response

Every result includes `cached: boolean`:
- `false` — fresh probe (or a non-cacheable result).
- `true` — served from cache; `timestamp` is refreshed to the serve time
  so the UI shows "just now", while the underlying probe data is the
  cached snapshot.

## Invalidation

- **Automatic:** TTL expiry.
- **Manual:** `cache.flushAll()` (used in tests; not exposed publicly).
- No event-driven invalidation — website state changes are not observable
  by us, so TTL is the right tradeoff.

## Upgrade path

When moving to multiple instances, swap `node-cache` for Redis `SET … EX`
without changing the service interface. See
[Scalability](./SCALABILITY.md).
