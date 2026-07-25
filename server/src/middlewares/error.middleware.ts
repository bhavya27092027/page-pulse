import type { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { AuditErrorPayload } from '../types/index.js';

export function errorHandler(err: unknown, req: Request, res: Response,
  _next: NextFunction): void {
  void _next;
  const requestId = req.requestId ?? (res.getHeader('X-Request-Id') as string) ?? 'unknown';

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error('request.server_error', { requestId, name: err.name, message: err.message, stack: err.stack });
    } else {
      logger.warn('request.client_error', { requestId, name: err.name, message: err.message });
    }
    const payload: AuditErrorPayload = {
      success: false,
      error: err.message,
      requestId,
    };
    res.status(err.statusCode).json(payload);
    return;
  }

  if (err && typeof err === 'object' && 'issues' in err) {
    const message = (err as { issues: Array<{ message: string }> }).issues[0]?.message ?? 'Validation failed.';
    const ve = new ValidationError(message);
    res.status(ve.statusCode).json({ success: false, error: ve.message, requestId });
    return;
  }

  const message = err instanceof Error ? err.message : 'Internal server error.';
  logger.error('request.unhandled', {
    requestId,
    message,
    stack: err instanceof Error ? err.stack : undefined,
  });
  res.status(500).json({ success: false, error: 'Internal server error.', requestId });
}

export function notFoundHandler(req: Request, res: Response): void {
  const requestId = req.requestId ?? (res.getHeader('X-Request-Id') as string) ?? 'unknown';
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
    requestId,
  });
}
