import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { createElement } from 'react';
import { useTodos } from './useTodos';

vi.mock('../api/todoApi', () => ({
  fetchTodos: vi.fn(),
  createTodo: vi.fn(),
  toggleTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

import { fetchTodos, createTodo as apiCreateTodo, toggleTodo as apiToggleTodo, deleteTodo as apiDeleteTodo } from '../api/todoApi';

const mockFetchTodos = vi.mocked(fetchTodos);
const mockCreateTodo = vi.mocked(apiCreateTodo);
const mockToggleTodo = vi.mocked(apiToggleTodo);
const mockDeleteTodo = vi.mocked(apiDeleteTodo);

function wrapper({ children }: { children: React.ReactNode }) {
  return createElement(SWRConfig, { value: { dedupingInterval: 0, provider: () => new Map() } }, children);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useTodos', () => {
  it('returns todos from API', async () => {
    const todos = [
      { id: '1', text: 'Test todo', isCompleted: false, createdAt: new Date() },
    ];
    mockFetchTodos.mockResolvedValue(todos);

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.todos).toEqual(todos);
    });

    expect(mockFetchTodos).toHaveBeenCalled();
  });

  it('returns empty array initially before data loads', () => {
    mockFetchTodos.mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useTodos(), { wrapper });

    expect(result.current.todos).toEqual([]);
  });

  it('triggers mutate after create', async () => {
    const initialTodos = [
      { id: '1', text: 'First', isCompleted: false, createdAt: new Date() },
    ];
    const newTodo = { id: '2', text: 'Second', isCompleted: false, createdAt: new Date() };

    mockFetchTodos.mockResolvedValue(initialTodos);
    mockCreateTodo.mockResolvedValue(newTodo);

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.todos).toEqual(initialTodos);
    });

    // Update mock to return both todos for the revalidation
    mockFetchTodos.mockResolvedValue([...initialTodos, newTodo]);

    await act(async () => {
      await result.current.createTodo('Second');
    });

    expect(mockCreateTodo).toHaveBeenCalledWith('Second');

    await waitFor(() => {
      expect(mockFetchTodos).toHaveBeenCalledTimes(2);
    });
  });

  it('toggleTodo calls apiToggleTodo and triggers mutate', async () => {
    const initialTodos = [
      { id: '1', text: 'Test', isCompleted: false, createdAt: new Date() },
    ];
    const toggledTodo = { ...initialTodos[0], isCompleted: true };

    mockFetchTodos.mockResolvedValue(initialTodos);
    mockToggleTodo.mockResolvedValue(toggledTodo);

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.todos).toEqual(initialTodos);
    });

    // After toggle, fetchTodos will be called for revalidation
    mockFetchTodos.mockResolvedValue([toggledTodo]);

    await act(async () => {
      await result.current.toggleTodo('1');
    });

    expect(mockToggleTodo).toHaveBeenCalledWith('1', true);
  });

  it('optimistic update flips isCompleted before API resolves', async () => {
    const initialTodos = [
      { id: '1', text: 'Test', isCompleted: false, createdAt: new Date() },
    ];

    mockFetchTodos.mockResolvedValue(initialTodos);
    // Make toggle take a long time so we can check optimistic state
    mockToggleTodo.mockImplementation(() => new Promise((resolve) => {
      setTimeout(() => resolve({ ...initialTodos[0], isCompleted: true }), 100);
    }));

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.todos).toEqual(initialTodos);
    });

    mockFetchTodos.mockResolvedValue([{ ...initialTodos[0], isCompleted: true }]);

    // Start toggle but don't await — check optimistic state
    act(() => {
      result.current.toggleTodo('1');
    });

    // Optimistic update should flip isCompleted immediately
    await waitFor(() => {
      expect(result.current.todos[0].isCompleted).toBe(true);
    });
  });

  it('optimistic toggle reverts on API failure (rollbackOnError)', async () => {
    const initialTodos = [
      { id: '1', text: 'Test', isCompleted: false, createdAt: new Date() },
    ];

    mockFetchTodos.mockResolvedValue(initialTodos);
    // API call will fail
    mockToggleTodo.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.todos).toEqual(initialTodos);
    });

    // fetchTodos still returns original data for rollback
    mockFetchTodos.mockResolvedValue(initialTodos);

    await act(async () => {
      // toggleTodo swallows the error internally via SWR
      try {
        await result.current.toggleTodo('1');
      } catch {
        // SWR may propagate the error
      }
    });

    // After rollback, isCompleted should revert to false
    await waitFor(() => {
      expect(result.current.todos[0].isCompleted).toBe(false);
    });
  });

  it('deleteTodo calls apiDeleteTodo and triggers mutate', async () => {
    const initialTodos = [
      { id: '1', text: 'Test', isCompleted: false, createdAt: new Date() },
      { id: '2', text: 'Keep', isCompleted: false, createdAt: new Date() },
    ];

    mockFetchTodos.mockResolvedValue(initialTodos);
    mockDeleteTodo.mockResolvedValue({ id: '1' });

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.todos).toEqual(initialTodos);
    });

    mockFetchTodos.mockResolvedValue([initialTodos[1]]);

    await act(async () => {
      await result.current.deleteTodo('1');
    });

    expect(mockDeleteTodo).toHaveBeenCalledWith('1');
  });

  it('optimistic delete reverts on API failure (rollbackOnError)', async () => {
    const initialTodos = [
      { id: '1', text: 'Delete me', isCompleted: false, createdAt: new Date() },
      { id: '2', text: 'Keep me', isCompleted: false, createdAt: new Date() },
    ];

    mockFetchTodos.mockResolvedValue(initialTodos);
    mockDeleteTodo.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.todos).toHaveLength(2);
    });

    mockFetchTodos.mockResolvedValue(initialTodos);

    await act(async () => {
      try {
        await result.current.deleteTodo('1');
      } catch {
        // SWR may propagate the error
      }
    });

    // After rollback, both todos should reappear
    await waitFor(() => {
      expect(result.current.todos).toHaveLength(2);
      expect(result.current.todos[0].id).toBe('1');
    });
  });

  it('sets itemErrors on toggle failure and clears on success', async () => {
    const initialTodos = [
      { id: '1', text: 'Test', isCompleted: false, createdAt: new Date() },
    ];

    mockFetchTodos.mockResolvedValue(initialTodos);
    mockToggleTodo.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.todos).toEqual(initialTodos);
    });

    mockFetchTodos.mockResolvedValue(initialTodos);

    await act(async () => {
      try { await result.current.toggleTodo('1'); } catch {}
    });

    // Error should be set for that item
    await waitFor(() => {
      expect(result.current.itemErrors.get('1')).toBe("Couldn't update task. Try again.");
    });

    // Now succeed on retry
    const toggledTodo = { ...initialTodos[0], isCompleted: true };
    mockToggleTodo.mockResolvedValueOnce(toggledTodo);
    mockFetchTodos.mockResolvedValue([toggledTodo]);

    await act(async () => {
      await result.current.toggleTodo('1');
    });

    // Error should be cleared
    await waitFor(() => {
      expect(result.current.itemErrors.has('1')).toBe(false);
    });
  });

  it('optimistic delete removes todo from list before API resolves', async () => {
    const initialTodos = [
      { id: '1', text: 'Delete me', isCompleted: false, createdAt: new Date() },
      { id: '2', text: 'Keep me', isCompleted: false, createdAt: new Date() },
    ];

    mockFetchTodos.mockResolvedValue(initialTodos);
    mockDeleteTodo.mockImplementation(() => new Promise((resolve) => {
      setTimeout(() => resolve({ id: '1' }), 100);
    }));

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => {
      expect(result.current.todos).toHaveLength(2);
    });

    mockFetchTodos.mockResolvedValue([initialTodos[1]]);

    act(() => {
      result.current.deleteTodo('1');
    });

    await waitFor(() => {
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].id).toBe('2');
    });
  });
});
