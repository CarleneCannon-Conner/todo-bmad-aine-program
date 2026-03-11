import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddButton } from './AddButton';

describe('AddButton', () => {
  it('renders disabled when disabled prop is true', () => {
    render(<AddButton onClick={vi.fn()} disabled={true} />);
    expect(screen.getByRole('button', { name: /add task/i })).toBeDisabled();
  });

  it('renders active when disabled prop is false', () => {
    render(<AddButton onClick={vi.fn()} disabled={false} />);
    expect(screen.getByRole('button', { name: /add task/i })).not.toBeDisabled();
  });

  it('fires onClick callback on click when active', () => {
    const onClick = vi.fn();
    render(<AddButton onClick={onClick} disabled={false} />);
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(<AddButton onClick={onClick} disabled={true} />);
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
