# Architecture

## Component diagram

```mermaid
flowchart LR
  subgraph Client["Frontend (React + Vite — Vercel)"]
    UI["Dashboard UI"]
    ASvc["audit service"]
    FB["Fallback engine"]
    UI --> ASvc
    ASvc -- "backend unreachable" --> FB
  end

  subgraph Edge["Browser"]
    NET["fetch / no-cors"]
    FB --> NET
  end

  subgraph Server["Backend (Express — Render)"]
    MW["Middleware stack<br/>Helmet · CORS · RequestId · RateLimit · Validation"]
    CTRL["audit controller"]
    AQ["Concurrency queue<br/>max 10"]
    AUDIT["audit service<br/>5s abort"]
    CACHE["NodeCache<br/>TTL 10m"]
    HIST["History ring buffer<br/>last 20"]
    LOG["Winston logger"]
  end

  UI -- "POST /api/audit {url}" --> MW
  MW --> CTRL
  CTRL -- "cache hit?" --> CACHE
  CTRL --> AQ
  AQ --> AUDIT
  AUDIT -- "fetch (AbortController)" --> TARGET["Target website"]
  AUDIT --> CACHE
  AUDIT --> HIST
  CTRL --> LOG
  CTRL -- "200 {success,data,requestId}" --> UI
```

## Request lifecycle

```mermaid
sequenceDiagram
  participant C as Client
  participant M as Middleware
  participant Q as ConcurrencyQueue
  participant A as AuditService
  participant Cache as NodeCache
  participant T as Target URL

  C->>M: POST /api/audit {url}
  M->>M: requestId · helmet · cors · rateLimit · validate
  M->>A: auditWebsite(url, requestId, ip)
  A->>Cache: get(url)
  alt cache hit
    Cache-->>A: result
    A-->>M: {…, cached:true}
  else cache miss
    A->>Q: run(probe)
    Q->>A: slot acquired
    A->>T: fetch(url, {signal: 5s})
    T-->>A: response + title
    A->>Cache: set(url, result)
    A-->>M: {…, cached:false}
  end
  M-->>C: 200 {success, data, requestId}
```

## Layers

| Layer | Responsibility | Key files |
| --- | --- | --- |
| Transport | HTTP server, CORS, security headers | `app.ts` |
| Middleware | Request ID, rate limit, validation, errors | `middlewares/` |
| Controller | Request/response shaping, orchestration | `controllers/` |
| Service | Cache, queue, probe, history, logging | `services/` |
| Utils | Errors, validation schema, logger | `utils/` |
| Config | Env parsing, constants | `config/` |

## Key invariants

1. **Every response carries a `requestId`** — success or error.
2. **Errors always use the `{success:false,error,requestId}` envelope.**
3. **Only reachable results are cached** — transient failures are not
   remembered as "the answer".
4. **Cache TTL is env-configurable**, defaulting to 10 minutes.
5. **Concurrency is bounded** at `MAX_CONCURRENT_AUDITS` (default 10);
   excess work queues fairly (FIFO).
