# Story 4.2: Inline Error Display & Retry

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to see what went wrong right where it happened, keep working, and retry easily,
so that errors never block me or leave me confused.

## Acceptance Criteria

1. **Given** I submit a new task and the backend fails **When** the error response is received **Then** an inline error message appears below the input field: "Couldn't add task. Try again." **And** the input retains my entered text and focus so I can press Enter to retry immediately **And** the error uses `role="alert"` for screen reader announcement **And** the error clears when my next create succeeds

2. **Given** I toggle a task and the backend fails **When** the error response is received **Then** the task's visual state reverts smoothly to its prior state (0.15s transition) **And** an inline error message appears below the task item: "Couldn't update task. Try again." **And** clicking the task again retries the toggle **And** the error clears when the next toggle on that item succeeds

3. **Given** I delete a task and the backend fails **When** the error response is received **Then** the task reappears in its original position in the list **And** an inline error message appears below the task item: "Couldn't delete task. Try again." **And** clicking the delete control again retries the deletion **And** the error clears when the next delete on that item succeeds

4. **Given** an error is displayed on one task **When** I interact with other tasks **Then** all other tasks remain fully interactive — errors on one item never block the rest

5. **Given** an error is displayed **When** no dismiss action is taken **Then** the error persists until the next successful action on that item — no timers, no dismiss buttons

6. **Given** the inline error features are complete **When** I run `pnpm --filter frontend test` **Then** `ErrorMessage.test.tsx` passes with tests covering: renders error text, has `role="alert"` attribute **And** `TaskItem.test.tsx` includes tests for: displays error message on failed toggle, reverts visual state on toggle failure, displays error message on failed delete, task reappears on delete failure **And** `TaskInput.test.tsx` includes tests for: displays error message on failed create, retains input text and focus on create failure, error clears on next successful create

7. **Given** Epic 4 is complete and both servers are running **When** I run `pnpm --filter e2e test` **Then** at least 5 Playwright E2E tests pass (cumulative across all epics) including: error message displays when backend is unavailable and user can retry successfully

## Tasks / Subtasks

- [x] Task 1: Create `ErrorMessage` component (AC: #1, #2, #3, #6)
  - [x] Create `frontend/src/components/ErrorMessage/` with `index.ts`, `ErrorMessage.tsx`, `ErrorMessage.css`, `ErrorMessage.test.tsx`
  - [x] Barrel export: `export { ErrorMessage } from './ErrorMessage'`
  - [x] Props: `message: string`
  - [x] Render `<p role="alert" className="error-message">{message}</p>`
  - [x] Style: `color: var(--color-error)`, `font-size: 0.85rem`, `margin: 0.25rem 0 0`, no background
- [x] Task 2: Add per-item error state to `useTodos` hook (AC: #1, #2, #3, #4, #5)
  - [x] Add `itemErrors` state: `Map<string, string>` — key is todo ID (or `'create'` for input errors), value is error message
  - [x] On `toggleTodo` failure: catch error, set `itemErrors` for that todo ID with "Couldn't update task. Try again."
  - [x] On `deleteTodo` failure: catch error, set `itemErrors` for that todo ID with "Couldn't delete task. Try again."
  - [x] On `createTodo` failure: catch error, set `itemErrors` for `'create'` key with "Couldn't add task. Try again." **and re-throw** so App.tsx knows to keep input text
  - [x] On successful toggle/delete/create: clear the corresponding error from `itemErrors`
  - [x] Return `itemErrors` and `clearError` (or handle clearing internally on next success)
- [x] Task 3: Display create error below input (AC: #1, #5)
  - [x] In `App.tsx`: get `createError` from `useTodos()` (or from `itemErrors.get('create')`)
  - [x] Render `<ErrorMessage message={createError} />` below the input area when error exists
  - [x] On create failure: input retains text (already works — `catch` block doesn't clear text)
  - [x] On create failure: keep focus on input for immediate Enter retry
  - [x] On successful create: error clears automatically (hook clears `'create'` from `itemErrors`)
- [x] Task 4: Display toggle/delete errors below task items (AC: #2, #3, #4, #5)
  - [x] In `TaskItem`: accept `error?: string` prop
  - [x] Render `<ErrorMessage message={error} />` below the task item content when error exists
  - [x] In `TaskList`: pass `error={itemErrors.get(todo.id)}` to each `<TaskItem>`
  - [x] Errors are per-item — other items remain fully interactive
  - [x] On successful toggle/delete: error clears for that item
- [x] Task 5: Ensure toggle rollback works smoothly (AC: #2)
  - [x] SWR `rollbackOnError: true` already reverts optimistic toggle — verify this still works
  - [x] After rollback, error message appears below the item
  - [x] Item remains clickable for retry — clicking toggles again as retry
- [x] Task 6: Ensure delete rollback works (AC: #3)
  - [x] SWR `rollbackOnError: true` already restores deleted task — verify this still works
  - [x] After rollback, error message appears below the restored item
  - [x] Delete button remains functional for retry
- [x] Task 7: Create `ErrorMessage.test.tsx` (AC: #6)
  - [x] Test: renders error text passed as `message` prop
  - [x] Test: has `role="alert"` attribute
  - [x] Test: does not render when no message (or renders null)
- [x] Task 8: Update `TaskItem.test.tsx` with error tests (AC: #6)
  - [x] Test: displays error message when `error` prop is provided
  - [x] Test: does not display error message when `error` prop is undefined
  - [x] Test: task item remains clickable (for retry) when error is displayed
- [x] Task 9: Update `TaskInput` area tests for create errors (AC: #6)
  - [x] Test: error message displays below input when create fails
  - [x] Test: input retains text on create failure
  - [x] Test: error clears on next successful create
- [x] Task 10: Add E2E test for error display and retry (AC: #7)
  - [x] Use Playwright route interception to simulate backend failure
  - [x] Test: error message appears when backend returns error
  - [x] Test: user can retry and succeed after error
  - [x] Ensure cumulative E2E count reaches at least 5
- [x] Task 11: Verify all existing tests still pass (regression check)

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Frontend API Boundary, Process Patterns]

**Error handling pattern (MUST follow):**
- Inline below affected item, per-action error state: `{ id: string, action: 'create' | 'toggle' | 'delete', message: string }`
- Errors clear on next successful action against that item
- SWR `mutate()` handles optimistic rollback

**Frontend API boundary:**
- `todoApi.ts` unwraps `ApiResponse<T>` — returns `.data` on success, throws on error
- `useTodos` hook catches these errors and manages error state
- Components receive error state via props — no direct API calls in components

**Component hierarchy:**
```
App
  └── CardShell
        ├── BeeHeader
        ├── TaskInput + AddButton + ErrorMessage (create error)
        └── TaskList
              └── TaskItem (× N)
                    ├── HexCheckbox
                    ├── .task-item-text
                    ├── DeleteButton
                    └── ErrorMessage (toggle/delete error)
```

### ErrorMessage Component Design

```tsx
// ErrorMessage.tsx
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <p className="error-message" role="alert">
      {message}
    </p>
  );
}
```

```css
/* ErrorMessage.css */
.error-message {
  color: var(--color-error);
  font-size: 0.85rem;
  margin: 0.25rem 0 0;
  line-height: 1.3;
}
```

### Error State Management in useTodos

**Key design: per-item error Map**

```typescript
// In useTodos.ts
const [itemErrors, setItemErrors] = useState<Map<string, string>>(new Map());

const clearError = (key: string) => {
  setItemErrors(prev => {
    const next = new Map(prev);
    next.delete(key);
    return next;
  });
};

const setError = (key: string, message: string) => {
  setItemErrors(prev => new Map(prev).set(key, message));
};

// In createTodo:
const createTodo = async (text: string) => {
  try {
    await apiCreateTodo(text);
    mutate();
    clearError('create'); // Clear create error on success
  } catch (err) {
    setError('create', "Couldn't add task. Try again.");
    throw err; // Re-throw so App.tsx knows to keep input text
  }
};

// In toggleTodo:
const toggleTodo = async (id: string) => {
  // ... existing optimistic mutate logic ...
  try {
    await mutate(/* ... existing ... */);
    clearError(id); // Clear error on success
  } catch (err) {
    setError(id, "Couldn't update task. Try again.");
  } finally {
    // ... existing togglingIds cleanup ...
  }
};

// In deleteTodo:
const deleteTodo = async (id: string) => {
  // ... existing optimistic mutate logic ...
  try {
    await mutate(/* ... existing ... */);
    clearError(id); // Clear error on success
  } catch (err) {
    setError(id, "Couldn't delete task. Try again.");
  } finally {
    // ... existing deletingIds cleanup ...
  }
};

return {
  // ... existing returns ...
  itemErrors,
};
```

### Error Message Text (from UX spec)

**Exact wording — calm, factual tone:**
- Create failure: `"Couldn't add task. Try again."`
- Toggle failure: `"Couldn't update task. Try again."`
- Delete failure: `"Couldn't delete task. Try again."`

Pattern: `"Couldn't [verb] task. Try again."` — consistent phrasing across all error types.

**Error colour:** `--color-error: #D32F2F` (standard red, not theme-derived — clarity wins over palette harmony)

### App.tsx Updates for Create Error

```tsx
function App() {
  const { todos, isLoading, createTodo, toggleTodo, deleteTodo, togglingIds, deletingIds, itemErrors } = useTodos()
  const [inputText, setInputText] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const createError = itemErrors.get('create');

  const handleSubmit = async () => {
    const trimmed = inputText.trim()
    if (!trimmed || isCreating) return
    setIsCreating(true)
    try {
      await createTodo(trimmed)
      setInputText('')  // Only clear on success
    } catch {
      // Input keeps text for retry — error is set in useTodos
      // Focus stays on input (input is already focused from typing)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="app">
      {/* ... BeeHeader, CardShell ... */}
      <div className="input-area">
        <TaskInput value={inputText} onChange={setInputText} onSubmit={handleSubmit} />
        <AddButton onClick={handleSubmit} disabled={!hasValidInput || isCreating} />
      </div>
      {createError && <ErrorMessage message={createError} />}
      <TaskList
        todos={todos}
        isLoading={isLoading}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        togglingIds={togglingIds}
        deletingIds={deletingIds}
        itemErrors={itemErrors}
      />
    </div>
  )
}
```

### TaskList Updates

```tsx
interface TaskListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  togglingIds: Set<string>;
  deletingIds: Set<string>;
  isLoading: boolean;
  itemErrors: Map<string, string>;
}

// In the render, pass error to TaskItem:
<TaskItem
  todo={todo}
  onToggle={onToggle}
  onDelete={onDelete}
  isToggling={togglingIds.has(todo.id)}
  isDeleting={deletingIds.has(todo.id)}
  error={itemErrors.get(todo.id)}
/>
```

### TaskItem Updates

```tsx
interface TaskItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
  isDeleting: boolean;
  error?: string;
}

export function TaskItem({ todo, onToggle, onDelete, isToggling, isDeleting, error }: TaskItemProps) {
  // ... existing className logic ...

  return (
    <div className={className} onClick={handleClick}>
      <HexCheckbox checked={todo.isCompleted} />
      <span className="task-item-text">{todo.text}</span>
      <DeleteButton onDelete={() => onDelete(todo.id)} disabled={isDeleting || isToggling} />
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
```

**Note:** The ErrorMessage renders inside the task item div. It should be styled to appear below the main content row. Consider wrapping the hex+text+delete in a flex row, and the error below:

```tsx
return (
  <div className={className}>
    <div className="task-item-row" onClick={handleClick}>
      <HexCheckbox checked={todo.isCompleted} />
      <span className="task-item-text">{todo.text}</span>
      <DeleteButton onDelete={() => onDelete(todo.id)} disabled={isDeleting || isToggling} />
    </div>
    {error && <ErrorMessage message={error} />}
  </div>
);
```

This may require a small CSS adjustment to `task-item` — making it a flex column, with the row as a nested flex row.

### Retry Pattern

**Toggle retry:** User clicks the task again → `onToggle(id)` fires → `useTodos.toggleTodo(id)` → on success, `clearError(id)` removes the error message. The task item remains fully clickable even when an error is displayed.

**Delete retry:** User clicks the delete button again → `onDelete(id)` fires → `useTodos.deleteTodo(id)` → on success, error clears and task is removed.

**Create retry:** User presses Enter again → `handleSubmit()` fires → `useTodos.createTodo(text)` → on success, `clearError('create')` removes the error, input clears.

**No separate retry buttons needed.** The same user gesture that triggered the original action is the retry mechanism.

### E2E Test for Error and Retry

```typescript
test('error message displays when backend fails and user can retry', async ({ page }) => {
  await page.goto('/');

  // Add a task first (this will succeed)
  const todoText = `Error test ${Date.now()}`;
  const input = page.getByPlaceholder('add a task...');
  await input.fill(todoText);
  await input.press('Enter');
  await expect(page.getByText(todoText)).toBeVisible();

  // Intercept the next toggle request to simulate failure
  await page.route('**/api/todos/*', async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
        }),
      });
    } else {
      await route.continue();
    }
  });

  // Toggle the task — should fail
  await page.getByText(todoText).click();

  // Error message should appear
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByText(/Couldn't update task/)).toBeVisible();

  // Remove the interception so retry succeeds
  await page.unroute('**/api/todos/*');

  // Retry — click the task again
  await page.getByText(todoText).click();

  // Error should clear on success
  await expect(page.getByText(/Couldn't update task/)).not.toBeVisible({ timeout: 5000 });
});
```

### Testing Patterns

**ErrorMessage test:**
```typescript
import { render, screen } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

it('renders error text', () => {
  render(<ErrorMessage message="Couldn't add task. Try again." />);
  expect(screen.getByText("Couldn't add task. Try again.")).toBeInTheDocument();
});

it('has role="alert" for accessibility', () => {
  render(<ErrorMessage message="Error" />);
  expect(screen.getByRole('alert')).toBeInTheDocument();
});
```

**TaskItem error test:**
```typescript
it('displays error message when error prop is provided', () => {
  render(
    <TaskItem {...defaultProps} error="Couldn't update task. Try again." />
  );
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.getByText("Couldn't update task. Try again.")).toBeInTheDocument();
});

it('does not display error message when no error', () => {
  render(<TaskItem {...defaultProps} />);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('remains clickable for retry when error is displayed', () => {
  const onToggle = vi.fn();
  render(
    <TaskItem {...defaultProps} onToggle={onToggle} error="Couldn't update task. Try again." />
  );
  fireEvent.click(screen.getByText('Test task'));
  expect(onToggle).toHaveBeenCalledWith('1');
});
```

### Current Code State

**What already exists:**
- `App.tsx` has `handleSubmit` with try/catch that keeps input text on failure
- `useTodos` has `toggleTodo` and `deleteTodo` with SWR `rollbackOnError: true`
- `todoApi.ts` throws `Error(json.error.message)` on failed responses
- `--color-error: #D32F2F` design token defined in `:root` (from Story 3.1)

**What this story adds:**
- New `ErrorMessage` component (folder-per-component pattern)
- Error state management (`itemErrors` Map) in `useTodos`
- Error display in `App.tsx` (create errors) and `TaskItem` (toggle/delete errors)
- Error prop threading through `TaskList` → `TaskItem`
- Comprehensive error tests + 1 new E2E test

### Project Structure Notes

- All frontend changes — no backend changes (backend structured errors done in Story 4.1)
- New folder: `ErrorMessage/` (folder-per-component)
- Files modified: `useTodos.ts` (error state), `App.tsx` (create error display), `TaskList.tsx` (pass error props), `TaskItem.tsx` (render error), `TaskItem.css` (layout adjustment for error below row)
- Tests: new `ErrorMessage.test.tsx`, updated `TaskItem.test.tsx`, updated `App.tsx`/`TaskInput` area tests
- E2E: updated `e2e/tests/todo-crud.spec.ts` with error + retry test

### What NOT To Do

- Do NOT add dismiss buttons on errors — errors clear only on next successful action
- Do NOT add error timers/auto-dismiss — errors persist until success
- Do NOT add toast/snackbar notifications — errors are inline only
- Do NOT add a global error banner — errors are per-item, per-action
- Do NOT add retry buttons — the same action gesture IS the retry
- Do NOT add error codes in the UI — only show the human-readable message
- Do NOT change the backend error handling — that's Story 4.1 (already done/in progress)
- Do NOT add offline detection or sync queues — post-MVP concern
- Do NOT add error logging to the frontend — just display the message
- Do NOT style errors with the bee theme — use `--color-error` (#D32F2F), standard red
- Do NOT add error animations beyond the existing 0.15s transitions
- Do NOT make ErrorMessage a complex component — it's just a styled `<p>` with `role="alert"`

### Previous Story Intelligence

**From Story 4.1 (Backend Structured Error Responses):**
- Backend returns structured `ApiResponse<T>` envelope for all errors
- Error codes: `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `INTERNAL_ERROR` (500)
- Error handler moved to app-level in `app.ts`
- `setNotFoundHandler` returns `ApiResponse<T>` for unknown routes

**From Story 2.2 (Toggle Task Completion):**
- Toggle uses SWR `mutate()` with `rollbackOnError: true` and `optimisticData`
- `togglingIds` Set tracks in-flight toggle requests per item
- Rollback automatically reverts visual state on failure

**From Story 2.3 (Delete Task):**
- Delete uses SWR `mutate()` with `rollbackOnError: true` and `optimisticData`
- `deletingIds` Set tracks in-flight delete requests per item
- Rollback automatically restores deleted task on failure

**From Story 2.4 (AddButton & Input Validation):**
- `TaskInput` is now a controlled component (value/onChange lifted to App)
- `App.tsx` manages `inputText` state and `isCreating` loading state
- `handleSubmit` catch block keeps input text on failure (already implemented)
- `AddButton` disables during `isCreating`

**From Story 3.3 (HexCheckbox & Styled Task Items):**
- TaskItem layout: HexCheckbox | text (flex: 1) | DeleteButton
- `prefers-reduced-motion` blanket override in `index.css`
- Transition timing: 0.15s ease for state changes

**Current useTodos hook gaps:**
- Toggle/delete `catch` blocks currently do nothing except clean up loading IDs
- No error state is tracked — errors are silently swallowed after rollback
- `createTodo` re-throws to App.tsx but no error message is set

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns — Error handling]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend API Boundary]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#ErrorMessage component]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Flow 3 — Error Handling]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Error Feedback patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Error text: "Couldn't [verb] task. Try again."]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Errors are exceptions to the theme — use standard red]
- [Source: frontend/src/hooks/useTodos.ts — current hook with silent error handling]
- [Source: frontend/src/components/TaskItem/TaskItem.tsx — current component, needs error prop]
- [Source: frontend/src/components/TaskInput/TaskInput.tsx — controlled component]
- [Source: frontend/src/App.tsx — current App with handleSubmit try/catch]
- [Source: frontend/src/api/todoApi.ts — throws Error on failure]
- [Source: _bmad-output/implementation-artifacts/4-1-backend-structured-error-responses.md — backend error contract]
- [Source: _bmad-output/implementation-artifacts/2-2-toggle-task-completion.md — optimistic toggle pattern]
- [Source: _bmad-output/implementation-artifacts/2-3-delete-task.md — optimistic delete pattern]
- [Source: _bmad-output/implementation-artifacts/2-4-addbutton-and-input-validation.md — controlled input, AddButton]
- [Source: e2e/tests/todo-crud.spec.ts — current 5 E2E tests]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Created ErrorMessage component: `<p role="alert">` with `--color-error` styling
- Added `itemErrors` Map to useTodos hook for per-item error state management
- Create errors: set on failure with "Couldn't add task. Try again.", clear on success, re-throw for App.tsx
- Toggle errors: set on failure with "Couldn't update task. Try again.", clear on success, SWR rollback reverts visual state
- Delete errors: set on failure with "Couldn't delete task. Try again.", clear on success, SWR rollback restores task
- Updated App.tsx to display create error below input area
- Updated TaskItem to use `.task-item-row` wrapper with error below via ErrorMessage
- Updated TaskList to thread `itemErrors` Map to TaskItem as `error` prop
- Retry is the same user gesture — no separate retry buttons needed
- Added 2 ErrorMessage tests, 3 TaskItem error tests, 1 E2E error+retry test
- Fixed App.test.tsx and TaskList.test.tsx mocks to include `itemErrors`
- All 101 tests pass (67 frontend + 34 backend), zero regressions

### Change Log

- **Code Review Fix (2026-03-12):** Added 3 missing create error tests to App.test.tsx (error display, text retention, error clearing); added forwardRef to TaskInput and inputRef.focus() in App.tsx catch block for focus restoration after AddButton-triggered failure; moved cursor:pointer from .task-item to .task-item-row so error area doesn't show misleading pointer; added var() fallback to ErrorMessage.css; added itemErrors unit test to useTodos.test.ts.

### File List

- frontend/src/components/ErrorMessage/index.ts (new)
- frontend/src/components/ErrorMessage/ErrorMessage.tsx (new)
- frontend/src/components/ErrorMessage/ErrorMessage.css (new)
- frontend/src/components/ErrorMessage/ErrorMessage.test.tsx (new)
- frontend/src/hooks/useTodos.ts (modified — added itemErrors state, error handling in create/toggle/delete)
- frontend/src/App.tsx (modified — display create error, pass itemErrors to TaskList)
- frontend/src/components/TaskList/TaskList.tsx (modified — accept and pass itemErrors)
- frontend/src/components/TaskList/TaskList.test.tsx (modified — added itemErrors to defaultProps)
- frontend/src/components/TaskItem/TaskItem.tsx (modified — added error prop, task-item-row wrapper, ErrorMessage)
- frontend/src/components/TaskItem/TaskItem.css (modified — task-item-row layout, error spacing)
- frontend/src/components/TaskItem/TaskItem.test.tsx (modified — added 3 error tests)
- frontend/src/App.test.tsx (modified — added itemErrors to mock)
- e2e/tests/todo-crud.spec.ts (modified — added error+retry E2E test)
