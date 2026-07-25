import winston from 'winston';
import { env, isProd } from '../config/env.js';

const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
);

const jsonFormat = winston.format.combine(baseFormat, winston.format.json());

const consoleFormat = winston.format.combine(
  baseFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...rest } = info as Record<string, unknown>;
    const meta = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
    return `[${timestamp}] ${level}: ${String(message)}${meta}`;
  }),
);

export const logger = winston.createLogger({
  level: isProd ? 'info' : 'debug',
  format: isProd ? jsonFormat : consoleFormat,
  defaultMeta: { service: 'page-pulse-api' },
  transports: [
    new winston.transports.Console(),
    ...(isProd
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
});

export function logAudit(opts: {
  requestId: string;
  url: string;
  status: number | null;
  duration: number | null;
  ip: string;
  cached: boolean;
  error?: string;
}): void {
  const { requestId, url, status, duration, ip, cached, error } = opts;
  if (error) {
    logger.error('audit.failed', { requestId, url, ip, duration, error });
  } else {
    logger.info('audit.completed', { requestId, url, ip, status, duration, cached });
  }
  void env;
}
