# Concurrency & Queue Design

## Requirement

At most `MAX_CONCURRENT_AUDITS` (default **10**) audits may execute
simultaneously. Excess requests queue and run as slots free.

## Why bound concurrency?

- **Protect the event loop:** outbound HTTP is the slow part; unbounded
  fan-out would saturate sockets and memory.
- **Protect upstream targets:** we are a polite probe, not a load tester.
- **Predictable latency:** a bounded queue degrades gracefully under load
  instead of collapsing.

## Implementation

`ConcurrencyQueue` (`services/queue.service.ts`) is a tiny fair scheduler:

```
active: number            // currently running
waiting: (() => void)[]   // FIFO of parked resolvers
maxConcurrent: number     // cap

run(task):
  if active >= max:
    await new Promise(res => waiting.push(res))   // park
  active++
  try: return await task()
  finally:
    active--
    waiting.shift()?.()    // admit next in line
```

## Properties

- **Fairness:** `waiting` is a FIFO array; `shift()` admits the oldest
  waiter. No starvation under normal load.
- **No shared result state:** each enqueued task carries its own
  resolve/reject — results never cross wires.
- **Slot release guarantee:** the `finally` block always decrements
  `active` and admits the next waiter, even if `task()` throws or aborts.
- **Singleton:** one process-wide `auditQueue` ensures the cap is on total
  process concurrency, not per-route.

## Interaction with the 5s timeout

The timeout is applied **inside** the task (via `AbortController` in
`probeUrl`), not by the queue. So a timed-out probe releases its slot
within 5s; the queue never holds a slot for a hung request.

## Interaction with caching

Cache hits short-circuit **before** the queue (`audit.service.ts`):
```
cache.get(url) → return   // never touches the queue
```
So cached responses don't consume concurrency slots — a big win for the
popular-URL long tail.

## Observable state

`auditQueue.running` and `auditQueue.pending` are exposed for the health
endpoint / metrics. At horizontal scale, replace this with a distributed
semaphore or a work queue (BullMQ) — see
[Scalability](./SCALABILITY.md).
