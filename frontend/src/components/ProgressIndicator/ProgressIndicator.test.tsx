import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ProgressIndicator } from './ProgressIndicator';

describe('ProgressIndicator', () => {
  it('renders "3/5 complete" for given props', () => {
    render(<ProgressIndicator completedCount={3} totalCount={5} />);
    expect(screen.getByText('3/5 complete')).toBeTruthy();
  });

  it('renders null when totalCount is 0', () => {
    const { container } = render(<ProgressIndicator completedCount={0} totalCount={0} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders "0/3 complete" when no tasks are done', () => {
    render(<ProgressIndicator completedCount={0} totalCount={3} />);
    expect(screen.getByText('0/3 complete')).toBeTruthy();
  });

  it('renders "3/3 complete" when all tasks are done', () => {
    render(<ProgressIndicator completedCount={3} totalCount={3} />);
    expect(screen.getByText('3/3 complete')).toBeTruthy();
  });

  it('has role="status" and accessible aria-label', () => {
    render(<ProgressIndicator completedCount={2} totalCount={5} />);
    const indicator = screen.getByRole('status');
    expect(indicator).toBeTruthy();
    expect(indicator).toHaveAttribute('aria-label', '2 of 5 tasks complete');
  });

  it('includes a honeycomb hex SVG icon', () => {
    const { container } = render(<ProgressIndicator completedCount={1} totalCount={2} />);
    const svg = container.querySelector('.progress-hex-icon');
    expect(svg).toBeTruthy();
    expect(svg?.querySelector('polygon')).toBeTruthy();
  });
});

describe('Favicon', () => {
  it('index.html favicon link points to /bumble-bee.svg', () => {
    const html = readFileSync(resolve(__dirname, '../../../index.html'), 'utf-8');
    expect(html).toContain('href="/bumble-bee.svg"');
    expect(html).not.toContain('href="/vite.svg"');
  });
});
