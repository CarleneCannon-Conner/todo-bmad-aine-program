import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BeeHeader } from './BeeHeader';

describe('BeeHeader', () => {
  it('renders bee image as interactive button', () => {
    render(<BeeHeader />);
    const img = screen.getByRole('button', { name: /click me for a surprise/i });
    expect(img).toBeTruthy();
    expect(img.tagName).toBe('IMG');
  });

  it('renders "my todos" heading', () => {
    render(<BeeHeader />);
    expect(screen.getByRole('heading', { level: 1 })).toBeTruthy();
    expect(screen.getByText('my todos')).toBeTruthy();
  });

  it('adds wiggle animation class on click', () => {
    render(<BeeHeader />);
    const img = screen.getByRole('button', { name: /click me for a surprise/i });
    expect(img.classList.contains('bee-header-img--wiggle')).toBe(false);
    fireEvent.click(img);
    expect(img.classList.contains('bee-header-img--wiggle')).toBe(true);
  });

  it('removes wiggle class after animation ends', () => {
    render(<BeeHeader />);
    const img = screen.getByRole('button', { name: /click me for a surprise/i });
    fireEvent.click(img);
    expect(img.classList.contains('bee-header-img--wiggle')).toBe(true);
    fireEvent.animationEnd(img);
    expect(img.classList.contains('bee-header-img--wiggle')).toBe(false);
  });

  it('ignores clicks while already wiggling', () => {
    render(<BeeHeader />);
    const img = screen.getByRole('button', { name: /click me for a surprise/i });
    fireEvent.click(img);
    expect(img.classList.contains('bee-header-img--wiggle')).toBe(true);
    // Second click should not cause issues — still wiggling
    fireEvent.click(img);
    expect(img.classList.contains('bee-header-img--wiggle')).toBe(true);
  });
});
