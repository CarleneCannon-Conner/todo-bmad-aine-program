import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { listTodos, createTodo, toggleTodo, deleteTodo, ValidationError, NotFoundError } from './todo.service.js';
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

describe('toggleTodo', () => {
  it('updates isCompleted to true', async () => {
    const db = getTestDb();
    const todo = await createTodo(db, 'Test toggle');
    const updated = await toggleTodo(db, todo.id, true);
    expect(updated.isCompleted).toBe(true);
    expect(updated.id).toBe(todo.id);
    expect(updated.text).toBe('Test toggle');
  });

  it('updates isCompleted to false (toggle back)', async () => {
    const db = getTestDb();
    const todo = await createTodo(db, 'Test toggle back');
    await toggleTodo(db, todo.id, true);
    const updated = await toggleTodo(db, todo.id, false);
    expect(updated.isCompleted).toBe(false);
  });

  it('throws NotFoundError on non-existent ID', async () => {
    const db = getTestDb();
    await expect(
      toggleTodo(db, '00000000-0000-0000-0000-000000000000', true),
    ).rejects.toThrow(NotFoundError);
  });
});

describe('deleteTodo', () => {
  it('removes todo from database', async () => {
    const db = getTestDb();
    const todo = await createTodo(db, 'Test delete');
    const result = await deleteTodo(db, todo.id);
    expect(result).toEqual({ id: todo.id });

    const remaining = await listTodos(db);
    expect(remaining).toHaveLength(0);
  });

  it('throws NotFoundError on non-existent ID', async () => {
    const db = getTestDb();
    await expect(
      deleteTodo(db, '00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow(NotFoundError);
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
