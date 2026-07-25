import { env } from '../config/env.js';
import { AuditFailedError, TimeoutError } from '../utils/errors.js';
import { getCachedAudit, setCachedAudit } from './cache.service.js';
import { auditQueue } from './queue.service.js';
import { historyStore } from './history.service.js';
import type { AuditResult } from '../types/index.js';
import { logAudit } from '../utils/logger.js';

/** Internal probe result before it's shaped into an AuditResult. */
interface ProbeResult {
  status: number | null;
  reachable: boolean;
  responseTime: number;
  title: string | null;
}

/**
 * Perform the actual HTTP fetch with a hard timeout. Uses AbortController
 * to abort cleanly after AUDIT_TIMEOUT_MS (default 5s) — surfaces a
 * TimeoutError so the error handler can return 504.
 */
async function probeUrl(url: string, timeoutMs: number): Promise<ProbeResult> {
  const start = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'PagePulse/1.0 (+https://page-pulse.app)' },
    });
    const responseTime = Math.round(performance.now() - start);

    let title: string | null = null;
    try {
      const text = await res.text();
      const match = text.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (match?.[1]) title = decodeHtmlEntities(match[1].trim());
    } catch {
      /* title is best-effort; non-HTML bodies are fine */
    }

    return {
      status: res.status,
      reachable: res.ok || res.status < 500,
      responseTime,
      title,
    };
  } catch (err) {
    const responseTime = Math.round(performance.now() - start);
    if ((err as Error).name === 'AbortError') {
      throw new TimeoutError(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    // DNS / connection / TLS failures — return a structured unreachable
    // result rather than a 502 so the dashboard can still render the row.
    return {
      status: null,
      reachable: false,
      responseTime,
      title: null,
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Full audit pipeline: cache check → concurrency queue → probe → shape →
 * cache + history write → structured log. Returns the public AuditResult.
 */
export async function auditWebsite(
  url: string,
  requestId: string,
  ip: string
): Promise<AuditResult> {
  // 1. Cache hit — return immediately with cached=true.
  const cached = getCachedAudit(url);
  if (cached) {
    const result: AuditResult = { ...cached, cached: true, requestId, timestamp: new Date().toISOString() };
    logAudit({ requestId: result.requestId, url, status: result.status, duration: result.responseTime, ip, cached: true });
    return result;
  }

  // 2. Run the probe under the concurrency limiter.
  let probe: ProbeResult;
  try {
    probe = await auditQueue.run(() => probeUrl(url, env.AUDIT_TIMEOUT_MS));
  } catch (err) {
    // Robust to module-duplication under test runners: check name as well as
    // instanceof so a TimeoutError always surfaces as 504, never 502.
    if (err instanceof TimeoutError || (err instanceof Error && err.name === 'TimeoutError')) {
      logAudit({ requestId, url, status: null, duration: null, ip, cached: false, error: err.message });
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Unknown audit error';
    logAudit({ requestId, url, status: null, duration: null, ip, cached: false, error: message });
    throw new AuditFailedError(message);
  }

  const result: AuditResult = {
    url,
    status: probe.status,
    reachable: probe.reachable,
    responseTime: probe.responseTime,
    title: probe.title,
    cached: false,
    timestamp: new Date().toISOString(),
    requestId,
  };

  // 3. Cache + history (only cache reachable results to avoid caching
  //    transient failures as "the answer").
  if (result.reachable) {
    setCachedAudit(url, { ...result, cached: false });
  }
  historyStore.add(result);

  logAudit({ requestId, url, status: result.status, duration: result.responseTime, ip, cached: false });
  return result;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Test/diagnostics helpers. */
export function resetAuditState(): void {
  historyStore.clear();
}
