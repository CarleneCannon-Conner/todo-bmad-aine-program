import { useState } from 'react';
import useSWR from 'swr';
import type { Todo } from '@todo/shared';
import { fetchTodos, createTodo as apiCreateTodo, toggleTodo as apiToggleTodo, deleteTodo as apiDeleteTodo } from '../api/todoApi';

export function useTodos() {
  const { data, error, isLoading, mutate } = useSWR<Todo[]>('/api/todos', fetchTodos);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [itemErrors, setItemErrors] = useState<Map<string, string>>(new Map());

  const setError = (key: string, message: string) => {
    setItemErrors(prev => new Map(prev).set(key, message));
  };

  const clearError = (key: string) => {
    setItemErrors(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  };

  const createTodo = async (text: string) => {
    try {
      await apiCreateTodo(text);
      mutate();
      clearError('create');
    } catch (err) {
      setError('create', "Couldn't add task. Try again.");
      throw err;
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = data?.find(t => t.id === id);
    if (!todo) return;

    setTogglingIds(prev => new Set(prev).add(id));

    try {
      await mutate(
        async () => {
          await apiToggleTodo(id, !todo.isCompleted);
          return fetchTodos();
        },
        {
          optimisticData: data?.map(t =>
            t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
          ),
          rollbackOnError: true,
          revalidate: false,
        }
      );
      clearError(id);
    } catch {
      setError(id, "Couldn't update task. Try again.");
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const deleteTodo = async (id: string) => {
    setDeletingIds(prev => new Set(prev).add(id));

    // Delay optimistic removal so the CSS delete animation + height collapse plays before the DOM element is removed
    // Skip delay when user prefers reduced motion (animations complete in ~0.01s)
    const prefersReducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await new Promise(r => setTimeout(r, prefersReducedMotion ? 0 : 300));

    try {
      await mutate(
        async () => {
          await apiDeleteTodo(id);
          return fetchTodos();
        },
        {
          optimisticData: data?.filter(t => t.id !== id),
          rollbackOnError: true,
          revalidate: false,
        }
      );
      clearError(id);
    } catch {
      setError(id, "Couldn't delete task. Try again.");
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return {
    todos: data ?? [],
    isLoading,
    error,
    createTodo,
    toggleTodo,
    deleteTodo,
    togglingIds,
    deletingIds,
    itemErrors,
  };
}
