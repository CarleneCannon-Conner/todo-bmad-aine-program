import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteButton } from './DeleteButton';

describe('DeleteButton', () => {
  it('renders delete control', () => {
    render(<DeleteButton onDelete={vi.fn()} />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeTruthy();
  });

  it('fires onDelete callback on click', () => {
    const onDelete = vi.fn();
    render(<DeleteButton onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('does not fire callback when disabled', () => {
    const onDelete = vi.fn();
    render(<DeleteButton onDelete={onDelete} disabled />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).not.toHaveBeenCalled();
  });
});
