import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Todo, ApiResponse } from '@todo/shared';
import App from './App';

vi.mock('./hooks/useTodos', () => ({
  useTodos: vi.fn(),
}));

import { useTodos } from './hooks/useTodos';

const mockCreateTodo = vi.fn();
const mockUseTodos = vi.mocked(useTodos);

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateTodo.mockResolvedValue(undefined);
  mockUseTodos.mockReturnValue({
    todos: [],
    isLoading: false,
    error: undefined,
    createTodo: mockCreateTodo,
    toggleTodo: vi.fn(),
    deleteTodo: vi.fn(),
    togglingIds: new Set<string>(),
    deletingIds: new Set<string>(),
    itemErrors: new Map<string, string>(),
  });
});

describe('workspace setup', () => {
  it('can import shared types', () => {
    const todo: Todo = {
      id: '123',
      text: 'Test',
      isCompleted: false,
      createdAt: new Date(),
    };
    expect(todo.text).toBe('Test');
  });

  it('ApiResponse type works as discriminated union', () => {
    const success: ApiResponse<string> = { success: true, data: 'hello' };
    const error: ApiResponse<string> = {
      success: false,
      error: { code: 'TEST', message: 'fail' },
    };
    expect(success.success).toBe(true);
    expect(error.success).toBe(false);
  });
});

describe('App input validation', () => {
  it('rejects empty input on Enter — no API call', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('add a task...');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockCreateTodo).not.toHaveBeenCalled();
  });

  it('rejects whitespace-only input on Enter — no API call', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('add a task...');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockCreateTodo).not.toHaveBeenCalled();
  });

  it('trims whitespace before submission', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('add a task...');
    fireEvent.change(input, { target: { value: '  Buy milk  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith('Buy milk');
    });
  });

  it('AddButton is disabled when input is empty', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /add task/i })).toBeDisabled();
  });

  it('AddButton submits and clears input on success', async () => {
    render(<App />);
    const input = screen.getByPlaceholderText('add a task...');
    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith('New task');
    });
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});

describe('App create error handling', () => {
  it('displays error message below input when create fails', () => {
    mockUseTodos.mockReturnValue({
      todos: [],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map([['create', "Couldn't add task. Try again."]]),
    });
    render(<App />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText("Couldn't add task. Try again.")).toBeTruthy();
  });

  it('retains input text on create failure', async () => {
    mockCreateTodo.mockRejectedValue(new Error('Network error'));
    render(<App />);
    const input = screen.getByPlaceholderText('add a task...');
    fireEvent.change(input, { target: { value: 'My task' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith('My task');
    });
    // Input should retain the text after failure
    expect(input).toHaveValue('My task');
  });

  it('error clears when create error is removed from itemErrors', () => {
    // First render with error
    mockUseTodos.mockReturnValue({
      todos: [],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map([['create', "Couldn't add task. Try again."]]),
    });
    const { rerender } = render(<App />);
    expect(screen.getByRole('alert')).toBeTruthy();

    // Re-render with cleared error (simulating successful retry)
    mockUseTodos.mockReturnValue({
      todos: [],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map(),
    });
    rerender(<App />);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
