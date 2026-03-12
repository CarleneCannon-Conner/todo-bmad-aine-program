import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AllClearCelebration } from './AllClearCelebration';
import fs from 'fs';
import path from 'path';

describe('AllClearCelebration', () => {
  it('renders celebration content', () => {
    render(<AllClearCelebration />);
    expect(screen.getByText('all clear!')).toBeTruthy();
  });

  it('has alert role for accessibility', () => {
    render(<AllClearCelebration />);
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('contains an SVG bee', () => {
    const { container } = render(<AllClearCelebration />);
    expect(container.querySelector('svg.all-clear-bee')).toBeTruthy();
  });
});

describe('Extended theme tokens', () => {
  it('defines new celebration theme tokens in :root CSS', () => {
    const cssPath = path.resolve(__dirname, '../../index.css');
    const css = fs.readFileSync(cssPath, 'utf-8');
    expect(css).toContain('--color-celebration:');
    expect(css).toContain('--color-celebration-bg:');
    expect(css).toContain('--color-bee-body:');
    expect(css).toContain('--color-bee-wing:');
  });
});
