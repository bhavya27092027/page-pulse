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
