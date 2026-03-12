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

  it('has role="checkbox" and aria-checked reflecting completion state', () => {
    const { rerender } = render(<TaskItem {...defaultProps} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeTruthy();
    expect(checkbox.getAttribute('aria-checked')).toBe('false');

    const completedTodo = { ...mockTodo, isCompleted: true };
    rerender(<TaskItem {...defaultProps} todo={completedTodo} />);
    expect(screen.getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
  });

  it('toggles on Enter key', () => {
    const onToggle = vi.fn();
    render(<TaskItem {...defaultProps} onToggle={onToggle} />);
    fireEvent.keyDown(screen.getByRole('checkbox'), { key: 'Enter' });
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('toggles on Space key', () => {
    const onToggle = vi.fn();
    render(<TaskItem {...defaultProps} onToggle={onToggle} />);
    fireEvent.keyDown(screen.getByRole('checkbox'), { key: ' ' });
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('deletes on Delete key', () => {
    const onDelete = vi.fn();
    render(<TaskItem {...defaultProps} onDelete={onDelete} />);
    fireEvent.keyDown(screen.getByRole('checkbox'), { key: 'Delete' });
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('deletes on Backspace key', () => {
    const onDelete = vi.fn();
    render(<TaskItem {...defaultProps} onDelete={onDelete} />);
    fireEvent.keyDown(screen.getByRole('checkbox'), { key: 'Backspace' });
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('does not toggle or delete via keyboard when toggling', () => {
    const onToggle = vi.fn();
    const onDelete = vi.fn();
    render(<TaskItem {...defaultProps} onToggle={onToggle} onDelete={onDelete} isToggling={true} />);
    fireEvent.keyDown(screen.getByRole('checkbox'), { key: 'Enter' });
    fireEvent.keyDown(screen.getByRole('checkbox'), { key: 'Delete' });
    expect(onToggle).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('applies task-item--entering class when isEntering is true', () => {
    const { container } = render(
      <TaskItem {...defaultProps} isEntering={true} />,
    );
    expect(container.querySelector('.task-item--entering')).toBeTruthy();
  });

  it('does not apply task-item--entering class by default', () => {
    const { container } = render(
      <TaskItem {...defaultProps} />,
    );
    expect(container.querySelector('.task-item--entering')).toBeNull();
  });

  it('renders BeeAnimation when task transitions from incomplete to complete', () => {
    const incompleteTodo = { ...mockTodo, isCompleted: false };
    const completedTodo = { ...mockTodo, isCompleted: true };
    const { container, rerender } = render(
      <TaskItem {...defaultProps} todo={incompleteTodo} />,
    );
    expect(container.querySelector('.bee-animation')).toBeNull();

    rerender(<TaskItem {...defaultProps} todo={completedTodo} />);
    expect(container.querySelector('.bee-animation')).toBeTruthy();
  });

  it('does not render BeeAnimation on initial load for already-completed tasks', () => {
    const completedTodo = { ...mockTodo, isCompleted: true };
    const { container } = render(
      <TaskItem {...defaultProps} todo={completedTodo} />,
    );
    expect(container.querySelector('.bee-animation')).toBeNull();
  });

  it('does not render BeeAnimation when uncompleting a task', () => {
    const completedTodo = { ...mockTodo, isCompleted: true };
    const incompleteTodo = { ...mockTodo, isCompleted: false };
    const { container, rerender } = render(
      <TaskItem {...defaultProps} todo={completedTodo} />,
    );

    rerender(<TaskItem {...defaultProps} todo={incompleteTodo} />);
    expect(container.querySelector('.bee-animation')).toBeNull();
  });

  it('calls onAnimationEnd when entering animation completes', () => {
    const onAnimationEnd = vi.fn();
    const { container } = render(
      <TaskItem {...defaultProps} isEntering={true} onAnimationEnd={onAnimationEnd} />,
    );
    const taskItem = container.querySelector('.task-item--entering')!;
    fireEvent.animationEnd(taskItem);
    expect(onAnimationEnd).toHaveBeenCalled();
  });

  it('removes BeeAnimation after its animation ends', () => {
    const incompleteTodo = { ...mockTodo, isCompleted: false };
    const completedTodo = { ...mockTodo, isCompleted: true };
    const { container, rerender } = render(
      <TaskItem {...defaultProps} todo={incompleteTodo} />,
    );

    rerender(<TaskItem {...defaultProps} todo={completedTodo} />);
    const bee = container.querySelector('.bee-animation')!;
    expect(bee).toBeTruthy();

    fireEvent.animationEnd(bee);
    expect(container.querySelector('.bee-animation')).toBeNull();
  });
});
