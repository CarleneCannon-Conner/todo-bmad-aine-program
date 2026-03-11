import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskList } from './TaskList';

const mockTodo = {
  id: '1',
  text: 'Test task',
  isCompleted: false,
  createdAt: new Date(),
};

const defaultProps = {
  todos: [] as typeof mockTodo[],
  isLoading: false,
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  togglingIds: new Set<string>(),
  deletingIds: new Set<string>(),
};

describe('TaskList', () => {
  it('renders skeleton when loading with no todos', () => {
    const { container } = render(
      <TaskList {...defaultProps} isLoading={true} />,
    );
    expect(container.querySelector('.loading-skeleton')).toBeTruthy();
  });

  it('renders nothing when not loading and no todos', () => {
    const { container } = render(
      <TaskList {...defaultProps} />,
    );
    expect(container.querySelector('.loading-skeleton')).toBeNull();
    expect(container.querySelector('.task-list')).toBeNull();
  });

  it('renders todo items when data is present', () => {
    render(
      <TaskList {...defaultProps} todos={[mockTodo]} />,
    );
    expect(screen.getByText('Test task')).toBeTruthy();
  });

  it('renders todos not skeleton during revalidation', () => {
    const { container } = render(
      <TaskList {...defaultProps} todos={[mockTodo]} isLoading={true} />,
    );
    expect(container.querySelector('.loading-skeleton')).toBeNull();
    expect(screen.getByText('Test task')).toBeTruthy();
  });
});
