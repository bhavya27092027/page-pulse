import NodeCache from 'node-cache';
import { env } from '../config/env.js';
import type { AuditResult } from '../types/index.js';

const cache = new NodeCache({
  stdTTL: env.CACHE_TTL_SECONDS,
  checkperiod: env.CACHE_TTL_SECONDS / 2 || 60,
  useClones: false,
});

export function getCachedAudit(url: string): AuditResult | undefined {
  return cache.get<AuditResult>(url);
}

export function setCachedAudit(url: string, result: AuditResult): void {
  cache.set(url, result);
}

export function clearCache(): void {
  cache.flushAll();
}

export function cacheStats() {
  return cache.getStats();
}
