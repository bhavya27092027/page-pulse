import NodeCache from 'node-cache';
import { env } from '../config/env.js';
import type { AuditResult } from '../types/index.js';

/**
 * TTL cache for audit results. Keyed by normalized URL.
 * TTL is configurable via CACHE_TTL_SECONDS (default 600 = 10 min).
 * `cached` is flipped to true on hit by the caller.
 */
const cache = new NodeCache({
  stdTTL: env.CACHE_TTL_SECONDS,
  checkperiod: env.CACHE_TTL_SECONDS / 2 || 60,
  useClones: false,
});

export function getCachedAudit(url: string): AuditResult | undefined {
  return cache.get<AuditResult>(url);
}

export function setCachedAudit(url: string, result: AuditResult): void {
  // Store a fresh-flagged copy; the caller decides whether to flip `cached`.
  cache.set(url, result);
}

export function clearCache(): void {
  cache.flushAll();
}

export function cacheStats() {
  return cache.getStats();
}
