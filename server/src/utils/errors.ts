/**
 * Typed application errors. The central error handler maps these to
 * the right HTTP status + message; unknown errors become 500s.
 */
export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string) {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export class TimeoutError extends AppError {
  constructor(message: string) {
    super(message, 504);
    this.name = 'TimeoutError';
  }
}

export class AuditFailedError extends AppError {
  constructor(message: string) {
    super(message, 502);
    this.name = 'AuditFailedError';
  }
}
