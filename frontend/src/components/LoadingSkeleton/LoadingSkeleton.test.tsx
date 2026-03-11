import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingSkeleton } from './LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders 3 skeleton rows', () => {
    const { container } = render(<LoadingSkeleton />);
    expect(container.querySelectorAll('.skeleton-row')).toHaveLength(3);
  });

  it('each row has hex placeholder and text bar', () => {
    const { container } = render(<LoadingSkeleton />);
    const rows = container.querySelectorAll('.skeleton-row');
    rows.forEach(row => {
      expect(row.querySelector('svg')).toBeTruthy();
      expect(row.querySelector('.skeleton-text-bar')).toBeTruthy();
    });
  });

  it('has aria-hidden for accessibility', () => {
    const { container } = render(<LoadingSkeleton />);
    expect(container.querySelector('.loading-skeleton')?.getAttribute('aria-hidden')).toBe('true');
  });
});
