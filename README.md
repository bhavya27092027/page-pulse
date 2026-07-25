<div align="center">

# Page Pulse

### Production-grade Website Audit Platform

Enter any website URL. Get back its HTTP status, reachability, response
time, page title, and cache status — in seconds.

[React] · [Vite] · [TypeScript] · [Tailwind] · [Express] · [Node 20] · [Jest]

</div>

## 🚀 Live Demo

- **Frontend:** https://page-pulse-analyzer.netlify.app/
- **Backend API:** https://page-pulse-api-production.up.railway.app/

---

## Overview

**Page Pulse** is a full-stack website audit platform built as a
production-grade Software Development assessment. A React dashboard
submits a URL to an Express API, which probes the target with a 5-second
abort timeout, caches the result, bounds concurrency, rate-limits abuse,
and returns a structured JSON envelope keyed by a request ID.

```
┌────────────┐     POST /api/audit      ┌─────────────┐     fetch(5s)    ┌──────────┐
│  Frontend  │  ─────────────────────►  │   Backend   │  ─────────────►  │  Target  │
│  (Netlify)  │  ◄──── 200 {data} ────   │  (Railway)   │  ◄── response ── │  Website │
└────────────┘                          └─────────────┘                  └──────────┘
                                              │
                                   ┌──────────┼──────────┐
                                   ▼          ▼          ▼
                                Cache     Queue(10)   History(20)
```

If the backend is unreachable, the frontend gracefully degrades to a
CORS-safe in-browser probe — so the dashboard is **never a dead end**.

---

## Features

| | Feature | Detail |
| --- | --- | --- |
| **Core** | URL audit | HTTP status, reachability, response time, page title, cache status |
| | URL validation | zod schema on server + client; rejects invalid/internal URLs |
| | 5s timeout | `AbortController` → 504 on hang |
| | Concurrency limit | Max 10 parallel audits; FIFO queue for the rest |
| | Caching | 10-min TTL (env-configurable); only reachable results cached |
| | Rate limiting | 100 req / IP / hour with structured 429 |
| | Structured logging | Winston; request ID, URL, status, duration, IP on every line |
| | Centralized errors | `{success:false,error,requestId}` envelope everywhere |
| **Dashboard** | Recent history | Last 20 audits in memory + client localStorage |
| | Download report | One-click JSON download |
| | Copy result | Copy JSON to clipboard |
| | Loading skeleton | Shimmer effect while auditing |
| | Empty state | Illustrated, with example URLs |
| | Charts | Response-time trend + status distribution (Recharts) |
| | Dark mode | Dark-first, toggle persists, system-aware |
| | Keyboard shortcuts | `⌘K` focus · `⌘J` theme · `⌘/` re-run · `Esc` clear |
| | 404 page | Animated not-found route |
| | Animated background | Aurora blobs + grid (reduced-motion aware) |
| | Responsive | Desktop / tablet / mobile |
| **Security** | Helmet · CORS allowlist · input sanitization · rate limiting · env-based secrets |

---

## Tech stack

**Frontend:** React 18, Vite, TypeScript, TailwindCSS, shadcn/ui, Framer
Motion, React Hook Form, Zod, Axios, Recharts, Lucide icons.

> **Note on React version:** the project targets React 18.3 (the stable
> line shadcn/ui ships against). React 19 was requested; shadcn/ui's
> Radix primitives do not yet formally support 19, so 18.3 was chosen for
> production correctness. Upgrading is a one-line bump once Radix lands
> 19 support.

**Backend:** Node.js 20, Express, TypeScript, Winston, express-rate-limit,
node-cache, uuid, zod, Helmet, CORS, compression.

**Testing:** Jest + Supertest (21 tests across service + API layers).

**CI/CD:** GitHub Actions (backend + frontend jobs).

**Deployment:** Netlify (frontend) · Railway (backend).

---

## Project structure

```
page-pulse/
├── docs/                      # System design documents (interview-grade)
│   ├── ARCHITECTURE.md
│   ├── TECHNOLOGY_DECISIONS.md
│   ├── FAILURE_MODES.md
│   ├── SCALABILITY.md
│   ├── CACHING.md
│   ├── MONITORING.md
│   ├── ROLLBACK.md
│   ├── CONCURRENCY_AND_QUEUE.md
│   └── DEPLOYMENT.md
├── .github/workflows/ci.yml   # Lint · test · build (backend + frontend)
├── server/                    # Express + TypeScript backend
│   ├── src/
│   │   ├── config/            # Validated env config
│   │   ├── controllers/       # Request handlers
│   │   ├── middlewares/       # requestId, validation, rateLimit, error
│   │   ├── routes/            # /api router factory
│   │   ├── services/          # audit, cache, queue, history
│   │   ├── utils/             # logger, errors, validation, request-id
│   │   ├── tests/             # Jest + Supertest
│   │   ├── app.ts             # Express app factory
│   │   └── index.ts           # Server entrypoint
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
├── src/                       # React + Vite frontend
│   ├── components/
│   │   ├── audit/             # Hero, form, result, skeleton, history, charts
│   │   ├── layout/            # Header, Footer, AnimatedBackground, ToastViewport
│   │   └── ui/                # shadcn/ui primitives
│   ├── hooks/                 # useAudit, useTheme, useHistory, useToasts, shortcuts
│   ├── pages/                 # LandingPage, NotFoundPage
│   ├── services/              # audit (backend + fallback)
│   ├── types/                 # Shared domain types
│   ├── utils/                 # audit helpers, url validation, config
│   ├── App.tsx                # Routing + layout + error boundary
│   └── main.tsx
├── index.html
├── AI_USAGE.md
└── README.md
```

---

## Installation

### Prerequisites

- Node.js 20+
- npm 10+

### Backend

```bash
cd server
cp .env.example .env        # adjust if needed
npm install
npm run dev                 # http://localhost:4000
```

### Frontend

```bash
# from the repo root
npm install
VITE_API_URL=http://localhost:4000 npm run dev   # http://localhost:5173
```

If `VITE_API_URL` is unset, the frontend uses its in-browser fallback
engine (no backend required) — handy for quick previews.

---

## Environment variables

### Backend (`server/.env`)

| Var | Default | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | Listen port |
| `NODE_ENV` | `development` | Runtime mode |
| `CORS_ORIGIN` | `*` | Comma-separated allowed origins |
| `AUDIT_TIMEOUT_MS` | `5000` | Per-probe abort timeout |
| `MAX_CONCURRENT_AUDITS` | `10` | Concurrency cap |
| `CACHE_TTL_SECONDS` | `600` | Result cache TTL (10 min) |
| `HISTORY_LIMIT` | `20` | In-memory history size |
| `RATE_LIMIT_WINDOW_MS` | `3600000` | Rate-limit window (1 h) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window per IP |

### Frontend

| Var | Default | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | _(empty)_ | Backend base URL. Empty = use fallback engine. |

**No secrets are committed.** All sensitive values come from the
environment.

---

## API documentation

### `POST /api/audit`

Audit a website.

**Request**
```json
{ "url": "https://openai.com" }
```

**200 — success**
```json
{
  "success": true,
  "data": {
    "url": "https://openai.com",
    "status": 200,
    "reachable": true,
    "responseTime": 182,
    "title": "OpenAI",
    "cached": false,
    "timestamp": "2026-07-25T03:10:32.000Z",
    "requestId": "2d7331bb-a74c-44c0-860b-c98d7bb01313"
  },
  "requestId": "2d7331bb-a74c-44c0-860b-c98d7bb01313"
}
```

**Errors** (all share the envelope)
| Status | Cause |
| --- | --- |
| 400 | Invalid / missing URL |
| 404 | Unknown route |
| 429 | Rate limit exceeded |
| 504 | Audit timeout (> 5s) |
| 500 | Internal error |
| 200 w/ `reachable:false` | Target site down (not an API error) |

```json
{ "success": false, "error": "…", "requestId": "…" }
```

### `GET /api/health`
Liveness probe. → `{ success, data: { status:"ok", uptime, timestamp } }`

### `GET /api/history`
Recent audits (last 20). → `{ success, data: AuditResult[] }`

---

## Testing

```bash
cd server
npm test            # Jest + Supertest, with coverage
```

21 tests across two suites:

- **`audit.service.test.ts`** — success, title extraction, 4xx/5xx,
  network failure, timeout, caching, history writes.
- **`api.test.ts`** — valid URL, scheme normalization, validation
  failures (4 cases), cache hit, timeout → 504, network failure →
  reachable:false, rate limiting → 429, health, history, 404 envelope.

---

## Deployment

### Frontend → Netlify

1. Import the repository into Netlify.
2. Set the build configuration:

   ```text
   Build command: npm run build
   Publish directory: dist
   ```

3. Add the environment variable:

   ```text
   VITE_API_URL=https://page-pulse-api-production.up.railway.app
   ```

4. Deploy the site. If using React Router, configure a SPA redirect using `netlify.toml` (or Netlify's redirect settings).

### Backend → Railway

1. Create a new project in Railway and connect your GitHub repository.
2. Set the **Root Directory** to:

   ```text
   server
   ```

3. Railway will build and deploy the backend automatically.
4. Set the following environment variables:

   ```text
   NODE_ENV=production
   CORS_ORIGIN=https://page-pulse-analyzer.netlify.app
   ```

5. Verify the deployment using:

   ```text
   https://page-pulse-api-production.up.railway.app/api/health
   ```

See [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) for the full deployment guide.

---

## System design

The `docs/` folder contains interview-grade system design:

- [Architecture diagram](./docs/ARCHITECTURE.md) (Mermaid)
- [Technology decision record](./docs/TECHNOLOGY_DECISIONS.md)
- [Failure mode analysis](./docs/FAILURE_MODES.md)
- [Scalability plan](./docs/SCALABILITY.md)
- [Caching strategy](./docs/CACHING.md)
- [Monitoring strategy](./docs/MONITORING.md)
- [Rollback strategy](./docs/ROLLBACK.md)
- [Concurrency & queue design](./docs/CONCURRENCY_AND_QUEUE.md)
- [Production deployment guide](./docs/DEPLOYMENT.md)

---

## Code quality

- **SOLID / single-responsibility:** controllers shape requests, services
  own business logic, middlewares cross-cut.
- **Reusable components:** shadcn/ui primitives + composable audit cards.
- **Shared contract:** the API envelope + `AuditResult` shape are mirrored
  client/server.
- **Error boundaries:** a top-level React boundary + the central Express
  handler mean no unhandled error blanks the app.
- **No duplicate logic:** URL validation uses one zod schema (server) and a
  mirrored helper (client); fetch-mock helpers are shared across tests.
- **Type safety:** strict TypeScript end-to-end.

---

## Accessibility & performance

- Reduced-motion media query disables animations.
- Keyboard shortcuts with `allowInInput` guards.
- ARIA labels on icon-only buttons; focus-visible rings.
- Bundle code-splitting (react-vendor / charts / motion / forms).
- Memoized background; lazy chart rendering when history is empty.

---

## Future improvements

- Redis-backed cache + rate-limit store for horizontal scale.
- Persistent audit history (Postgres via Supabase).
- Background worker queue (BullMQ) with `202 + jobId` for very high throughput.
- Prometheus metrics + Grafana dashboards.
- SSRF egress filter (deny RFC1918 / link-local destinations).
- Optional auth + per-user audit history.
- WebSocket/SSE live updates for queued audits.

---

## AI usage

See [`AI_USAGE.md`](./AI_USAGE.md) — AI was used for scaffolding,
architecture brainstorming, and documentation; implementation,
refinement, testing, debugging, and design decisions were reviewed and
customized by the developer.

---
