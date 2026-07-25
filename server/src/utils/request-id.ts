import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a request-scoped correlation ID.
 * Used for structured logging and the `requestId` field in every API error.
 */
export function generateRequestId(): string {
  return uuidv4();
}

export type { RequestHandler } from 'express';
