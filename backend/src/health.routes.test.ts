import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from './app.js';
import type { FastifyInstance } from 'fastify';
import { setupTestDb, teardownTestDb } from './test-helpers.js';

let app: FastifyInstance;

beforeAll(async () => {
  await setupTestDb();
  app = await buildApp({ logger: false });
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await teardownTestDb();
});

describe('GET /api/health', () => {
  it('returns 200 with { success: true, data: { status: "ok" } }', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body).toEqual({
      success: true,
      data: { status: 'ok' },
    });
  });

  it('returns response in ApiResponse<T> envelope format', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/health',
    });

    const body = response.json();
    expect(body).toHaveProperty('success');
    expect(body).toHaveProperty('data');
    expect(body.success).toBe(true);
    expect(typeof body.data.status).toBe('string');
  });
});
