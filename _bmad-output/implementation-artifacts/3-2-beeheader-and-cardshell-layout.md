# Story 3.2: BeeHeader & CardShell Layout

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to see the friendly bee mascot and a polished layout that adapts to my device,
so that the app feels like a complete product on both my phone and desktop.

## Acceptance Criteria

1. **Given** the app is loaded **When** I view the top of the page **Then** a static bee SVG is displayed prominently **And** "my todos" title is shown below the bee in Patrick Hand font

2. **Given** I am on a mobile device (< 768px) **When** I view the app **Then** the layout is full-bleed with no card treatment, no border-radius, no shadow

3. **Given** I am on a desktop or tablet (>= 768px) **When** I view the app **Then** the content is displayed in a 560px centered card with `border-radius: 20px` **And** the card has shadow `0 4px 24px rgba(61, 46, 31, 0.18), 0 1px 4px rgba(61, 46, 31, 0.10)` **And** the outer background is Honey Oak (`--color-desktop-bg`)

4. **Given** the CSS implementation **When** I inspect the responsive approach **Then** base styles are mobile-first (full-bleed) **And** a single `@media (min-width: 768px)` breakpoint adds the card layout

5. **Given** the layout components are complete **When** I run `pnpm --filter frontend test` **Then** `BeeHeader.test.tsx` passes with tests covering: renders bee SVG, renders "my todos" title **And** `CardShell.test.tsx` passes with tests covering: renders children content

## Tasks / Subtasks

- [x] Task 1: Copy bee SVG to frontend assets (AC: #1)
  - [x] Copy `assets/bumble-bee.svg` to `frontend/public/bumble-bee.svg` (served statically)
  - [x] Clean up SVG: remove Inkscape/Sodipodi metadata, keep essential paths only
  - [x] Set reasonable display size (e.g., width 80-120px, centered)
- [x] Task 2: Create `BeeHeader` component (AC: #1, #5)
  - [x] Create `frontend/src/components/BeeHeader/` with `index.ts`, `BeeHeader.tsx`, `BeeHeader.css`, `BeeHeader.test.tsx`
  - [x] Render bee SVG prominently (as `<img>`)
  - [x] Render `<h1>my todos</h1>` below the bee
  - [x] Style: centered, `color: var(--color-text)`, Patrick Hand font (inherited from body)
  - [x] No interactive behaviour — purely decorative
  - [x] Bee SVG: `aria-hidden="true"` (decorative image)
- [x] Task 3: Create `CardShell` component (AC: #2, #3, #4, #5)
  - [x] Create `frontend/src/components/CardShell/` with `index.ts`, `CardShell.tsx`, `CardShell.css`, `CardShell.test.tsx`
  - [x] Props: `children: React.ReactNode`
  - [x] Render a `<main>` wrapper that contains children
  - [x] Mobile-first base styles: full-bleed, `background: var(--color-background)`, no border-radius, no shadow
  - [x] Desktop media query: `@media (min-width: 768px)` adds card treatment
- [x] Task 4: Style CardShell responsive layout (AC: #2, #3, #4)
  - [x] Mobile base: `min-height: 100vh`, `padding: 1rem`, `background: var(--color-background)`
  - [x] Desktop `@media (min-width: 768px)`:
    - [x] `max-width: 560px`
    - [x] `margin: 2rem auto`
    - [x] `border-radius: 20px`
    - [x] `box-shadow: 0 4px 24px rgba(61, 46, 31, 0.18), 0 1px 4px rgba(61, 46, 31, 0.10)`
    - [x] `min-height: auto` (card doesn't fill viewport)
  - [x] Body/html background: `var(--color-desktop-bg)` on desktop via media query in index.css
- [x] Task 5: Update `App.tsx` to use BeeHeader and CardShell (AC: #1, #2, #3)
  - [x] Import and render `BeeHeader` at top
  - [x] Wrap all content inside `CardShell`
  - [x] Remove old `.app` max-width/margin styles from `App.css` (CardShell handles layout now)
  - [x] Structure: `<CardShell><BeeHeader /><input-area/><TaskList .../></CardShell>`
- [x] Task 6: Handle desktop background colour (AC: #3)
  - [x] On desktop (>= 768px), the outer page background should be `var(--color-desktop-bg)` (Honey Oak)
  - [x] On mobile (< 768px), page background is `var(--color-background)` (cream)
  - [x] Approach: media query on `body` in `index.css` to switch background
- [x] Task 7: Create `BeeHeader.test.tsx` (AC: #5)
  - [x] Test: renders bee image/SVG element
  - [x] Test: renders "my todos" heading text
- [x] Task 8: Create `CardShell.test.tsx` (AC: #5)
  - [x] Test: renders children content passed to it
- [x] Task 9: Clean up old App.css layout styles
  - [x] Remove `.app` max-width, margin, padding (replaced by CardShell)
  - [x] Remove `.app h1` styles (replaced by BeeHeader)
- [x] Task 10: Verify all existing tests still pass (regression check)

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Frontend Architecture, Component Boundaries]

**Component structure (MUST follow):**
- Folder-per-component: `BeeHeader/index.ts`, `BeeHeader.tsx`, `BeeHeader.css`, `BeeHeader.test.tsx`
- Same for `CardShell/`
- Barrel export: `export { BeeHeader } from './BeeHeader'`
- Import via barrel: `import { BeeHeader } from './components/BeeHeader'`

**Component hierarchy (from architecture):**
```
App
  └── CardShell
        ├── BeeHeader
        ├── TaskInput + AddButton (input area)
        └── TaskList
              └── TaskItem (× N)
```

**Semantic HTML (from architecture + UX spec):**
- `CardShell` renders as `<main>` element
- `BeeHeader` renders `<h1>` for the title
- Bee SVG is decorative: `aria-hidden="true"` or `role="img"` with alt text

### Bee SVG Asset

The bee SVG exists at `assets/bumble-bee.svg`. It's an Inkscape-generated SVG with metadata.

**Recommended approach: Copy cleaned SVG to `frontend/public/`**
- Remove `<sodipodi:namedview>`, `<metadata>`, Inkscape namespaces
- Keep only essential `<g>` and `<path>` elements
- Result is a clean, small SVG served as static asset
- Reference via `<img src="/bumble-bee.svg" alt="" aria-hidden="true" />`

**Alternative: Inline SVG in BeeHeader** — avoids extra HTTP request, allows CSS styling of paths. Choose based on SVG complexity.

**Display size:** The SVG viewBox is `0 0 717.02 726.74` (roughly square). Display at ~80-120px width, centered above the title.

### Responsive Layout Details

**Mobile-first CSS (base styles = mobile):**
```css
.card-shell {
  background: var(--color-background);
  min-height: 100vh;
  padding: 1rem 1rem 2rem;
}
```

**Desktop card treatment (768px+):**
```css
@media (min-width: 768px) {
  body {
    background: var(--color-desktop-bg);
  }

  .card-shell {
    max-width: 560px;
    margin: 2rem auto;
    border-radius: 20px;
    box-shadow: 0 4px 24px rgba(61, 46, 31, 0.18),
                0 1px 4px rgba(61, 46, 31, 0.10);
    min-height: auto;
    padding: 1.5rem 2rem 2rem;
  }
}
```

**Key:** The desktop outer background (Honey Oak) goes on `body`, while the card itself keeps the cream background. On mobile, body background stays cream (set by Story 3.1 in `index.css`). The media query in `index.css` (or CardShell.css) overrides body background to Honey Oak on desktop.

### BeeHeader Styling

```css
.bee-header {
  text-align: center;
  margin-bottom: 1rem;
}

.bee-header img {
  width: 100px;
  height: auto;
  display: block;
  margin: 0 auto 0.5rem;
}

.bee-header h1 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--color-text);
  font-weight: 400; /* Patrick Hand only has 400 */
}
```

**Title text:** "my todos" (lowercase, friendly tone — from UX spec)

### App.tsx After This Story

```tsx
import { BeeHeader } from './components/BeeHeader'
import { CardShell } from './components/CardShell'
import { TaskInput } from './components/TaskInput'
import { TaskList } from './components/TaskList'
import { useTodos } from './hooks/useTodos'

function App() {
  const { todos, createTodo, toggleTodo, togglingIds /*, deleteTodo, deletingIds */ } = useTodos()

  return (
    <CardShell>
      <BeeHeader />
      <TaskInput onSubmit={createTodo} />
      <TaskList todos={todos} onToggle={toggleTodo} togglingIds={togglingIds} />
    </CardShell>
  )
}
```

### Testing Patterns

**BeeHeader test:**
```typescript
import { render, screen } from '@testing-library/react';
import { BeeHeader } from './BeeHeader';

it('renders bee image', () => {
  render(<BeeHeader />);
  // If using <img>:
  expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  // OR check for img element with src containing 'bee'
});

it('renders "my todos" title', () => {
  render(<BeeHeader />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('my todos');
});
```

**CardShell test:**
```typescript
import { render, screen } from '@testing-library/react';
import { CardShell } from './CardShell';

it('renders children content', () => {
  render(<CardShell><p>Test content</p></CardShell>);
  expect(screen.getByText('Test content')).toBeInTheDocument();
});
```

### Project Structure Notes

- All changes are in `frontend/` — no backend changes
- New folders: `BeeHeader/`, `CardShell/` (folder-per-component)
- New asset: `frontend/public/bumble-bee.svg` (cleaned copy)
- Files modified: `App.tsx` (wrap in CardShell, add BeeHeader), `App.css` (remove old layout), possibly `index.css` (desktop body background media query)
- Old `.app` styles in `App.css` replaced by CardShell

### What NOT To Do

- Do NOT animate the bee — MVP is static only
- Do NOT add HexCheckbox or styled task items — that's Story 3.3
- Do NOT add loading skeleton — that's Story 3.4
- Do NOT add multiple breakpoints — single `768px` breakpoint only
- Do NOT add `prefers-reduced-motion` — that's Story 3.3
- Do NOT make the bee interactive or clickable
- Do NOT add a navigation bar or footer
- Do NOT change the Vite favicon from `vite.svg` — that's cosmetic and not in scope
- Do NOT use `position: fixed` or `position: sticky` for the header — it scrolls with content

### Previous Story Intelligence

**From Story 3.1 (Design System & Bee Theme):**
- `index.css` now has all 12 CSS custom properties in `:root`
- Body has `background-color: var(--color-background)` and `color: var(--color-text)`
- Patrick Hand font loaded via Google Fonts `<link>` in `index.html`
- `font-family: 'Patrick Hand', cursive, sans-serif` on body
- All component CSS files updated to use `var()` instead of hardcoded colours

**From current App.tsx:**
- Uses `useTodos()` hook returning `todos, createTodo, toggleTodo, togglingIds`
- Has `<div className="app">` wrapper with max-width/margin — this gets replaced by CardShell
- Title is `<h1>Todo App</h1>` — this gets replaced by BeeHeader's `<h1>my todos</h1>`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure — BeeHeader, CardShell components]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Boundaries]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#BeeHeader — h1 with decorative bee SVG]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#CardShell — CSS layout wrapper, 560px, 768px breakpoint]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive Layout — mobile full-bleed, desktop card]
- [Source: assets/bumble-bee.svg — bee SVG asset (Openclipart, public domain)]
- [Source: frontend/src/App.tsx — current component wiring to replace]
- [Source: frontend/src/App.css — old layout styles to remove]
- [Source: _bmad-output/implementation-artifacts/3-1-design-system-and-bee-theme.md — design token foundation]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

No issues encountered.

### Completion Notes List

- Cleaned bee SVG: removed all Inkscape/Sodipodi metadata, namespaces, `<metadata>`, `<sodipodi:namedview>` — kept essential `<g>` and `<path>` elements
- BeeHeader: `<header>` with `<img>` (100px width, centered, `aria-hidden="true"`) and `<h1>my todos</h1>` (font-weight 400 for Patrick Hand)
- CardShell: `<main>` wrapper with mobile-first CSS — full-bleed on mobile, 560px centered card with border-radius 20px and shadow on desktop (768px+)
- Desktop body background switched to `var(--color-desktop-bg)` via `@media (min-width: 768px)` in index.css
- App.tsx refactored: removed `<div className="app">` wrapper and `<h1>Todo App</h1>`, replaced with `<CardShell>` wrapping `<BeeHeader />` + input area + `<TaskList />`
- App.css cleaned: removed `.app` and `.app h1` rules, kept `.input-area` styles
- Tests: 2 BeeHeader tests (bee image, heading), 2 CardShell tests (children, main element)
- All 78 tests passing (49 frontend + 29 backend), 0 regressions

### File List

- frontend/public/bumble-bee.svg (new — cleaned SVG asset)
- frontend/src/components/BeeHeader/BeeHeader.tsx (new)
- frontend/src/components/BeeHeader/BeeHeader.css (new)
- frontend/src/components/BeeHeader/BeeHeader.test.tsx (new)
- frontend/src/components/BeeHeader/index.ts (new)
- frontend/src/components/CardShell/CardShell.tsx (new)
- frontend/src/components/CardShell/CardShell.css (new)
- frontend/src/components/CardShell/CardShell.test.tsx (new)
- frontend/src/components/CardShell/index.ts (new)
- frontend/src/App.tsx (modified — CardShell + BeeHeader integration)
- frontend/src/App.css (modified — removed old layout styles)
- frontend/src/index.css (modified — desktop body background media query)

### Change Log

- 2026-03-11: Code review — Removed redundant `aria-hidden="true"` from bee img (empty `alt=""` is sufficient for decorative images per WCAG); replaced fragile `querySelector('img[src*="bee"]')` test selector with role-based `getByRole('presentation')` for robustness
