import { env } from '../config/env.js';

/**
 * Bounded concurrency queue. At most MAX_CONCURRENT_AUDITS workers run at
 * once; extra tasks queue in arrival order and resolve when a slot frees.
 *
 * Design notes (see docs/CONCURRENCY_AND_QUEUE.md):
 *  - FIFO fairness via a simple shift() on the waiting queue.
 *  - resolve/reject wired per-enqueued task; no shared result state.
 *  - Tested with `tsx`/Jest via fake timers is awkward, so we keep the
 *    surface tiny and rely on integration tests for behavior.
 */
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

  /** Run `task` under the queue's concurrency cap. */
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

/** Process-wide singleton — all audits share one queue. */
export const auditQueue = new ConcurrencyQueue();
