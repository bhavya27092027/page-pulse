import type { AuditResult } from '@/types/audit';

/**
 * In-browser audit engine — a resilience fallback used when no backend is
 * configured (e.g. static Vercel preview without API wiring) or the backend
 * is unreachable. Produces the exact same AuditResult shape as the server.
 *
 * Constraints:
 *  - CORS limits which sites expose headers/title; we degrade gracefully.
 *  - No caching/concurrency control here — those are server concerns.
 *  - `cached` is always false; `requestId` is prefixed `client-` so logs
 *    and the UI can distinguish server- vs client-sourced results.
 */
export async function fetchAuditFallback(
  url: string,
  signal?: AbortSignal,
  isDegraded = false
): Promise<AuditResult> {
  const startedAt = performance.now();
  const timestamp = new Date().toISOString();
  const requestId = `client-${Math.random().toString(36).slice(2, 10)}`;

  const base: AuditResult = {
    url,
    status: null,
    reachable: false,
    responseTime: null,
    title: null,
    cached: false,
    timestamp,
    requestId,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    if (signal) {
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    // no-cors lets us confirm reachability even when headers are opaque.
    const res = await fetch(url, {
      method: 'GET',
      mode: 'no-cors',
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const responseTime = Math.round(performance.now() - startedAt);

    // With mode: 'no-cors', `res.type` is 'opaque' and status is 0 even on
    // success. Treat a non-thrown fetch as reachable.
    const reachable = res.type === 'opaque' ? true : res.ok;
    const status = res.type === 'opaque' ? 0 : res.status;

    let title: string | null = null;
    if (res.type !== 'opaque') {
      try {
        const text = await res.text();
        const match = text.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (match?.[1]) title = decodeHtmlEntities(match[1].trim());
      } catch {
        /* title is best-effort */
      }
    }

    return {
      ...base,
      status: status === 0 ? 200 : status,
      reachable,
      responseTime,
      title,
    };
  } catch (err) {
    if (isDegraded) {
      // Backend was down — surface that context rather than a bare "unreachable".
      throw new Error(
        'Backend unreachable and target site blocks cross-origin reads. ' +
          'Try a different URL or check the backend status.'
      );
    }
    const responseTime = Math.round(performance.now() - startedAt);
    return {
      ...base,
      reachable: false,
      responseTime,
    };
  }
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
