import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error text passed as message prop', () => {
    render(<ErrorMessage message="Couldn't add task. Try again." />);
    expect(screen.getByText("Couldn't add task. Try again.")).toBeTruthy();
  });

  it('has role="alert" for accessibility', () => {
    render(<ErrorMessage message="Error" />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });
});
