import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-8 sm:pt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Production-grade Website Audit Platform</span>
        </div>

        <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
          <span className="text-gradient">Page Pulse</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground text-balance sm:text-lg">
          Enter any website URL and get a complete audit — HTTP status, reachability,
          response time, page title, and cache status — in seconds.
        </p>
      </motion.div>
    </section>
  );
}
