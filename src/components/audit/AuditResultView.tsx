import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Clock, Globe, CheckCircle2, XCircle, Tag, Calendar } from 'lucide-react';
import type { AuditResult } from '@/types/audit';
import {
  statusMeta,
  responseTimeBand,
  formatTimestamp,
  prettyHost,
} from '@/utils/audit';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  badge?: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'destructive';
  delay?: number;
}

export function MetricCard({ icon: Icon, label, value, badge, tone = 'default', delay = 0 }: MetricCardProps) {
  const toneRing = {
    default: 'ring-border/60',
    success: 'ring-success/20',
    warning: 'ring-accent/20',
    destructive: 'ring-destructive/20',
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'relative overflow-hidden rounded-2xl glass p-4 ring-1',
        toneRing
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        </div>
        {badge}
      </div>
      <div className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-[1.6rem]">
        {value}
      </div>
    </motion.div>
  );
}

interface AuditResultViewProps {
  result: AuditResult;
}

export function AuditResultView({ result }: AuditResultViewProps) {
  const meta = statusMeta(result.status);
  const band = responseTimeBand(result.responseTime);
  const time = formatTimestamp(result.timestamp);
  const host = prettyHost(result.url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl glass-strong p-5 sm:p-6"
    >
      {/* Header row */}
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            <span>Audit Result</span>
            {result.cached && (
              <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-semibold text-secondary">
                From cache
              </span>
            )}
          </div>
          <h3 className="mt-1.5 truncate font-display text-lg font-bold tracking-tight sm:text-xl" title={result.url}>
            {host}
          </h3>
          {result.title && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground" title={result.title}>
              {result.title}
            </p>
          )}
        </div>

        <div className={cn('flex items-center gap-2 self-start rounded-xl border px-3 py-2 text-sm font-semibold', meta.bgClass)}>
          <span className={cn('h-2 w-2 rounded-full', meta.dotClass)} />
          {meta.label}
        </div>
      </div>

      {/* Metric grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          icon={Activity}
          label="Status"
          value={result.status ?? '—'}
          tone={meta.tone === 'muted' ? 'default' : (meta.tone as 'success' | 'warning' | 'destructive')}
          delay={0.04}
        />
        <MetricCard
          icon={result.reachable ? CheckCircle2 : XCircle}
          label="Reachable"
          value={
            <span className={result.reachable ? 'text-success' : 'text-destructive'}>
              {result.reachable ? 'Yes' : 'No'}
            </span>
          }
          tone={result.reachable ? 'success' : 'destructive'}
          delay={0.08}
        />
        <MetricCard
          icon={Clock}
          label="Response"
          value={result.responseTime !== null ? `${result.responseTime}ms` : '—'}
          badge={
            result.responseTime !== null && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  band.tone === 'success' && 'bg-success/15 text-success',
                  band.tone === 'warning' && 'bg-accent/15 text-accent',
                  band.tone === 'destructive' && 'bg-destructive/15 text-destructive'
                )}
              >
                {band.label}
              </span>
            )
          }
          tone={band.tone === 'muted' ? 'default' : (band.tone as 'success' | 'warning' | 'destructive')}
          delay={0.12}
        />
        <MetricCard
          icon={Tag}
          label="Page Title"
          value={
            <span className="block truncate text-base font-semibold" title={result.title ?? ''}>
              {result.title ?? '—'}
            </span>
          }
          delay={0.16}
        />
        <MetricCard
          icon={Calendar}
          label="Timestamp"
          value={
            <span className="text-base font-semibold" title={time.absolute}>
              {time.relative}
            </span>
          }
          delay={0.2}
        />
        <MetricCard
          icon={result.cached ? CheckCircle2 : AlertTriangle}
          label="Cache"
          value={
            <span className={result.cached ? 'text-secondary' : 'text-primary'}>
              {result.cached ? 'Cached' : 'Fresh'}
            </span>
          }
          tone={result.cached ? 'success' : 'default'}
          delay={0.24}
        />
      </div>

      {/* Meta footer */}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/60 pt-4 text-xs text-muted-foreground">
        <span className="font-mono">{result.url}</span>
        {result.requestId && (
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span className="font-mono">req: {result.requestId}</span>
          </span>
        )}
        <span className="ml-auto font-mono">{time.absolute}</span>
      </div>
    </motion.div>
  );
}
