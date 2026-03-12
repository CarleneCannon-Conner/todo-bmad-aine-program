import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

const REQUIRED_TOKENS = [
  '--color-background',
  '--color-accent',
  '--color-text',
  '--color-desktop-bg',
  '--color-error',
  '--color-hover',
  '--color-hex-idle',
  '--color-hex-stroke',
  '--color-hex-focus',
  '--color-done-text',
  '--color-input-border',
  '--color-placeholder',
];

function findCssFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      results.push(...findCssFiles(fullPath));
    } else if (entry.endsWith('.css')) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Design System', () => {
  it('defines all 12 CSS custom properties in :root', () => {
    const indexCss = readFileSync(resolve(__dirname, 'index.css'), 'utf-8');
    for (const token of REQUIRED_TOKENS) {
      expect(indexCss, `Missing token: ${token}`).toContain(token);
    }
  });

  it('contrast-adjusted tokens have correct WCAG AA values', () => {
    const indexCss = readFileSync(resolve(__dirname, 'index.css'), 'utf-8');
    expect(indexCss).toContain('--color-placeholder: #826B4F');
    expect(indexCss).toContain('--color-done-text: #7A6D5B');
    expect(indexCss).toContain('--color-input-border: #A08862');
    expect(indexCss).toContain('--color-hex-stroke: #9A8250');
  });

  it('no component CSS contains hardcoded colour hex values', () => {
    const componentsDir = resolve(__dirname, 'components');
    const cssFiles = findCssFiles(componentsDir);

    // Match hex colour values (#xxx, #xxxx, #xxxxxx, #xxxxxxxx) that are NOT inside var() fallbacks
    // Strategy: find all hex values, then exclude those inside var(..., #hex)
    const bareHexRegex = /#[0-9a-fA-F]{3,8}\b/g;
    const varFallbackRegex = /var\([^)]*,\s*#[0-9a-fA-F]{3,8}\s*\)/g;

    const cssCommentRegex = /\/\*[\s\S]*?\*\//g;

    for (const file of cssFiles) {
      const content = readFileSync(file, 'utf-8');

      // Strip CSS comments and var() fallbacks before checking for bare hex
      const contentWithoutComments = content.replace(cssCommentRegex, '');
      const contentWithoutVarFallbacks = contentWithoutComments.replace(varFallbackRegex, '');

      const matches = contentWithoutVarFallbacks.match(bareHexRegex);
      if (matches) {
        const relativePath = file.replace(componentsDir, 'components');
        expect(matches, `Hardcoded hex values found in ${relativePath}: ${matches.join(', ')}`).toEqual([]);
      }
    }
  });
});
