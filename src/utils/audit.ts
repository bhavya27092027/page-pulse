import type { StatusKind } from '@/types/audit';

/**
 * Bucket an HTTP status code into a semantic severity kind.
 * Used to pick colors, icons, and labels across the dashboard.
 */
export function classifyStatus(status: number | null): StatusKind {
  if (status === null) return 'unreachable';
  if (status >= 200 && status < 300) return 'success';
  if (status >= 300 && status < 400) return 'redirect';
  if (status >= 400 && status < 500) return 'client-error';
  if (status >= 500) return 'server-error';
  return 'unknown';
}

interface StatusMeta {
  label: string;
  tone: 'success' | 'warning' | 'destructive' | 'muted';
  dotClass: string;
  textClass: string;
  bgClass: string;
}

/** Human-readable label + color tokens for a status kind. */
export function statusMeta(status: number | null): StatusMeta {
  const kind = classifyStatus(status);
  switch (kind) {
    case 'success':
      return {
        label: status === null ? 'OK' : `${status} · OK`,
        tone: 'success',
        dotClass: 'bg-success',
        textClass: 'text-success',
        bgClass: 'bg-success/10 text-success border-success/20',
      };
    case 'redirect':
      return {
        label: `${status} · Redirect`,
        tone: 'warning',
        dotClass: 'bg-accent',
        textClass: 'text-accent',
        bgClass: 'bg-accent/10 text-accent border-accent/20',
      };
    case 'client-error':
      return {
        label: `${status} · Client Error`,
        tone: 'warning',
        dotClass: 'bg-accent',
        textClass: 'text-accent',
        bgClass: 'bg-accent/10 text-accent border-accent/20',
      };
    case 'server-error':
      return {
        label: `${status} · Server Error`,
        tone: 'destructive',
        dotClass: 'bg-destructive',
        textClass: 'text-destructive',
        bgClass: 'bg-destructive/10 text-destructive border-destructive/20',
      };
    case 'unreachable':
      return {
        label: 'Unreachable',
        tone: 'destructive',
        dotClass: 'bg-destructive',
        textClass: 'text-destructive',
        bgClass: 'bg-destructive/10 text-destructive border-destructive/20',
      };
    default:
      return {
        label: status === null ? 'Unknown' : `${status}`,
        tone: 'muted',
        dotClass: 'bg-muted-foreground',
        textClass: 'text-muted-foreground',
        bgClass: 'bg-muted text-muted-foreground border-border',
      };
  }
}

/** Performance band for response time, used for chart coloring + copy. */
export function responseTimeBand(ms: number | null): {
  label: string;
  tone: 'success' | 'warning' | 'destructive' | 'muted';
} {
  if (ms === null) return { label: '—', tone: 'muted' };
  if (ms < 300) return { label: 'Fast', tone: 'success' };
  if (ms < 1000) return { label: 'Average', tone: 'warning' };
  return { label: 'Slow', tone: 'destructive' };
}

/** Format an ISO timestamp into a friendly relative + absolute string. */
export function formatTimestamp(iso: string): {
  relative: string;
  absolute: string;
} {
  const date = new Date(iso);
  const now = Date.now();
  const diff = Math.max(0, now - date.getTime());
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor(diff / 1000);

  let relative: string;
  if (diff < 5000) relative = 'just now';
  else if (secs < 60) relative = `${secs}s ago`;
  else if (mins < 60) relative = `${mins}m ago`;
  else if (mins < 1440) relative = `${Math.floor(mins / 60)}h ago`;
  else relative = `${Math.floor(mins / 1440)}d ago`;

  const absolute = date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return { relative, absolute };
}

/** Extract a readable host from a URL for compact display. */
export function prettyHost(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '') + (u.pathname && u.pathname !== '/' ? u.pathname : '');
  } catch {
    return url;
  }
}

/** Copy text to clipboard with a legacy fallback. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy */
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  } catch {
    return false;
  }
}

/** Trigger a client-side JSON file download. */
export function downloadJson(filename: string, data: unknown): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Build a slug-safe filename from a URL. */
export function auditFilename(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '').replace(/[^\w-]+/g, '_');
    return `pagepulse-${host}-${Date.now()}.json`;
  } catch {
    return `pagepulse-audit-${Date.now()}.json`;
  }
}
