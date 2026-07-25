import { auditRequestSchema } from '../types/index.js';

export { auditRequestSchema };

export function parseAuditBody(input: unknown) {
  return auditRequestSchema.safeParse(input);
}
