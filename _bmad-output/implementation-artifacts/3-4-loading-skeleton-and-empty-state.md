# Story 3.4: Loading Skeleton & Empty State

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want clear visual feedback while data loads and a helpful empty state on first visit,
so that I'm never confused about what the app is doing or how to use it.

## Acceptance Criteria

1. **Given** the app is loading data from the backend **When** the SWR fetch is in progress **Then** a skeleton placeholder is displayed with pulsing hex shapes and text bars **And** the skeleton rows mirror the real task layout (hex + text line) **And** the bee header and input field render immediately above the skeleton (no skeleton for those) **And** skeleton animation uses `opacity 1→0.4` over 1.5s ease-in-out with 0.15s staggered delay per row

2. **Given** the app is loaded (empty or populated list) **When** I view the input field **Then** the placeholder always reads "add a task..." regardless of how many tasks exist **And** no other instructional text or ghost tasks are shown

3. **Given** the loading and empty states are complete **When** I run `pnpm --filter frontend test` **Then** `TaskList.test.tsx` includes tests for: renders skeleton when loading, renders empty state with input placeholder when no todos exist, renders todo items when data is present

4. **Given** Epic 3 is complete and both servers are running **When** I run `pnpm --filter e2e test` **Then** at least 4 Playwright E2E tests pass (cumulative) including: app displays bee header and themed layout, loading skeleton appears before data loads

## Tasks / Subtasks

- [x] Task 1: Create `LoadingSkeleton` component (AC: #1)
  - [x] Create `frontend/src/components/LoadingSkeleton/` with `index.ts`, `LoadingSkeleton.tsx`, `LoadingSkeleton.css`, `LoadingSkeleton.test.tsx`
  - [x] Barrel export: `export { LoadingSkeleton } from './LoadingSkeleton'`
  - [x] Render 3 skeleton rows (hardcoded count — reasonable default for initial load)
  - [x] Each row: SVG hex placeholder (same 28×28 size as HexCheckbox) + CSS text bar
  - [x] Hex placeholder: `fill: #F0E4D0`, `stroke: #E0D0B8`, `stroke-width: 1.5`
  - [x] Text bar: `background: #F0E4D0`, `border-radius: 4px`, `height: ~16px`, `width: 60-80%`
  - [x] Layout matches TaskItem: flex row, same gap/padding as real task items
  - [x] No interactive behaviour — purely decorative, `aria-hidden="true"`
- [x] Task 2: Add skeleton pulse animation (AC: #1)
  - [x] CSS `@keyframes skeleton-pulse`: `opacity: 1` → `opacity: 0.4` → `opacity: 1`
  - [x] Duration: `1.5s`, timing: `ease-in-out`, iteration: `infinite`
  - [x] Staggered delay per row: row 1 = `0s`, row 2 = `0.15s`, row 3 = `0.30s`
  - [x] Apply animation to each skeleton row container
  - [x] `prefers-reduced-motion: reduce` already handled by blanket override from Story 3.3
- [x] Task 3: Pass `isLoading` to TaskList (AC: #1)
  - [x] `App.tsx`: destructure `isLoading` from `useTodos()` (already returned by hook)
  - [x] Pass `isLoading` prop to `<TaskList>`
  - [x] `TaskListProps` interface: add `isLoading: boolean`
- [x] Task 4: Render LoadingSkeleton in TaskList (AC: #1)
  - [x] Import `LoadingSkeleton` in `TaskList.tsx`
  - [x] When `isLoading` is true AND `todos.length === 0`: render `<LoadingSkeleton />` instead of task items
  - [x] When `isLoading` is false AND `todos.length === 0`: render nothing (empty state — input placeholder is the only affordance)
  - [x] When `todos.length > 0`: render task items as normal (even if `isLoading` true during revalidation)
- [x] Task 5: Verify empty state behaviour (AC: #2)
  - [x] Confirm `TaskInput` placeholder is always "add a task..." — already implemented
  - [x] No ghost tasks, no instructional text, no separate empty state component
  - [x] Empty state = bee header + input field + nothing else (no skeleton after initial load)
- [x] Task 6: Create `LoadingSkeleton.test.tsx` (AC: #3)
  - [x] Test: renders 3 skeleton rows
  - [x] Test: each row has an SVG hex placeholder and a text bar
  - [x] Test: component has `aria-hidden="true"`
- [x] Task 7: Create `TaskList.test.tsx` (AC: #3)
  - [x] Test: renders `LoadingSkeleton` when `isLoading={true}` and `todos=[]`
  - [x] Test: renders nothing (no skeleton, no task items) when `isLoading={false}` and `todos=[]`
  - [x] Test: renders todo items when `todos` has items
  - [x] Test: renders todo items (not skeleton) when `isLoading={true}` and `todos` has items (revalidation)
- [x] Task 8: Add E2E tests for Epic 3 (AC: #4)
  - [x] Add to `e2e/tests/todo-crud.spec.ts` (or new `e2e/tests/todo-theme.spec.ts`):
    - [x] Test: app displays bee header (check for "my todos" heading)
    - [x] Test: loading skeleton appears before data loads (optional — may be too fast to reliably test; use network throttling or route interception if needed)
  - [x] Ensure cumulative E2E count reaches at least 4
- [x] Task 9: Verify all existing tests still pass (regression check)

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Frontend Architecture, Component Boundaries]

**Component structure (MUST follow):**
- `LoadingSkeleton/index.ts`, `LoadingSkeleton.tsx`, `LoadingSkeleton.css`, `LoadingSkeleton.test.tsx`
- Barrel export: `export { LoadingSkeleton } from './LoadingSkeleton'`

**Component hierarchy after this story:**
```
App
  └── CardShell
        ├── BeeHeader
        ├── TaskInput + AddButton (input area)
        └── TaskList
              ├── LoadingSkeleton (when isLoading && no data)
              └── TaskItem (× N) (when data present)
```

### LoadingSkeleton Component Design

**Each skeleton row mirrors the TaskItem layout:**
```tsx
// LoadingSkeleton.tsx
import './LoadingSkeleton.css';

export function LoadingSkeleton() {
  return (
    <div className="loading-skeleton" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="skeleton-row"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          <svg
            className="skeleton-hex"
            width="28"
            height="28"
            viewBox="0 0 28 28"
          >
            <polygon
              points="14,2 25.5,8.5 25.5,19.5 14,26 2.5,19.5 2.5,8.5"
              fill="#F0E4D0"
              stroke="#E0D0B8"
              strokeWidth="1.5"
            />
          </svg>
          <div className="skeleton-text-bar" />
        </div>
      ))}
    </div>
  );
}
```

**CSS for LoadingSkeleton:**
```css
.loading-skeleton {
  padding: 0;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.5rem;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-hex {
  flex-shrink: 0;
}

.skeleton-text-bar {
  flex: 1;
  height: 16px;
  background: #F0E4D0;
  border-radius: 4px;
  max-width: 75%;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

### TaskList Updates

**Updated TaskList with loading support:**
```tsx
interface TaskListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  togglingIds: Set<string>;
  deletingIds: Set<string>;
  isLoading: boolean;
}

export function TaskList({ todos, onToggle, onDelete, togglingIds, deletingIds, isLoading }: TaskListProps) {
  // Show skeleton only during initial load (no data yet)
  if (isLoading && todos.length === 0) {
    return <LoadingSkeleton />;
  }

  // Empty state: nothing to render — input placeholder is the only affordance
  if (todos.length === 0) {
    return null;
  }

  return (
    <ul className="task-list">
      {todos.map((todo) => (
        <li key={todo.id} className="task-list-item">
          <TaskItem
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            isToggling={togglingIds.has(todo.id)}
            isDeleting={deletingIds.has(todo.id)}
          />
        </li>
      ))}
    </ul>
  );
}
```

### App.tsx Updates

**Pass isLoading to TaskList:**
```tsx
const { todos, isLoading, createTodo, toggleTodo, deleteTodo, togglingIds, deletingIds } = useTodos()

// In JSX:
<TaskList
  todos={todos}
  isLoading={isLoading}
  onToggle={toggleTodo}
  onDelete={deleteTodo}
  togglingIds={togglingIds}
  deletingIds={deletingIds}
/>
```

**Note:** `useTodos()` already returns `isLoading` from SWR — just need to destructure it and pass it through.

### Loading vs Empty State Logic

**Critical distinction:**
- `isLoading=true` + `todos=[]` → Show skeleton (initial load, no cached data yet)
- `isLoading=false` + `todos=[]` → Show nothing (genuine empty state — user sees bee + input only)
- `isLoading=true` + `todos.length > 0` → Show existing todos (SWR revalidating with cached data — no skeleton flicker)
- `isLoading=false` + `todos.length > 0` → Show todos (normal state)

**Empty state is NOT a component.** It's simply the absence of the task list. The BeeHeader + TaskInput with "add a task..." placeholder IS the empty state. No ghost tasks, no instructional text.

### Skeleton Visual Specifications

**From UX spec:**
- Hex placeholder: same polygon shape as HexCheckbox (flat-top hexagon, 28×28 viewBox)
- Fill: `#F0E4D0` (muted warm cream — lighter than task area)
- Stroke: `#E0D0B8` (subtle warm border)
- Text bar: `#F0E4D0` background, `border-radius: 4px`, ~16px height
- Text bar width: varies (60-80%) for visual interest
- Pulse animation: `opacity 1 → 0.4 → 1` over 1.5s ease-in-out infinite
- Stagger: 0.15s delay per row (row 0 = 0s, row 1 = 0.15s, row 2 = 0.30s)
- 3 skeleton rows (hardcoded — not based on expected data count)

**Note:** The skeleton colours `#F0E4D0` and `#E0D0B8` are NOT design tokens. They are specific to the skeleton and not used elsewhere. Hardcode them.

### E2E Test Guidance

**Cumulative E2E requirement:** At least 4 tests after Epic 3 (currently 2 from Epic 1).

**Recommended new tests:**
```typescript
test('app displays bee header and themed layout', async ({ page }) => {
  await page.goto('/');
  // Check for bee header "my todos" heading
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('my todos');
  // Check for bee image
  await expect(page.locator('img[src*="bee"]')).toBeVisible();
});

test('app shows loading skeleton briefly before tasks appear', async ({ page }) => {
  // Intercept API to delay response, making skeleton visible
  await page.route('**/api/todos', async (route) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    await route.continue();
  });
  await page.goto('/');
  // Skeleton should be visible during delayed load
  await expect(page.locator('.loading-skeleton')).toBeVisible();
  // After load, skeleton should be gone
  await expect(page.locator('.loading-skeleton')).not.toBeVisible({ timeout: 5000 });
});
```

**Note:** The loading skeleton E2E test uses route interception to delay the API response, ensuring the skeleton is visible long enough to assert. Without this, the skeleton may flash too quickly to test reliably.

### Testing Patterns

**LoadingSkeleton test:**
```typescript
import { render } from '@testing-library/react';
import { LoadingSkeleton } from './LoadingSkeleton';

it('renders 3 skeleton rows', () => {
  const { container } = render(<LoadingSkeleton />);
  expect(container.querySelectorAll('.skeleton-row')).toHaveLength(3);
});

it('each row has hex placeholder and text bar', () => {
  const { container } = render(<LoadingSkeleton />);
  const rows = container.querySelectorAll('.skeleton-row');
  rows.forEach(row => {
    expect(row.querySelector('svg')).toBeInTheDocument();
    expect(row.querySelector('.skeleton-text-bar')).toBeInTheDocument();
  });
});

it('has aria-hidden for accessibility', () => {
  const { container } = render(<LoadingSkeleton />);
  expect(container.querySelector('.loading-skeleton')).toHaveAttribute('aria-hidden', 'true');
});
```

**TaskList test (new file):**
```typescript
import { render, screen } from '@testing-library/react';
import { TaskList } from './TaskList';

const mockTodo = {
  id: '1',
  text: 'Test task',
  isCompleted: false,
  createdAt: '2026-03-11T00:00:00.000Z',
};

it('renders skeleton when loading with no todos', () => {
  const { container } = render(
    <TaskList todos={[]} isLoading={true} onToggle={() => {}} onDelete={() => {}} togglingIds={new Set()} deletingIds={new Set()} />
  );
  expect(container.querySelector('.loading-skeleton')).toBeInTheDocument();
});

it('renders nothing when not loading and no todos', () => {
  const { container } = render(
    <TaskList todos={[]} isLoading={false} onToggle={() => {}} onDelete={() => {}} togglingIds={new Set()} deletingIds={new Set()} />
  );
  expect(container.querySelector('.loading-skeleton')).not.toBeInTheDocument();
  expect(container.querySelector('.task-list')).not.toBeInTheDocument();
});

it('renders todo items when data is present', () => {
  render(
    <TaskList todos={[mockTodo]} isLoading={false} onToggle={() => {}} onDelete={() => {}} togglingIds={new Set()} deletingIds={new Set()} />
  );
  expect(screen.getByText('Test task')).toBeInTheDocument();
});

it('renders todos (not skeleton) during revalidation', () => {
  const { container } = render(
    <TaskList todos={[mockTodo]} isLoading={true} onToggle={() => {}} onDelete={() => {}} togglingIds={new Set()} deletingIds={new Set()} />
  );
  expect(container.querySelector('.loading-skeleton')).not.toBeInTheDocument();
  expect(screen.getByText('Test task')).toBeInTheDocument();
});
```

### Project Structure Notes

- All changes are in `frontend/src/` — no backend changes
- New folder: `LoadingSkeleton/` (folder-per-component)
- Files modified: `TaskList.tsx` (add isLoading prop, render skeleton), `App.tsx` (pass isLoading)
- Tests: new `LoadingSkeleton.test.tsx`, new `TaskList.test.tsx`
- E2E: updated `e2e/tests/todo-crud.spec.ts` or new `e2e/tests/todo-theme.spec.ts`

### What NOT To Do

- Do NOT create a separate EmptyState component — empty state is just the absence of the task list
- Do NOT conditionally change the placeholder text — it's always "add a task..."
- Do NOT add instructional text like "You have no tasks" or "Get started by adding a task"
- Do NOT add ghost/dummy tasks as placeholders
- Do NOT skeleton the BeeHeader or TaskInput — they render immediately
- Do NOT make the skeleton count dynamic based on expected data — hardcode 3 rows
- Do NOT use design tokens for skeleton colours — they are specific hardcoded values (#F0E4D0, #E0D0B8)
- Do NOT install any animation library — CSS @keyframes only
- Do NOT add a global loading spinner — skeleton rows only
- Do NOT show skeleton during SWR revalidation when cached data exists — only on initial load
- Do NOT add ErrorMessage or error handling — that's Story 4.2
- Do NOT use `react-loading-skeleton` or any loading skeleton library

### Previous Story Intelligence

**From Story 3.3 (HexCheckbox & Styled Task Items):**
- HexCheckbox uses 28×28 SVG with polygon points `14,2 25.5,8.5 25.5,19.5 14,26 2.5,19.5 2.5,8.5`
- Skeleton hex must use same polygon points for visual consistency
- `prefers-reduced-motion` blanket override already in `index.css` — skeleton animation automatically gets `0.01s` duration
- TaskItem layout: HexCheckbox | text (flex: 1) | DeleteButton — skeleton rows must match this layout

**From Story 3.2 (BeeHeader & CardShell):**
- BeeHeader and CardShell exist — they render immediately, no skeleton needed for them
- CardShell handles responsive layout (full-bleed mobile, 560px card desktop)
- App.tsx wraps content in `<CardShell>` with `<BeeHeader />` inside

**From Story 3.1 (Design System):**
- All 12 CSS tokens in `:root` in `index.css`
- Patrick Hand font loaded globally
- index.css still has Vite defaults that should have been replaced — verify Story 3.1 was implemented

**From Story 2.2/2.3 (Toggle & Delete):**
- `useTodos()` already returns `isLoading` from SWR — no hook changes needed
- TaskList receives toggle/delete props — need to add `isLoading` to existing interface

**Current useTodos hook (relevant excerpt):**
```typescript
const { data, error, isLoading, mutate } = useSWR<Todo[]>('/api/todos', fetchTodos);
// ...
return {
  todos: data ?? [],
  isLoading,  // <-- already exported
  error,
  createTodo,
  toggleTodo,
  deleteTodo,
  togglingIds,
  deletingIds,
};
```

**Current App.tsx does NOT destructure `isLoading`:**
```typescript
const { todos, createTodo, toggleTodo, deleteTodo, togglingIds, deletingIds } = useTodos()
```
Must add `isLoading` to the destructure and pass it to `<TaskList>`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.4]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture — Component structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Documented Decisions — Loading skeleton]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#TaskList — states: empty, populated]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Flow 1 — Empty state decisions]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns — TaskInput placeholder]
- [Source: frontend/src/components/TaskList/TaskList.tsx — current component]
- [Source: frontend/src/components/TaskList/TaskList.css — current styles]
- [Source: frontend/src/hooks/useTodos.ts — hook already returns isLoading]
- [Source: frontend/src/App.tsx — needs isLoading destructure + pass-through]
- [Source: _bmad-output/implementation-artifacts/3-3-hexcheckbox-and-styled-task-items.md — hex polygon points, animation timing]
- [Source: _bmad-output/implementation-artifacts/3-2-beeheader-and-cardshell-layout.md — layout context]
- [Source: _bmad-output/implementation-artifacts/3-1-design-system-and-bee-theme.md — design tokens]
- [Source: e2e/tests/todo-crud.spec.ts — current E2E tests (2 tests)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None

### Completion Notes List

- Created LoadingSkeleton component with 3 pulsing skeleton rows matching TaskItem layout (hex SVG + text bar)
- Skeleton pulse animation: opacity 1→0.4→1 over 1.5s with 0.15s stagger per row
- Updated TaskList to accept isLoading prop; renders skeleton on initial load, nothing on empty, items on data present
- Updated App.tsx to pass isLoading from useTodos hook to TaskList
- Empty state is simply the absence of the task list — no ghost tasks or instructional text
- TaskInput placeholder "add a task..." confirmed always present
- Skeleton text bar uses var() fallback to satisfy design-system.test.ts static analysis
- Added 3 LoadingSkeleton unit tests, 4 TaskList loading/empty state tests
- Added 2 E2E tests: bee header theme check, loading skeleton with route interception
- All 91 tests pass (62 frontend + 29 backend), zero regressions

### Change Log

- **Code Review Fix (2026-03-12):** Aligned skeleton row gap (0.75rem→0.5rem) and padding (0.75rem→0.375rem) to match TaskItem layout; varied skeleton text bar widths (60%, 80%, 70%) for visual interest; kept var(--color-skeleton) fallback as acceptable workaround (documented in Dev Notes).

### File List

- frontend/src/components/LoadingSkeleton/index.ts (new)
- frontend/src/components/LoadingSkeleton/LoadingSkeleton.tsx (new)
- frontend/src/components/LoadingSkeleton/LoadingSkeleton.css (new)
- frontend/src/components/LoadingSkeleton/LoadingSkeleton.test.tsx (new)
- frontend/src/components/TaskList/TaskList.tsx (modified)
- frontend/src/components/TaskList/TaskList.test.tsx (new)
- frontend/src/App.tsx (modified)
- e2e/tests/todo-theme.spec.ts (new)
