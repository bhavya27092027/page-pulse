import { useCallback, useRef, useState } from 'react';
import type { AuditResult, HistoryEntry } from '@/types/audit';
import { auditUrl, AuditError } from '@/services/audit';
import { useHistory } from './use-history';
import { toast } from './use-toast-store';

interface AuditState {
  loading: boolean;
  result: AuditResult | null;
  error: string | null;
  requestId?: string;
}

const initialState: AuditState = { loading: false, result: null, error: null };

export function useAudit() {
  const [state, setState] = useState<AuditState>(initialState);
  const { history, add, clear } = useHistory();
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (rawUrl: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({ loading: true, result: null, error: null });

      try {
        const result = await auditUrl(rawUrl, { signal: controller.signal });
        if (controller.signal.aborted) return;

        setState({ loading: false, result, error: null, requestId: result.requestId });

        const entry: HistoryEntry = {
          ...result,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        };
        add(entry);

        if (result.reachable) {
          toast.success(
            'Audit complete',
            result.title ? `${result.title} · ${result.responseTime ?? '?'}ms` : undefined
          );
        } else {
          toast.error('Site unreachable', 'The URL could not be reached within the timeout.');
        }
        return result;
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof AuditError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Unexpected error during audit.';
        setState({ loading: false, result: null, error: message, requestId: (err as AuditError)?.requestId });
        toast.error('Audit failed', message);
        return null;
      }
    },
    [add]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState(initialState);
  }, []);

  return { ...state, history, run, reset, clearHistory: clear };
}
