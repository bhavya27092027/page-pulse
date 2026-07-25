import type { Request, Response, NextFunction } from 'express';
import { auditWebsite } from '../services/audit.service.js';
import { historyStore } from '../services/history.service.js';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { AuditSuccessPayload, AuditErrorPayload } from '../types/index.js';

function clientIp(req: Request): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') return xff.split(',')[0].trim();
  return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
}

export async function auditController(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { url } = req.body as { url: string };
  const requestId = req.requestId;
  const ip = clientIp(req);

  logger.info('request.received', { requestId, url, ip, method: req.method, path: req.path });

  try {
    if (!url || typeof url !== 'string') {
      throw new AppError('URL is required.', 400);
    }

    const result = await auditWebsite(url, requestId, ip);
    const payload: AuditSuccessPayload = {
      success: true,
      data: result,
      requestId,
    };
    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

export function healthController(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    requestId: _req.requestId,
  });
}

export function historyController(req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    data: historyStore.list(),
    requestId: req.requestId,
  });
}

export function clearHistoryController(req: Request, res: Response): void {
  historyStore.clear();
  res.status(200).json({ success: true, requestId: req.requestId });
}

export type { AuditErrorPayload };
