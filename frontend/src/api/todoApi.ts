import type { Todo, CreateTodoRequest, ApiResponse } from '@todo/shared';

const API_BASE = '/api/todos';

async function handleResponse<T>(response: Response): Promise<T> {
  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new Error(`Server error (${response.status})`);
  }
  if (!json.success) {
    throw new Error(json.error.message);
  }
  return json.data;
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(API_BASE);
  return handleResponse<Todo[]>(res);
}

export async function toggleTodo(id: string, isCompleted: boolean): Promise<Todo> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isCompleted }),
  });
  return handleResponse<Todo>(res);
}

export async function deleteTodo(id: string): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ id: string }>(res);
}

export async function createTodo(text: string): Promise<Todo> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text } satisfies CreateTodoRequest),
  });
  return handleResponse<Todo>(res);
}
