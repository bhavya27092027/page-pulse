/**
 * Fetch mocking helpers for tests. Mutates global.fetch directly so the
 * audit service (which calls the global fetch) sees the mock.
 */
type FetchImpl = typeof fetch;

let savedFetch: FetchImpl | null = null;

/** Install a fetch implementation for subsequent calls. */
export function setFetchMock(fn: FetchImpl): void {
  if (savedFetch === null) savedFetch = global.fetch as FetchImpl;
  global.fetch = fn;
}

/** Restore the original fetch (called automatically in afterEach via setup). */
export function clearFetchMock(): void {
  if (savedFetch !== null) {
    global.fetch = savedFetch;
    savedFetch = null;
  }
}

/** Build a fake Response with arbitrary status + body + title. */
export function makeResponse(opts: {
  status?: number;
  title?: string | null;
  body?: string;
  headers?: Record<string, string>;
}): Response {
  const status = opts.status ?? 200;
  const body =
    opts.body ??
    (opts.title === null
      ? 'no html here'
      : `<html><head><title>${opts.title ?? 'Example Site'}</title></head><body></body></html>`);
  const headers = { 'Content-Type': 'text/html', ...(opts.headers ?? {}) };
  return new Response(body, { status, headers });
}

/** Mock fetch to resolve with a fixed response. */
export function mockFetch(opts: Parameters<typeof makeResponse>[0] = {}): void {
  const res = makeResponse(opts);
  setFetchMock(async () => res);
}

/** Mock fetch to reject (simulates DNS/connection failure). */
export function mockFetchReject(error: Error): void {
  setFetchMock(async () => Promise.reject(error));
}

/** Mock fetch that resolves only after a delay (used to exercise timeout). */
export function mockFetchSlow(delayMs: number): void {
  setFetchMock(
    (_input: string | URL | Request, init?: RequestInit) =>
      new Promise<Response>((resolve, reject) => {
        const timer = setTimeout(() => resolve(makeResponse({ status: 200 })), delayMs);
        init?.signal?.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            const e = new Error('The operation was aborted');
            e.name = 'AbortError';
            reject(e);
          },
          { once: true }
        );
      })
  );
}
