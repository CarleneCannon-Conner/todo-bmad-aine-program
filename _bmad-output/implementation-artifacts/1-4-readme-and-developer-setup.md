# Story 1.4: README & Developer Setup

Status: done

## Story

As a **developer**,
I want clear setup documentation,
so that I can go from clone to running app without additional guidance.

## Acceptance Criteria

1. **Given** I have cloned the repository **When** I follow the README instructions **Then** I can install dependencies, set up the database, run migrations, and start the app with documented commands **And** `pnpm -r dev` starts both frontend and backend concurrently

2. **Given** the README exists **When** I read it **Then** it documents: prerequisites (Node.js, pnpm, PostgreSQL), environment setup (.env from .env.example), migration command, and dev start command **And** the API endpoints are listed with their methods and paths **And** the project structure is briefly described **And** test commands are documented: `pnpm -r test` (unit/integration), `pnpm --filter e2e test` (E2E)

3. **Given** the full Epic 1 is complete and both servers are running **When** I run `pnpm --filter e2e test` **Then** at least 1 Playwright E2E test passes covering: user opens app, adds a todo via Enter, todo appears in the list

## Tasks / Subtasks

- [x] Task 1: Create README.md at monorepo root (AC: #1, #2)
  - [x] **Prerequisites section:** Node.js 18+, pnpm, PostgreSQL
  - [x] **Getting Started section:**
    - [x] `pnpm install` — install all dependencies
    - [x] Copy `.env.example` to `.env` in `backend/` and configure `DATABASE_URL`
    - [x] `pnpm --filter backend drizzle-kit generate` — generate migrations (if not already present)
    - [x] `pnpm --filter backend drizzle-kit migrate` — run migrations to create tables
    - [x] `pnpm -r dev` — start both frontend (:5173) and backend (:3000)
  - [x] **Project Structure section:** brief description of monorepo layout (frontend/, backend/, shared/, e2e/)
  - [x] **API Endpoints section:** list all 4 endpoints with methods and paths
    - [x] `GET /api/todos` — list all todos
    - [x] `POST /api/todos` — create a new todo
    - [x] `PATCH /api/todos/:id` — update a todo (toggle completion)
    - [x] `DELETE /api/todos/:id` — delete a todo
  - [x] **Testing section:**
    - [x] `pnpm -r test` — run unit/integration tests (Vitest)
    - [x] `pnpm --filter e2e test` — run E2E tests (Playwright, requires running dev servers)
  - [x] **Environment Variables section:** document `DATABASE_URL` and `PORT` with defaults
- [x] Task 2: Write first Playwright E2E test — `e2e/tests/todo-crud.spec.ts` (AC: #3)
  - [x] Test: user opens app, sees the todo interface
  - [x] Test: user types text in input, presses Enter, todo appears in the list
  - [x] Use Playwright's `page.goto('/')`, `page.fill()`, `page.keyboard.press('Enter')`, `page.locator()` patterns
  - [x] Test should be resilient — wait for elements to appear rather than fixed delays
  - [x] Remove `e2e/tests/.gitkeep` after adding the test file
- [x] Task 3: Verify full Epic 1 integration (AC: #1, #3)
  - [x] Ensure `pnpm -r dev` starts both frontend and backend
  - [x] Ensure frontend Vite proxy correctly forwards `/api/*` to backend
  - [x] Run `pnpm -r test` and confirm all unit/integration tests pass
  - [x] Run `pnpm --filter e2e test` and confirm E2E test passes

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Development Workflow, Testing Patterns]

- **README location:** Monorepo root `README.md`
- **Dev command:** `pnpm -r dev` starts all packages concurrently
- **Frontend port:** 5173 (Vite default)
- **Backend port:** 3000 (configured via `PORT` env var)
- **Migrations:** `pnpm --filter backend drizzle-kit generate` then `drizzle-kit migrate`
- **Unit/integration tests:** `pnpm -r test` runs Vitest across frontend + backend
- **E2E tests:** `pnpm --filter e2e test` runs Playwright (requires running dev servers)
- **E2E test location:** `e2e/tests/` directory at monorepo root
- **E2E naming convention:** `todo-crud.spec.ts` per architecture directory structure
- **Playwright baseURL:** `http://localhost:5173` (already configured in `playwright.config.ts`)

### API Endpoints to Document

**Source:** [architecture.md — API & Communication Patterns]

| Method | Path | Description | Status Codes |
|--------|------|-------------|-------------|
| GET | `/api/todos` | List all todos (newest first) | 200 |
| POST | `/api/todos` | Create a new todo | 201, 400 |
| PATCH | `/api/todos/:id` | Toggle completion status | 200, 404 |
| DELETE | `/api/todos/:id` | Delete a todo | 200, 404 |

**Response format:** All endpoints return `ApiResponse<T>` envelope:
- Success: `{ success: true, data: T }`
- Error: `{ success: false, error: { code: string, message: string } }`

**Note:** PATCH and DELETE are not yet implemented (Story 2.1), but should be documented in the README since they are part of the defined API surface.

### Existing E2E Infrastructure (From Story 1.1)

```
e2e/
├── package.json           ← @playwright/test ^1.52.0, "test": "playwright test"
├── playwright.config.ts   ← baseURL: http://localhost:5173, testDir: ./tests
└── tests/
    └── .gitkeep           ← placeholder, remove when adding real tests
```

- Playwright config already set up with correct baseURL
- `pnpm --filter e2e test` is the documented command
- No Playwright browsers installed yet — dev agent should run `pnpm --filter e2e exec playwright install` before first E2E run

### E2E Test Pattern

```typescript
// e2e/tests/todo-crud.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Todo CRUD', () => {
  test('user can add a todo via Enter and see it in the list', async ({ page }) => {
    await page.goto('/');

    // Type a todo and press Enter
    const input = page.getByPlaceholder('add a task...');
    await input.fill('Buy groceries');
    await input.press('Enter');

    // Verify the todo appears in the list
    await expect(page.getByText('Buy groceries')).toBeVisible();
  });
});
```

**Key patterns:**
- Use `page.getByPlaceholder()` to find the input (matches "add a task..." placeholder from FR9)
- Use `page.getByText()` to verify items appear
- Wait for visibility assertions rather than fixed delays
- Each test should be independent — no shared state between tests

### Test Database for E2E

- E2E tests run against the dev database (not a separate test DB)
- Consider truncating todos before each E2E test for clean state
- The Playwright config can use `globalSetup` for DB cleanup if needed, but for 1 test this is optional

### Project Structure to Document

```
todo/
├── frontend/    ← React + Vite SPA (:5173)
├── backend/     ← Fastify API (:3000)
├── shared/      ← @todo/shared types and Drizzle schema
├── e2e/         ← Playwright E2E tests
└── README.md    ← Setup and developer documentation
```

### Previous Story Intelligence

**Story 1.1 learnings:**
- `pnpm install` requires `onlyBuiltDependencies` config in root package.json for esbuild postinstall
- Vite proxy in `vite.config.ts` already forwards `/api/*` to backend

**Story 1.2 context (backend):**
- Backend uses `tsx watch --env-file .env src/server.ts` for dev
- Drizzle migrations in `backend/drizzle/` directory
- `.env.example` in backend/ documents `DATABASE_URL` and `PORT`

**Story 1.3 context (frontend):**
- Frontend uses SWR + todoApi.ts pattern
- Input placeholder is "add a task..." — used in E2E test selectors
- Pessimistic create — todo appears after server confirmation

### What NOT To Do

- Do NOT create a complex README with architecture deep-dives — keep it concise and action-oriented
- Do NOT document internal implementation details (service/route patterns, SWR hooks) — that's for architecture.md
- Do NOT add CI/CD instructions — that's post-MVP
- Do NOT add Docker instructions — that's post-MVP
- Do NOT write more than 1-2 E2E tests — AC requires "at least 1", keep it focused
- Do NOT install additional testing libraries — Playwright is already set up
- Do NOT create a `CONTRIBUTING.md` or other docs — just the README
- Do NOT modify any source code (backend/frontend) — this story is documentation + E2E test only
- Do NOT add authentication setup instructions — no auth in MVP

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Development Workflow]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Testing Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4]
- [Source: e2e/playwright.config.ts — Playwright config with baseURL]
- [Source: backend/.env.example — Environment variable documentation]
- [Source: _bmad-output/implementation-artifacts/1-1-monorepo-scaffold-and-shared-types.md — Story 1.1 learnings]
- [Source: _bmad-output/implementation-artifacts/1-2-backend-api-create-and-list-todos.md — Backend API contract]
- [Source: _bmad-output/implementation-artifacts/1-3-frontend-add-and-view-todos.md — Frontend patterns]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Used `cd backend && npx drizzle-kit migrate` instead of `pnpm --filter backend drizzle-kit migrate` (pnpm doesn't recognize drizzle-kit as a script)
- README documents the npx approach for migrations
- Installed Playwright Chromium browser for E2E tests

### Completion Notes List

- README.md created with all required sections: Prerequisites, Getting Started, Project Structure, API Endpoints, Testing, Environment Variables
- 2 Playwright E2E tests passing: user sees interface, user adds todo via Enter
- Full integration verified: 24 unit/integration tests pass (15 backend + 9 frontend), 2 E2E tests pass
- `pnpm -r dev` confirmed working with both servers starting concurrently
- Vite proxy confirmed forwarding `/api/*` to backend

### File List

- `README.md` — New: developer setup documentation
- `e2e/tests/todo-crud.spec.ts` — New: 2 Playwright E2E tests
- `e2e/tests/.gitkeep` — Deleted: replaced by real test file
- `backend/package.json` — Modified: added "migrate" script for drizzle-kit

### Change Log

- Created README.md at monorepo root with full developer documentation
- Created todo-crud.spec.ts with 2 E2E tests (interface visible + add todo via Enter)
- Removed e2e/tests/.gitkeep placeholder
- Installed Playwright Chromium browser
- 2026-03-11: Code review — Added `createdb` step to README; replaced `cd backend && npx drizzle-kit migrate` with `pnpm --filter backend migrate` (added migrate script to package.json); annotated PATCH/DELETE as "(Epic 2)" in API table; fixed default DATABASE_URL to omit user:password; E2E test uses unique timestamp text for reliable reruns
