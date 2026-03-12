# Bug: No margin above first task list item (below input)

Status: done

## Story

As a **user**,
I want consistent spacing between the task input field and the first task in the list,
so that the interface doesn't feel visually cramped.

## Bug Description

**Observed:** The first task list item sits directly below the task input with no vertical spacing between them.

**Expected:** There should be a top margin on the task list (`.task-list`) to provide visual breathing room between the input and the first item.

**Root Cause:** `.task-list` has `margin: 0` in `TaskList.css`, which was set during initial scaffolding and never updated to include top spacing.

## Acceptance Criteria

1. **Given** the task list renders with items **When** I view the list **Then** there is visible spacing between the input field and the first task item

2. **Given** the fix is applied **When** I run `pnpm --filter frontend test` **Then** all existing tests pass with zero regressions

## Tasks / Subtasks

- [x] Task 1: Add margin-top to `.task-list` in TaskList.css (AC: #1)
- [x] Task 2: Verify no regressions (AC: #2)
  - [x] Run `pnpm --filter frontend test` — all tests pass

## Dev Notes

### Fix Location

Single file change: `frontend/src/components/TaskList/TaskList.css`

Add `margin-top` to the existing `.task-list` rule.

### What NOT To Do

- Do NOT add margin/padding to the parent container or TaskInput — keep separation at the list level
- Do NOT change TaskItem component or its CSS

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

None — single-file CSS fix, no debugging required.

### Completion Notes List

- Changed `.task-list` margin from `0` to `16px 0 0` — adds 16px top spacing between input area and task list
- 16px aligns with UX spec spacing rhythm (8px base unit, section spacing at 16px or 24px)
- All 71 frontend tests pass with zero regressions (14 test files)

### Change Log

- 2026-03-12: Bug fix — added margin-top: 16px to .task-list for spacing between input and first task item

### File List

- `frontend/src/components/TaskList/TaskList.css` (modified)
