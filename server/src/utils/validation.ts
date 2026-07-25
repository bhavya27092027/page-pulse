import { auditRequestSchema } from '../types/index.js';

/**
 * Re-export the zod schema + a parser helper so controllers/middleware
 * share one validation source of truth.
 */
export { auditRequestSchema };

export function parseAuditBody(input: unknown) {
  return auditRequestSchema.safeParse(input);
}
