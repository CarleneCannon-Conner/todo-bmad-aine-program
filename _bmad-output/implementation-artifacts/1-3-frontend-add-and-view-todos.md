# Story 1.3: Frontend — Add & View Todos

Status: done

## Story

As a **user**,
I want to open the app and immediately see my todos, and add new ones by typing and pressing Enter,
so that I can capture and track tasks without any setup or friction.

## Acceptance Criteria

1. **Given** the app is open and todos exist in the backend **When** the page loads **Then** all todos are displayed in a list (newest first) **And** no login or setup is required

2. **Given** the app is open **When** I type text in the input field and press Enter **Then** the new todo appears in the list after backend confirmation (pessimistic create) **And** the input field clears after successful submission

3. **Given** the frontend code **When** I inspect the architecture **Then** `todoApi.ts` is the single module for all API calls, unwrapping `ApiResponse<T>` **And** `useTodos.ts` is an SWR hook consuming `todoApi` functions **And** Vite proxy forwards `/api/*` requests to `localhost:3000`

4. **Given** the app is running **When** I add a todo and refresh the page **Then** the todo persists and is visible on reload

5. **Given** the frontend code is complete **When** I run `pnpm --filter frontend test` **Then** `useTodos.test.ts` passes with tests covering: hook returns todos from API, hook triggers mutate after create **And** `todoApi.test.ts` passes with tests covering: API functions call correct endpoints, responses are unwrapped from `ApiResponse<T>`

## Tasks / Subtasks

- [x] Task 1: Install SWR dependency (AC: #3)
  - [x] `pnpm --filter frontend add swr`
  - [x] SWR is the ONLY new dependency for this story
- [x] Task 2: Create API module — `frontend/src/api/todoApi.ts` (AC: #3)
  - [x] `fetchTodos()` — GET `/api/todos`, unwrap `ApiResponse<Todo[]>`, return `Todo[]`
  - [x] `createTodo(text)` — POST `/api/todos` with `{ text }`, unwrap `ApiResponse<Todo>`, return `Todo`
  - [x] On success (`success: true`): return `.data`
  - [x] On error (`success: false`): throw an error with the error message from the response
  - [x] Use native `fetch` — no axios or other HTTP libraries
  - [x] All functions typed using `Todo`, `ApiResponse` from `@todo/shared`
- [x] Task 3: Create SWR hook — `frontend/src/hooks/useTodos.ts` (AC: #1, #2, #3)
  - [x] `useTodos()` hook wrapping `todoApi.fetchTodos` with SWR
  - [x] SWR key: `"/api/todos"`
  - [x] Expose: `todos`, `isLoading`, `error`, `createTodo(text)`
  - [x] `createTodo(text)`: call `todoApi.createTodo(text)`, then `mutate()` to revalidate the cache
  - [x] Pessimistic create — do NOT use optimistic update for create (wait for server confirmation)
  - [x] Return type should make `todos` available as `Todo[]` (default to empty array when undefined)
- [x] Task 4: Create TaskItem component — `frontend/src/components/TaskItem/` (AC: #1)
  - [x] `TaskItem.tsx` — receives `todo: Todo` prop, renders todo text
  - [x] `TaskItem.css` — minimal styling (this is pre-theme, Epic 3 applies full design)
  - [x] `index.ts` — barrel export
  - [x] Basic display only — no toggle, no delete, no hex checkbox (those are Epic 2/3)
- [x] Task 5: Create TaskList component — `frontend/src/components/TaskList/` (AC: #1)
  - [x] `TaskList.tsx` — receives `todos: Todo[]` prop, renders list of `TaskItem` components
  - [x] `TaskList.css` — minimal list styling
  - [x] `index.ts` — barrel export
  - [x] Use semantic `<ul>/<li>` elements
  - [x] Basic rendering only — no loading skeleton, no empty state (those are Story 3.4)
- [x] Task 6: Create TaskInput component — `frontend/src/components/TaskInput/` (AC: #2)
  - [x] `TaskInput.tsx` — controlled input with Enter key submit
  - [x] `TaskInput.css` — minimal styling
  - [x] `index.ts` — barrel export
  - [x] Placeholder text: `"add a task..."` (always, per FR9)
  - [x] On Enter: call `onSubmit(text)` callback, clear input on success
  - [x] Enter-only submission — no AddButton in this story (that's Story 2.4)
  - [x] Semantic `<input>` element
- [x] Task 7: Wire up App.tsx (AC: #1, #2, #4)
  - [x] Import `useTodos` hook
  - [x] Import `TaskList`, `TaskInput` components
  - [x] Render TaskInput and TaskList
  - [x] Connect TaskInput's onSubmit to `useTodos().createTodo`
  - [x] Pass `todos` from hook to TaskList
  - [x] Replace Vite default content — remove placeholder `<h1>Todo App</h1>`
  - [x] Update App.css — remove Vite default styles, keep minimal layout
- [x] Task 8: Write todoApi tests — `frontend/src/api/todoApi.test.ts` (AC: #5)
  - [x] Test: `fetchTodos` calls GET `/api/todos` and returns unwrapped data
  - [x] Test: `createTodo` calls POST `/api/todos` with correct body and returns unwrapped data
  - [x] Test: functions throw on error responses (`success: false`)
  - [x] Mock `fetch` globally for these tests
- [x] Task 9: Write useTodos hook tests — `frontend/src/hooks/useTodos.test.ts` (AC: #5)
  - [x] Test: hook returns todos from API
  - [x] Test: hook triggers mutate after create
  - [x] Mock `todoApi` module — this is the single mock boundary
  - [x] Use `@testing-library/react` `renderHook` for SWR hook testing

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Frontend API Boundary, Frontend Architecture]

- **Frontend API Boundary:** `todoApi.ts` is the ONLY module that calls `fetch`. No direct fetch in components or hooks.
- **todoApi.ts unwraps `ApiResponse<T>`:** Returns `.data` on success, throws on error. SWR expects throws for error handling.
- **SWR hook pattern:** `useTodos` is the single bridge between `todoApi` and React components. Components receive data via props from this hook.
- **Component structure:** Folder-per-component with `index.ts` barrel, `.tsx`, `.css`, `.test.tsx` co-located
- **Component barrel imports:** `import { TaskItem } from '../components/TaskItem'` (NOT `../components/TaskItem/TaskItem`)
- **Naming:** Components PascalCase (`TaskItem.tsx`), non-components camelCase (`todoApi.ts`, `useTodos.ts`)
- **Shared types:** Always `import type { Todo, ApiResponse } from '@todo/shared'` — never redeclare
- **Mutation strategy:** Create is PESSIMISTIC — wait for server, then revalidate SWR cache
- **SWR cache key:** `"/api/todos"` (matches endpoint path)
- **SWR revalidation:** `mutate("/api/todos")` after create

### Exact Versions (Already Installed)

| Package | Version | Notes |
|---------|---------|-------|
| React | ^19.1.0 | Already in frontend/package.json |
| React DOM | ^19.1.0 | Already in frontend/package.json |
| Vite | ^7.3.1 | Already in devDependencies |
| Vitest | ^4.0.0 | Already in devDependencies |
| @testing-library/react | ^16.3.0 | Already in devDependencies |
| @testing-library/jest-dom | ^6.6.0 | Already in devDependencies |
| jsdom | ^26.1.0 | Already in devDependencies |

**New dependency needed:** `swr` — server state management. Install via `pnpm --filter frontend add swr`.

### Shared Types Already Defined (Do NOT Recreate)

**Source:** [shared/types.ts]

```typescript
export type Todo = InferSelectModel<typeof todos>;
// Fields: { id: string, text: string, isCompleted: boolean, createdAt: Date }

export interface CreateTodoRequest { text: string; }

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

### todoApi.ts Implementation Pattern

**Source:** [architecture.md — Frontend API Boundary]

```typescript
// frontend/src/api/todoApi.ts
import type { Todo, CreateTodoRequest, ApiResponse } from '@todo/shared';

const API_BASE = '/api/todos';

async function handleResponse<T>(response: Response): Promise<T> {
  const json: ApiResponse<T> = await response.json();
  if (!json.success) {
    throw new Error(json.error.message);
  }
  return json.data;
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(API_BASE);
  return handleResponse<Todo[]>(res);
}

export async function createTodo(text: string): Promise<Todo> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text } satisfies CreateTodoRequest),
  });
  return handleResponse<Todo>(res);
}
```

### useTodos Hook Pattern

**Source:** [architecture.md — SWR cache, Process Patterns]

```typescript
// frontend/src/hooks/useTodos.ts
import useSWR from 'swr';
import type { Todo } from '@todo/shared';
import { fetchTodos, createTodo as apiCreateTodo } from '../api/todoApi';

export function useTodos() {
  const { data, error, isLoading, mutate } = useSWR<Todo[]>('/api/todos', fetchTodos);

  const createTodo = async (text: string) => {
    await apiCreateTodo(text);
    mutate(); // revalidate cache (pessimistic)
  };

  return {
    todos: data ?? [],
    isLoading,
    error,
    createTodo,
  };
}
```

### Existing Frontend Files (From Story 1.1)

These files exist and will be MODIFIED:
- `App.tsx` — replace Vite default with todo app layout
- `App.css` — replace Vite default styles with minimal layout
- `index.css` — currently Vite defaults (will be fully replaced in Story 3.1 with design tokens)

These files exist and should NOT be modified:
- `main.tsx` — React entry point, no changes needed
- `test-setup.ts` — testing-library setup, no changes needed
- `vite.config.ts` — proxy + vitest config already correct
- `App.test.tsx` — workspace smoke test, keep as-is

### Frontend File Structure After This Story

```
frontend/src/
├── main.tsx              ← EXISTS: no changes
├── App.tsx               ← MODIFIED: wire up useTodos + components
├── App.css               ← MODIFIED: minimal layout (not themed yet)
├── index.css             ← EXISTS: Vite defaults (replaced in Story 3.1)
├── test-setup.ts         ← EXISTS: no changes
├── App.test.tsx          ← EXISTS: workspace smoke test (keep)
├── api/
│   ├── todoApi.ts        ← NEW: fetch wrapper, unwraps ApiResponse<T>
│   └── todoApi.test.ts   ← NEW: API module tests
├── hooks/
│   ├── useTodos.ts       ← NEW: SWR hook wrapping todoApi
│   └── useTodos.test.ts  ← NEW: hook tests
└── components/
    ├── TaskItem/
    │   ├── index.ts      ← NEW: barrel export
    │   ├── TaskItem.tsx   ← NEW: displays single todo text
    │   └── TaskItem.css   ← NEW: minimal styling
    ├── TaskList/
    │   ├── index.ts      ← NEW: barrel export
    │   ├── TaskList.tsx   ← NEW: renders list of TaskItems
    │   └── TaskList.css   ← NEW: minimal list styling
    └── TaskInput/
        ├── index.ts      ← NEW: barrel export
        ├── TaskInput.tsx  ← NEW: input with Enter submit
        └── TaskInput.css  ← NEW: minimal input styling
```

### Vite Proxy (Already Configured)

`vite.config.ts` already has:
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
},
```

No changes needed. Frontend fetch calls to `/api/todos` will be proxied to the backend at port 3000.

### Testing Strategy

**todoApi tests (`todoApi.test.ts`):**
- Mock global `fetch` using `vi.fn()`
- Test that `fetchTodos` calls `fetch(API_BASE)` and returns unwrapped data
- Test that `createTodo` calls `fetch` with POST method, correct headers, and JSON body
- Test that both functions throw when response has `success: false`

**useTodos hook tests (`useTodos.test.ts`):**
- Mock the `todoApi` module: `vi.mock('../api/todoApi')`
- Use `renderHook` from `@testing-library/react` to test the hook
- Test: hook returns todos from mocked fetchTodos
- Test: createTodo calls apiCreateTodo then triggers SWR mutate (revalidation)
- SWR testing tip: may need to wrap in `SWRConfig` with `dedupingInterval: 0` for test isolation

### Previous Story Intelligence (Story 1.1)

- `passWithNoTests: true` already set in vitest config — new test files will be picked up automatically
- `@todo/shared` workspace dependency already in frontend `package.json`
- Shared type imports confirmed working (App.test.tsx uses them)
- Code review found the original scaffold was vanilla-ts not react-ts — was fixed; current files are correct React + TypeScript

### What NOT To Do

- Do NOT install axios or any HTTP library — use native `fetch`
- Do NOT install any CSS framework — plain CSS only
- Do NOT create AddButton component — that's Story 2.4
- Do NOT create DeleteButton component — that's Story 2.3
- Do NOT create HexCheckbox component — that's Story 3.3
- Do NOT create BeeHeader or CardShell — that's Story 3.2
- Do NOT create ErrorMessage component — that's Story 4.2
- Do NOT create loading skeleton — that's Story 3.4
- Do NOT apply bee theme design tokens — that's Story 3.1
- Do NOT add toggle or delete functionality — those are Epic 2
- Do NOT add optimistic updates for create — create is PESSIMISTIC (wait for server)
- Do NOT add error display UI — this story does not handle error display (Story 4.2)
- Do NOT modify `vite.config.ts` — proxy is already configured
- Do NOT modify `main.tsx` or `test-setup.ts`
- Do NOT redeclare types — import from `@todo/shared`
- Do NOT call `fetch` directly in components or hooks — always go through `todoApi.ts`
- Do NOT create `.test.tsx` files for TaskItem/TaskList/TaskInput — only `todoApi.test.ts` and `useTodos.test.ts` are required by AC

### Project Structure Notes

- Folder-per-component: `components/TaskItem/index.ts` + `TaskItem.tsx` + `TaskItem.css`
- Import via barrel: `import { TaskItem } from '../components/TaskItem'`
- Non-component files: `api/todoApi.ts`, `hooks/useTodos.ts` (camelCase)
- Tests co-located: `api/todoApi.test.ts`, `hooks/useTodos.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend API Boundary]
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns — SWR cache]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns — Naming Conventions]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
- [Source: shared/types.ts — Todo, CreateTodoRequest, ApiResponse<T>]
- [Source: frontend/vite.config.ts — Vite proxy already configured]
- [Source: _bmad-output/implementation-artifacts/1-1-monorepo-scaffold-and-shared-types.md — Previous story learnings]
- [Source: _bmad-output/implementation-artifacts/1-2-backend-api-create-and-list-todos.md — Backend API contract]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed: SWR cache leaking between tests — added SWRConfig wrapper with isolated cache provider per test

### Completion Notes List

- All 9 frontend tests passing (3 test files: App.test.tsx, todoApi.test.ts, useTodos.test.ts)
- todoApi.ts: fetchTodos + createTodo with ApiResponse<T> unwrapping and error throwing
- useTodos.ts: SWR hook with pessimistic create and cache revalidation
- 3 components: TaskItem (display), TaskList (ul/li semantic), TaskInput (Enter submit)
- App.tsx wired up with useTodos hook feeding TaskInput and TaskList
- No regressions — backend 15 tests still passing

### File List

- `frontend/src/api/todoApi.ts` — API module with fetch wrapper
- `frontend/src/api/todoApi.test.ts` — 4 API tests
- `frontend/src/hooks/useTodos.ts` — SWR hook
- `frontend/src/hooks/useTodos.test.ts` — 3 hook tests
- `frontend/src/components/TaskItem/TaskItem.tsx` — Single todo display
- `frontend/src/components/TaskItem/TaskItem.css` — Minimal styling
- `frontend/src/components/TaskItem/index.ts` — Barrel export
- `frontend/src/components/TaskList/TaskList.tsx` — Todo list with ul/li
- `frontend/src/components/TaskList/TaskList.css` — List styling
- `frontend/src/components/TaskList/index.ts` — Barrel export
- `frontend/src/components/TaskInput/TaskInput.tsx` — Input with Enter submit
- `frontend/src/components/TaskInput/TaskInput.css` — Input styling
- `frontend/src/components/TaskInput/index.ts` — Barrel export
- `frontend/src/App.tsx` — Modified: wired up useTodos + components
- `frontend/src/App.css` — Modified: minimal layout replacing Vite defaults
- `frontend/package.json` — Modified: added swr dependency

### Change Log

- Created todoApi.ts, useTodos.ts (API + hook layer)
- Created TaskItem, TaskList, TaskInput components with barrel exports
- Updated App.tsx to wire up useTodos hook with components
- Updated App.css with minimal layout styles
- Added SWR dependency
- Created todoApi.test.ts and useTodos.test.ts
- 2026-03-11: Code review — todoApi.ts handleResponse now guards against non-JSON responses; TaskInput.tsx handleKeyDown catches submit errors to prevent unhandled promise rejections
