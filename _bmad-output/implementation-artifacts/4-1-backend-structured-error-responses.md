# Story 4.1: Backend Structured Error Responses

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user**,
I want the backend to return clear, consistent error information,
so that the frontend can tell me exactly what went wrong.

## Acceptance Criteria

1. **Given** a request fails due to validation (e.g. empty text on create) **When** the backend responds **Then** it returns a `400` with `{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }`

2. **Given** a request targets a non-existent todo ID **When** the backend responds **Then** it returns a `404` with `{ success: false, error: { code: "NOT_FOUND", message: "..." } }`

3. **Given** an unexpected server error occurs **When** the backend responds **Then** it returns a `500` with `{ success: false, error: { code: "INTERNAL_ERROR", message: "..." } }` **And** the error is logged via Pino

4. **Given** any endpoint (GET, POST, PATCH, DELETE) **When** any error occurs **Then** the response always uses the `ApiResponse<T>` envelope format **And** no endpoint ever returns an unstructured error or silently swallows a failure

5. **Given** a request to a non-existent route (e.g. `GET /api/unknown`) **When** the backend responds **Then** it returns a `404` with `{ success: false, error: { code: "NOT_FOUND", message: "Route not found" } }` in `ApiResponse<T>` format (not Fastify's default error format)

6. **Given** the structured error responses are complete **When** I run `pnpm --filter backend test` **Then** `todo.routes.test.ts` includes tests for: 400 returns VALIDATION_ERROR envelope, 404 returns NOT_FOUND envelope, 500 returns INTERNAL_ERROR envelope, all error responses match `ApiResponse<T>` shape

## Tasks / Subtasks

- [ ] Task 1: Add global `setNotFoundHandler` in `app.ts` (AC: #4, #5)
  - [ ] Add `app.setNotFoundHandler()` in `buildApp()` that returns `ApiResponse<never>` with `NOT_FOUND` code
  - [ ] Response format: `{ success: false, error: { code: "NOT_FOUND", message: "Route not found" } }` with status 404
  - [ ] This ensures ALL 404s (including unknown routes outside the todo plugin) use the envelope format
- [ ] Task 2: Move error handler from route-scoped to app-level (AC: #3, #4)
  - [ ] Move `setErrorHandler` from `todo.routes.ts` to `app.ts` (or add an app-level handler alongside the route-scoped one)
  - [ ] **Important decision:** The current route-scoped handler works for todo routes, but unexpected errors outside the routes plugin won't be caught. An app-level handler ensures ALL errors are caught.
  - [ ] The existing error handler logic stays the same — just move it to `app.ts`
  - [ ] Import `ValidationError`, `NotFoundError` from `todo.service.js` in `app.ts`
  - [ ] Remove `fastify.setErrorHandler()` from `todo.routes.ts`
- [ ] Task 3: Add 500 INTERNAL_ERROR test (AC: #3, #6)
  - [ ] Create a test that simulates an unexpected server error
  - [ ] Approach: use `app.inject()` with a route that will throw a non-ValidationError, non-NotFoundError
  - [ ] OR: register a test-only route that throws a generic `Error`
  - [ ] Verify response is 500 with `{ success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } }`
  - [ ] Verify the original error message is NOT exposed to the client (security)
- [ ] Task 4: Add test for unknown route 404 in ApiResponse format (AC: #5, #6)
  - [ ] Test: `GET /api/unknown` returns 404 with `ApiResponse<T>` envelope
  - [ ] Test: response has `success: false`, `error.code: "NOT_FOUND"`, `error.message` is a string
- [ ] Task 5: Add comprehensive ApiResponse<T> shape validation tests (AC: #6)
  - [ ] Test: every error response across all endpoints has exactly `{ success, error: { code, message } }` shape
  - [ ] Test: every success response has exactly `{ success, data }` shape
  - [ ] These may already exist partially — verify and add any missing coverage
- [ ] Task 6: Verify Pino logging on 500 errors (AC: #3)
  - [ ] Confirm `fastify.log.error(error)` is called in the catch-all handler
  - [ ] This is already implemented — just verify it's still present after the refactor
- [ ] Task 7: Verify all existing tests still pass (regression check)
  - [ ] Run `pnpm --filter backend test` to verify nothing broke from the error handler move

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Service/Route Boundary, API Format Standards]

**Service/Route boundary (MUST follow):**
- Services return domain types (`Todo[]`, `Todo`) — never API envelopes
- Services throw on error (e.g., not found) — never return error objects
- Routes catch service errors and wrap in `ApiResponse<T>` envelope
- Routes are the only layer that sets HTTP status codes

**Error contract:**
```ts
// Success
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string } }
```

**Error codes defined:**
- `VALIDATION_ERROR` — 400 (TypeBox validation or service ValidationError)
- `NOT_FOUND` — 404 (service NotFoundError or unknown route)
- `INTERNAL_ERROR` — 500 (catch-all for unexpected errors)

### Current State Analysis

**What already works (from Stories 2.1):**
- `todo.service.ts` has `ValidationError` and `NotFoundError` custom error classes
- `todo.routes.ts` has a comprehensive `setErrorHandler` that handles all three error types
- `ApiResponse<T>` type exists in `shared/types.ts` as a discriminated union
- Tests exist for 400 VALIDATION_ERROR (3 tests) and 404 NOT_FOUND (4 tests)
- Tests exist for ApiResponse<T> envelope shape validation (3 tests)

**Gaps this story closes:**
1. **No 500 INTERNAL_ERROR test** — handler exists but untested
2. **Error handler is route-scoped** — registered via `fastify.setErrorHandler()` inside `todoRoutes` plugin. Errors outside this scope (unknown routes, plugin registration errors) use Fastify's default format
3. **No `setNotFoundHandler`** — requests to unknown routes get Fastify's default JSON error, not `ApiResponse<T>`
4. **No test for unknown route 404** — only tests for not-found todo IDs

### Error Handler Refactoring

**Current (route-scoped in todo.routes.ts):**
```typescript
// This only catches errors thrown within /api/todos/* routes
fastify.setErrorHandler(async (error, _request, reply) => {
  // ... handles ValidationError, NotFoundError, 500
});
```

**Target (app-level in app.ts):**
```typescript
import { ValidationError, NotFoundError } from './todo.service.js';
import type { ApiResponse } from '@todo/shared';

export async function buildApp(opts: { logger?: boolean } = {}) {
  const app = Fastify({ logger: opts.logger ?? true });

  // Global 404 for unknown routes
  app.setNotFoundHandler(async (_request, reply) => {
    const response: ApiResponse<never> = {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    };
    return reply.status(404).send(response);
  });

  // Global error handler — catches all unhandled errors
  app.setErrorHandler(async (error, _request, reply) => {
    if (error.validation) {
      const response: ApiResponse<never> = {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      };
      return reply.status(400).send(response);
    }
    if (error instanceof ValidationError) {
      const response: ApiResponse<never> = {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.message },
      };
      return reply.status(400).send(response);
    }
    if (error instanceof NotFoundError) {
      const response: ApiResponse<never> = {
        success: false,
        error: { code: 'NOT_FOUND', message: error.message },
      };
      return reply.status(404).send(response);
    }
    app.log.error(error);
    const response: ApiResponse<never> = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    };
    return reply.status(500).send(response);
  });

  await app.register(dbPlugin);
  await app.register(todoRoutes, { prefix: '/api/todos' });

  return app;
}
```

**In todo.routes.ts — remove the error handler:**
```typescript
// DELETE this entire block from todo.routes.ts:
// fastify.setErrorHandler(async (error, _request, reply) => { ... });
```

### Testing the 500 Error

**Challenge:** Simulating an unexpected server error that isn't a ValidationError or NotFoundError.

**Recommended approach — register a test-only route:**
```typescript
describe('Error handling — 500 INTERNAL_ERROR', () => {
  it('returns 500 with INTERNAL_ERROR envelope on unexpected error', async () => {
    // The error handler is now on the app, so any route's unhandled error triggers it.
    // We can test by creating a scenario where the DB throws (e.g., invalid query).
    // Alternatively, register a test-only route:

    // Option A: Use a non-existent table operation (would need to mock)
    // Option B: Just verify the handler works by testing an existing route with a broken DB

    // Simplest approach: POST with valid-looking JSON but a type that bypasses TypeBox
    // and causes a service-level runtime error.

    // Actually, the cleanest approach for the 500 test:
    // Add a test-only route in the test setup:
    app.get('/api/test-error', async () => {
      throw new Error('Unexpected failure');
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/test-error',
    });

    expect(response.statusCode).toBe(500);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBe('Internal server error');
    // Verify original error message is NOT leaked
    expect(body.error.message).not.toContain('Unexpected failure');
  });
});
```

**Note:** Since the error handler is now at app level, a test route registered on the app instance will use the same error handler. This is the cleanest way to test 500 errors without mocking.

### Testing Unknown Route 404

```typescript
describe('Error handling — unknown routes', () => {
  it('returns 404 with NOT_FOUND envelope for unknown route', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/unknown',
    });

    expect(response.statusCode).toBe(404);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toBe('Route not found');
  });

  it('returns 404 with NOT_FOUND envelope for unknown method on known route', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: '/api/todos',
    });

    expect(response.statusCode).toBe(404);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
  });
});
```

### Frontend Impact Assessment

**No frontend changes required for this story.** The frontend `todoApi.ts` already handles the `ApiResponse<T>` envelope:
```typescript
async function handleResponse<T>(response: Response): Promise<T> {
  let json: ApiResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new Error(`Server error (${response.status})`);
  }
  if (!json.success) {
    throw new Error(json.error.message);
  }
  return json.data;
}
```

This correctly:
- Parses the JSON as `ApiResponse<T>`
- Throws on `success: false` with the error message
- Handles non-JSON responses (network errors, proxy errors)

Story 4.2 will add frontend error *display* — this story only ensures the backend always returns the right format.

### Project Structure Notes

- All changes are in `backend/src/` — no frontend changes, no shared changes
- Files modified: `app.ts` (add error handler + not-found handler), `todo.routes.ts` (remove error handler)
- Files modified for tests: `todo.routes.test.ts` (add 500, unknown route, comprehensive envelope tests)
- No new files created
- No new dependencies

### What NOT To Do

- Do NOT change the `ApiResponse<T>` type in `shared/types.ts` — it's already correct
- Do NOT change `ValidationError` or `NotFoundError` classes — they work correctly
- Do NOT add error codes or types beyond the three defined (VALIDATION_ERROR, NOT_FOUND, INTERNAL_ERROR)
- Do NOT expose internal error messages to the client in 500 responses — always use generic "Internal server error"
- Do NOT add error middleware for specific HTTP methods — use the single global handler
- Do NOT add retry logic or circuit breakers — that's not in scope
- Do NOT change the frontend `todoApi.ts` — it already handles the envelope correctly
- Do NOT add ErrorMessage component — that's Story 4.2
- Do NOT add inline error display — that's Story 4.2
- Do NOT use `fastify-sensible` or any error handling library — keep it simple with custom handlers

### Previous Story Intelligence

**From Story 2.1 (Backend Toggle & Delete Endpoints):**
- `ValidationError` and `NotFoundError` custom error classes created in `todo.service.ts`
- Error handler added to `todo.routes.ts` (route-scoped via `fastify.setErrorHandler()`)
- TypeBox validation added for PATCH body (`ToggleTodoBody`), DELETE params (`TodoParams`)
- Test patterns: `app.inject()` for route testing, `beforeAll/beforeEach/afterAll` for DB setup/teardown
- Tests cover: 400 validation, 404 not-found for PATCH and DELETE

**From Story 2.3 (Delete Task):**
- Delete endpoint returns `{ id }` in success envelope
- Existing tests verify the envelope shape for delete operations

**Current test file structure:**
- `todo.routes.test.ts` — 16 tests across 4 describe blocks (POST, PATCH, DELETE, GET)
- All tests use `app.inject()` pattern with `beforeAll/beforeEach/afterAll` lifecycle
- Tests import from `./app.js`, `./test-helpers.js`

**Current error handler (to be moved):**
Located at `todo.routes.ts:55-83` — handles `error.validation`, `ValidationError`, `NotFoundError`, and catch-all 500.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.1]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Format Standards — ApiResponse envelope]
- [Source: _bmad-output/planning-artifacts/architecture.md#Service/Route Boundary]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions — Error contract]
- [Source: backend/src/todo.routes.ts — current error handler at lines 55-83]
- [Source: backend/src/todo.routes.test.ts — current test coverage]
- [Source: backend/src/todo.service.ts — ValidationError, NotFoundError classes]
- [Source: backend/src/app.ts — app factory, needs error handler addition]
- [Source: shared/types.ts — ApiResponse<T> type definition]
- [Source: frontend/src/api/todoApi.ts — already handles ApiResponse<T> correctly]
- [Source: _bmad-output/implementation-artifacts/2-1-backend-toggle-and-delete-endpoints.md — original error handling implementation]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
