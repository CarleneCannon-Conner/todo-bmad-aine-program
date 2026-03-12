import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { buildApp } from './app.js';
import { setupTestDb, truncateTodos, teardownTestDb } from './test-helpers.js';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  await setupTestDb();
  app = await buildApp({ logger: false });
  // Test-only route for 500 error testing
  app.get('/api/test-error', async () => {
    throw new Error('Unexpected failure');
  });
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

  it('returns 400 with VALIDATION_ERROR when text exceeds 500 characters', async () => {
    const longText = 'a'.repeat(501);
    const response = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: longText },
    });

    expect(response.statusCode).toBe(400);

    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
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

describe('PATCH /api/todos/:id', () => {
  it('returns 200 with updated todo on toggle to complete', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: 'Test toggle' },
    });
    const todoId = createRes.json().data.id;

    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/api/todos/${todoId}`,
      payload: { isCompleted: true },
    });

    expect(patchRes.statusCode).toBe(200);
    const body = patchRes.json();
    expect(body.success).toBe(true);
    expect(body.data.isCompleted).toBe(true);
    expect(body.data.id).toBe(todoId);
  });

  it('returns 200 with updated todo on toggle back to incomplete', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: 'Test untoggle' },
    });
    const todoId = createRes.json().data.id;

    // Toggle to complete
    await app.inject({
      method: 'PATCH',
      url: `/api/todos/${todoId}`,
      payload: { isCompleted: true },
    });

    // Toggle back to incomplete
    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/api/todos/${todoId}`,
      payload: { isCompleted: false },
    });

    expect(patchRes.statusCode).toBe(200);
    const body = patchRes.json();
    expect(body.success).toBe(true);
    expect(body.data.isCompleted).toBe(false);
    expect(body.data.id).toBe(todoId);
  });

  it('returns 404 with NOT_FOUND envelope for missing ID', async () => {
    const patchRes = await app.inject({
      method: 'PATCH',
      url: '/api/todos/00000000-0000-0000-0000-000000000000',
      payload: { isCompleted: true },
    });

    expect(patchRes.statusCode).toBe(404);
    const body = patchRes.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(typeof body.error.message).toBe('string');
  });

  it('returns 400 with VALIDATION_ERROR for invalid UUID format', async () => {
    const patchRes = await app.inject({
      method: 'PATCH',
      url: '/api/todos/not-a-uuid',
      payload: { isCompleted: true },
    });

    expect(patchRes.statusCode).toBe(400);
    const body = patchRes.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns error response in ApiResponse<T> envelope format', async () => {
    const patchRes = await app.inject({
      method: 'PATCH',
      url: '/api/todos/00000000-0000-0000-0000-000000000000',
      payload: { isCompleted: true },
    });

    const body = patchRes.json();
    expect(body).toHaveProperty('success');
    expect(body).toHaveProperty('error');
    expect(body.error).toHaveProperty('code');
    expect(body.error).toHaveProperty('message');
  });
});

describe('DELETE /api/todos/:id', () => {
  it('returns 200 with { id } on success', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: 'Test delete' },
    });
    const todoId = createRes.json().data.id;

    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/api/todos/${todoId}`,
    });

    expect(deleteRes.statusCode).toBe(200);
    const body = deleteRes.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ id: todoId });
  });

  it('returns 404 with NOT_FOUND envelope for missing ID', async () => {
    const deleteRes = await app.inject({
      method: 'DELETE',
      url: '/api/todos/00000000-0000-0000-0000-000000000000',
    });

    expect(deleteRes.statusCode).toBe(404);
    const body = deleteRes.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(typeof body.error.message).toBe('string');
  });

  it('returns error response in ApiResponse<T> envelope format', async () => {
    const deleteRes = await app.inject({
      method: 'DELETE',
      url: '/api/todos/00000000-0000-0000-0000-000000000000',
    });

    const body = deleteRes.json();
    expect(body).toHaveProperty('success');
    expect(body).toHaveProperty('error');
    expect(body.error).toHaveProperty('code');
    expect(body.error).toHaveProperty('message');
  });
});

describe('Error handling — unknown routes', () => {
  it('returns 404 with NOT_FOUND envelope for unknown route', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/unknown',
    });

    expect(response.statusCode).toBe(404);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toBe('Route not found');
  });

  it('returns 404 with NOT_FOUND envelope for unknown method on known route', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/api/todos',
    });

    expect(response.statusCode).toBe(404);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});

describe('Error handling — 500 INTERNAL_ERROR', () => {
  it('returns 500 with INTERNAL_ERROR envelope on unexpected error', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/test-error',
    });

    expect(response.statusCode).toBe(500);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBe('Internal server error');
    // Original error message must NOT be leaked to client
    expect(body.error.message).not.toContain('Unexpected failure');
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

describe('ApiResponse<T> envelope consistency', () => {
  it('every success response has exactly { success: true, data } shape', async () => {
    // Create a todo to test all success endpoints
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/todos',
      payload: { text: 'Envelope test' },
    });
    const todoId = createRes.json().data.id;

    const successResponses = [
      createRes, // POST 201
      await app.inject({ method: 'GET', url: '/api/todos' }), // GET 200
      await app.inject({ method: 'PATCH', url: `/api/todos/${todoId}`, payload: { isCompleted: true } }), // PATCH 200
      await app.inject({ method: 'DELETE', url: `/api/todos/${todoId}` }), // DELETE 200
    ];

    for (const res of successResponses) {
      const body = res.json();
      expect(body.success).toBe(true);
      expect(body).toHaveProperty('data');
      expect(body).not.toHaveProperty('error');
    }
  });

  it('every error response has exactly { success: false, error: { code, message } } shape', async () => {
    const errorResponses = [
      await app.inject({ method: 'POST', url: '/api/todos', payload: { text: '' } }), // 400 validation
      await app.inject({ method: 'PATCH', url: '/api/todos/not-a-uuid', payload: { isCompleted: true } }), // 400 TypeBox schema
      await app.inject({ method: 'PATCH', url: '/api/todos/00000000-0000-0000-0000-000000000000', payload: { isCompleted: true } }), // 404
      await app.inject({ method: 'DELETE', url: '/api/todos/00000000-0000-0000-0000-000000000000' }), // 404
      await app.inject({ method: 'GET', url: '/api/unknown' }), // 404 unknown route
      await app.inject({ method: 'GET', url: '/api/test-error' }), // 500 internal error
    ];

    for (const res of errorResponses) {
      const body = res.json();
      expect(body.success).toBe(false);
      expect(body).toHaveProperty('error');
      expect(body.error).toHaveProperty('code');
      expect(body.error).toHaveProperty('message');
      expect(typeof body.error.code).toBe('string');
      expect(typeof body.error.message).toBe('string');
      expect(body).not.toHaveProperty('data');
    }
  });
});
