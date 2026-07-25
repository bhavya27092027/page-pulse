# Monitoring Strategy

## Logs (Winston)

Structured, request-scoped logs are the primary observability surface.

| Event | Level | Fields |
| --- | --- | --- |
| `server.started` | info | port, env, cacheTtl, maxConcurrent |
| `request.received` | info | requestId, url, ip, method, path |
| `audit.completed` | info | requestId, url, ip, status, duration, cached |
| `audit.failed` | error | requestId, url, ip, duration, error |
| `request.client_error` | warn | requestId, name, message |
| `request.server_error` | error | requestId, name, message, stack |
| `request.unhandled` | error | requestId, message, stack |
| `server.shutting_down` | info | signal |

- **Development:** colorized console.
- **Production:** JSON to console + `logs/error.log` + `logs/combined.log`.
  Render captures stdout; pipe to a log aggregator (Logtail, Datadog) as needed.

## Request ID

Every request gets a UUIDv4 (or a propagated `X-Request-Id`). It appears
in every log line for that request and in the response body + header —
so a user-reported error can be traced end-to-end.

## Health endpoint

`GET /api/health` → `{ status:"ok", uptime, timestamp }`. Used by Render's
health check and by uptime monitors. (Queue/cache stats can be added here
without breaking the contract.)

## Metrics (upgrade path)

For production-grade metrics, add `prom-client` and expose `/metrics`:

- `page_pulse_audit_total{result="success|failure|timeout"}` counter
- `page_pulse_audit_duration_seconds` histogram
- `page_pulse_cache_hits_total` / `cache_misses_total` counters
- `page_pulse_queue_active` / `queue_pending` gauges
- `page_pulse_rate_limit_rejections_total` counter

Scrape with Prometheus; alert on error-rate, p95 duration, and queue
saturation.

## Alerting (SLOs)

| SLO | Target | Alert when |
| --- | --- | --- |
| Availability | 99.9% | 5xx rate > 0.5% over 5m |
| Audit p95 latency | < 2s | p95 > 3s over 10m |
| Timeout rate | < 5% | > 10% over 10m |
| Queue depth | < 50 | pending > 100 sustained |
