import useSWR from 'swr';
import type { Todo } from '@todo/shared';
import { fetchTodos, createTodo as apiCreateTodo } from '../api/todoApi';

export function useTodos() {
  const { data, error, isLoading, mutate } = useSWR<Todo[]>('/api/todos', fetchTodos);

  const createTodo = async (text: string) => {
    await apiCreateTodo(text);
    mutate();
  };

  return {
    todos: data ?? [],
    isLoading,
    error,
    createTodo,
  };
}
