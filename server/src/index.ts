import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info('server.started', {
    port: env.PORT,
    env: env.NODE_ENV,
    cacheTtl: env.CACHE_TTL_SECONDS,
    maxConcurrent: env.MAX_CONCURRENT_AUDITS,
  });
});

function shutdown(signal: string) {
  logger.info('server.shutting_down', { signal });
  server.close(() => {
    logger.info('server.closed');
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('process.unhandledRejection', { reason });
});

process.on('uncaughtException', (err) => {
  logger.error('process.uncaughtException', { message: err.message, stack: err.stack });
  process.exit(1);
});

export default server;
