import { motion } from 'framer-motion';
import { Activity, Search } from 'lucide-react';

interface EmptyStateProps {
  onPickExample: (url: string) => void;
}

const EXAMPLES = [
  { label: 'OpenAI', url: 'https://openai.com' },
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'Vercel', url: 'https://vercel.com' },
  { label: 'Stripe', url: 'https://stripe.com' },
];

/** Illustrated empty state shown before the first audit runs. */
export function EmptyState({ onPickExample }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center rounded-3xl glass p-8 text-center sm:p-12"
    >
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 ring-1 ring-primary/30"
        >
          <Activity className="h-9 w-9 text-primary" strokeWidth={2} />
        </motion.div>
        {/* Orbiting dot */}
        <motion.span
          className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-secondary shadow-lg shadow-secondary/50"
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '44px 44px' }}
        />
      </div>

      <h3 className="font-display text-xl font-bold tracking-tight">
        Ready to audit the web
      </h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Enter any website URL above to measure its HTTP status, reachability, response time, and page title.
        Results stream back in seconds.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          Try one
        </span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex.url}
            onClick={() => onPickExample(ex.url)}
            className="rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
