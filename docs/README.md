# Page Pulse — System Design

This directory contains the system-design documentation for Page Pulse,
structured to support a Software Engineering interview discussion.

| Document | Purpose |
| --- | --- |
| [Architecture Diagram](./ARCHITECTURE.md) | Component + data-flow overview (Mermaid) |
| [Technology Decision Record](./TECHNOLOGY_DECISIONS.md) | Why each technology was chosen |
| [Failure Mode Analysis](./FAILURE_MODES.md) | What can break and how we handle it |
| [Scalability Plan](./SCALABILITY.md) | How the system grows beyond a single instance |
| [Caching Strategy](./CACHING.md) | TTL, invalidation, and cacheability rules |
| [Monitoring Strategy](./MONITORING.md) | Observability, logs, metrics, alerting |
| [Rollback Strategy](./ROLLBACK.md) | Safe deploy + rollback procedures |
| [Concurrency & Queue Design](./CONCURRENCY_AND_QUEUE.md) | Bounded concurrency + fair queue |
| [Production Deployment Guide](./DEPLOYMENT.md) | End-to-end deploy on Render + Vercel |

## One-paragraph summary

Page Pulse is a stateless website-audit API fronted by a React dashboard.
A user submits a URL; the server checks an in-memory TTL cache, then
runs the audit through a bounded concurrency queue (max 10 parallel
probes, each with a 5s abort timeout), normalizes the result, writes it
to a 20-entry ring buffer, and returns a structured JSON envelope keyed
by a request ID. Rate limiting, Helmet, CORS, input validation, and a
central error handler harden the boundary. The frontend talks to the API
when configured, and gracefully degrades to a CORS-safe in-browser probe
when the backend is unreachable — so the dashboard is never a dead end.
