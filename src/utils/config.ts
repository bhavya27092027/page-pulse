/**
 * Frontend configuration. Values resolve from Vite env vars at build time,
 * with safe fallbacks so the app runs without a backend in dev preview.
 */
const env = import.meta.env;

export const config = {
  /** Backend API base URL. Empty string => use in-browser fallback engine. */
  apiUrl: (env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '',
  /** Hard timeout for the client-side audit request. */
  timeoutMs: 12000,
  /** Max history entries retained in the UI. */
  historyLimit: 20,
} as const;

export type ClientConfig = typeof config;
