/** Professional shimmer skeleton shown while an audit is in flight. */
export function AuditSkeleton() {
  return (
    <div className="rounded-3xl glass-strong p-5 sm:p-6" aria-label="Loading audit result" role="status">
      {/* Header row */}
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full space-y-2">
          <div className="shimmer h-3 w-24 rounded bg-muted" />
          <div className="shimmer h-5 w-64 rounded bg-muted" />
          <div className="shimmer h-3 w-48 rounded bg-muted" />
        </div>
        <div className="shimmer h-10 w-28 rounded-xl bg-muted" />
      </div>

      {/* Metric grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl glass p-4">
            <div className="flex items-center gap-2">
              <div className="shimmer h-4 w-4 rounded bg-muted" />
              <div className="shimmer h-3 w-14 rounded bg-muted" />
            </div>
            <div className="shimmer mt-3 h-7 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center gap-4 border-t border-border/60 pt-4">
        <div className="shimmer h-3 w-56 rounded bg-muted" />
        <div className="shimmer ml-auto h-3 w-32 rounded bg-muted" />
      </div>
    </div>
  );
}
