import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import type { Request, Response } from 'express';

/**
 * Factory: IP-based rate limiter — 100 requests per window (default 1h) per IP.
 * Returns a structured 429 with a Retry-After header so the frontend can
 * surface a friendly "slow down" message.
 *
 * Built per-app (rather than as a module singleton) so each app instance owns
 * its own in-memory store. In production there is exactly one app per process,
 * so this is equivalent to a process-wide limiter; in tests, fresh apps get
 * fresh counters and don't contaminate each other.
 */
export function createAuditRateLimiter() {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      const xff = req.headers['x-forwarded-for'];
      if (typeof xff === 'string') {
        return xff.split(',')[0].trim();
      }
      return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    },
    handler: (_req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        error: 'Too many audit requests. Please try again later.',
        requestId: res.getHeader('X-Request-Id') as string,
      });
    },
  });
}
