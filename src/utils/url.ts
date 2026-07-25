/**
 * URL validation + normalization used by the form and the audit service.
 * Mirrors the backend's zod schema (server/src/utils/validation.ts) so the
 * client rejects bad input before making a network round-trip.
 */
export interface NormalizedUrl {
  url: string;
  host: string;
}

const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidUrl(input: string): { valid: boolean; reason?: string } {
  const normalized = normalizeUrl(input);
  if (!normalized) return { valid: false, reason: 'URL is required.' };

  try {
    const u = new URL(normalized);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return { valid: false, reason: 'Only http and https URLs are allowed.' };
    }
    if (!u.hostname || !u.hostname.includes('.')) {
      return { valid: false, reason: 'Enter a valid domain name.' };
    }
    if (BLOCKED_HOSTS.has(u.hostname.toLowerCase())) {
      return { valid: false, reason: 'Internal addresses are not allowed.' };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: 'Enter a valid URL, e.g. https://openai.com' };
  }
}
