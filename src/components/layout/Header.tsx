import { motion } from 'framer-motion';
import { Activity, Moon, Sun, Keyboard } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

/** Top app bar: brand mark, keyboard-shortcuts hint, theme toggle. */
export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-40 w-full"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mt-4 flex h-14 items-center justify-between rounded-2xl glass px-4 sm:px-5">
          <a href="/" className="group flex items-center gap-2.5" aria-label="Page Pulse home">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/30">
              <Activity className="h-5 w-5" strokeWidth={2.5} />
              <span className="absolute inset-0 rounded-xl ring-2 ring-primary/30 animate-pulse-ring" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-base font-bold tracking-tight">Page Pulse</span>
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Audit Platform
              </span>
            </span>
          </a>

          <div className="flex items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden gap-1.5 text-muted-foreground hover:text-foreground sm:flex"
                  aria-label="Keyboard shortcuts"
                >
                  <Keyboard className="h-4 w-4" />
                  <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold">⌘K</kbd>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64">
                <div className="space-y-2.5">
                  <p className="text-sm font-semibold">Keyboard shortcuts</p>
                  <ShortcutRow keys="⌘ K" label="Focus audit input" />
                  <ShortcutRow keys="⌘ J" label="Toggle theme" />
                  <ShortcutRow keys="⌘ /" label="Run last audit" />
                  <ShortcutRow keys="Esc" label="Clear result" />
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="h-9 w-9"
            >
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-center"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                ) : (
                  <Moon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                )}
              </motion.span>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

function ShortcutRow({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <kbd className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
        {keys}
      </kbd>
    </div>
  );
}
