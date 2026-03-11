import { useState } from 'react';
import useSWR from 'swr';
import type { Todo } from '@todo/shared';
import { fetchTodos, createTodo as apiCreateTodo, toggleTodo as apiToggleTodo, deleteTodo as apiDeleteTodo } from '../api/todoApi';

export function useTodos() {
  const { data, error, isLoading, mutate } = useSWR<Todo[]>('/api/todos', fetchTodos);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const createTodo = async (text: string) => {
    await apiCreateTodo(text);
    mutate();
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
  };
}
