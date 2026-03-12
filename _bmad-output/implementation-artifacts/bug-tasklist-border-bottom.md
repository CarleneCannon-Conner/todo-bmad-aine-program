# Bug: TaskList border-bottom does not match UX design spec

Status: done

## Story

As a **user**,
I want the task list to match the designed visual style with spacing-based separation instead of border dividers,
so that the interface looks clean and consistent with the bee theme UX specification.

## Bug Description

**Observed:** `.task-list-item` has `border-bottom: 1px solid var(--color-input-border)` creating visible horizontal divider lines between tasks.

**Expected:** No border dividers. Tasks should be separated by vertical spacing (`margin-bottom: 6px`) with hover background for visual definition, per the UX design spec.

**Root Cause:** The `border-bottom` was carried over from the pre-theme CSS (Story 1.3) and was not removed during Story 3.1 (Design System & Bee Theme) when component styles were migrated to design tokens. The border was tokenized (`var(--color-input-border)`) instead of being removed entirely.

**UX Spec Reference:** The HTML design mockup (`ux-design-directions.html`) specifies `margin-bottom: 6px` between task items, `border-radius: 8px` for hover backgrounds, and no border properties. The UX Design Specification document describes task item separation through spacing rhythm (8px gaps) — not dividers.

## Acceptance Criteria

1. **Given** the task list renders with items **When** I view the list **Then** there are no visible border dividers between task items **And** items are separated by vertical spacing only

2. **Given** the fix is applied **When** I run `pnpm --filter frontend test` **Then** all existing tests pass with zero regressions

## Tasks / Subtasks

- [x] Task 1: Replace border-bottom with margin-bottom in TaskList.css (AC: #1)
  - [x] Remove `border-bottom: 1px solid var(--color-input-border)` from `.task-list-item`
  - [x] Remove `padding: 0.5rem 0` from `.task-list-item` (padding handled by TaskItem itself)
  - [x] Add `margin-bottom: 6px` to `.task-list-item` per UX design spec
- [x] Task 2: Verify no regressions (AC: #2)
  - [x] Run `pnpm --filter frontend test` — all tests pass

## Dev Notes

### Fix Location

Single file change: `frontend/src/components/TaskList/TaskList.css`

**Before:**
```css
.task-list-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-input-border);
}
```

**After:**
```css
.task-list-item {
  margin-bottom: 6px;
}
```

### What NOT To Do

- Do NOT add any new separator mechanism (no HR, no pseudo-elements)
- Do NOT change TaskItem component or its CSS — separation is handled at the list level
- Do NOT add alternating backgrounds or zebra striping

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md — TaskItem states, spacing rhythm]
- [Source: ux-design-directions.html — `.dir-a2 .task-item { margin-bottom: 6px }`, no border properties]
- [Source: frontend/src/components/TaskList/TaskList.css — bug location]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

None — single-file CSS fix, no debugging required.

### Completion Notes List

- Replaced `border-bottom: 1px solid var(--color-input-border)` and `padding: 0.5rem 0` with `margin-bottom: 6px` on `.task-list-item`
- Fix aligns TaskList with UX design spec (spacing-based separation, no border dividers)
- All 71 frontend tests pass with zero regressions (14 test files)

### Change Log

- 2026-03-12: Bug fix — removed border-bottom dividers from task list items, replaced with margin-based spacing per UX spec
- 2026-03-12: Code review fix — added `.task-list-item:last-child { margin-bottom: 0 }` to remove trailing margin

### File List

- `frontend/src/components/TaskList/TaskList.css` (modified)
