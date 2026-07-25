import type { Request, Response, NextFunction } from 'express';
import { parseAuditBody } from '../utils/validation.js';
import { ValidationError } from '../utils/errors.js';

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
