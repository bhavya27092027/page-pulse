import { env } from '../config/env.js';

export class ConcurrencyQueue {
  private active = 0;
  private readonly waiting: Array<() => void> = [];

  constructor(private readonly maxConcurrent: number = env.MAX_CONCURRENT_AUDITS) {}

  get running(): number {
    return this.active;
  }

  get pending(): number {
    return this.waiting.length;
  }

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    }
    this.active++;
    try {
      return await task();
    } finally {
      this.active--;
      const next = this.waiting.shift();
      if (next) next();
    }
  }
}

export const auditQueue = new ConcurrencyQueue();
