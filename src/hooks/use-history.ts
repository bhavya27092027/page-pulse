import { useCallback, useEffect, useState } from 'react';
import type { HistoryEntry } from '@/types/audit';
import { config } from '@/utils/config';

const STORAGE_KEY = 'page-pulse-history';

function load(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, config.historyLimit) : [];
  } catch {
    return [];
  }
}

/**
 * Recent-audit history persisted to localStorage. Mirrors the server's
 * in-memory ring buffer (last 20) but survives reloads on the client.
 */
export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [history]);

  const add = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => [entry, ...prev].slice(0, config.historyLimit));
  }, []);

  const clear = useCallback(() => setHistory([]), []);

  return { history, add, clear };
}
