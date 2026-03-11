# Story 1.2: Backend API — Create & List Todos

Status: done

## Story

As a **user**,
I want to add todo items and see them persisted,
so that my tasks survive page refreshes and browser sessions.

## Acceptance Criteria

1. **Given** the backend is running **When** I send `POST /api/todos` with `{ "text": "Buy milk" }` **Then** I receive a `201` response with `{ success: true, data: { id, text, isCompleted: false, createdAt } }` **And** the todo is persisted in PostgreSQL

2. **Given** todos exist in the database **When** I send `GET /api/todos` **Then** I receive a `200` response with `{ success: true, data: [...] }` containing all todos **And** todos are sorted by `created_at` DESC (newest first)

3. **Given** the backend is running **When** I send `POST /api/todos` with empty text or whitespace-only text **Then** I receive a `400` response with `{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }`

4. **Given** a fresh database **When** I run `drizzle-kit migrate` **Then** the `todos` table is created from the migration files

5. **Given** the backend code **When** I inspect the architecture **Then** `app.ts` creates the Fastify instance and registers plugins **And** `db.ts` registers Drizzle as a Fastify plugin accessible as `fastify.db` **And** `todo.service.ts` contains business logic returning domain types **And** `todo.routes.ts` wraps service responses in `ApiResponse<T>` **And** Pino logging is enabled via `logger: true` **And** `server.ts` starts the server on the configured PORT

6. **Given** the backend code is complete **When** I run `pnpm --filter backend test` **Then** `todo.service.test.ts` passes with tests covering: create returns a todo with all fields, list returns todos sorted by `created_at` DESC, create rejects empty/whitespace text **And** `todo.routes.test.ts` passes with integration tests covering: POST 201 success, POST 400 validation error, GET 200 returns list, responses use `ApiResponse<T>` envelope

## Tasks / Subtasks

- [x] Task 1: Create Drizzle database plugin — `backend/src/db.ts` (AC: #5)
  - [x] Install `fastify-plugin` as a dependency
  - [x] Create Drizzle client wrapping `pg` Pool with `DATABASE_URL` from `process.env`
  - [x] Register as Fastify plugin using `fastify-plugin` so it decorates the instance as `fastify.db`
  - [x] Add TypeScript declaration merging for `fastify.db` on FastifyInstance
- [x] Task 2: Create Fastify app factory — `backend/src/app.ts` (AC: #5)
  - [x] Create `buildApp()` function that instantiates Fastify with `logger: true`
  - [x] Register db plugin
  - [x] Register todo routes (prefix: `/api/todos`)
  - [x] Export `buildApp` for use by server.ts and tests
- [x] Task 3: Create todo service — `backend/src/todo.service.ts` (AC: #1, #2, #3, #5)
  - [x] `listTodos(db)` — SELECT all, ORDER BY created_at DESC, return `Todo[]`
  - [x] `createTodo(db, text)` — validate non-empty after trim, INSERT, return `Todo`
  - [x] Service functions accept Drizzle instance as parameter (from `fastify.db`)
  - [x] Service throws on validation failure (empty/whitespace text) — never returns error objects
  - [x] Service returns domain types (`Todo`, `Todo[]`) — never API envelopes
- [x] Task 4: Create todo routes — `backend/src/todo.routes.ts` (AC: #1, #2, #3, #5)
  - [x] `GET /api/todos` — calls `listTodos`, wraps in `ApiResponse<T>`, returns 200
  - [x] `POST /api/todos` — TypeBox validation for `{ text: string }`, calls `createTodo`, wraps in `ApiResponse<T>`, returns 201
  - [x] Catch service errors → return `{ success: false, error: { code, message } }` with appropriate HTTP status (400 for validation)
  - [x] Register as Fastify plugin with route prefix
- [x] Task 5: Create server entry point — `backend/src/server.ts` (AC: #5)
  - [x] Import `buildApp` from `app.ts`
  - [x] Read PORT from `process.env` (default 3000)
  - [x] Call `fastify.listen({ port, host: '0.0.0.0' })`
  - [x] Log startup message
- [x] Task 6: Generate and run database migration (AC: #4)
  - [x] Run `pnpm --filter backend drizzle-kit generate` to create SQL migration from shared schema
  - [x] Verify migration file creates `todos` table with correct columns
  - [x] Document migration command in dev notes
- [x] Task 7: Write service unit tests — `backend/src/todo.service.test.ts` (AC: #6)
  - [x] Test: `createTodo` returns a Todo with all fields (id, text, isCompleted, createdAt)
  - [x] Test: `listTodos` returns todos sorted by created_at DESC
  - [x] Test: `createTodo` throws on empty string
  - [x] Test: `createTodo` throws on whitespace-only string
  - [x] Tests need a real test database (see Dev Notes for setup)
- [x] Task 8: Write route integration tests — `backend/src/todo.routes.test.ts` (AC: #6)
  - [x] Test: POST `/api/todos` with valid text → 201, `ApiResponse<T>` with success:true and data
  - [x] Test: POST `/api/todos` with empty text → 400, `ApiResponse<T>` with success:false and VALIDATION_ERROR
  - [x] Test: GET `/api/todos` → 200, `ApiResponse<T>` with data array
  - [x] Test: All responses match `ApiResponse<T>` envelope shape
  - [x] Use `buildApp()` to create test instances (inject pattern)

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Implementation Patterns & Consistency Rules]

- **Service/Route Boundary:** Services return domain types (`Todo[]`, `Todo`) and throw on error. Routes catch errors and wrap in `ApiResponse<T>`. Routes are the ONLY layer that sets HTTP status codes.
- **Fastify Plugin Pattern:** Drizzle client registered as Fastify plugin via `fastify-plugin`, accessed as `fastify.db`. Plugin registered in `app.ts`.
- **Backend File Naming:** Dot-notation, flat in `src/` — `todo.routes.ts`, `todo.service.ts`, `todo.routes.test.ts`, `todo.service.test.ts`
- **Import from shared:** Always `import { ... } from '@todo/shared'` — never subpath imports
- **API Format:** All responses use `ApiResponse<T>` envelope. Success: `{ success: true, data: T }`. Error: `{ success: false, error: { code: string, message: string } }`
- **HTTP Status Codes:** GET 200, POST 201, errors 400 (validation), 404 (not found), 500 (server)
- **Dates:** ISO 8601 strings in JSON responses
- **Sort Order:** `ORDER BY created_at DESC` (newest first)
- **Validation:** TypeBox (bundled with Fastify) — TypeScript-native schemas, zero extra dependencies
- **Logging:** `logger: true` on Fastify instance — Pino structured JSON, automatic request logging
- **Environment:** Use `process.env.DATABASE_URL` and `process.env.PORT`. No dotenv package — `tsx watch --env-file .env` handles it.

### Exact Versions (Already Installed in package.json)

| Package | Version | Notes |
|---------|---------|-------|
| Fastify | ^5.7.0 | Already in backend/package.json |
| Drizzle ORM | ^0.45.1 | Already in backend/package.json |
| pg | ^8.16.0 | Already in backend/package.json |
| drizzle-kit | ^0.31.0 | Already in devDependencies |
| tsx | ^4.19.0 | Already in devDependencies |
| Vitest | ^4.0.0 | Already in devDependencies |

**New dependency needed:** `fastify-plugin` — required for registering Drizzle as a proper Fastify plugin.

**TypeBox:** NOT bundled with Fastify 5.x — must install `@sinclair/typebox` separately. Import from `@sinclair/typebox`.

### Shared Types Already Defined (Do NOT Recreate)

**Source:** [shared/schema.ts, shared/types.ts]

```typescript
// shared/schema.ts — Drizzle table (ALREADY EXISTS)
export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  text: text('text').notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// shared/types.ts — Types (ALREADY EXISTS)
export type Todo = InferSelectModel<typeof todos>;
export interface CreateTodoRequest { text: string; }
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

### Backend File Structure After This Story

```
backend/
├── package.json          ← add fastify-plugin dependency
├── tsconfig.json         ← no changes
├── vitest.config.ts      ← may need env-file config for test DB
├── .env.example          ← no changes (DATABASE_URL, PORT)
├── .env.test             ← already exists, gitignored
├── drizzle.config.ts     ← no changes
├── drizzle/              ← NEW: generated SQL migration files
│   └── 0000_*.sql        ← creates todos table
└── src/
    ├── server.ts         ← NEW: entry point, listen on PORT
    ├── app.ts            ← NEW: Fastify factory + plugin/route registration
    ├── db.ts             ← NEW: Drizzle as Fastify plugin
    ├── todo.service.ts   ← NEW: listTodos, createTodo
    ├── todo.service.test.ts ← NEW: service unit tests
    ├── todo.routes.ts    ← NEW: GET/POST /api/todos
    ├── todo.routes.test.ts  ← NEW: route integration tests
    └── setup.test.ts     ← EXISTS: workspace smoke test (keep)
```

### Drizzle Plugin Implementation Pattern

**Source:** [architecture.md — Fastify Plugin Pattern]

```typescript
// backend/src/db.ts
import fp from 'fastify-plugin';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@todo/shared';

// TypeScript declaration merging
declare module 'fastify' {
  interface FastifyInstance {
    db: ReturnType<typeof drizzle>;
  }
}

export default fp(async (fastify) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  fastify.decorate('db', db);
  fastify.addHook('onClose', async () => { await pool.end(); });
});
```

### TypeBox Validation Pattern

```typescript
// In todo.routes.ts
import { Type } from '@sinclair/typebox';

const CreateTodoBody = Type.Object({
  text: Type.String({ minLength: 1 }),
});
```

TypeBox integrates with Fastify's schema validation natively. Use `schema: { body: CreateTodoBody }` in route options.

### Testing Strategy

**Service tests (`todo.service.test.ts`):**
- Need a real PostgreSQL test database (not mocked)
- Use `.env.test` with test `DATABASE_URL`
- Set up/teardown: truncate `todos` table before each test
- Import Drizzle directly (not through Fastify plugin) for service-level tests

**Route integration tests (`todo.routes.test.ts`):**
- Use Fastify's `inject()` method — no real HTTP server needed
- Build app with `buildApp()`, then `app.inject({ method, url, payload })`
- Still needs real test database for full integration
- Verify response shape matches `ApiResponse<T>` exactly

**Test database setup:**
- `backend/.env.test` already exists (gitignored)
- Load test env in vitest.config.ts or test setup file
- Ensure test DB URL differs from dev DB URL
- Run migrations against test DB before test suite

### What NOT To Do

- Do NOT install `dotenv` — use `tsx --env-file` for dev, and configure vitest to load `.env.test`
- Do NOT install `@sinclair/typebox` separately — it's bundled with Fastify 5.x
- Do NOT create frontend files — this story is backend only
- Do NOT create PATCH or DELETE endpoints — those are Story 2.1
- Do NOT create any component folders — that's Epic 2+
- Do NOT add a `user_id` column — explicitly deferred per architecture
- Do NOT return error objects from service functions — services THROW, routes CATCH
- Do NOT use direct `fetch` or HTTP calls in tests — use Fastify's `inject()` pattern
- Do NOT redeclare `Todo`, `CreateTodoRequest`, or `ApiResponse<T>` — import from `@todo/shared`
- Do NOT import from `@todo/shared/schema` subpath — always use barrel `@todo/shared`
- Do NOT skip the Drizzle migration step — migration files from day one per architecture

### Project Structure Notes

- All backend source files go flat in `backend/src/` — no subdirectories
- Dot-notation naming: `todo.routes.ts`, `todo.service.ts`, `db.ts`, `app.ts`, `server.ts`
- Co-located tests: `todo.routes.test.ts` next to `todo.routes.ts`
- Migration files in `backend/drizzle/` (auto-generated by drizzle-kit)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions — Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns — Service/Route Boundary]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns — Fastify Plugin Pattern]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns — API Format Standards]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns — Testing Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
- [Source: shared/schema.ts — Drizzle table definition]
- [Source: shared/types.ts — Todo, CreateTodoRequest, ApiResponse<T>]
- [Source: _bmad-output/implementation-artifacts/1-1-monorepo-scaffold-and-shared-types.md — Previous story learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Fixed: `@sinclair/typebox` not bundled with Fastify 5.x — had to install separately despite story notes
- Fixed: `loadEnv` not exported from vitest 4.x — used hardcoded test DATABASE_URL in vitest.config.ts
- Fixed: PostgreSQL 14 broken library links — reinstalled via homebrew (14.1 → 14.22)
- Created test database: `createuser -s user`, `createdb -U user todo_test`

### Completion Notes List

- All 15 tests passing (3 test files: setup.test.ts, todo.service.test.ts, todo.routes.test.ts)
- Service/Route boundary pattern implemented as specified
- TypeBox validation on POST body with minLength: 1
- Fastify error handler catches both service ValidationError and Fastify schema validation errors
- Drizzle migration generated: `backend/drizzle/0000_overjoyed_venom.sql`

### File List

- `backend/package.json` — Modified: added fastify-plugin, @sinclair/typebox dependencies
- `backend/src/db.ts` — Drizzle Fastify plugin with declaration merging
- `backend/src/app.ts` — Fastify app factory with plugin/route registration
- `backend/src/todo.service.ts` — listTodos, createTodo, ValidationError class
- `backend/src/todo.routes.ts` — GET/POST /api/todos with ApiResponse<T> envelope
- `backend/src/server.ts` — Server entry point
- `backend/src/test-helpers.ts` — Shared test DB setup/teardown utilities
- `backend/src/todo.service.test.ts` — 6 service unit tests
- `backend/src/todo.routes.test.ts` — 8 route integration tests (incl. whitespace validation, sort order)
- `shared/package.json` — Modified: added "type": "module" and "exports" field for ESM resolution
- `backend/vitest.config.ts` — Updated to load .env.test file
- `backend/drizzle/0000_overjoyed_venom.sql` — Migration creating todos table
- `backend/drizzle/meta/0000_snapshot.json` — Drizzle migration metadata
- `backend/drizzle/meta/_journal.json` — Drizzle migration journal

### Change Log

- Created db.ts, app.ts, todo.service.ts, todo.routes.ts, server.ts
- Created todo.service.test.ts, todo.routes.test.ts
- Generated Drizzle migration files
- Added `fastify-plugin` and `@sinclair/typebox` as dependencies
- Updated vitest.config.ts for test database configuration
- 2026-03-11: Code review — Refactored vitest.config.ts to load .env.test instead of hardcoding credentials; extracted shared test-helpers.ts to eliminate duplicate CREATE TABLE SQL and pool-per-test inefficiency; added whitespace-only route integration test; corrected dev notes re: @sinclair/typebox; updated File List
- 2026-03-11: Code review #2 — test-helpers.ts now reads actual migration SQL file instead of hardcoded CREATE TABLE; added sort order integration test for GET endpoint (AC #2); aligned DB type annotation in todo.service.ts; documented shared/package.json change in File List; added e2e artifacts to .gitignore
