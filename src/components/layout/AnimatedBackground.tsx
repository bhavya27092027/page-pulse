import { memo } from 'react';

/**
 * Layered animated background: aurora blobs + grid + radial mask.
 * Purely decorative — pointer-events:none, aria-hidden, and paused for
 * users with reduced-motion (handled in CSS via prefers-reduced-motion).
 */
function AnimatedBackgroundImpl() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base wash */}
      <div className="absolute inset-0 bg-background" />

      {/* Aurora blobs */}
      <div className="absolute -left-32 -top-40 h-[40rem] w-[40rem] rounded-full bg-primary/20 blur-[120px] animate-aurora" />
      <div
        className="absolute -right-40 top-1/3 h-[36rem] w-[36rem] rounded-full bg-secondary/20 blur-[120px] animate-aurora"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="absolute bottom-[-12rem] left-1/3 h-[32rem] w-[32rem] rounded-full bg-accent/10 blur-[120px] animate-aurora"
        style={{ animationDelay: '-12s' }}
      />

      {/* Grid with radial fade */}
      <div
        className="absolute inset-0 bg-grid opacity-[0.18] dark:opacity-[0.12]"
        style={{
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
        }}
      />

      {/* Vignette for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
    </div>
  );
}

export const AnimatedBackground = memo(AnimatedBackgroundImpl);
