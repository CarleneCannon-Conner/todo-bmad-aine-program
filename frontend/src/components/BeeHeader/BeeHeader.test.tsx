import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BeeHeader } from './BeeHeader';

describe('BeeHeader', () => {
  it('renders bee image', () => {
    render(<BeeHeader />);
    const img = screen.getByRole('presentation');
    expect(img).toBeTruthy();
    expect(img.tagName).toBe('IMG');
  });

  it('renders "my todos" heading', () => {
    render(<BeeHeader />);
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
    expect(screen.getByText('my todos')).toBeTruthy();
  });
});
