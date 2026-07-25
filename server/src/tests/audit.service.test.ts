import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { auditWebsite } from '../services/audit.service.js';
import { resetAuditState } from '../services/audit.service.js';
import { clearCache } from '../services/cache.service.js';
import { historyStore } from '../services/history.service.js';
import { mockFetch, mockFetchReject, mockFetchSlow, clearFetchMock } from './helpers.js';

beforeEach(() => {
  resetAuditState();
  clearCache();
});

afterEach(() => {
  clearFetchMock();
});

describe('audit.service — auditWebsite', () => {
  it('returns a successful result with status, title, and response time', async () => {
    mockFetch({ status: 200, title: 'OpenAI' });
    const result = await auditWebsite('https://openai.com', 'req-1', '127.0.0.1');

    expect(result.url).toBe('https://openai.com');
    expect(result.status).toBe(200);
    expect(result.reachable).toBe(true);
    expect(result.title).toBe('OpenAI');
    expect(result.responseTime).toBeGreaterThanOrEqual(0);
    expect(result.cached).toBe(false);
    expect(result.requestId).toBe('req-1');
    expect(result.timestamp).toBeTruthy();
  });

  it('extracts the page title from HTML', async () => {
    mockFetch({ body: '<html><head><title>GitHub: Let&#39;s build from here</title></head></html>' });
    const result = await auditWebsite('https://github.com', 'req-2', '127.0.0.1');
    expect(result.title).toBe("GitHub: Let's build from here");
  });

  it('reports a 404 as reachable-but-client-error', async () => {
    mockFetch({ status: 404, title: 'Not Found' });
    const result = await auditWebsite('https://example.com/missing', 'req-3', '127.0.0.1');
    expect(result.status).toBe(404);
    expect(result.reachable).toBe(true);
  });

  it('reports a 500 as unreachable', async () => {
    mockFetch({ status: 500 });
    const result = await auditWebsite('https://example.com', 'req-4', '127.0.0.1');
    expect(result.status).toBe(500);
    expect(result.reachable).toBe(false);
  });

  it('returns unreachable on network failure (not a thrown error)', async () => {
    mockFetchReject(new Error('ENOTFOUND'));
    const result = await auditWebsite('https://nope.invalid', 'req-5', '127.0.0.1');
    expect(result.reachable).toBe(false);
    expect(result.status).toBeNull();
  });

  it(
    'throws a TimeoutError when the request exceeds the timeout',
    async () => {
      // Slow response exceeds the 5s audit timeout.
      mockFetchSlow(10000);
      await expect(auditWebsite('https://slow.example', 'req-6', '127.0.0.1')).rejects.toThrow(
        /timed out/i
      );
    },
    15000
  );

  it('serves a cached result on the second call with cached=true', async () => {
    mockFetch({ status: 200, title: 'Cached Site' });
    const first = await auditWebsite('https://cached.example', 'req-7', '127.0.0.1');
    expect(first.cached).toBe(false);

    const second = await auditWebsite('https://cached.example', 'req-8', '127.0.0.1');
    expect(second.cached).toBe(true);
    expect(second.status).toBe(200);
    expect(second.title).toBe('Cached Site');
  });

  it('writes each successful audit into the history store', async () => {
    mockFetch({ status: 200, title: 'Hist' });
    await auditWebsite('https://h1.example', 'req-9', '127.0.0.1');
    await auditWebsite('https://h2.example', 'req-10', '127.0.0.1');
    expect(historyStore.list().length).toBe(2);
    // Most-recent-first ordering.
    expect(historyStore.list()[0].url).toBe('https://h2.example');
  });
});
