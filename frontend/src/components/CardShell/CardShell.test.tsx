import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardShell } from './CardShell';

describe('CardShell', () => {
  it('renders children content', () => {
    render(<CardShell><p>Test content</p></CardShell>);
    expect(screen.getByText('Test content')).toBeTruthy();
  });

  it('renders as main element', () => {
    render(<CardShell><p>Content</p></CardShell>);
    expect(screen.getByRole('main')).toBeTruthy();
  });
});
