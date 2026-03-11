import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchTodos, createTodo } from './todoApi';

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
