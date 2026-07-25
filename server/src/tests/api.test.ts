import request from 'supertest';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createApp } from '../app.js';
import type { Express } from 'express';
import { clearCache } from '../services/cache.service.js';
import { historyStore } from '../services/history.service.js';
import { mockFetch, mockFetchReject, mockFetchSlow, clearFetchMock } from './helpers.js';

let app: Express;

beforeEach(() => {
  app = createApp();
  clearCache();
  historyStore.clear();
});

afterEach(() => {
  clearFetchMock();
});

describe('POST /api/audit — success path', () => {
  it('returns 200 with the full audit envelope for a valid URL', async () => {
    mockFetch({ status: 200, title: 'Google' });

    const res = await request(app)
      .post('/api/audit')
      .send({ url: 'https://google.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      url: 'https://google.com',
      status: 200,
      reachable: true,
      title: 'Google',
      cached: false,
    });
    expect(res.body.data.responseTime).toBeGreaterThanOrEqual(0);
    expect(res.body.data.timestamp).toBeTruthy();
    expect(res.body.requestId).toBeTruthy();
    expect(res.headers['x-request-id']).toBeTruthy();
  });

  it('normalizes a URL missing its scheme', async () => {
    mockFetch({ status: 200, title: 'Normalized' });
    const res = await request(app).post('/api/audit').send({ url: 'example.com' });
    expect(res.status).toBe(200);
    expect(res.body.data.url).toBe('https://example.com');
  });
});

describe('POST /api/audit — validation failures', () => {
  it('rejects an invalid URL with 400 and a structured error', async () => {
    const res = await request(app)
      .post('/api/audit')
      .send({ url: 'not a url' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeTruthy();
    expect(res.body.requestId).toBeTruthy();
  });

  it('rejects a missing url field with 400', async () => {
    const res = await request(app).post('/api/audit').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('rejects a non-string url with 400', async () => {
    const res = await request(app).post('/api/audit').send({ url: 123 });
    expect(res.status).toBe(400);
  });

  it('rejects an empty body with 400', async () => {
    const res = await request(app).post('/api/audit').send();
    expect(res.status).toBe(400);
  });
});

describe('POST /api/audit — cache behaviour', () => {
  it('returns cached=true on the second identical request', async () => {
    mockFetch({ status: 200, title: 'Cache Me' });
    const first = await request(app).post('/api/audit').send({ url: 'https://cache.example' });
    expect(first.body.data.cached).toBe(false);

    const second = await request(app).post('/api/audit').send({ url: 'https://cache.example' });
    expect(second.body.data.cached).toBe(true);
    expect(second.body.data.title).toBe('Cache Me');
  });
});

describe('POST /api/audit — failure paths', () => {
  it(
    'returns a 504 on timeout',
    async () => {
      mockFetchSlow(10000);
      const res = await request(app).post('/api/audit').send({ url: 'https://slow.example' });
      expect(res.status).toBe(504);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/timed out/i);
    },
    15000
  );

  it('returns a 200 with reachable=false on a network failure', async () => {
    mockFetchReject(new Error('ENOTFOUND'));
    const res = await request(app).post('/api/audit').send({ url: 'https://nope.invalid' });
    expect(res.status).toBe(200);
    expect(res.body.data.reachable).toBe(false);
    expect(res.body.data.status).toBeNull();
  });
});

describe('POST /api/audit — rate limiting', () => {
  it('returns 429 after exceeding the configured limit', async () => {
    mockFetch({ status: 200, title: 'Limited' });
    let limited = false;
    for (let i = 0; i < 105; i++) {
      const res = await request(app).post('/api/audit').send({ url: 'https://rl.example' });
      if (res.status === 429) {
        limited = true;
        expect(res.body.success).toBe(false);
        expect(res.body.error).toMatch(/too many/i);
        break;
      }
    }
    expect(limited).toBe(true);
  });
});

describe('GET /api/health', () => {
  it('returns 200 with an ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.uptime).toBeGreaterThanOrEqual(0);
  });
});

describe('GET /api/history', () => {
  it('returns the recent audit list after audits run', async () => {
    mockFetch({ status: 200, title: 'H' });
    await request(app).post('/api/audit').send({ url: 'https://h1.example' });
    await request(app).post('/api/audit').send({ url: 'https://h2.example' });

    const res = await request(app).get('/api/history');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].url).toBe('https://h2.example');
  });
});

describe('404 + error envelope', () => {
  it('returns 404 for unknown routes with a structured error', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/not found/i);
    expect(res.body.requestId).toBeTruthy();
  });
});
