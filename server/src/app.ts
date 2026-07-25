import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { corsOrigins, isTest } from './config/env.js';
import { requestIdMiddleware } from './middlewares/request-id.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { createApiRouter } from './routes/index.js';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

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

  app.use(requestIdMiddleware);

  // Routes
  app.use('/api', createApiRouter());

  app.get('/', (_req, res) => {
    res.json({ success: true, data: { name: 'Page Pulse API', status: 'running' } });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
