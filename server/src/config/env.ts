import 'dotenv/config';
import { z } from 'zod';

/**
 * Centralized, validated runtime configuration.
 * All env vars are parsed once at boot and exposed as typed constants.
 * Invalid config throws — fail fast rather than running with bad defaults.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('*'),

  AUDIT_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  MAX_CONCURRENT_AUDITS: z.coerce.number().int().positive().default(10),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(600),
  HISTORY_LIMIT: z.coerce.number().int().positive().default(20),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(3600000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

/** Normalized list of allowed CORS origins. */
export const corsOrigins: string[] =
  env.CORS_ORIGIN === '*' ? ['*'] : env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean);

export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
