import axios, { AxiosError } from 'axios';
import type { AuditResult, AuditResponse } from '@/types/audit';
import { config } from '@/utils/config';
import { fetchAuditFallback } from './fallback';

const http = axios.create({
  baseURL: config.apiUrl,
  timeout: config.timeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

export interface AuditOptions {
  signal?: AbortSignal;
}

/**
 * Run a website audit.
 *
 * Production path: POST /api/audit on the Express backend (caching, rate
 * limiting, concurrency control, structured logging all server-side).
 *
 * Resilience path: if no VITE_API_URL is configured OR the backend is
 * unreachable, a CORS-safe in-browser audit engine produces the same result
 * shape so the dashboard is never a dead end. This is intentionally a
 * graceful degradation, not a silent override — `cached` is always `false`
 * and `requestId` is prefixed `client-` when the fallback is used.
 */
export async function auditUrl(url: string, opts: AuditOptions = {}): Promise<AuditResult> {
  if (!config.apiUrl) {
    return fetchAuditFallback(url, opts.signal);
  }

  try {
    const res = await http.post<AuditResponse>('/api/audit', { url }, { signal: opts.signal });
    const body = res.data;
    if (!body.success || !body.data) {
      throw new AuditError(body.error ?? 'Audit failed', body.requestId);
    }
    return body.data;
  } catch (err) {
    if (err instanceof AuditError) throw err;

    const axiosErr = err as AxiosError<AuditResponse>;
    if (axiosErr?.response?.data && !axiosErr.response.data.success) {
      throw new AuditError(
        axiosErr.response.data.error ?? 'Audit failed',
        axiosErr.response.data.requestId
      );
    }

    // Network / timeout / CORS — degrade to client engine instead of dead-ending.
    return fetchAuditFallback(url, opts.signal, true);
  }
}

export class AuditError extends Error {
  requestId?: string;
  constructor(message: string, requestId?: string) {
    super(message);
    this.name = 'AuditError';
    this.requestId = requestId;
  }
}
