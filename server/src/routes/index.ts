import { Router } from 'express';
import { auditController, healthController, historyController } from '../controllers/audit.controller.js';
import { validateAuditBody } from '../middlewares/validation.middleware.js';
import { createAuditRateLimiter } from '../middlewares/rate-limit.middleware.js';

/**
 * /api routes. Rate limiting is applied per-route (only to /audit) so
 * health checks never get throttled. A fresh limiter is constructed per
 * router instance so each app owns its own in-memory counters.
 */
export function createApiRouter(): Router {
  const router = Router();

  router.get('/health', healthController);
  router.get('/history', historyController);
  router.post('/audit', createAuditRateLimiter(), validateAuditBody, auditController);

  return router;
}
