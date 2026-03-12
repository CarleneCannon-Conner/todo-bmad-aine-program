# Story 6.2: Accessibility Audit & Remediation

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want the application to meet WCAG AA accessibility standards,
So that the app is usable regardless of ability or assistive technology.

## Acceptance Criteria

1. **Given** the existing MVP colour tokens **When** I update the 4 contrast-failing tokens **Then** `--color-placeholder` is updated to `#826B4F` (4.77:1 ratio) **And** `--color-done-text` is updated to `#7A6D5B` (4.76:1 ratio) **And** `--color-input-border` is updated to `#A08862` (3.20:1 ratio) **And** `--color-hex-stroke` is updated to `#9A8250` (3.48:1 ratio) **And** the visual warmth of the palette is preserved

2. **Given** the application is running **When** I navigate using only the keyboard **Then** Tab moves focus between TaskInput, AddButton, and TaskItems **And** Enter/Space on a TaskItem toggles the HexCheckbox **And** Delete/Backspace on a focused TaskItem triggers delete **And** all focus indicators use `:focus-visible` with amber ring (`--color-accent`, 2px solid, offset 2px) **And** no focus ring appears on mouse click

3. **Given** the application is running with a screen reader **When** I navigate the interface **Then** TaskItems have `role="checkbox"` with `aria-checked` reflecting completion state **And** TaskList has `role="list"` with `aria-live="polite"` announcing changes **And** ErrorMessages have `role="alert"` **And** TaskInput has `aria-label="Add a new task"` **And** AddButton has `aria-label="Add task"` and `disabled` attribute when inactive **And** DeleteButton has `aria-label="Delete task"` **And** HexCheckbox SVG is `aria-hidden="true"`

4. **Given** the user has `prefers-reduced-motion: reduce` enabled **When** any transition or animation occurs **Then** all `transition-duration` and `animation-duration` are `0.01s`

5. **Given** all accessibility work is complete **When** I run an automated Lighthouse or axe-core audit via Playwright **Then** zero critical WCAG AA violations are reported **And** the audit results are documented

## Tasks / Subtasks

- [ ] Task 1: Update contrast-failing CSS tokens (AC: #1)
  - [ ] In `frontend/src/index.css`, update `--color-placeholder` from `#C4A97D` to `#826B4F`
  - [ ] Update `--color-done-text` from `#B8A68E` to `#7A6D5B`
  - [ ] Update `--color-input-border` from `#E8D5B5` to `#A08862`
  - [ ] Update `--color-hex-stroke` from `#D4B87A` to `#9A8250`
  - [ ] Visually verify the palette warmth is preserved (no jarring changes)
  - [ ] Update any existing CSS design token tests in `frontend/src/design-system.test.ts` with new values

- [ ] Task 2: Add keyboard navigation to TaskItem (AC: #2)
  - [ ] Make TaskItem keyboard-focusable: add `tabIndex={0}` to the task item wrapper
  - [ ] Add `onKeyDown` handler to TaskItem: Enter/Space triggers toggle, Delete/Backspace triggers delete
  - [ ] Ensure event.preventDefault() on Space to prevent page scroll
  - [ ] Ensure Delete/Backspace key handler calls the same onDelete prop as the DeleteButton click
  - [ ] Verify Tab order: TaskInput → AddButton → TaskItem(s) (natural DOM order, no manual tabIndex > 0)

- [ ] Task 3: Add :focus-visible styling to all interactive elements (AC: #2)
  - [ ] Add global `:focus-visible` rule in `frontend/src/index.css`: `outline: 2px solid var(--color-accent); outline-offset: 2px;`
  - [ ] Add global `:focus:not(:focus-visible)` rule: `outline: none;` (suppress mouse-click rings)
  - [ ] Ensure TaskInput `:focus-visible` replaces current `:focus` styling (border-color + outline)
  - [ ] Ensure AddButton `:focus-visible` shows amber ring
  - [ ] Ensure DeleteButton `:focus-visible` shows amber ring
  - [ ] Ensure TaskItem `:focus-visible` shows amber ring around the entire item
  - [ ] Verify: mouse click on any element produces NO focus ring

- [ ] Task 4: Add ARIA attributes for screen reader support (AC: #3)
  - [ ] TaskItem: add `role="checkbox"` and `aria-checked={isCompleted}` to the focusable wrapper element
  - [ ] TaskList `<ul>`: add `aria-label="Todo list"` and `aria-live="polite"` for dynamic announcements
  - [ ] TaskInput `<input>`: add `aria-label="Add a new task"`
  - [ ] Verify AddButton already has `aria-label="Add task"` and `disabled` attribute (ALREADY EXISTS)
  - [ ] Verify DeleteButton already has `aria-label="Delete task"` (ALREADY EXISTS)
  - [ ] Verify ErrorMessage already has `role="alert"` (ALREADY EXISTS)
  - [ ] Verify HexCheckbox SVG already has `aria-hidden="true"` (ALREADY EXISTS)

- [ ] Task 5: Fix prefers-reduced-motion coverage (AC: #4)
  - [ ] Verify `frontend/src/index.css` already has `@media (prefers-reduced-motion: reduce)` with `transition-duration: 0.01s` and `animation-duration: 0.01s` (ALREADY EXISTS)
  - [ ] In `frontend/src/components/LoadingSkeleton/LoadingSkeleton.css`: ensure the `skeleton-pulse` animation respects the global reduced-motion rule (the `*` selector in index.css should cover this — verify it does, or add a specific `@media (prefers-reduced-motion: reduce)` override if needed)

- [ ] Task 6: Install axe-core and create accessibility audit test (AC: #5)
  - [ ] Install `@axe-core/playwright` as devDependency in `e2e/`: `pnpm --filter e2e add -D @axe-core/playwright`
  - [ ] Create `e2e/tests/accessibility.spec.ts` with axe-core audit
  - [ ] Test must: load the app, inject axe-core, run audit, assert zero critical/serious violations
  - [ ] Test should cover: empty state page, page with tasks (add 2-3 tasks), page with completed task
  - [ ] Document audit results in completion notes

- [ ] Task 7: Update existing component tests for new a11y attributes (AC: #2, #3)
  - [ ] Update `TaskItem.test.tsx`: test role="checkbox", aria-checked, keyboard Enter/Space toggle, keyboard Delete
  - [ ] Update `TaskList.test.tsx`: test aria-label, aria-live="polite"
  - [ ] Update `TaskInput.test.tsx`: test aria-label="Add a new task"
  - [ ] Update `design-system.test.ts`: update expected token values to new contrast-adjusted values
  - [ ] Run full test suite: `pnpm -r test` — all tests pass

- [ ] Task 8: Final verification (AC: #1, #2, #3, #4, #5)
  - [ ] `pnpm -r test` — all unit/integration tests pass
  - [ ] `pnpm --filter e2e test` — all E2E tests pass including new accessibility.spec.ts
  - [ ] Manual keyboard navigation check: Tab through all elements, Enter/Space toggle, Delete removes
  - [ ] Verify no visual regressions from contrast token changes

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Accessibility (MVP) and Cross-Cutting Concerns]

The architecture doc defines accessibility as follows:
- **MVP:** Semantic HTML as zero-cost default. Original design palette for MVP.
- **Post-MVP (this story):** WCAG 2.1 AA compliance — contrast-adjusted tokens, keyboard navigation, ARIA roles, screen reader support, `prefers-reduced-motion`.

The 4 tokens identified for contrast adjustment were pre-analysed in the architecture doc and UX spec. The replacement values preserve the warm amber/brown palette while meeting WCAG AA contrast ratios.

### Technical Implementation Details

**Contrast Token Changes:**

| Token | Current | New | Ratio | WCAG |
|-------|---------|-----|-------|------|
| `--color-placeholder` | `#C4A97D` | `#826B4F` | 4.77:1 | AA pass (4.5:1 text) |
| `--color-done-text` | `#B8A68E` | `#7A6D5B` | 4.76:1 | AA pass (4.5:1 text) |
| `--color-input-border` | `#E8D5B5` | `#A08862` | 3.20:1 | AA pass (3:1 UI) |
| `--color-hex-stroke` | `#D4B87A` | `#9A8250` | 3.48:1 | AA pass (3:1 UI) |

All ratios are against `--color-background: #FFF8EE`.

**Keyboard Navigation Pattern:**

TaskItem currently uses a `<div>` with `onClick` for toggling — this is NOT keyboard accessible. The fix:
1. Add `tabIndex={0}` to the TaskItem wrapper div
2. Add `role="checkbox"` and `aria-checked` for screen reader semantics
3. Add `onKeyDown` handler that maps Enter/Space → toggle and Delete/Backspace → delete
4. This approach keeps the existing DOM structure (div wrapping HexCheckbox SVG + text + DeleteButton) while making it keyboard-operable

**Focus-visible Strategy:**

Use global CSS rules in `index.css`:
```css
*:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
*:focus:not(:focus-visible) {
  outline: none;
}
```
Then override per-component only where needed (TaskInput already has `:focus` border styling that should change to `:focus-visible`).

**Current TaskInput `:focus` rule** (`TaskInput.css` line ~15): removes outline, changes border color. This should be refactored to use `:focus-visible` instead of `:focus` so mouse clicks don't show the focus ring but keyboard navigation does.

**ARIA Attributes — What Already Exists vs What's Needed:**

| Component | Already Has | Needs Adding |
|-----------|------------|-------------|
| AddButton | `aria-label="Add task"`, disabled | Nothing |
| DeleteButton | `aria-label="Delete task"`, disabled | Nothing |
| ErrorMessage | `role="alert"` | Nothing |
| HexCheckbox | `aria-hidden="true"` | Nothing |
| TaskInput | placeholder text | `aria-label="Add a new task"` |
| TaskList | semantic `<ul>/<li>` | `aria-label="Todo list"`, `aria-live="polite"` |
| TaskItem | onClick div | `tabIndex={0}`, `role="checkbox"`, `aria-checked`, `onKeyDown` |

**axe-core Playwright Integration:**

```typescript
import AxeBuilder from '@axe-core/playwright';

test('should have no critical accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious')).toEqual([]);
});
```

The `@axe-core/playwright` package provides the `AxeBuilder` class. Import pattern: `import AxeBuilder from '@axe-core/playwright'`.

**prefers-reduced-motion — Current State:**

`frontend/src/index.css` already has:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01s !important;
    animation-duration: 0.01s !important;
  }
}
```
This should cover LoadingSkeleton's `skeleton-pulse` animation via the `*` selector. Verify this works — if the `@keyframes` animation in `LoadingSkeleton.css` overrides the `!important` declaration, add a specific reduced-motion rule in that file.

### Previous Story Intelligence

**From Story 6.1 (immediate predecessor):**
- Added coverage tooling (`@vitest/coverage-v8`) to both frontend and backend
- Configured coverage in `vitest.config.ts` (backend) and `vite.config.ts` (frontend)
- Added `test:coverage` scripts to package.json files
- Test counts: backend 36 tests, frontend 71 tests, total 107 unit/integration tests
- E2E tests in `e2e/tests/todo-crud.spec.ts` and `e2e/tests/todo-theme.spec.ts`
- Testing patterns: `@testing-library/react`, `render`, `screen`, `fireEvent`, `waitFor`
- Frontend mock boundary: all mocking targets `todoApi` via `vi.mock()`

**From Story 5.1 (Dockerfiles):**
- Added `health.routes.ts` and `health.routes.test.ts` to backend
- Backend uses Fastify app factory pattern in `app.ts` with `app.inject()` for integration tests

### Git Intelligence

Recent commits show all epics have been built incrementally. The codebase is stable. No architectural changes expected — this story modifies existing CSS and components only.

### What NOT To Do

- Do NOT change the HTML structure of components beyond what's needed for accessibility (don't refactor TaskItem into a `<label>` or `<checkbox>` — keep the HexCheckbox SVG visual pattern)
- Do NOT add keyboard shortcuts beyond what's specified (no Ctrl+key combos, no escape-to-close)
- Do NOT change the optimistic/pessimistic mutation patterns — only add ARIA and keyboard bindings
- Do NOT add focus trapping — simple Tab order through the natural DOM flow is sufficient
- Do NOT use `tabIndex` values > 0 — only use `tabIndex={0}` for elements that need to join the natural tab order
- Do NOT add `aria-live` to anything other than TaskList — too many live regions cause screen reader noise
- Do NOT mock `@axe-core/playwright` in E2E tests — the audit must run against the real rendered page
- Do NOT change `--color-accent` or `--color-background` — only the 4 specified tokens change
- Do NOT add `eslint-plugin-jsx-a11y` or other linting tools — that's scope creep for this story

### Project Structure Notes

- Modified: `frontend/src/index.css` (4 token values + global focus-visible rules)
- Modified: `frontend/src/components/TaskItem/TaskItem.tsx` (tabIndex, role, aria-checked, onKeyDown)
- Modified: `frontend/src/components/TaskItem/TaskItem.css` (focus-visible styling)
- Modified: `frontend/src/components/TaskInput/TaskInput.tsx` (aria-label)
- Modified: `frontend/src/components/TaskInput/TaskInput.css` (:focus → :focus-visible)
- Modified: `frontend/src/components/TaskList/TaskList.tsx` (aria-label, aria-live)
- Modified: `frontend/src/components/TaskItem/TaskItem.test.tsx` (keyboard + ARIA tests)
- Modified: `frontend/src/components/TaskList/TaskList.test.tsx` (aria-label, aria-live tests)
- Modified: `frontend/src/components/TaskInput/TaskInput.test.tsx` (aria-label test)
- Modified: `frontend/src/design-system.test.ts` (updated token values)
- Modified: `e2e/package.json` (add @axe-core/playwright)
- New: `e2e/tests/accessibility.spec.ts` (axe-core audit test)
- No new source components — all changes are to existing files

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.2 — Accessibility Audit & Remediation]
- [Source: _bmad-output/planning-artifacts/prd.md#Accessibility — WCAG AA, zero critical violations]
- [Source: _bmad-output/planning-artifacts/prd.md#FR37 — Accessibility audit passes with zero critical WCAG AA violations]
- [Source: _bmad-output/planning-artifacts/architecture.md#Accessibility (MVP) — semantic HTML, deferred WCAG tokens]
- [Source: _bmad-output/planning-artifacts/architecture.md#Cross-Cutting Concerns — design token system, 12 CSS custom properties]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Accessibility — WCAG AA token values, keyboard nav, ARIA]
- [Source: _bmad-output/implementation-artifacts/6-1-test-coverage-analysis-and-improvement.md — test patterns, current test counts]
- [Source: frontend/src/index.css — current design tokens, prefers-reduced-motion rule]
- [Source: frontend/src/components/TaskItem/TaskItem.tsx — current onClick div structure]
- [Source: frontend/src/components/HexCheckbox/HexCheckbox.tsx — SVG with aria-hidden]
- [Source: project-context.md — training Step 4 quality assurance requirements]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
