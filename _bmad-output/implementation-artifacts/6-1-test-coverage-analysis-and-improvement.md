# Story 6.1: Test Coverage Analysis & Improvement

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want comprehensive test coverage across the application,
so that I have confidence in code quality and can catch regressions.

## Acceptance Criteria

1. **Given** the existing test suite from Epics 1-4 **When** I run coverage analysis (`pnpm -r test -- --coverage`) **Then** a coverage report is generated for both frontend and backend

2. **Given** the coverage report identifies gaps **When** I review uncovered code paths **Then** meaningful tests are added to close gaps — targeting business logic, error paths, and edge cases (not boilerplate or trivial getters) **And** the overall meaningful coverage reaches minimum 70%

3. **Given** the E2E test suite **When** I run `pnpm --filter e2e test` **Then** at least 5 Playwright E2E tests pass covering core user flows: add a task, toggle complete/incomplete, delete a task, error display and retry, app loads with persisted data

4. **Given** all tests pass **When** I inspect the test suite **Then** unit/integration tests are co-located with source files **And** E2E tests are in `e2e/` at the monorepo root **And** no test relies on implementation details that would break on refactor

## Tasks / Subtasks

- [ ] Task 1: Install coverage tooling (AC: #1)
  - [ ] Install `@vitest/coverage-v8` as devDependency in both `backend/` and `frontend/`
  - [ ] Version must match Vitest version (4.0.x)
  - [ ] Command: `pnpm --filter backend add -D @vitest/coverage-v8` and same for frontend

- [ ] Task 2: Configure coverage reporting in backend (AC: #1)
  - [ ] Update `backend/vitest.config.ts` with coverage configuration
  - [ ] Provider: `v8`
  - [ ] Reporter: `['text', 'text-summary', 'html', 'lcov']`
  - [ ] Report directory: `./coverage`
  - [ ] Include: `src/**/*.ts` (exclude test files, config files)
  - [ ] Exclude: `src/**/*.test.ts`, `src/setup.test.ts`
  - [ ] Add `coverage/` to `backend/.gitignore`

- [ ] Task 3: Configure coverage reporting in frontend (AC: #1)
  - [ ] Update `frontend/vite.config.ts` test section with coverage configuration
  - [ ] Provider: `v8`
  - [ ] Reporter: `['text', 'text-summary', 'html', 'lcov']`
  - [ ] Report directory: `./coverage`
  - [ ] Include: `src/**/*.{ts,tsx}` (exclude test files, CSS, assets)
  - [ ] Exclude: `src/**/*.test.{ts,tsx}`, `src/test-setup.ts`, `src/main.tsx`, `src/vite-env.d.ts`
  - [ ] Add `coverage/` to `frontend/.gitignore`

- [ ] Task 4: Run initial coverage analysis (AC: #1)
  - [ ] Run `pnpm --filter backend test -- --coverage` and record baseline
  - [ ] Run `pnpm --filter frontend test -- --coverage` and record baseline
  - [ ] Document current coverage percentages per package (lines, branches, functions, statements)
  - [ ] Identify uncovered code paths — focus on business logic, error paths, edge cases

- [ ] Task 5: Add missing backend tests to reach 70% (AC: #2)
  - [ ] Review coverage report for `todo.service.ts` — add tests for any uncovered branches
  - [ ] Review coverage report for `todo.routes.ts` — add tests for any uncovered error paths
  - [ ] Review coverage report for `health.routes.ts` — verify coverage (should be near 100% already)
  - [ ] Review coverage report for `app.ts` — add tests for app factory, plugin registration, error handler
  - [ ] Review coverage report for `db.ts` — add test for database plugin registration if practical
  - [ ] Review coverage report for `server.ts` — entry point, may exclude from coverage (bootstrap code)
  - [ ] Target: business logic and error paths, NOT boilerplate

- [ ] Task 6: Add missing frontend tests to reach 70% (AC: #2)
  - [ ] Review coverage report for `todoApi.ts` — add tests for any uncovered error handling paths
  - [ ] Review coverage report for `useTodos.ts` — add tests for any uncovered branches (loading states, error combinations)
  - [ ] Review coverage report for `App.tsx` — add integration-style tests for uncovered user flows
  - [ ] Review coverage for each component — fill gaps in branch coverage
  - [ ] Do NOT test pure CSS or trivial barrel exports (`index.ts` files)

- [ ] Task 7: Verify E2E test suite meets minimum 5 tests (AC: #3)
  - [ ] Run `pnpm --filter e2e test` and count passing tests
  - [ ] Verify these core flows are covered: add a task, toggle complete/incomplete, delete a task, error display and retry, app loads with persisted data
  - [ ] If any core flow is missing, add the E2E test
  - [ ] Current E2E files: `todo-crud.spec.ts`, `todo-theme.spec.ts`

- [ ] Task 8: Add coverage threshold enforcement (AC: #2)
  - [ ] Add `thresholds` to backend vitest coverage config: `{ lines: 70, branches: 70, functions: 70, statements: 70 }`
  - [ ] Add `thresholds` to frontend vitest coverage config: `{ lines: 70, branches: 70, functions: 70, statements: 70 }`
  - [ ] Verify `pnpm -r test -- --coverage` passes with thresholds enforced

- [ ] Task 9: Add coverage scripts to package.json (AC: #1)
  - [ ] Add `"test:coverage": "vitest run --coverage"` to both backend and frontend `package.json`
  - [ ] Add `"test:coverage": "pnpm -r --filter '!e2e' test:coverage"` to root `package.json`
  - [ ] Verify `pnpm test:coverage` from root generates reports for both packages

- [ ] Task 10: Final verification and regression check (AC: #1, #2, #3, #4)
  - [ ] `pnpm -r test` — all unit/integration tests pass
  - [ ] `pnpm test:coverage` — coverage meets 70% threshold for both packages
  - [ ] `pnpm --filter e2e test` — at least 5 E2E tests pass
  - [ ] Verify all tests are co-located with source files (not in separate `__tests__` dirs)
  - [ ] Verify no tests rely on implementation details (no testing internal state, no snapshot tests of CSS)

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Testing Patterns]

**Testing patterns (MUST follow):**
- Unit/integration tests: co-located with source files (`.test.ts` / `.test.tsx`)
- E2E tests: `e2e/` directory at monorepo root (Playwright)
- Test runner: Vitest for unit/integration, Playwright for E2E
- Test database: separate PostgreSQL database via `DATABASE_URL` in `.env.test`
- Test DB reset: truncate tables before each test (Vitest), once before suite (Playwright)

**Frontend testing patterns (from architecture):**
- All mocking targets `todoApi` — single mock boundary
- SWR hooks consume `todoApi` functions — SWR expects throws for error state handling
- Components receive data via props — test via props, not internal state

**Backend testing patterns (from architecture):**
- Services return domain types and throw on error — test return values and thrown errors
- Routes wrap in `ApiResponse<T>` — test response envelope shape
- Drizzle registered as Fastify plugin — test via `app.inject()` integration tests

### Current Test Infrastructure

**Test counts (from Story 4.2 completion + Story 5.1):**
- Backend: 36 tests across 4 test files
- Frontend: 71 tests across 14 test files
- E2E: tests across 2 spec files (`todo-crud.spec.ts`, `todo-theme.spec.ts`)
- Total unit/integration: 107 tests

**Test files inventory:**

Backend (`backend/src/`):
- `setup.test.ts` — test database setup/teardown utilities
- `todo.service.test.ts` — service layer business logic
- `todo.routes.test.ts` — route handler integration tests
- `health.routes.test.ts` — health endpoint tests (from Story 5.1)

Frontend (`frontend/src/`):
- `api/todoApi.test.ts` — API boundary tests
- `design-system.test.ts` — CSS design token tests
- `hooks/useTodos.test.ts` — SWR hook tests with mocked API
- `components/App.test.tsx` — App component integration tests
- `components/AddButton/AddButton.test.tsx`
- `components/BeeHeader/BeeHeader.test.tsx`
- `components/CardShell/CardShell.test.tsx`
- `components/DeleteButton/DeleteButton.test.tsx`
- `components/ErrorMessage/ErrorMessage.test.tsx`
- `components/HexCheckbox/HexCheckbox.test.tsx`
- `components/LoadingSkeleton/LoadingSkeleton.test.tsx`
- `components/TaskInput/TaskInput.test.tsx`
- `components/TaskItem/TaskItem.test.tsx`
- `components/TaskList/TaskList.test.tsx`

E2E (`e2e/tests/`):
- `todo-crud.spec.ts` — CRUD operations + error/retry
- `todo-theme.spec.ts` — theme/visual tests

**Coverage tooling: NOT YET INSTALLED**
- Neither `@vitest/coverage-v8` nor `@vitest/coverage-istanbul` exists in any package.json
- Coverage provider must be installed before `--coverage` flag works

### Vitest Coverage Configuration Pattern

**Backend (`backend/vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    passWithNoTests: true,
    envFile: '.env.test',
    exclude: ['dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/setup.test.ts'],
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70,
      },
    },
  },
});
```

**Frontend (in `frontend/vite.config.ts` test section):**
```typescript
test: {
  // ... existing config ...
  coverage: {
    provider: 'v8',
    reporter: ['text', 'text-summary', 'html', 'lcov'],
    reportsDirectory: './coverage',
    include: ['src/**/*.{ts,tsx}'],
    exclude: [
      'src/**/*.test.{ts,tsx}',
      'src/test-setup.ts',
      'src/main.tsx',
      'src/vite-env.d.ts',
    ],
    thresholds: {
      lines: 70,
      branches: 70,
      functions: 70,
      statements: 70,
    },
  },
},
```

### Coverage Strategy — What to Test vs Skip

**High-value targets (test these):**
- `todo.service.ts` — all business logic branches, error throws, edge cases
- `todo.routes.ts` — all endpoint paths, validation errors, not-found, success
- `todoApi.ts` — success/error unwrapping, network error handling
- `useTodos.ts` — all hook behaviors: create, toggle, delete, error states, loading states
- `App.tsx` — user flow integration: submit, toggle, delete, error display
- Component interaction logic — event handlers, conditional rendering, disabled states

**Low-value targets (skip or minimal coverage):**
- `server.ts` — entry point bootstrap, hard to unit test, exclude from coverage
- `db.ts` — plugin registration, tested implicitly via route integration tests
- `main.tsx` — React DOM render, exclude from coverage
- `index.ts` barrel exports — trivial re-exports, exclude
- Pure presentational components with no logic — only test if they render without error
- CSS files — not covered by Vitest

**Meaningful coverage means:**
- Test business logic branches, not just happy paths
- Test error handling — what happens when API calls fail, when validation rejects
- Test edge cases — empty input, long text, concurrent operations
- Do NOT pad coverage with trivial tests (testing that a div renders, snapshot tests of markup)

### E2E Test Verification

**Required core flows (minimum 5 Playwright tests):**
1. Add a task — type text, press Enter, verify task appears
2. Toggle complete/incomplete — click task, verify visual state changes
3. Delete a task — click delete, verify task disappears
4. Error display and retry — simulate backend failure, verify error message, verify retry works
5. App loads with persisted data — add tasks, refresh page, verify tasks still present

**Current E2E tests exist in:**
- `e2e/tests/todo-crud.spec.ts` — likely covers add, toggle, delete, error/retry
- `e2e/tests/todo-theme.spec.ts` — likely covers visual/theme tests

If the 5 required flows are already covered, no new E2E tests needed. Just verify count and coverage.

### What NOT To Do

- Do NOT add snapshot tests — they're brittle and test implementation details
- Do NOT test CSS styling via unit tests — that's what E2E visual tests are for
- Do NOT test barrel export files (`index.ts`) — trivial re-exports don't need tests
- Do NOT test `main.tsx` — React root render is framework boilerplate
- Do NOT pad coverage with meaningless tests (e.g., "renders without crashing" for every component)
- Do NOT mock internal module boundaries — mock at the API boundary (`todoApi`) only
- Do NOT add tests that depend on implementation details (internal state shape, specific DOM structure)
- Do NOT use `istanbul` provider — use `v8` (faster, native, recommended for Vitest 4.x)
- Do NOT configure coverage in a root `vitest.config.ts` — each package manages its own coverage
- Do NOT add coverage HTML reports to git — add `coverage/` to `.gitignore`
- Do NOT chase 100% coverage — 70% is the target, focus on meaningful coverage of business logic

### Previous Story Intelligence

**From Story 5.1 (most recent completed):**
- Added `health.routes.ts` and `health.routes.test.ts` to backend
- Backend now has 36 tests (was 34 before health endpoint)
- Frontend unchanged at 71 tests
- All 107 unit/integration tests pass

**From Story 4.2 (last MVP story):**
- Added `ErrorMessage` component with tests
- Added error state tests to `TaskItem.test.tsx`, `App.test.tsx`
- Added `useTodos.test.ts` error state tests
- Added E2E error+retry test
- Code review added: create error tests, focus restoration test, itemErrors unit test

**Testing patterns established across all stories:**
- Frontend: `@testing-library/react` with `render`, `screen`, `fireEvent`, `waitFor`
- Frontend hooks: `renderHook` with SWR wrapper, mock API via `vi.mock()`
- Backend: `app.inject()` for integration tests, `setupTestDb()`/`teardownTestDb()` for DB lifecycle
- E2E: Playwright with `page.goto()`, `page.route()` for interception, `expect().toBeVisible()`

### Current Vitest Configuration

**Backend (`backend/vitest.config.ts`):**
- `globals: true`
- `passWithNoTests: true`
- `envFile: '.env.test'`
- Excludes: `dist/**`, `node_modules/**`
- No coverage config yet

**Frontend (in `frontend/vite.config.ts`):**
- `environment: 'jsdom'`
- `globals: true`
- `setupFiles: ['./src/test-setup.ts']`
- `passWithNoTests: true`
- React plugin enabled
- No coverage config yet

### Project Structure Notes

- Modified: `backend/vitest.config.ts` (add coverage config)
- Modified: `frontend/vite.config.ts` (add coverage config to test section)
- Modified: `backend/package.json` (add `@vitest/coverage-v8`, `test:coverage` script)
- Modified: `frontend/package.json` (add `@vitest/coverage-v8`, `test:coverage` script)
- Modified: `package.json` (root — add `test:coverage` script)
- New/modified test files as needed to close coverage gaps
- New: `backend/.gitignore` or update (add `coverage/`)
- New: `frontend/.gitignore` or update (add `coverage/`)
- No new source code files — only tests and configuration

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 6.1 — Test Coverage Analysis & Improvement]
- [Source: _bmad-output/planning-artifacts/prd.md#Quality Assurance — FR35, FR36]
- [Source: _bmad-output/planning-artifacts/architecture.md#Testing Patterns — co-located, Vitest, Playwright]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend API Boundary — single mock boundary at todoApi]
- [Source: _bmad-output/implementation-artifacts/4-2-inline-error-display-and-retry.md — test patterns, 101 tests baseline]
- [Source: _bmad-output/implementation-artifacts/5-1-dockerfiles-for-frontend-and-backend.md — 107 tests after health endpoint]
- [Source: backend/vitest.config.ts — current config, needs coverage addition]
- [Source: frontend/vite.config.ts — current test config, needs coverage addition]
- [Source: e2e/playwright.config.ts — E2E config, base URL localhost:5173]
- [Source: project-context.md — training Step 4 quality assurance requirements]
- [Source: vitest.dev/guide/coverage — official Vitest coverage docs]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
