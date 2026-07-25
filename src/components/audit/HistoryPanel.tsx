import { AnimatePresence, motion } from 'framer-motion';
import { History, Trash2, Globe, Clock, ChevronRight } from 'lucide-react';
import type { HistoryEntry } from '@/types/audit';
import { statusMeta, formatTimestamp, prettyHost } from '@/utils/audit';
import { cn } from '@/lib/utils';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onReaudit: (url: string) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onReaudit, onClear }: HistoryPanelProps) {
  return (
    <div className="rounded-3xl glass p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-display text-sm font-bold uppercase tracking-wider">
            Recent Audits
          </h3>
          {history.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {history.length}
            </span>
          )}
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="mt-4 py-6 text-center text-sm text-muted-foreground">
          No audits yet. Run your first audit above.
        </p>
      ) : (
        <ul className="mt-4 max-h-[22rem] divide-y divide-border/40 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {history.map((entry) => {
              const meta = statusMeta(entry.status);
              const time = formatTimestamp(entry.timestamp);
              return (
                <motion.li
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <button
                    onClick={() => onReaudit(entry.url)}
                    className="group flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-muted/40 -mx-2 px-2 rounded-lg"
                  >
                    <span className={cn('h-2 w-2 shrink-0 rounded-full', meta.dotClass)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground" title={entry.url}>
                        {prettyHost(entry.url)}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {entry.status ?? '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {entry.responseTime !== null ? `${entry.responseTime}ms` : '—'}
                        </span>
                        <span>{time.relative}</span>
                        {entry.cached && (
                          <span className="rounded bg-secondary/15 px-1.5 py-0.5 text-[9px] font-semibold text-secondary">
                            CACHED
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
