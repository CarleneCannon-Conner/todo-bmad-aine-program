import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskInput } from './TaskInput';

const defaultProps = {
  value: '',
  onChange: vi.fn(),
  onSubmit: vi.fn(),
};

describe('TaskInput', () => {
  it('renders with placeholder "add a task..."', () => {
    render(<TaskInput {...defaultProps} />);
    expect(screen.getByPlaceholderText('add a task...')).toBeTruthy();
  });

  it('calls onSubmit on Enter with valid text', () => {
    const onSubmit = vi.fn();
    render(<TaskInput {...defaultProps} value="Buy milk" onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByPlaceholderText('add a task...'), { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('calls onSubmit on Enter even with empty value (parent handles validation)', () => {
    const onSubmit = vi.fn();
    render(<TaskInput {...defaultProps} value="" onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByPlaceholderText('add a task...'), { key: 'Enter' });
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('does not call onSubmit on non-Enter keys', () => {
    const onSubmit = vi.fn();
    render(<TaskInput {...defaultProps} value="text" onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByPlaceholderText('add a task...'), { key: 'a' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<TaskInput {...defaultProps} onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('add a task...'), { target: { value: 'Hello' } });
    expect(onChange).toHaveBeenCalledWith('Hello');
  });

  it('has maxLength attribute set to 500', () => {
    render(<TaskInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('add a task...');
    expect(input).toHaveAttribute('maxLength', '500');
  });

  it('has aria-label "Add a new task"', () => {
    render(<TaskInput {...defaultProps} />);
    expect(screen.getByLabelText('Add a new task')).toBeTruthy();
  });
});
