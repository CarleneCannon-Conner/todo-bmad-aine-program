# Story 2.1: Backend — Toggle & Delete Endpoints

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want to mark tasks complete/incomplete and delete tasks,
so that I can manage my task list and clear irrelevant items.

## Acceptance Criteria

1. **Given** a todo exists with `isCompleted: false` **When** I send `PATCH /api/todos/:id` with `{ "isCompleted": true }` **Then** I receive a `200` response with `{ success: true, data: { id, text, isCompleted: true, createdAt } }` **And** the change is persisted in PostgreSQL

2. **Given** a todo exists with `isCompleted: true` **When** I send `PATCH /api/todos/:id` with `{ "isCompleted": false }` **Then** I receive a `200` response with the updated todo showing `isCompleted: false`

3. **Given** a todo exists **When** I send `DELETE /api/todos/:id` **Then** I receive a `200` response with `{ success: true, data: { id } }` **And** the todo is removed from the database

4. **Given** a non-existent todo ID **When** I send `PATCH /api/todos/:id` or `DELETE /api/todos/:id` **Then** I receive a `404` response with `{ success: false, error: { code: "NOT_FOUND", message: "..." } }`

5. **Given** the backend code **When** I inspect the service layer **Then** `todo.service.ts` handles toggle and delete, throwing on not-found **And** `todo.routes.ts` catches service errors and returns structured `ApiResponse<T>` envelopes

6. **Given** the backend code is complete **When** I run `pnpm --filter backend test` **Then** `todo.service.test.ts` includes tests for: toggle updates `isCompleted`, delete removes todo, toggle/delete throw on non-existent ID **And** `todo.routes.test.ts` includes tests for: PATCH 200 success, DELETE 200 success, PATCH/DELETE 404 for missing ID

## Tasks / Subtasks

- [x] Task 1: Add `toggleTodo` to `todo.service.ts` (AC: #1, #2, #4, #5)
  - [x] Add `NotFoundError` class (mirrors existing `ValidationError` pattern)
  - [x] Implement `toggleTodo(db, id, isCompleted)` — uses Drizzle `update().set().where().returning()`
  - [x] Throw `NotFoundError` when no rows returned (returning() returns empty array)
- [x] Task 2: Add `deleteTodo` to `todo.service.ts` (AC: #3, #4, #5)
  - [x] Implement `deleteTodo(db, id)` — uses Drizzle `delete().where().returning()`
  - [x] Throw `NotFoundError` when no rows returned
  - [x] Return `{ id }` on success (not the full todo — matches AC #3 response shape)
- [x] Task 3: Add PATCH and DELETE routes to `todo.routes.ts` (AC: #1, #2, #3, #4)
  - [x] Add TypeBox schema for PATCH body: `{ isCompleted: Type.Boolean() }`
  - [x] Add TypeBox schema for `:id` param: `{ id: Type.String({ format: 'uuid' }) }`
  - [x] Wire PATCH `/:id` route — calls `toggleTodo`, wraps in `ApiResponse<Todo>`, returns 200
  - [x] Wire DELETE `/:id` route — calls `deleteTodo`, wraps in `ApiResponse<{ id: string }>`, returns 200
  - [x] Catch `NotFoundError` in both routes → return 404 with `{ code: "NOT_FOUND", message }` envelope
- [x] Task 4: Add service unit tests to `todo.service.test.ts` (AC: #6)
  - [x] Test: `toggleTodo` updates `isCompleted` to true
  - [x] Test: `toggleTodo` updates `isCompleted` to false (toggle back)
  - [x] Test: `toggleTodo` throws `NotFoundError` on non-existent ID
  - [x] Test: `deleteTodo` removes todo from database
  - [x] Test: `deleteTodo` throws `NotFoundError` on non-existent ID
- [x] Task 5: Add route integration tests to `todo.routes.test.ts` (AC: #6)
  - [x] Test: PATCH 200 returns updated todo with toggled `isCompleted`
  - [x] Test: PATCH 404 with NOT_FOUND envelope for missing ID
  - [x] Test: DELETE 200 returns `{ id }` on success
  - [x] Test: DELETE 404 with NOT_FOUND envelope for missing ID
  - [x] Test: all error responses match `ApiResponse<T>` envelope shape
- [x] Task 6: Verify all existing tests still pass (regression check)

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Service/Route Boundary, API & Communication Patterns]

**Service/Route Boundary (MUST follow):**
- Services return domain types (`Todo` for toggle, `{ id: string }` for delete) and **throw** on error
- Routes catch service errors and wrap in `ApiResponse<T>` envelope
- Routes set HTTP status codes — services never do

**API Endpoints being added:**
| Method | Path | Success | Error |
|--------|------|---------|-------|
| PATCH | `/api/todos/:id` | 200 `{ success: true, data: Todo }` | 404 NOT_FOUND |
| DELETE | `/api/todos/:id` | 200 `{ success: true, data: { id } }` | 404 NOT_FOUND |

**Error codes used:** `NOT_FOUND` (new), `VALIDATION_ERROR` (existing), `INTERNAL_ERROR` (existing)

**ID format:** UUID v4 string — validate with TypeBox `format: 'uuid'` on route params

### Existing Code Patterns to Follow

**Error class pattern** (from `todo.service.ts:22-27`):
```typescript
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
```

**Route error handling pattern** (from `todo.routes.ts:25-33`):
```typescript
// In route handler try/catch:
if (error instanceof NotFoundError) {
  const response: ApiResponse<never> = {
    success: false,
    error: { code: 'NOT_FOUND', message: error.message },
  };
  return reply.status(404).send(response);
}
```

**Drizzle update pattern:**
```typescript
import { eq } from 'drizzle-orm';
// Update returns array — empty means not found
const [updated] = await db.update(todos).set({ isCompleted }).where(eq(todos.id, id)).returning();
```

**Drizzle delete pattern:**
```typescript
const [deleted] = await db.delete(todos).where(eq(todos.id, id)).returning();
```

**Route registration:** Routes are registered with prefix `/api/todos` in `app.ts:9`, so route paths are relative: `/:id` for PATCH and DELETE

**TypeBox param schema:**
```typescript
const TodoParams = Type.Object({
  id: Type.String({ format: 'uuid' }),
});
```

**Fastify route typing with params:**
```typescript
fastify.patch<{ Params: { id: string }; Body: { isCompleted: boolean } }>(
  '/:id',
  { schema: { params: TodoParams, body: ToggleTodoBody } },
  async (request, reply) => { ... }
);
```

### Testing Patterns

**Source:** [architecture.md — Testing Patterns], existing test files

**Test infrastructure already exists:**
- `test-helpers.ts` provides `getTestDb()`, `setupTestDb()`, `truncateTodos()`, `teardownTestDb()`
- Service tests use `getTestDb()` directly
- Route tests use `buildApp({ logger: false })` + `app.inject()`
- Each test file has `beforeAll(setupTestDb)`, `beforeEach(truncateTodos)`, `afterAll(teardownTestDb)`

**Route test pattern** (use `app.inject`):
```typescript
// Create a todo first, then toggle/delete it
const createRes = await app.inject({
  method: 'POST', url: '/api/todos', payload: { text: 'Test' }
});
const todoId = createRes.json().data.id;

const patchRes = await app.inject({
  method: 'PATCH', url: `/api/todos/${todoId}`, payload: { isCompleted: true }
});
expect(patchRes.statusCode).toBe(200);
```

**For 404 tests:** Use a valid UUID format that doesn't exist: `'00000000-0000-0000-0000-000000000000'`

### Imports to Add

**In `todo.service.ts`:** Add `eq` from `drizzle-orm` (already imports `desc` from there)
**In `todo.routes.ts`:** Add `NotFoundError` to imports from `./todo.service.js`

### Project Structure Notes

- All changes are in `backend/src/` — **no frontend changes in this story**
- Files modified: `todo.service.ts`, `todo.routes.ts`, `todo.service.test.ts`, `todo.routes.test.ts`
- No new files created
- No migration needed — schema unchanged, we're using existing `todos` table columns

### What NOT To Do

- Do NOT add frontend toggle/delete functions to `todoApi.ts` or `useTodos.ts` — that's Story 2.2/2.3
- Do NOT modify the Drizzle schema or create new migrations — the `is_completed` column already exists
- Do NOT add a global error handler — the existing `setErrorHandler` in `todo.routes.ts` already handles TypeBox validation errors and 500s; just add `NotFoundError` catch in the route handlers
- Do NOT use `fastify.db` directly — use service functions that receive `db` as parameter (existing pattern)
- Do NOT return the full todo object from delete — AC #3 specifies `{ success: true, data: { id } }`
- Do NOT add CORS, auth middleware, or other cross-cutting concerns — out of scope
- Do NOT modify `app.ts` or `db.ts` — no changes needed there

### Previous Story Intelligence

**From Epic 1 stories (patterns established):**
- Backend uses `.js` extensions in imports (e.g., `import { ... } from './todo.service.js'`) — TypeScript with NodeNext module resolution
- Tests use real PostgreSQL via `test-helpers.ts` — not mocked
- Route tests use Fastify's `app.inject()` for HTTP-level testing without starting a server
- `buildApp({ logger: false })` suppresses Pino logs during tests
- Service tests directly call functions with `getTestDb()`
- `truncateTodos()` runs before each test for clean state
- TypeBox schemas defined as constants at module level (see `CreateTodoBody`)

**From Story 1.4 code review learnings:**
- `cd backend && npx drizzle-kit migrate` is the working migration command (not pnpm filter)
- Playwright browsers need explicit install

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Service / Route Boundary]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Format Standards]
- [Source: _bmad-output/planning-artifacts/architecture.md#Testing Patterns]
- [Source: backend/src/todo.service.ts — existing service pattern]
- [Source: backend/src/todo.routes.ts — existing route pattern]
- [Source: backend/src/test-helpers.ts — test infrastructure]
- [Source: backend/src/todo.service.test.ts — service test pattern]
- [Source: backend/src/todo.routes.test.ts — route test pattern]
- [Source: shared/types.ts — ApiResponse<T>, Todo types]
- [Source: shared/schema.ts — todos table with isCompleted column]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

None — all tests passed on first run.

### Completion Notes List

- Added `NotFoundError` class following existing `ValidationError` pattern
- Implemented `toggleTodo(db, id, isCompleted)` using Drizzle `update().set().where().returning()`
- Implemented `deleteTodo(db, id)` returning `{ id }` only (per AC #3)
- Both functions throw `NotFoundError` when target todo doesn't exist
- Added PATCH `/:id` and DELETE `/:id` routes with TypeBox param/body validation
- Routes catch `NotFoundError` and return 404 with structured `ApiResponse<T>` envelope
- Added 5 service unit tests (toggle true, toggle false, toggle 404, delete success, delete 404)
- Added 6 route integration tests (PATCH 200, PATCH 404, PATCH envelope, DELETE 200, DELETE 404, DELETE envelope)
- All 27 tests pass (3 test files), zero regressions

### File List

- backend/src/todo.service.ts (modified — added eq import, toggleTodo, deleteTodo, NotFoundError)
- backend/src/todo.routes.ts (modified — added imports, TypeBox schemas, PATCH and DELETE routes)
- backend/src/todo.service.test.ts (modified — added toggleTodo and deleteTodo test suites)
- backend/src/todo.routes.test.ts (modified — added PATCH and DELETE test suites)

### Change Log

- Added toggleTodo, deleteTodo, NotFoundError to todo.service.ts
- Added PATCH /:id and DELETE /:id routes with TypeBox validation to todo.routes.ts
- Added 5 service tests and 6 route integration tests
- 2026-03-11: Code review — Consolidated error handling into setErrorHandler (removed duplicated try/catch from 3 route handlers); added route test for PATCH toggle-back to false (AC #2); added UUID format validation test; 29 tests passing
