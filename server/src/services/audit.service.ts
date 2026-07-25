import { env } from '../config/env.js';
import { AuditFailedError, TimeoutError } from '../utils/errors.js';
import { getCachedAudit, setCachedAudit } from './cache.service.js';
import { auditQueue } from './queue.service.js';
import { historyStore } from './history.service.js';
import type { AuditResult } from '../types/index.js';
import { logAudit } from '../utils/logger.js';

interface ProbeResult {
  status: number | null;
  reachable: boolean;
  responseTime: number;
  title: string | null;
}

async function probeUrl(url: string, timeoutMs: number): Promise<ProbeResult> {
  const start = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
        "Accept": "text/html",
      },
    });
    const responseTime = Math.round(performance.now() - start);

    let title: string | null = null;
    try {
      const text = await res.text();

      const match = text.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (match?.[1]) title = decodeHtmlEntities(match[1].trim());
    } catch {
      // Ignore title extraction errors.
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

export async function auditWebsite(
  url: string,
  requestId: string,
  ip: string
): Promise<AuditResult> {

  const cached = getCachedAudit(url);

  if (cached) {

    const result: AuditResult = {
      ...cached,
      cached: true,
      requestId,
      timestamp: new Date().toISOString(),
    };

    logAudit({
      requestId: result.requestId,
      url,
      status: result.status,
      duration: result.responseTime,
      ip,
      cached: true,
    });

    return result;
  }

  let probe: ProbeResult;
  try {
    probe = await auditQueue.run(() => {
      return probeUrl(url, env.AUDIT_TIMEOUT_MS);
    });

  } catch (err) {
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

export function resetAuditState(): void {
  historyStore.clear();
}
