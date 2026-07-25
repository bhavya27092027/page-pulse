import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isValidUrl, normalizeUrl } from '@/utils/url';
import { cn } from '@/lib/utils';

interface AuditFormProps {
  onSubmit: (url: string) => void;
  loading: boolean;
  initialUrl?: string;
}

export const AuditForm = forwardRef<HTMLInputElement, AuditFormProps>(
  ({ onSubmit, loading, initialUrl = '' }, ref) => {
    const [value, setValue] = useState(initialUrl);
    const [touched, setTouched] = useState(false);

    const normalized = normalizeUrl(value);
    const validation = isValidUrl(value);
    const showError = touched && value.length > 0 && !validation.valid;

    function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setTouched(true);
      if (!validation.valid || !normalized) return;
      onSubmit(normalized);
    }

    return (
      <form onSubmit={handleSubmit} className="w-full" noValidate>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            'group relative flex flex-col gap-2 rounded-2xl glass-strong p-2 sm:flex-row sm:items-center',
            showError && 'ring-1 ring-destructive/40'
          )}
        >
          <div className="relative flex-1">
            <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" style={{ width: 18, height: 18 }} />
            <input
              ref={ref}
              type="text"
              inputMode="url"
              autoComplete="url"
              spellCheck={false}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={() => setTouched(true)}
              disabled={loading}
              placeholder="Enter a website URL — e.g. https://openai.com"
              aria-label="Website URL"
              aria-invalid={showError}
              className="h-12 w-full rounded-xl bg-transparent pl-11 pr-4 font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-50 sm:text-base"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-12 gap-2 rounded-xl px-5 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 disabled:opacity-60"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" style={{ width: 18, height: 18 }} />
                <span>Auditing</span>
              </>
            ) : (
              <>
                <Zap className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                <span>Audit</span>
              </>
            )}
          </Button>
        </motion.div>

        <div className="mt-2 flex min-h-[1.25rem] items-center gap-2 px-2 text-sm">
          {showError ? (
            <motion.span
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 text-destructive"
            >
              <Search className="h-3.5 w-3.5" />
              {validation.reason}
            </motion.span>
          ) : (
            <span className="text-xs text-muted-foreground">
              Tip: press <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">⌘ K</kbd> to focus,{' '}
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">Enter</kbd> to audit.
            </span>
          )}
        </div>
      </form>
    );
  }
);

AuditForm.displayName = 'AuditForm';
