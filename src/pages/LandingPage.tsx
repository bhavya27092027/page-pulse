import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Hero } from '@/components/audit/Hero';
import { AuditForm } from '@/components/audit/AuditForm';
import { FeatureStrip } from '@/components/audit/FeatureStrip';
import { AuditResultView } from '@/components/audit/AuditResultView';
import { AuditSkeleton } from '@/components/audit/AuditSkeleton';
import { EmptyState } from '@/components/audit/EmptyState';
import { HistoryPanel } from '@/components/audit/HistoryPanel';
import { ChartsPanel } from '@/components/audit/ChartsPanel';
import { ResultActions } from '@/components/audit/ResultActions';
import { useAudit } from '@/hooks/use-audit';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface LandingPageProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function LandingPage({  onToggleTheme }: LandingPageProps) {
  const {
    loading,
    result,
    error,
    requestId,
    history,
    run,
    reset,
    clearHistory,
  } = useAudit();

  const inputRef = useRef<HTMLInputElement>(null);
  const lastUrlRef = useRef<string>('');

  // Global keyboard shortcuts.
  useKeyboardShortcuts([
    { key: 'k', ctrl: true, handler: () => inputRef.current?.focus() },
    { key: 'j', ctrl: true, handler: onToggleTheme },
    {
      key: '/',
      ctrl: true,
      handler: () => {
        if (lastUrlRef.current) run(lastUrlRef.current);
      },
    },
    { key: 'escape', handler: () => reset(), allowInInput: true },
  ]);

  function handleSubmit(url: string) {
    lastUrlRef.current = url;
    run(url);
  }

  // Scroll the result into view after it lands.
  useEffect(() => {
    if (result && !loading) {
      requestAnimationFrame(() => {
        document.getElementById('result-anchor')?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      });
    }
  }, [result, loading]);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <Hero />

      <div className="mx-auto mt-8 max-w-2xl">
        <AuditForm ref={inputRef} onSubmit={handleSubmit} loading={loading} />
      </div>

      <div className="mx-auto mt-6 max-w-5xl">
        <FeatureStrip />
      </div>

      {/* Result / loading / empty */}
      <div id="result-anchor" className="mx-auto mt-10 max-w-5xl scroll-mt-24">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" exit={{ opacity: 0 }}>
              <AuditSkeleton />
            </motion.div>
          ) : result ? (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AuditResultView result={result} />
              <div className="mt-4">
                <ResultActions result={result} />
              </div>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive"
            >
              <p className="font-semibold">Audit failed</p>
              <p className="mt-1 text-destructive/80">{error}</p>
              {requestId && (
                <p className="mt-2 font-mono text-xs text-destructive/60">requestId: {requestId}</p>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" exit={{ opacity: 0 }}>
              <EmptyState onPickExample={handleSubmit} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Charts + history */}
      <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-2">
        <ChartsPanel history={history} />
        <HistoryPanel
          history={history}
          onReaudit={handleSubmit}
          onClear={clearHistory}
        />
      </div>
    </main>
  );
}
