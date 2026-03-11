# Story 2.3: Delete Task

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to delete tasks I no longer need,
so that my list stays relevant and tidy.

## Acceptance Criteria

1. **Given** a task is displayed in the list **When** I click the delete control on that task **Then** the task is removed from the list immediately (optimistic) **And** no confirmation dialog is shown

2. **Given** a task was optimistically removed **When** the backend confirms the deletion **Then** the task remains removed

3. **Given** a task was optimistically removed **When** the backend fails to delete **Then** the task reappears in its original position in the list

4. **Given** a delete request is in-flight for a specific task **When** I try to interact with that same task **Then** the task's actions are disabled **And** all other tasks remain fully interactive

5. **Given** a task with long text **When** I view the task in the list **Then** the text wraps gracefully without breaking layout **And** the completion control and delete control remain visible and accessible

6. **Given** the delete feature is complete **When** I run `pnpm --filter frontend test` **Then** `TaskItem.test.tsx` includes tests for: clicking delete removes task optimistically, delete action is disabled during in-flight request **And** `DeleteButton.test.tsx` includes tests for: renders delete control, fires callback on click

## Tasks / Subtasks

- [x] Task 1: Add `deleteTodo` to `todoApi.ts` (AC: #1, #2, #3)
  - [x] Add `deleteTodo(id: string): Promise<{ id: string }>` function
  - [x] Uses `DELETE /api/todos/${id}` with no body
  - [x] Follows existing `handleResponse<T>` pattern
- [x] Task 2: Add `deleteTodo` to `useTodos.ts` with optimistic update (AC: #1, #2, #3, #4)
  - [x] Add `deleteTodo(id: string)` function to the hook's return value
  - [x] Implement optimistic update: call `mutate()` with optimistic data that filters out the deleted todo
  - [x] On failure: SWR rolls back — task reappears in original position (`rollbackOnError: true`)
  - [x] Track per-item in-flight state for delete disable (share `deletingIds` Set, same pattern as `togglingIds` from Story 2.2)
  - [x] Add `deletingIds` to hook return value
- [x] Task 3: Create `DeleteButton` component (AC: #1, #6)
  - [x] Create `frontend/src/components/DeleteButton/` folder with `index.ts`, `DeleteButton.tsx`, `DeleteButton.css`, `DeleteButton.test.tsx`
  - [x] Props: `onDelete: () => void`, `disabled?: boolean`
  - [x] Render a `<button>` with `×` or similar delete indicator
  - [x] `aria-label="Delete task"` for accessibility
  - [x] Prevent event bubbling (`e.stopPropagation()`) so clicking delete doesn't trigger toggle
  - [x] Disabled state when `disabled` prop is true
- [x] Task 4: Integrate DeleteButton into `TaskItem.tsx` (AC: #1, #4, #5)
  - [x] Add `onDelete` and `isDeleting` props to `TaskItemProps`
  - [x] Render `DeleteButton` inside the task item row
  - [x] Pass `disabled={isDeleting || isToggling}` to DeleteButton (disable during any in-flight action)
  - [x] Layout: task text + delete button in a row — text fills available space, delete button fixed width
  - [x] Disable entire task item actions when `isDeleting` is true
- [x] Task 5: Update `TaskItem.css` for layout and long text wrapping (AC: #5)
  - [x] Task item row: `display: flex; align-items: center; gap: 0.5rem`
  - [x] `.task-item-text`: `flex: 1; min-width: 0; word-break: break-word` for graceful long text wrapping
  - [x] Delete button: fixed size, never shrinks (`flex-shrink: 0`)
  - [x] `.task-item--deleting`: `opacity: 0.5; pointer-events: none` (visual disabled state)
- [x] Task 6: Wire delete through `TaskList.tsx` and `App.tsx` (AC: #1, #4)
  - [x] `App.tsx` passes `deleteTodo` and `deletingIds` from `useTodos()` down to `TaskList`
  - [x] `TaskList` passes `onDelete` and per-item `isDeleting` to each `TaskItem`
  - [x] `isDeleting` computed from `deletingIds.has(todo.id)`
- [x] Task 7: Add `deleteTodo` tests to `todoApi.test.ts` (AC: #6)
  - [x] Test: calls DELETE `/api/todos/${id}` and returns unwrapped data
  - [x] Test: throws on error response
- [x] Task 8: Create `DeleteButton.test.tsx` (AC: #6)
  - [x] Test: renders delete control (button element)
  - [x] Test: fires `onDelete` callback on click
  - [x] Test: does not fire callback when disabled
- [x] Task 9: Add delete tests to `TaskItem.test.tsx` (AC: #6)
  - [x] Test: clicking delete button calls onDelete with todo id
  - [x] Test: delete action is disabled when `isDeleting` is true
  - [x] Test: long text wraps without breaking layout (snapshot or class assertion)
- [x] Task 10: Update `useTodos.test.ts` with delete tests
  - [x] Test: deleteTodo calls apiDeleteTodo and triggers mutate
  - [x] Test: optimistic update removes todo from list before API resolves
- [x] Task 11: Verify all existing tests still pass (regression check)

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Frontend API Boundary, Process Patterns]

**Mutation strategy for delete: OPTIMISTIC**
- Remove task from UI immediately on click (filter out from SWR cache)
- If backend confirms → task stays removed, SWR revalidates
- If backend fails → SWR rolls back, task reappears in original position
- No confirmation dialog (Carlene's explicit preference — PRD + UX spec)

**Frontend API boundary (MUST follow):**
- All API calls go through `todoApi.ts` — no direct `fetch` in components or hooks
- `todoApi.ts` unwraps `ApiResponse<T>` — returns `.data` on success, throws on error
- SWR hooks consume `todoApi` functions
- All mocking in tests targets `todoApi` — single mock boundary

**Per-item loading state (FR28):**
- Delete disables on the specific item while its request is in-flight
- Toggle also disabled on that item during delete (and vice versa)
- Other items remain fully interactive

**Component structure (MUST follow):**
- Folder-per-component: `DeleteButton/index.ts`, `DeleteButton.tsx`, `DeleteButton.css`, `DeleteButton.test.tsx`
- Barrel export: `export { DeleteButton } from './DeleteButton'`
- Import via barrel: `import { DeleteButton } from '../components/DeleteButton'`

### Existing Code Patterns to Follow

**todoApi.ts — add `deleteTodo`:**
```typescript
export async function deleteTodo(id: string): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ id: string }>(res);
}
```

**SWR optimistic delete pattern** (for `useTodos.ts`):
```typescript
const deleteTodo = async (id: string) => {
  setDeletingIds(prev => new Set(prev).add(id));

  try {
    await mutate(
      async () => {
        await apiDeleteTodo(id);
        return fetchTodos(); // revalidate
      },
      {
        optimisticData: data?.filter(t => t.id !== id),
        rollbackOnError: true,
        revalidate: false,
      }
    );
  } finally {
    setDeletingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }
};
```

**DeleteButton component pattern:**
```typescript
import './DeleteButton.css';

interface DeleteButtonProps {
  onDelete: () => void;
  disabled?: boolean;
}

export function DeleteButton({ onDelete, disabled }: DeleteButtonProps) {
  return (
    <button
      className="delete-button"
      onClick={(e) => {
        e.stopPropagation(); // Don't trigger task row toggle
        onDelete();
      }}
      disabled={disabled}
      aria-label="Delete task"
    >
      ×
    </button>
  );
}
```

**CRITICAL: `e.stopPropagation()`** — The delete button sits inside the task item row which is clickable for toggle (from Story 2.2). Without `stopPropagation()`, clicking delete would also trigger toggle.

### TaskItem Layout After This Story

```tsx
<div className={`task-item ${completedClass} ${deletingClass}`} onClick={handleToggle}>
  <span className="task-item-text">{todo.text}</span>
  <DeleteButton onDelete={() => onDelete(todo.id)} disabled={isDeleting || isToggling} />
</div>
```

**CSS layout:**
```css
.task-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.task-item-text {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.delete-button {
  flex-shrink: 0;
}
```

### Props After This Story

**TaskItem props** (cumulative from Stories 2.2 + 2.3):
```typescript
interface TaskItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
  isDeleting: boolean;
}
```

**TaskList props:**
```typescript
interface TaskListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  togglingIds: Set<string>;
  deletingIds: Set<string>;
}
```

**useTodos return value** (after this story):
```typescript
{
  todos, isLoading, error,
  createTodo, toggleTodo, deleteTodo,
  togglingIds, deletingIds
}
```

### Backend API Contract

**Source:** [Story 2.1 — Backend Toggle & Delete Endpoints]

- `DELETE /api/todos/:id` → `200 { success: true, data: { id } }`
- Missing ID → `404 { success: false, error: { code: "NOT_FOUND", message: "..." } }`
- No request body needed for DELETE

### Dependency on Stories 2.1 and 2.2

- **Story 2.1** provides the backend `DELETE /api/todos/:id` endpoint
- **Story 2.2** provides the toggle infrastructure in `TaskItem` (click handler, props pattern, `isToggling` state) that this story extends with delete

### Testing Patterns

**DeleteButton test pattern:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteButton } from './DeleteButton';

it('renders delete control', () => {
  render(<DeleteButton onDelete={vi.fn()} />);
  expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
});

it('fires onDelete on click', () => {
  const onDelete = vi.fn();
  render(<DeleteButton onDelete={onDelete} />);
  fireEvent.click(screen.getByRole('button', { name: /delete/i }));
  expect(onDelete).toHaveBeenCalledOnce();
});

it('does not fire when disabled', () => {
  const onDelete = vi.fn();
  render(<DeleteButton onDelete={onDelete} disabled />);
  fireEvent.click(screen.getByRole('button', { name: /delete/i }));
  expect(onDelete).not.toHaveBeenCalled();
});
```

**todoApi delete test pattern:**
```typescript
describe('deleteTodo', () => {
  it('calls DELETE /api/todos/:id and returns unwrapped data', async () => {
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { id: '1' } }),
    });
    const result = await deleteTodo('1');
    expect(mockFetch).toHaveBeenCalledWith('/api/todos/1', { method: 'DELETE' });
    expect(result).toEqual({ id: '1' });
  });
});
```

### Project Structure Notes

- All changes are in `frontend/src/` — **no backend changes in this story**
- Files modified: `todoApi.ts`, `useTodos.ts`, `TaskItem.tsx`, `TaskItem.css`, `TaskList.tsx`, `App.tsx`
- New folder created: `frontend/src/components/DeleteButton/` with `index.ts`, `DeleteButton.tsx`, `DeleteButton.css`, `DeleteButton.test.tsx`
- Test files modified: `todoApi.test.ts`, `useTodos.test.ts`, `TaskItem.test.tsx` (created in Story 2.2)

### What NOT To Do

- Do NOT add a confirmation dialog on delete — Carlene's explicit preference
- Do NOT implement the delete slide-out animation (0.2s translateX) — that's Story 3.3 visual polish
- Do NOT add hover-reveal for delete button (hidden by default, visible on hover) — that's Story 3.3
- Do NOT add ErrorMessage inline display for failed deletes — that's Story 4.2
- Do NOT add AddButton component — that's Story 2.4
- Do NOT modify backend code — all changes are frontend only
- Do NOT use hardcoded colour values — use CSS custom properties
- Do NOT create a separate state management layer — SWR + optimistic mutate is the architecture choice
- Do NOT add `prefers-reduced-motion` — that's Story 3.3
- Do NOT implement swipe-to-delete — that's post-MVP

### Previous Story Intelligence

**From Story 2.2 (Toggle Task Completion) — patterns established:**
- `todoApi.ts` now has `toggleTodo(id, isCompleted)` using PATCH
- `useTodos.ts` has optimistic mutate pattern with `rollbackOnError: true`
- `useTodos.ts` tracks per-item in-flight via `useState<Set<string>>` for `togglingIds`
- `TaskItem.tsx` has `onToggle`, `isToggling` props and click handler on row
- `TaskItem.css` has `.task-item--completed` and `.task-item--toggling` classes
- `TaskList.tsx` threads `onToggle` and `togglingIds` through to TaskItem
- `App.tsx` passes `toggleTodo` and `togglingIds` from `useTodos()`
- `TaskItem.test.tsx` exists with toggle tests — extend with delete tests

**From Story 2.1 (Backend Toggle & Delete):**
- DELETE endpoint returns `{ success: true, data: { id } }` — note: data is `{ id }` not full Todo
- `handleResponse<{ id: string }>` is the correct return type for delete

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend API Boundary]
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns — Mutation strategy (delete: optimistic)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns — Loading states (FR28)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Boundaries]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Task deletion: no confirmation dialog]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Optimistic Feedback — delete]
- [Source: frontend/src/api/todoApi.ts — existing API pattern]
- [Source: frontend/src/hooks/useTodos.ts — existing SWR hook with toggle pattern]
- [Source: frontend/src/components/TaskItem/TaskItem.tsx — current component (post Story 2.2)]
- [Source: _bmad-output/implementation-artifacts/2-1-backend-toggle-and-delete-endpoints.md — backend DELETE contract]
- [Source: _bmad-output/implementation-artifacts/2-2-toggle-task-completion.md — frontend toggle patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

None — all tests passed on first run.

### Completion Notes List

- Added `deleteTodo` to `todoApi.ts` using DELETE endpoint with `handleResponse<T>` pattern
- Implemented optimistic delete in `useTodos.ts` with SWR `mutate()`, `rollbackOnError: true`, and per-item in-flight tracking via `deletingIds` Set
- Created `DeleteButton` component with `aria-label`, `e.stopPropagation()` to prevent toggle trigger, and disabled state
- Integrated DeleteButton into TaskItem with `onDelete`/`isDeleting` props; disables both toggle and delete during any in-flight action
- Updated TaskItem CSS with flex layout for text + delete button, `word-break: break-word` for long text, and `.task-item--deleting` disabled state
- Wired delete through `TaskList.tsx` (passes per-item `isDeleting`) and `App.tsx` (destructures `deleteTodo`/`deletingIds` from `useTodos()`)
- Added 2 API tests (deleteTodo DELETE call + error throw)
- Added 3 DeleteButton tests (renders, fires callback, disabled state)
- Added 3 TaskItem tests (delete click, deleting disabled state, long text wrapping)
- Added 2 hook tests (deleteTodo calls API, optimistic removes from list)
- All 56 tests pass (27 frontend + 29 backend), zero regressions

### File List

- frontend/src/api/todoApi.ts (modified — added deleteTodo function)
- frontend/src/hooks/useTodos.ts (modified — added deleteTodo with optimistic update, deletingIds state)
- frontend/src/components/DeleteButton/DeleteButton.tsx (new)
- frontend/src/components/DeleteButton/DeleteButton.css (new)
- frontend/src/components/DeleteButton/DeleteButton.test.tsx (new)
- frontend/src/components/DeleteButton/index.ts (new)
- frontend/src/components/TaskItem/TaskItem.tsx (modified — added onDelete/isDeleting props, DeleteButton integration)
- frontend/src/components/TaskItem/TaskItem.css (modified — flex layout, text wrapping, deleting state)
- frontend/src/components/TaskList/TaskList.tsx (modified — added onDelete/deletingIds props)
- frontend/src/App.tsx (modified — wired deleteTodo/deletingIds from useTodos)
- frontend/src/api/todoApi.test.ts (modified — added deleteTodo test suite)
- frontend/src/components/TaskItem/TaskItem.test.tsx (modified — added delete and long text tests)
- frontend/src/hooks/useTodos.test.ts (modified — added delete test suite)
