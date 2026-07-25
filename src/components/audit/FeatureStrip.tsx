import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Clock, Database, History, FileJson } from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: '5s timeout', desc: 'Requests abort cleanly — no hung audits.' },
  { icon: ShieldCheck, title: 'Rate limited', desc: '100 req / IP / hour with graceful errors.' },
  { icon: Database, title: '10-min cache', desc: 'Identical URLs return instantly, fresh-flagged.' },
  { icon: Clock, title: 'Concurrency', desc: 'Max 10 parallel audits with a fair queue.' },
  { icon: History, title: 'History', desc: 'Last 20 audits stored + a downloadable report.' },
  { icon: FileJson, title: 'Structured logs', desc: 'Request ID, IP, status, duration on every call.' },
];

export function FeatureStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {FEATURES.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
          className="rounded-2xl glass p-3.5"
        >
          <f.icon className="h-4.5 w-4.5 text-primary" style={{ width: 18, height: 18 }} />
          <p className="mt-2 text-sm font-semibold leading-tight">{f.title}</p>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{f.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
