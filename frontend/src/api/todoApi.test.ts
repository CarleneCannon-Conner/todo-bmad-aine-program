import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchTodos, createTodo, toggleTodo, deleteTodo } from './todoApi';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('fetchTodos', () => {
  it('calls GET /api/todos and returns unwrapped data', async () => {
    const todos = [
      { id: '1', text: 'Test', isCompleted: false, createdAt: new Date().toISOString() },
    ];
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: todos }),
    });

    const result = await fetchTodos();

    expect(mockFetch).toHaveBeenCalledWith('/api/todos');
    expect(result).toEqual(todos);
  });

  it('throws on error response', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
      }),
    });

    await expect(fetchTodos()).rejects.toThrow('Something went wrong');
  });
});

describe('createTodo', () => {
  it('calls POST /api/todos with correct body and returns unwrapped data', async () => {
    const todo = { id: '1', text: 'New todo', isCompleted: false, createdAt: new Date().toISOString() };
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: todo }),
    });

    const result = await createTodo('New todo');

    expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'New todo' }),
    });
    expect(result).toEqual(todo);
  });

  it('throws on error response', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Text cannot be empty' },
      }),
    });

    await expect(createTodo('')).rejects.toThrow('Text cannot be empty');
  });
});

describe('toggleTodo', () => {
  it('calls PATCH /api/todos/:id with isCompleted body and returns unwrapped data', async () => {
    const todo = { id: '1', text: 'Test', isCompleted: true, createdAt: new Date().toISOString() };
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: todo }),
    });

    const result = await toggleTodo('1', true);

    expect(mockFetch).toHaveBeenCalledWith('/api/todos/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted: true }),
    });
    expect(result).toEqual(todo);
  });

  it('throws on error response', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Todo not found' },
      }),
    });

    await expect(toggleTodo('1', true)).rejects.toThrow('Todo not found');
  });
});

describe('deleteTodo', () => {
  it('calls DELETE /api/todos/:id and returns unwrapped data', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { id: '1' } }),
    });

    const result = await deleteTodo('1');

    expect(mockFetch).toHaveBeenCalledWith('/api/todos/1', { method: 'DELETE' });
    expect(result).toEqual({ id: '1' });
  });

  it('throws on error response', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Todo not found' },
      }),
    });

    await expect(deleteTodo('1')).rejects.toThrow('Todo not found');
  });
});
