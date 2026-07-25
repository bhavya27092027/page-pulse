/**
 * Shared domain types for Page Pulse.
 * These mirror the backend API contract (server/src/types).
 */

export interface AuditRequest {
  url: string;
}

export interface AuditResult {
  url: string;
  status: number | null;
  reachable: boolean;
  responseTime: number | null;
  title: string | null;
  cached: boolean;
  timestamp: string;
  requestId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  requestId?: string;
}

export type AuditResponse = ApiResponse<AuditResult>;

/** Severity bucket derived from an HTTP status code. */
export type StatusKind = 'success' | 'redirect' | 'client-error' | 'server-error' | 'unreachable' | 'unknown';

export interface HistoryEntry extends AuditResult {
  id: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'info';
}
