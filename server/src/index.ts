import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

/**
 * Server entrypoint. Builds the app and binds the configured port.
 * Exported separately from app.ts so tests can import createApp()
 * without starting a listener.
 */
const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info('server.started', {
    port: env.PORT,
    env: env.NODE_ENV,
    cacheTtl: env.CACHE_TTL_SECONDS,
    maxConcurrent: env.MAX_CONCURRENT_AUDITS,
  });
});

// Graceful shutdown — stop accepting new connections, then exit.
function shutdown(signal: string) {
  logger.info('server.shutting_down', { signal });
  server.close(() => {
    logger.info('server.closed');
    process.exit(0);
  });
  // Hard exit if something hangs.
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
