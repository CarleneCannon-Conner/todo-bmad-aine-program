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

describe('ProgressIndicator integration', () => {
  it('renders correct X/Y count from todos state', () => {
    mockUseTodos.mockReturnValue({
      todos: [
        { id: '1', text: 'Task one', isCompleted: true, createdAt: new Date() },
        { id: '2', text: 'Task two', isCompleted: false, createdAt: new Date() },
        { id: '3', text: 'Task three', isCompleted: true, createdAt: new Date() },
      ],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map<string, string>(),
    });
    render(<App />);
    expect(screen.getByText('2/3 complete')).toBeTruthy();
  });

  it('updates count when todos change (simulating toggle)', () => {
    const todosBeforeToggle = [
      { id: '1', text: 'Task one', isCompleted: false, createdAt: new Date() },
      { id: '2', text: 'Task two', isCompleted: false, createdAt: new Date() },
    ];
    mockUseTodos.mockReturnValue({
      todos: todosBeforeToggle,
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map<string, string>(),
    });
    const { rerender } = render(<App />);
    expect(screen.getByText('0/2 complete')).toBeTruthy();

    // Simulate toggle: task 1 becomes completed
    mockUseTodos.mockReturnValue({
      todos: [
        { id: '1', text: 'Task one', isCompleted: true, createdAt: new Date() },
        { id: '2', text: 'Task two', isCompleted: false, createdAt: new Date() },
      ],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map<string, string>(),
    });
    rerender(<App />);
    expect(screen.getByText('1/2 complete')).toBeTruthy();
  });

  it('hides indicator when todo list is empty', () => {
    render(<App />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('shows indicator when todos exist', () => {
    mockUseTodos.mockReturnValue({
      todos: [
        { id: '1', text: 'Task one', isCompleted: false, createdAt: new Date() },
      ],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map<string, string>(),
    });
    render(<App />);
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByText('0/1 complete')).toBeTruthy();
  });
});

describe('AllClearCelebration integration', () => {
  it('shows celebration when transitioning from incomplete to all complete', () => {
    // Start with one incomplete task
    mockUseTodos.mockReturnValue({
      todos: [
        { id: '1', text: 'Task one', isCompleted: false, createdAt: new Date() },
      ],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map<string, string>(),
    });
    const { rerender } = render(<App />);
    expect(screen.queryByText('all clear!')).toBeNull();

    // Complete the task
    mockUseTodos.mockReturnValue({
      todos: [
        { id: '1', text: 'Task one', isCompleted: true, createdAt: new Date() },
      ],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map<string, string>(),
    });
    rerender(<App />);
    expect(screen.getByText('all clear!')).toBeTruthy();
  });

  it('does NOT show celebration when some tasks are incomplete', () => {
    mockUseTodos.mockReturnValue({
      todos: [
        { id: '1', text: 'Task one', isCompleted: true, createdAt: new Date() },
        { id: '2', text: 'Task two', isCompleted: false, createdAt: new Date() },
      ],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map<string, string>(),
    });
    render(<App />);
    expect(screen.queryByText('all clear!')).toBeNull();
  });

  it('does NOT show celebration when task list is empty', () => {
    render(<App />);
    expect(screen.queryByText('all clear!')).toBeNull();
  });

  it('clears celebration when a new task is added (rerender with incomplete task)', () => {
    // Start incomplete
    mockUseTodos.mockReturnValue({
      todos: [
        { id: '1', text: 'Task one', isCompleted: false, createdAt: new Date() },
      ],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map<string, string>(),
    });
    const { rerender } = render(<App />);

    // Complete all
    mockUseTodos.mockReturnValue({
      todos: [
        { id: '1', text: 'Task one', isCompleted: true, createdAt: new Date() },
      ],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map<string, string>(),
    });
    rerender(<App />);
    expect(screen.getByText('all clear!')).toBeTruthy();

    // Add a new incomplete task
    mockUseTodos.mockReturnValue({
      todos: [
        { id: '1', text: 'Task one', isCompleted: true, createdAt: new Date() },
        { id: '2', text: 'New task', isCompleted: false, createdAt: new Date() },
      ],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map<string, string>(),
    });
    rerender(<App />);
    expect(screen.queryByText('all clear!')).toBeNull();
  });

  it('does NOT show celebration on initial load with all tasks complete', () => {
    mockUseTodos.mockReturnValue({
      todos: [
        { id: '1', text: 'Task one', isCompleted: true, createdAt: new Date() },
      ],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map<string, string>(),
    });
    render(<App />);
    expect(screen.queryByText('all clear!')).toBeNull();
  });
});

describe('Keyboard focus-visible', () => {
  it('index.css defines focus-visible amber ring and suppresses mouse focus ring', () => {
    const { readFileSync } = require('fs');
    const { resolve } = require('path');
    const css = readFileSync(resolve(__dirname, 'index.css'), 'utf-8');

    // AC #1: focus-visible uses amber ring (--color-accent, 2px solid, offset 2px)
    expect(css).toContain('*:focus-visible');
    expect(css).toContain('outline: 2px solid var(--color-accent)');
    expect(css).toContain('outline-offset: 2px');

    // AC #1: no focus ring on mouse click
    expect(css).toContain('*:focus:not(:focus-visible)');
    expect(css).toContain('outline: none');
  });
});

describe('Keyboard navigation', () => {
  it('TaskInput, AddButton, and TaskItem checkboxes are all focusable in DOM order', () => {
    mockUseTodos.mockReturnValue({
      todos: [
        { id: '1', text: 'Task one', isCompleted: false, createdAt: new Date() },
        { id: '2', text: 'Task two', isCompleted: true, createdAt: new Date() },
      ],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map<string, string>(),
    });
    render(<App />);

    const input = screen.getByPlaceholderText('add a task...');
    const checkboxes = screen.getAllByRole('checkbox');

    // Enable the AddButton by typing text
    fireEvent.change(input, { target: { value: 'text' } });
    const addButton = screen.getByRole('button', { name: /add task/i });

    // Verify all key elements exist and are focusable
    input.focus();
    expect(document.activeElement).toBe(input);

    addButton.focus();
    expect(document.activeElement).toBe(addButton);

    checkboxes[0].focus();
    expect(document.activeElement).toBe(checkboxes[0]);

    checkboxes[1].focus();
    expect(document.activeElement).toBe(checkboxes[1]);
  });

  it('AddButton is disabled and not focusable when input is empty', () => {
    mockUseTodos.mockReturnValue({
      todos: [
        { id: '1', text: 'Task one', isCompleted: false, createdAt: new Date() },
      ],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map<string, string>(),
    });
    render(<App />);

    const addButton = screen.getByRole('button', { name: /add task/i });
    expect(addButton).toBeDisabled();
  });

  it('TaskItem checkbox appears before its delete button in DOM', () => {
    mockUseTodos.mockReturnValue({
      todos: [
        { id: '1', text: 'Task one', isCompleted: false, createdAt: new Date() },
      ],
      isLoading: false,
      error: undefined,
      createTodo: mockCreateTodo,
      toggleTodo: vi.fn(),
      deleteTodo: vi.fn(),
      togglingIds: new Set<string>(),
      deletingIds: new Set<string>(),
      itemErrors: new Map<string, string>(),
    });
    const { container } = render(<App />);

    // Get all focusable elements in DOM order
    const focusable = container.querySelectorAll('input, button:not([disabled]), [tabindex="0"]');
    const tags = Array.from(focusable).map(el => el.getAttribute('role') || el.tagName.toLowerCase());

    // Expected order: bee button, input, checkbox, delete button
    expect(tags[0]).toBe('button'); // bee image (interactive easter egg)
    expect(tags[1]).toBe('input');
    expect(tags[2]).toBe('checkbox');
    expect(tags[3]).toBe('button'); // delete button
  });
});
