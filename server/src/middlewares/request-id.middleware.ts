import type { Request, Response, NextFunction } from 'express';
import { generateRequestId } from '../utils/request-id.js';

/**
 * Attach a fresh request ID to every incoming request. Prefers a client-
 * supplied `X-Request-Id` header (if present) so upstream services can
 * propagate correlation; otherwise generates a UUIDv4.
 *
 * Exposes the id on `req.requestId` and as the `X-Request-Id` response header.
 */
declare module 'express-serve-static-core' {
  interface Request {
    requestId: string;
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header('X-Request-Id');
  req.requestId = incoming && /^[A-Za-z0-9-]{4,64}$/.test(incoming) ? incoming : generateRequestId();
  res.setHeader('X-Request-Id', req.requestId);
  next();
}
