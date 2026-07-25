import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { corsOrigins, isTest } from './config/env.js';
import { requestIdMiddleware } from './middlewares/request-id.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { createApiRouter } from './routes/index.js';
import { logger } from './utils/logger.js';

/**
 * Build the Express app. Exported as a factory so tests can construct
 * isolated app instances without binding a port.
 */
export function createApp(): Express {
  const app = express();

  // Trust proxy hop (Render/Vercel sit behind a reverse proxy).
  app.set('trust proxy', 1);

  // Security headers — tuned to allow our CORS + JSON API.
  app.use(
    helmet({
      contentSecurityPolicy: false, // API only; no browser-rendered HTML here
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS — explicit origin allowlist from env (default allows all for dev).
  app.use(
    cors({
      origin: corsOrigins[0] === '*' ? true : corsOrigins,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Client-Info'],
      exposedHeaders: ['X-Request-Id'],
      maxAge: 600,
    })
  );

  app.use(express.json({ limit: '64kb' }));
  app.use(compression());

  if (!isTest) {
    app.use(
      morgan('tiny', {
        skip: (req) => req.path === '/api/health',
      })
    );
  }

  // Correlation ID on every request — must come before routes + error handler.
  app.use(requestIdMiddleware);

  // Routes
  app.use('/api', createApiRouter());

  // Root sanity endpoint (handy for Render deploy checks).
  app.get('/', (_req, res) => {
    res.json({ success: true, data: { name: 'Page Pulse API', status: 'running' } });
  });

  // 404 + centralized error handler (order matters — last in the chain).
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
