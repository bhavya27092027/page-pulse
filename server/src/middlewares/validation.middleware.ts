import type { Request, Response, NextFunction } from 'express';
import { parseAuditBody } from '../utils/validation.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Body validation middleware for POST /api/audit. Parses with the shared
 * zod schema and rejects 400 with a readable message on failure. On
 * success, attaches the normalized URL to req.body.url.
 */
export function validateAuditBody(req: Request, _res: Response, next: NextFunction): void {
  const result = parseAuditBody(req.body);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue?.message ?? 'Invalid request body.';
    next(new ValidationError(message));
    return;
  }
  req.body = result.data;
  next();
}
