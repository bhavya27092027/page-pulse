import { env } from '../config/env.js';
import type { AuditResult } from '../types/index.js';

/**
 * In-memory ring buffer of the most recent audits (default: last 20).
 * Not persisted — this is a view into recent activity, not a store of
 * record. The frontend mirrors its own localStorage history client-side.
 */
class HistoryStore {
  private entries: AuditResult[] = [];

  add(result: AuditResult): void {
    this.entries.unshift(result);
    if (this.entries.length > env.HISTORY_LIMIT) {
      this.entries = this.entries.slice(0, env.HISTORY_LIMIT);
    }
  }

  list(): AuditResult[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }
}

export const historyStore = new HistoryStore();
