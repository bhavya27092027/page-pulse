import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, TrendingUp, Gauge } from 'lucide-react';
import type { HistoryEntry } from '@/types/audit';
import { classifyStatus } from '@/utils/audit';

interface ChartsPanelProps {
  history: HistoryEntry[];
}

export function ChartsPanel({ history }: ChartsPanelProps) {
  const trendData = useMemo(
    () =>
      [...history]
        .reverse()
        .slice(-12)
        .map((h, i) => ({
          i: i + 1,
          host: h.url.replace(/^https?:\/\//, '').split('/')[0],
          ms: h.responseTime ?? 0,
          reachable: h.reachable,
        })),
    [history]
  );

  const distribution = useMemo(() => {
    const buckets: Record<string, number> = {
      Success: 0,
      Redirect: 0,
      'Client Error': 0,
      'Server Error': 0,
      Unreachable: 0,
    };
    for (const h of history) {
      const kind = classifyStatus(h.status);
      if (kind === 'success') buckets.Success++;
      else if (kind === 'redirect') buckets.Redirect++;
      else if (kind === 'client-error') buckets['Client Error']++;
      else if (kind === 'server-error') buckets['Server Error']++;
      else if (kind === 'unreachable') buckets.Unreachable++;
    }
    return Object.entries(buckets)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  }, [history]);

  const avgMs = useMemo(() => {
    const reachable = history.filter((h) => h.responseTime !== null);
    if (!reachable.length) return null;
    return Math.round(reachable.reduce((s, h) => s + (h.responseTime ?? 0), 0) / reachable.length);
  }, [history]);

  if (history.length === 0) return null;

  const DIST_COLORS: Record<string, string> = {
    Success: 'hsl(var(--success))',
    Redirect: 'hsl(var(--accent))',
    'Client Error': 'hsl(var(--accent))',
    'Server Error': 'hsl(var(--destructive))',
    Unreachable: 'hsl(var(--destructive))',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl glass p-5 sm:p-6"
    >
      <div className="mb-5 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wider">Dashboard</h3>
      </div>

      {/* Stat strip */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatTile icon={TrendingUp} label="Total audits" value={history.length} />
        <StatTile
          icon={Gauge}
          label="Avg response"
          value={avgMs !== null ? `${avgMs}ms` : '—'}
        />
        <StatTile
          icon={BarChart3}
          label="Reachable"
          value={`${Math.round((history.filter((h) => h.reachable).length / history.length) * 100)}%`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Response time trend */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Response time trend
          </p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -28 }}>
                <defs>
                  <linearGradient id="rtFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="i"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'hsl(var(--foreground))',
                  }}
                  labelFormatter={(_, p) => (p?.[0]?.payload?.host as string) ?? ''}
                  formatter={(v: number) => [`${v}ms`, 'Response']}
                />
                <Area
                  type="monotone"
                  dataKey="ms"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#rtFill)"
                  dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status distribution */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Status distribution
          </p>
          <div className="h-44 w-full">
            {distribution.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution} margin={{ top: 4, right: 8, bottom: 0, left: -28 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                      color: 'hsl(var(--foreground))',
                    }}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {distribution.map((d) => (
                      <Cell key={d.name} fill={DIST_COLORS[d.name] ?? 'hsl(var(--muted-foreground))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1.5 font-display text-lg font-bold tracking-tight">{value}</p>
    </div>
  );
}
