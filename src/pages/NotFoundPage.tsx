import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Animated 404 page. */
export function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 ring-1 ring-primary/30">
          <Compass className="h-9 w-9 text-primary" />
        </div>
        <p className="font-display text-7xl font-extrabold text-gradient">404</p>
        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved. Let's get you back to auditing.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Back to Page Pulse
          </Button>
        </Link>
      </motion.div>
    </main>
  );
}
