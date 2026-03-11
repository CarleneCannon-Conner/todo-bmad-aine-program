import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { createElement } from 'react';
import { useTodos } from './useTodos';

vi.mock('../api/todoApi', () => ({
  fetchTodos: vi.fn(),
  createTodo: vi.fn(),
}));

import { fetchTodos, createTodo as apiCreateTodo } from '../api/todoApi';

const mockFetchTodos = vi.mocked(fetchTodos);
const mockCreateTodo = vi.mocked(apiCreateTodo);

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
});
