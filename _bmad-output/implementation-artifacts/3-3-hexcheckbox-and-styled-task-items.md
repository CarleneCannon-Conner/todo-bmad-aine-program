# Story 3.3: HexCheckbox & Styled Task Items

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want honeycomb-shaped checkboxes and polished task styling,
so that interacting with my tasks feels distinctive and satisfying.

## Acceptance Criteria

1. **Given** a task is displayed **When** I view the completion control **Then** it renders as an SVG honeycomb hexagon (not a standard checkbox)

2. **Given** a task is incomplete **When** I view the hex checkbox **Then** it shows pale fill (`--color-hex-idle`) with muted stroke (`--color-hex-stroke`)

3. **Given** a task is complete **When** I view the hex checkbox **Then** it shows solid amber fill (`--color-accent`) with a white checkmark **And** the task text has strikethrough and uses `--color-done-text`

4. **Given** I hover over a task item **When** the hover state activates **Then** the task background shifts to `--color-hover` **And** the delete button becomes visible (opacity transition 0.15s)

5. **Given** the delete button **When** no hover or focus is on the task **Then** the delete button is hidden (opacity: 0)

6. **Given** any state change (hex toggle, hover, delete visibility) **When** the transition occurs **Then** state changes use 0.15s ease timing **And** delete slide-out uses 0.2s ease timing (opacity + translateX)

7. **Given** the user has `prefers-reduced-motion: reduce` enabled **When** any transition occurs **Then** all `transition-duration` and `animation-duration` are set to `0.01s`

8. **Given** the styled components are complete **When** I run `pnpm --filter frontend test` **Then** `HexCheckbox.test.tsx` passes with tests covering: renders SVG hexagon, idle state has correct fill, completed state shows checkmark and accent fill **And** `TaskItem.test.tsx` includes tests for: completed task shows strikethrough and `--color-done-text`

## Tasks / Subtasks

- [ ] Task 1: Create `HexCheckbox` component (AC: #1, #2, #3, #8)
  - [ ] Create `frontend/src/components/HexCheckbox/` with `index.ts`, `HexCheckbox.tsx`, `HexCheckbox.css`, `HexCheckbox.test.tsx`
  - [ ] Props: `checked: boolean`
  - [ ] Render an inline SVG hexagon (6-sided polygon)
  - [ ] Idle state: `fill: var(--color-hex-idle)`, `stroke: var(--color-hex-stroke)`, `stroke-width: 1.5`
  - [ ] Checked state: `fill: var(--color-accent)`, white checkmark polyline/path inside
  - [ ] `aria-hidden="true"` — decorative element (toggle handled by parent TaskItem click)
  - [ ] Size: approximately 24-28px for the hex, fixed and consistent
  - [ ] `transition: fill 0.15s ease, stroke 0.15s ease` on the polygon
- [ ] Task 2: Style HexCheckbox SVG (AC: #1, #2, #3)
  - [ ] SVG hexagon polygon points for a regular hexagon shape
  - [ ] Checkmark: white polyline or path, visible only when checked
  - [ ] Checked polygon: `fill: var(--color-accent)`, `stroke: var(--color-accent)`
  - [ ] Smooth transition between idle and checked fill states
- [ ] Task 3: Integrate HexCheckbox into TaskItem (AC: #1, #2, #3)
  - [ ] Import and render `HexCheckbox` as first child in the task item row
  - [ ] Pass `checked={todo.isCompleted}` prop
  - [ ] Layout: HexCheckbox (fixed size) | text (flex: 1) | DeleteButton (fixed size)
  - [ ] HexCheckbox must not shrink: `flex-shrink: 0`
- [ ] Task 4: Style task item hover state (AC: #4)
  - [ ] `.task-item:hover`: `background: var(--color-hover)`
  - [ ] Add `border-radius: 8px` on hover for soft edges (or always applied)
  - [ ] `transition: background 0.15s ease` on `.task-item`
  - [ ] Add padding to `.task-item` for hover background visibility
- [ ] Task 5: Style delete button hide/reveal on hover (AC: #4, #5)
  - [ ] Default: `.delete-button` has `opacity: 0` (hidden)
  - [ ] On task hover: `.task-item:hover .delete-button, .task-item:focus-within .delete-button` → `opacity: 0.6`
  - [ ] On delete button hover: `.delete-button:hover` → `opacity: 1`
  - [ ] Transition: `opacity 0.15s ease` (already exists on DeleteButton)
  - [ ] On touch devices: delete button becomes visible via sticky `:hover` after tap
- [ ] Task 6: Add delete slide-out animation (AC: #6)
  - [ ] When `.task-item--deleting` is applied: `opacity: 0`, `transform: translateX(20px)`, `transition: opacity 0.2s ease, transform 0.2s ease`
  - [ ] This replaces the current simple `opacity: 0.5` deleting style
- [ ] Task 7: Add `prefers-reduced-motion` support (AC: #7)
  - [ ] Add to `index.css` (global):
    ```css
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        transition-duration: 0.01s !important;
        animation-duration: 0.01s !important;
      }
    }
    ```
  - [ ] This is a blanket override — all transitions become effectively instant
- [ ] Task 8: Create `HexCheckbox.test.tsx` (AC: #8)
  - [ ] Test: renders SVG element with hexagon polygon
  - [ ] Test: unchecked state — polygon has idle fill class/attribute
  - [ ] Test: checked state — shows checkmark element and accent fill
- [ ] Task 9: Update `TaskItem.test.tsx` with visual styling tests (AC: #8)
  - [ ] Test: completed task shows strikethrough and `--color-done-text` (may already exist from Story 2.2)
  - [ ] Test: renders HexCheckbox component
  - [ ] Test: HexCheckbox shows checked state when todo is completed
- [ ] Task 10: Verify all existing tests still pass (regression check)

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Frontend Architecture, Component Boundaries]

**Component structure (MUST follow):**
- `HexCheckbox/index.ts`, `HexCheckbox.tsx`, `HexCheckbox.css`, `HexCheckbox.test.tsx`
- Barrel export: `export { HexCheckbox } from './HexCheckbox'`

**Component hierarchy after this story:**
```
TaskItem (div, clickable for toggle)
  ├── HexCheckbox (SVG, aria-hidden, decorative)
  ├── .task-item-text (span, flex: 1)
  └── DeleteButton (button, hidden until hover/focus)
```

### HexCheckbox SVG Design

**Regular hexagon polygon (flat-top orientation):**
```svg
<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
  <polygon
    points="14,2 25.5,8.5 25.5,19.5 14,26 2.5,19.5 2.5,8.5"
    class="hex-polygon"
  />
  {/* Checkmark — only visible when checked */}
  <polyline
    points="8,14 12,18 20,10"
    class="hex-checkmark"
    fill="none"
    stroke="white"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
```

**CSS for HexCheckbox:**
```css
.hex-checkbox {
  flex-shrink: 0;
  display: block;
}

.hex-polygon {
  fill: var(--color-hex-idle);
  stroke: var(--color-hex-stroke);
  stroke-width: 1.5;
  transition: fill 0.15s ease, stroke 0.15s ease;
}

.hex-checkbox--checked .hex-polygon {
  fill: var(--color-accent);
  stroke: var(--color-accent);
}

.hex-checkmark {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.hex-checkbox--checked .hex-checkmark {
  opacity: 1;
}
```

### TaskItem Layout After This Story

```tsx
<div className={className} onClick={handleClick}>
  <HexCheckbox checked={todo.isCompleted} />
  <span className="task-item-text">{todo.text}</span>
  <DeleteButton onDelete={() => onDelete(todo.id)} disabled={isDeleting || isToggling} />
</div>
```

### Delete Button Hide/Reveal Pattern

**Current state:** DeleteButton is always visible with opacity 0.6. This story changes it to hidden by default, revealed on hover/focus.

**Updated DeleteButton.css:**
```css
.delete-button {
  /* ... existing styles ... */
  opacity: 0;  /* Hidden by default (changed from 0.6) */
  transition: opacity 0.15s ease;
}

/* Revealed on task hover or focus-within */
.task-item:hover .delete-button,
.task-item:focus-within .delete-button {
  opacity: 0.6;
}

.delete-button:hover:not(:disabled) {
  opacity: 1;
}
```

**Touch device consideration:** On mobile, `:hover` is sticky after tap — the delete button becomes visible when the user taps the task row (which also toggles). The user can then tap the delete button as a follow-up action. This is acceptable for MVP.

### Delete Slide-Out Animation

**Replace current `.task-item--deleting` with animated version:**
```css
.task-item--deleting {
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  pointer-events: none;
}
```

**Note:** The 0.2s timing is for spatial movement (delete slide-out). All other transitions use 0.15s (state changes).

### Transition Timing Rules

From UX spec — only two timing values:
| Animation | Duration | Easing |
|-----------|----------|--------|
| Hex state change | 0.15s | ease |
| Task hover background | 0.15s | ease |
| DeleteButton opacity | 0.15s | ease |
| Rollback (failed action) | 0.15s | ease |
| Delete slide-out | 0.2s | ease |

### prefers-reduced-motion

**Blanket override in `index.css`:**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01s !important;
    animation-duration: 0.01s !important;
  }
}
```

This makes all state changes appear instant while preserving the visual state changes themselves. Single rule, zero maintenance.

### CSS Design Tokens Used

All tokens from Story 3.1 that become active in this story:
- `--color-hex-idle: #FFF5E5` — unchecked hex fill
- `--color-hex-stroke: #D4B87A` — unchecked hex border
- `--color-hex-focus: #FFE8B8` — focused hex fill (post-MVP keyboard nav)
- `--color-accent: #F5A623` — checked hex fill + stroke
- `--color-hover: #FFF0D6` — task row hover background
- `--color-done-text: #B8A68E` — completed task text (already active)

### Testing Patterns

**HexCheckbox test:**
```typescript
import { render } from '@testing-library/react';
import { HexCheckbox } from './HexCheckbox';

it('renders SVG with hexagon polygon', () => {
  const { container } = render(<HexCheckbox checked={false} />);
  expect(container.querySelector('svg')).toBeInTheDocument();
  expect(container.querySelector('polygon')).toBeInTheDocument();
});

it('unchecked state has idle fill class', () => {
  const { container } = render(<HexCheckbox checked={false} />);
  expect(container.querySelector('.hex-checkbox--checked')).toBeNull();
});

it('checked state shows checkmark and accent fill', () => {
  const { container } = render(<HexCheckbox checked={true} />);
  expect(container.querySelector('.hex-checkbox--checked')).toBeTruthy();
  expect(container.querySelector('.hex-checkmark')).toBeInTheDocument();
});
```

### Project Structure Notes

- All changes are in `frontend/src/` — no backend changes
- New folder: `HexCheckbox/` (folder-per-component)
- Files modified: `TaskItem.tsx` (add HexCheckbox), `TaskItem.css` (hover styles, delete animation), `DeleteButton.css` (hide/reveal), `index.css` (prefers-reduced-motion)
- Tests: new `HexCheckbox.test.tsx`, updated `TaskItem.test.tsx`

### What NOT To Do

- Do NOT make HexCheckbox interactive (clickable/focusable) — the parent TaskItem row handles the click
- Do NOT add `role="checkbox"` or `aria-checked` to HexCheckbox — it's `aria-hidden="true"` (decorative)
- Do NOT add keyboard navigation (Tab, Enter/Space on individual items) — that's post-MVP WCAG
- Do NOT use `--color-hex-focus` token actively — it's for post-MVP keyboard focus states
- Do NOT add ErrorMessage styling — that's Story 4.2
- Do NOT add loading skeleton styling — that's Story 3.4
- Do NOT install any animation library (framer-motion, etc.) — plain CSS transitions only
- Do NOT add swipe-to-delete — that's post-MVP
- Do NOT change the HexCheckbox SVG to use an external .svg file — inline SVG for CSS control
- Do NOT add sound or haptic feedback — web MVP only

### Previous Story Intelligence

**From Story 3.1 (Design System):**
- All 12 CSS tokens defined in `:root` in `index.css`
- Patrick Hand font loaded and applied globally
- All component CSS updated to use `var()` — no hardcoded hex values

**From Story 3.2 (BeeHeader & CardShell):**
- `CardShell` handles responsive layout (full-bleed mobile, 560px card desktop)
- `BeeHeader` renders bee SVG + "my todos" title
- `App.tsx` wraps content in `<CardShell>`

**From Stories 2.2/2.3 (Toggle & Delete):**
- `TaskItem.tsx` has `onToggle`, `onDelete`, `isToggling`, `isDeleting` props
- `TaskItem.css` has `.task-item--completed`, `.task-item--toggling`, `.task-item--deleting` classes
- `DeleteButton` exists with `e.stopPropagation()`, `aria-label="Delete task"`
- Delete button currently always visible at `opacity: 0.6` — this story hides it by default
- `.task-item--deleting` currently uses simple `opacity: 0.5` — this story upgrades to slide-out

**Current TaskItem structure (no HexCheckbox yet):**
```tsx
<div className={className} onClick={handleClick}>
  <span className="task-item-text">{todo.text}</span>
  <DeleteButton ... />
</div>
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture — Component structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#HexCheckbox — SVG honeycomb toggle]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#TaskItem — states: default, focused, done]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#DeleteButton — hidden until hover/focus]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Transition Timing — 0.15s/0.2s]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#prefers-reduced-motion blanket rule]
- [Source: frontend/src/components/TaskItem/TaskItem.tsx — current component]
- [Source: frontend/src/components/TaskItem/TaskItem.css — current styles]
- [Source: frontend/src/components/DeleteButton/DeleteButton.tsx — current component]
- [Source: frontend/src/components/DeleteButton/DeleteButton.css — current styles]
- [Source: _bmad-output/implementation-artifacts/3-1-design-system-and-bee-theme.md — design tokens]
- [Source: _bmad-output/implementation-artifacts/3-2-beeheader-and-cardshell-layout.md — layout context]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
