import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import type { Request, Response } from 'express';

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
