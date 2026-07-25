const env = import.meta.env;

export const config = {
  apiUrl: (env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '',
  timeoutMs: 12000,
  historyLimit: 20,
} as const;

export type ClientConfig = typeof config;
