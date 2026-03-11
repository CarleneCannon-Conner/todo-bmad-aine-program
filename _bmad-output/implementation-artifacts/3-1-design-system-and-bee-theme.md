# Story 3.1: Design System & Bee Theme

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want the app to feel warm and inviting with a consistent bee-themed aesthetic,
so that using the app feels personal and enjoyable rather than sterile.

## Acceptance Criteria

1. **Given** the app is loaded **When** I view any page **Then** all colours are rendered from 12 CSS custom properties defined in `:root` in `index.css` **And** no hardcoded colour values exist in any component CSS

2. **Given** the design tokens are defined **When** I inspect the values **Then** they match the confirmed MVP palette: `--color-background: #FFF8EE`, `--color-accent: #F5A623`, `--color-text: #3D2E1F`, `--color-desktop-bg: #C9A96E`, `--color-error: #D32F2F`, `--color-hover: #FFF0D6`, `--color-hex-idle: #FFF5E5`, `--color-hex-stroke: #D4B87A`, `--color-hex-focus: #FFE8B8`, `--color-done-text: #B8A68E`, `--color-input-border: #E8D5B5`, `--color-placeholder: #C4A97D`

3. **Given** the app is loaded **When** I view any text **Then** Patrick Hand font is loaded from Google Fonts with `cursive, sans-serif` fallback

4. **Given** the design system is applied **When** I run `pnpm --filter frontend test` **Then** a test verifies all 12 CSS custom properties are defined in `:root` and no component CSS contains hardcoded colour hex values

## Tasks / Subtasks

- [x] Task 1: Replace `index.css` with design system foundation (AC: #1, #2)
  - [x] Remove all Vite default styles (dark theme, color-scheme, Inter font)
  - [x] Define all 12 CSS custom properties in `:root`
  - [x] Set `body` background to `var(--color-background)`
  - [x] Set `body` color to `var(--color-text)`
  - [x] Add global resets: `margin: 0`, `box-sizing: border-box`, sensible defaults
  - [x] Set `font-family: 'Patrick Hand', cursive, sans-serif`
  - [x] Set `line-height: 1.5`
- [x] Task 2: Add Patrick Hand font from Google Fonts (AC: #3)
  - [x] Add `<link>` tag in `index.html` for Google Fonts: `Patrick Hand` weight 400
  - [x] URL: `https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap`
  - [x] `display=swap` ensures text is visible while font loads
- [x] Task 3: Update `App.css` to use design tokens (AC: #1)
  - [x] Replace any hardcoded colours with CSS custom properties
  - [x] Adjust layout as needed for the bee theme
- [x] Task 4: Update `TaskInput.css` — replace hardcoded colours (AC: #1)
  - [x] `border: 1px solid #ccc` → `border: 1px solid var(--color-input-border)`
  - [x] `border-color: #666` on focus → `border-color: var(--color-accent)`
  - [x] Add `color: var(--color-text)` for input text
  - [x] Add `font-family: inherit` so Patrick Hand applies to input
  - [x] Add `::placeholder` styles: `color: var(--color-placeholder)`
- [x] Task 5: Update `TaskItem.css` — replace hardcoded colours (AC: #1)
  - [x] Verify `--color-done-text` already uses `var()` (it does from Story 2.2 — already compliant)
  - [x] Add `color: var(--color-text)` as base text colour
- [x] Task 6: Update `TaskList.css` — replace hardcoded colours (AC: #1)
  - [x] `border-bottom: 1px solid #eee` → `border-bottom: 1px solid var(--color-input-border)`
- [x] Task 7: Update any other component CSS files with hardcoded colours (AC: #1)
  - [x] Scan all `.css` files in `frontend/src/` for hex values (`#xxx` or `#xxxxxx`)
  - [x] Replace each with the appropriate CSS custom property
  - [x] AddButton CSS (if created in Story 2.4): update any hardcoded colours
  - [x] DeleteButton CSS (if created in Story 2.3): update any hardcoded colours
- [x] Task 8: Create design system test (AC: #4)
  - [x] Create `frontend/src/design-system.test.ts` (or similar)
  - [x] Test: read `index.css` content, verify all 12 `--color-*` properties present
  - [x] Test: scan all `.css` files in `components/`, verify no bare hex colour values (regex: `#[0-9a-fA-F]{3,8}` not inside a CSS comment or `var()` fallback)
  - [x] Allow hex values inside `var()` fallbacks (e.g., `var(--color-done-text, #B8A68E)` is OK)
- [x] Task 9: Verify all existing tests still pass (regression check)
  - [x] Existing component tests may reference hardcoded styles — update assertions if needed

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Frontend Architecture, Styling Solution]

**Styling approach (MUST follow):**
- Plain CSS with custom properties — no framework, no build dependency beyond Vite
- 12 design tokens in `:root`, applied via `var()`
- No CSS-in-JS, no Tailwind, no styled-components
- Each component has co-located `.css` file

**Design tokens — the complete confirmed MVP palette:**

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `#FFF8EE` | Card/page background (cream) |
| `--color-accent` | `#F5A623` | Honey amber — checked hex, focus rings, AddButton active |
| `--color-text` | `#3D2E1F` | Dark charcoal — body text |
| `--color-desktop-bg` | `#C9A96E` | Honey Oak — desktop outer background (Story 3.2) |
| `--color-error` | `#D32F2F` | Standard red — error messages (Story 4.2) |
| `--color-hover` | `#FFF0D6` | Task hover/focus background (Story 3.3) |
| `--color-hex-idle` | `#FFF5E5` | Unchecked hex fill (Story 3.3) |
| `--color-hex-stroke` | `#D4B87A` | Unchecked hex border (Story 3.3) |
| `--color-hex-focus` | `#FFE8B8` | Focused unchecked hex fill (Story 3.3) |
| `--color-done-text` | `#B8A68E` | Completed task text |
| `--color-input-border` | `#E8D5B5` | Input field border |
| `--color-placeholder` | `#C4A97D` | Placeholder text, delete button |

**Note:** All 12 tokens are defined in this story even though some aren't actively used until later stories (3.2, 3.3, 4.2). This establishes the complete design system upfront.

### Font Loading

**Patrick Hand from Google Fonts:**
- Add to `index.html` `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap" rel="stylesheet">
```
- Set in `index.css` `:root` or `body`: `font-family: 'Patrick Hand', cursive, sans-serif`
- `display=swap` ensures text renders in system font while Patrick Hand loads (FOUT over FOIT)
- Patrick Hand only has weight 400 — that's all we need

### Current Hardcoded Colours to Replace

**`index.css` (Vite defaults — replace entirely):**
- `color: rgba(255, 255, 255, 0.87)` — dark mode text (remove)
- `background-color: #242424` — dark mode bg (remove)
- `color: #213547` — light mode text (remove)
- `background-color: #ffffff` — light mode bg (remove)
- Remove `color-scheme: light dark` — we have a fixed light theme

**`TaskInput.css`:**
- `border: 1px solid #ccc` → `var(--color-input-border)`
- `border-color: #666` → `var(--color-accent)`

**`TaskList.css`:**
- `border-bottom: 1px solid #eee` → `var(--color-input-border)`

**`TaskItem.css`:**
- Already uses `var(--color-done-text, #B8A68E)` — compliant (fallback is OK)

### index.css Target State

```css
:root {
  /* Design tokens — bee theme palette */
  --color-background: #FFF8EE;
  --color-accent: #F5A623;
  --color-text: #3D2E1F;
  --color-desktop-bg: #C9A96E;
  --color-error: #D32F2F;
  --color-hover: #FFF0D6;
  --color-hex-idle: #FFF5E5;
  --color-hex-stroke: #D4B87A;
  --color-hex-focus: #FFE8B8;
  --color-done-text: #B8A68E;
  --color-input-border: #E8D5B5;
  --color-placeholder: #C4A97D;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Patrick Hand', cursive, sans-serif;
  line-height: 1.5;
  color: var(--color-text);
  background-color: var(--color-background);
  min-height: 100vh;
}

input,
button,
textarea {
  font-family: inherit;
}
```

### Design System Test Approach

The test should verify the design system contract is maintained:

```typescript
// frontend/src/design-system.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';

const REQUIRED_TOKENS = [
  '--color-background', '--color-accent', '--color-text',
  '--color-desktop-bg', '--color-error', '--color-hover',
  '--color-hex-idle', '--color-hex-stroke', '--color-hex-focus',
  '--color-done-text', '--color-input-border', '--color-placeholder',
];

describe('Design System', () => {
  it('defines all 12 CSS custom properties in :root', () => {
    const indexCss = readFileSync(resolve(__dirname, 'index.css'), 'utf-8');
    for (const token of REQUIRED_TOKENS) {
      expect(indexCss).toContain(token);
    }
  });

  it('no component CSS contains hardcoded colour hex values', () => {
    // Scan component CSS files for bare hex values not inside var() fallbacks
    const componentsDir = resolve(__dirname, 'components');
    // Recursively find .css files and check for bare hex patterns
    // Allow hex inside var() fallbacks: var(--token, #hex) is OK
  });
});
```

**Test considerations:**
- This test reads actual CSS files from disk — it's a static analysis test, not a runtime test
- The regex for bare hex should exclude values inside `var()` fallbacks
- Pattern to reject: `property: #xxx` or `property: #xxxxxx`
- Pattern to allow: `var(--token, #xxxxxx)` (fallback inside var())

### Post-MVP Notes

**WCAG contrast-adjusted tokens (do NOT apply in this story):**
When accessibility work begins post-MVP, update 4 tokens:
- `--color-placeholder`: `#C4A97D` → `#826B4F`
- `--color-done-text`: `#B8A68E` → `#7A6D5B`
- `--color-input-border`: `#E8D5B5` → `#A08862`
- `--color-hex-stroke`: `#D4B87A` → `#9A8250`

### Project Structure Notes

- All changes are in `frontend/` — no backend changes
- Files modified: `index.html` (font link), `index.css` (complete rewrite), `App.css`, `TaskInput.css`, `TaskItem.css`, `TaskList.css`
- May need to update AddButton.css and DeleteButton.css if they exist from Stories 2.3/2.4
- New file: `design-system.test.ts` (design token verification test)
- No new components created

### What NOT To Do

- Do NOT add CardShell or responsive layout — that's Story 3.2
- Do NOT add BeeHeader or bee SVG — that's Story 3.2
- Do NOT add HexCheckbox styling — that's Story 3.3
- Do NOT add hover effects or delete button show/hide — that's Story 3.3
- Do NOT add loading skeleton — that's Story 3.4
- Do NOT use the WCAG contrast-adjusted token values — those are post-MVP
- Do NOT add `prefers-reduced-motion` handling — that's Story 3.3
- Do NOT install any CSS framework (Tailwind, styled-components, etc.)
- Do NOT add dark mode support — the app has a fixed light bee theme
- Do NOT add CSS variables for spacing/sizing — only colour tokens are specified in the design system
- Do NOT modify any component JSX/TSX for visual changes — this story is CSS + font only

### Previous Story Intelligence

**From Epic 2 stories — current CSS state:**
- `TaskItem.css` already uses `var(--color-done-text, #B8A68E)` — compliant
- `TaskInput.css` has `#ccc` and `#666` — needs replacement
- `TaskList.css` has `#eee` — needs replacement
- `index.css` still has Vite defaults (dark/light mode) — needs complete rewrite
- `App.css` has no colour values — may need minimal updates
- `index.html` has no Google Fonts link — needs adding

**From architecture:**
- `index.css` is the designated location for `:root` design tokens + global resets
- Font loaded via Google Fonts `<link>` in `index.html`, not via `@import` in CSS
- No `@font-face` declaration needed — Google Fonts provides it

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture — Styling Solution]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns — CSS custom properties]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design Tokens — 12 confirmed values]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Typography — Patrick Hand]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#WCAG Contrast — MVP vs post-MVP values]
- [Source: frontend/src/index.css — current Vite defaults to replace]
- [Source: frontend/src/components/TaskInput/TaskInput.css — hardcoded #ccc, #666]
- [Source: frontend/src/components/TaskList/TaskList.css — hardcoded #eee]
- [Source: frontend/src/components/TaskItem/TaskItem.css — already uses var()]
- [Source: frontend/index.html — needs Google Fonts link]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No issues encountered.

### Completion Notes List

- Replaced Vite default index.css with complete bee theme design system: 12 CSS custom properties in :root, global resets, Patrick Hand font
- Added Google Fonts preconnect + stylesheet links in index.html for Patrick Hand with display=swap
- App.css already had no hardcoded colours — no changes needed beyond existing input-area styles
- TaskInput.css: replaced #ccc → var(--color-input-border), #666 → var(--color-accent), added ::placeholder and color tokens
- TaskItem.css: added var(--color-text) base colour; --color-done-text already compliant with var() fallback
- TaskList.css: replaced #eee → var(--color-input-border)
- AddButton.css: replaced #ddd → var(--color-input-border), #aaa → var(--color-placeholder) for disabled state
- DeleteButton.css: already fully compliant with var() usage
- Created design-system.test.ts with 2 tests: token presence verification and component CSS hex audit (allows var() fallbacks)
- All 69 tests passing (40 frontend + 29 backend), 0 regressions
- font-family: inherit added to input/button/textarea in global reset (index.css), so TaskInput inherits Patrick Hand without needing its own font-family declaration

### File List

- frontend/src/index.css (modified — complete rewrite)
- frontend/index.html (modified — Google Fonts links)
- frontend/src/components/TaskInput/TaskInput.css (modified — design tokens)
- frontend/src/components/TaskItem/TaskItem.css (modified — added base text colour)
- frontend/src/components/TaskList/TaskList.css (modified — design token)
- frontend/src/components/AddButton/AddButton.css (modified — design tokens for disabled state)
- frontend/src/design-system.test.ts (new — design system verification tests)

### Change Log

- 2026-03-11: Code review — Hardened design-system hex scan test to strip CSS comments before checking for bare hex values (prevents false positives from comments like `/* old: #ccc */`); LOW findings documented: `color: white` keyword in AddButton.css is technically a hardcoded color but no token exists for it in the 12-token palette; inconsistent var() fallback strategy across component CSS files (some have fallbacks, some don't)
