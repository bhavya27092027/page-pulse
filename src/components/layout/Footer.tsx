import { Activity, Github, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <Activity className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-bold">Page Pulse</p>
              <p className="text-xs text-muted-foreground">Production-grade website audit platform</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-end">
            <a
              href="https://github.com/bhavya27092027/page-pulse"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              <span>GitHub Repository</span>
            </a>

            <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3.5 py-1.5 text-sm font-medium text-foreground">
              <Heart className="h-3.5 w-3.5 text-red-500" />
              <span>Built with React, Node.js, TypeScript & ❤️</span>
            </span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Page Pulse. Production-ready Website Audit Platform.
        </p>
      </div>
    </footer>
  );
}
