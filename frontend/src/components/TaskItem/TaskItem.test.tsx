import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from './TaskItem';

const mockTodo = { id: '1', text: 'Test task', isCompleted: false, createdAt: new Date() };

const defaultProps = {
  todo: mockTodo,
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  isToggling: false,
  isDeleting: false,
};

describe('TaskItem', () => {
  it('calls onToggle with todo id when clicked', () => {
    const onToggle = vi.fn();
    render(<TaskItem {...defaultProps} onToggle={onToggle} />);
    fireEvent.click(screen.getByText('Test task'));
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('shows strikethrough for completed task', () => {
    const completedTodo = { ...mockTodo, isCompleted: true };
    const { container } = render(
      <TaskItem {...defaultProps} todo={completedTodo} />,
    );
    expect(container.querySelector('.task-item--completed')).toBeTruthy();
  });

  it('does not show completed class for incomplete task', () => {
    const { container } = render(
      <TaskItem {...defaultProps} />,
    );
    expect(container.querySelector('.task-item--completed')).toBeNull();
  });

  it('disables toggle when isToggling is true', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <TaskItem {...defaultProps} onToggle={onToggle} isToggling={true} />,
    );
    expect(container.querySelector('.task-item--toggling')).toBeTruthy();
    fireEvent.click(screen.getByText('Test task'));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('calls onDelete with todo id when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<TaskItem {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('disables actions when isDeleting is true', () => {
    const onToggle = vi.fn();
    const { container } = render(
      <TaskItem {...defaultProps} onToggle={onToggle} isDeleting={true} />,
    );
    expect(container.querySelector('.task-item--deleting')).toBeTruthy();
    fireEvent.click(screen.getByText('Test task'));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('wraps long text gracefully', () => {
    const longTodo = { ...mockTodo, text: 'A'.repeat(500) };
    const { container } = render(
      <TaskItem {...defaultProps} todo={longTodo} />,
    );
    const textEl = container.querySelector('.task-item-text');
    expect(textEl).toBeTruthy();
    expect(textEl?.textContent).toHaveLength(500);
  });

  it('renders HexCheckbox component', () => {
    const { container } = render(<TaskItem {...defaultProps} />);
    expect(container.querySelector('.hex-checkbox')).toBeTruthy();
    expect(container.querySelector('polygon')).toBeTruthy();
  });

  it('HexCheckbox shows checked state when todo is completed', () => {
    const completedTodo = { ...mockTodo, isCompleted: true };
    const { container } = render(
      <TaskItem {...defaultProps} todo={completedTodo} />,
    );
    expect(container.querySelector('.hex-checkbox--checked')).toBeTruthy();
  });

  it('HexCheckbox shows unchecked state when todo is incomplete', () => {
    const { container } = render(<TaskItem {...defaultProps} />);
    expect(container.querySelector('.hex-checkbox--checked')).toBeNull();
  });

  it('displays error message when error prop is provided', () => {
    render(
      <TaskItem {...defaultProps} error="Couldn't update task. Try again." />,
    );
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText("Couldn't update task. Try again.")).toBeTruthy();
  });

  it('does not display error message when no error', () => {
    render(<TaskItem {...defaultProps} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('remains clickable for retry when error is displayed', () => {
    const onToggle = vi.fn();
    render(
      <TaskItem {...defaultProps} onToggle={onToggle} error="Couldn't update task. Try again." />,
    );
    fireEvent.click(screen.getByText('Test task'));
    expect(onToggle).toHaveBeenCalledWith('1');
  });
});
