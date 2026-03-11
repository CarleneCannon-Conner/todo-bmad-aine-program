import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HexCheckbox } from './HexCheckbox';

describe('HexCheckbox', () => {
  it('renders SVG with hexagon polygon', () => {
    const { container } = render(<HexCheckbox checked={false} />);
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.querySelector('polygon')).toBeTruthy();
  });

  it('unchecked state does not have checked class', () => {
    const { container } = render(<HexCheckbox checked={false} />);
    expect(container.querySelector('.hex-checkbox--checked')).toBeNull();
  });

  it('checked state applies checked class for accent fill and checkmark visibility', () => {
    const { container } = render(<HexCheckbox checked={true} />);
    expect(container.querySelector('.hex-checkbox--checked')).toBeTruthy();
  });
});
