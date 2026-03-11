import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { buildApp } from './app.js';
import { setupTestDb, truncateTodos, teardownTestDb } from './test-helpers.js';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  await setupTestDb();
  app = await buildApp({ logger: false });
  await app.ready();
});

beforeEach(async () => {
  await truncateTodos();
});

afterAll(async () => {
  await app.close();
  await teardownTestDb();
});

describe('POST /api/todos', () => {
  it('returns 201 with created todo on valid input', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: 'Buy milk' },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({
      text: 'Buy milk',
      isCompleted: false,
    });
    expect(body.data.id).toBeDefined();
    expect(body.data.createdAt).toBeDefined();
  });

  it('returns 400 with VALIDATION_ERROR on empty text', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: '' },
    });

    expect(response.statusCode).toBe(400);

    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(typeof body.error.message).toBe('string');
  });

  it('returns 400 on missing text field', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: {},
    });

    expect(response.statusCode).toBe(400);

    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 with VALIDATION_ERROR on whitespace-only text', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: '   ' },
    });

    expect(response.statusCode).toBe(400);

    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/todos', () => {
  it('returns 200 with empty array when no todos', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/todos',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  it('returns 200 with todos list', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: 'Test todo' },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/todos',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].text).toBe('Test todo');
  });

  it('returns todos sorted by created_at DESC (newest first)', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: 'First todo' },
    });
    // Small delay to ensure different timestamps
    await new Promise((r) => setTimeout(r, 10));
    await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: 'Second todo' },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/todos',
    });

    const body = response.json();
    expect(body.data).toHaveLength(2);
    expect(body.data[0].text).toBe('Second todo');
    expect(body.data[1].text).toBe('First todo');
  });

  it('returns todos in ApiResponse<T> envelope format', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/todos',
    });

    const body = response.json();
    expect(body).toHaveProperty('success');
    expect(body).toHaveProperty('data');
    expect(typeof body.success).toBe('boolean');
    expect(Array.isArray(body.data)).toBe(true);
  });
});
