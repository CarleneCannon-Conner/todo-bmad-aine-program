import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { listTodos, createTodo, ValidationError } from './todo.service.js';
import { getTestDb, setupTestDb, truncateTodos, teardownTestDb } from './test-helpers.js';

beforeAll(async () => {
  await setupTestDb();
});

beforeEach(async () => {
  await truncateTodos();
});

afterAll(async () => {
  await teardownTestDb();
});

describe('createTodo', () => {
  it('returns a Todo with all fields', async () => {
    const db = getTestDb();
    const todo = await createTodo(db, 'Buy milk');

    expect(todo).toMatchObject({
      text: 'Buy milk',
      isCompleted: false,
    });
    expect(todo.id).toBeDefined();
    expect(typeof todo.id).toBe('string');
    expect(todo.createdAt).toBeInstanceOf(Date);
  });

  it('trims whitespace from text', async () => {
    const db = getTestDb();
    const todo = await createTodo(db, '  Buy groceries  ');
    expect(todo.text).toBe('Buy groceries');
  });

  it('throws ValidationError on empty string', async () => {
    const db = getTestDb();
    await expect(createTodo(db, '')).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError on whitespace-only string', async () => {
    const db = getTestDb();
    await expect(createTodo(db, '   ')).rejects.toThrow(ValidationError);
  });
});

describe('listTodos', () => {
  it('returns todos sorted by created_at DESC', async () => {
    const db = getTestDb();
    await createTodo(db, 'First todo');
    await new Promise((r) => setTimeout(r, 10));
    await createTodo(db, 'Second todo');

    const result = await listTodos(db);

    expect(result).toHaveLength(2);
    expect(result[0].text).toBe('Second todo');
    expect(result[1].text).toBe('First todo');
  });

  it('returns empty array when no todos exist', async () => {
    const db = getTestDb();
    const result = await listTodos(db);
    expect(result).toEqual([]);
  });
});
