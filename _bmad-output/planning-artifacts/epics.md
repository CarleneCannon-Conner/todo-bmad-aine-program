---
stepsCompleted: [step-01, step-02, step-03, step-04]
workflowStatus: complete
completedDate: '2026-03-11'
inputDocuments:
  - project-context.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/ux-design-directions.html
---

# todo - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for todo, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can create a new todo item with a short text description
FR2: User can view the full list of their todo items
FR3: User can mark a todo item as complete
FR4: User can mark a completed todo item as incomplete
FR5: User can delete an individual todo item
FR6: System stores a creation timestamp for each todo item
FR7: System persists all todo items across page refreshes and browser sessions
FR8: User can visually distinguish between complete and incomplete todo items at a glance
FR9: User is shown an empty state when no todo items exist; the input field displays placeholder text "add a task..." at all times regardless of list state
FR10: User can see their full todo list immediately upon opening the application without any login or setup
FR11: User can submit a new todo item by pressing Enter
FR12: User can submit a new todo item by clicking an add button
FR13: System enables the add button only when valid input is present
FR14: User is shown a loading state while the application is fetching data
FR15: User sees immediate visual feedback when an action is performed (add, complete, delete) without requiring a page reload; toggle and delete reflect visually before backend confirmation (optimistic); create waits for backend confirmation before displaying the new item
FR16: User is shown an inline error message below the input field when a create action fails; input retains the entered text and focus so the user can retry immediately
FR17: User is shown an inline error message below the task item when a complete/incomplete toggle action fails; the visual state reverts smoothly to its prior state
FR18: User is shown an inline error message below the task item when a delete action fails; the task reappears in its original position
FR19: System never silently fails — all backend errors surface to the user inline near the action that failed; errors persist until the next successful action on that item
FR20: System returns structured error responses for all failed operations, enabling the frontend to surface meaningful feedback to the user
FR21: Application displays a bumble bee themed colour palette
FR22: Application displays a static bumble bee image prominently at the top of the page
FR23: Application layout adapts to desktop and mobile screen sizes without degradation
FR24: Developer can clone the repository and run the application locally using a documented setup process
FR25: Developer can understand the project structure and API surface without additional documentation beyond the README
FR26: System exposes a small, well-defined API for all todo CRUD operations
FR27: User can enter todo items of variable length; long text wraps gracefully without breaking layout or obscuring completion and delete controls
FR28: Actions on a specific task item are disabled while a request for that item is in-flight; other task items remain fully interactive
FR29: Empty input is rejected client-side without an API call; leading and trailing whitespace is trimmed before submission

### NonFunctional Requirements

NFR1: All user-initiated actions (add, complete, delete) must complete and reflect in the UI within 200ms under normal conditions
NFR2: Initial page load must render the todo list within 500ms under normal network conditions
NFR3: The application must not require a page reload to reflect state changes
NFR4: Zero data loss across page refreshes and browser sessions
NFR5: Backend must persist all todo operations durably — no silent write failures
NFR6: All failed operations must return structured error responses; no silent failures permitted
NFR7: Error states must not block or prevent continued use of the application — users can continue to add, complete, and delete items without explicitly dismissing errors
NFR8: Codebase must follow conventional, predictable structure requiring no explanation beyond the README
NFR9: Setup from clone to running locally must be achievable by a developer unfamiliar with the codebase
NFR10: The API surface must be small and self-evident; adding a new field to a todo item must be straightforward from existing patterns
NFR11: MVP: No formal accessibility compliance required; semantic HTML included as zero-cost default. MVP uses original design palette values; WCAG contrast-adjusted tokens (placeholder, done-text, input-border, hex-stroke) deferred to post-MVP alongside keyboard navigation and WCAG AA work

### Additional Requirements

**From Architecture:**
- Starter template: Custom pnpm monorepo + Vite react-ts template (Epic 1 Story 1)
- Monorepo structure: pnpm workspaces with frontend/, backend/, shared/ packages
- Shared types package (@todo/shared) with barrel export — must be set up before frontend or backend
- TypeScript throughout with strict tsconfig in each package
- Backend: Fastify 5.x + Drizzle ORM 0.45.x + PostgreSQL + TypeBox validation
- Frontend: React + Vite 7.x + SWR for server state + plain CSS custom properties
- API: 4 REST endpoints (GET, POST, PATCH, DELETE /api/todos) with ApiResponse<T> envelope
- Service/route boundary: services return domain types and throw on error; routes wrap in ApiResponse<T>
- Frontend API boundary: single todoApi.ts module, SWR hooks consume it
- Drizzle registered as Fastify plugin (fastify.db)
- Database migrations via drizzle-kit generate + migrate from day one
- UUID v4 for IDs via PostgreSQL gen_random_uuid()
- Default sort: ORDER BY created_at DESC (newest first)
- Environment config: per-package .env + .env.example; .env in .gitignore
- Logging: Fastify built-in Pino (logger: true)
- Testing: Vitest for unit/integration (co-located), Playwright for E2E (e2e/ at root)
- Naming conventions: snake_case DB, camelCase API/code, PascalCase types/components
- Folder-per-component with index.ts barrel exports
- Vite proxy /api/* to backend in dev

**From UX Design:**
- Honeycomb hex checkboxes (HexCheckbox) with three visual states: idle, focused, done
- 12 CSS design tokens defined in :root (confirmed colour values including WCAG-updated tokens)
- Patrick Hand font (Google Fonts) with cursive/sans-serif fallback
- Desktop: 560px card on Honey Oak (#C9A96E) background at 768px+ breakpoint
- Mobile: full-bleed, no card treatment
- Card shadow: 0 4px 24px rgba(61,46,31,0.18), 0 1px 4px rgba(61,46,31,0.10)
- Loading skeleton: pulsing hex + text bar placeholders while tasks load
- Delete button: hidden by default, revealed on hover/focus-within
- Error messages: calm factual tone — "Couldn't [verb] task. Try again."
- Transition timing: 0.15s for state changes, 0.2s for spatial movement (delete slide-out)
- prefers-reduced-motion: blanket transition-duration 0.01s
- Placeholder text: "add a task..." (same at all times, not conditional on list state)
- AddButton: 40x40px circle, "+" glyph, inactive when empty, amber when text present
- Bee SVG as ambient mascot at top of page
- 9 components: HexCheckbox, TaskItem, TaskInput, AddButton, DeleteButton, ErrorMessage, TaskList, BeeHeader, CardShell
- No confirmation dialog on delete (Carlene's explicit preference)
- Error colour: standard red (#D32F2F), not theme-derived — clarity wins over palette harmony

**From Project Context (Training Deliverables — inform stories but must not over-engineer MVP):**
- Docker Compose containerisation (post-MVP deliverable, architecture must not prevent it)
- Test coverage minimum 70%
- 5+ passing Playwright E2E tests
- WCAG AA accessibility audit (post-MVP)
- Security review
- README with setup instructions

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Create todo item |
| FR2 | Epic 1 | View full list |
| FR3 | Epic 2 | Mark todo complete |
| FR4 | Epic 2 | Mark todo incomplete |
| FR5 | Epic 2 | Delete individual todo |
| FR6 | Epic 1 | Creation timestamp |
| FR7 | Epic 1 | Persist across sessions |
| FR8 | Epic 2 | Visual complete/incomplete distinction |
| FR9 | Epic 3 | Empty state + contextual placeholder |
| FR10 | Epic 1 | Immediate list on load, no login |
| FR11 | Epic 1 | Submit via Enter |
| FR12 | Epic 2 | Submit via AddButton |
| FR13 | Epic 2 | AddButton enabled only with valid input |
| FR14 | Epic 3 | Loading state |
| FR15 | Epic 2 | Immediate visual feedback, optimistic UI |
| FR16 | Epic 4 | Inline error on create failure |
| FR17 | Epic 4 | Inline error on toggle failure + smooth revert |
| FR18 | Epic 4 | Inline error on delete failure + task reappears |
| FR19 | Epic 4 | No silent failures, errors inline |
| FR20 | Epic 4 | Structured backend error responses |
| FR21 | Epic 3 | Bee colour palette |
| FR22 | Epic 3 | Static bee image |
| FR23 | Epic 3 | Responsive desktop + mobile |
| FR24 | Epic 1 | Documented setup process |
| FR25 | Epic 1 | Understandable project structure |
| FR26 | Epic 1 | Well-defined API |
| FR27 | Epic 2 | Long text wrapping |
| FR28 | Epic 2 | Per-item action disable during in-flight |
| FR29 | Epic 2 | Client-side validation + trim |

## Epic List

### Epic 1: Project Foundation & First Task

A developer can clone the repo, run the app, and a user can add and see their first todo item persisted in the database.

**FRs covered:** FR1, FR2, FR6, FR7, FR10, FR11, FR24, FR25, FR26

Includes monorepo setup (pnpm workspaces, shared types, tsconfigs), backend (Fastify + Drizzle + PostgreSQL with migrations), frontend (React + Vite + SWR), Vite proxy wiring, and README. Delivers the first vertical slice — type a task, press Enter, see it in the list, refresh and it's still there.

### Epic 2: Complete Task Lifecycle

A user can manage their full task list — mark tasks complete/incomplete, delete tasks, and see immediate visual feedback for every action.

**FRs covered:** FR3, FR4, FR5, FR8, FR12, FR13, FR15, FR27, FR28, FR29

Adds toggle, delete, optimistic UI for toggle/delete, AddButton, visual complete/incomplete distinction, per-item action disable during in-flight requests, client-side validation and whitespace trimming, and graceful long text wrapping.

### Epic 3: Visual Design & Responsive Experience

The app looks and feels like the bee-themed product — warm palette, honeycomb checkboxes, responsive layout across desktop and mobile, with loading and empty states that feel polished.

**FRs covered:** FR9, FR14, FR21, FR22, FR23

Applies the full design system — 12 CSS tokens, Patrick Hand font, BeeHeader with bee SVG, CardShell with desktop card layout, HexCheckbox styling, loading skeleton, contextual placeholder text, mobile-first with 768px card breakpoint.

### Epic 4: Error Handling & Resilience

When something goes wrong, the user sees it clearly, can keep working, and can retry — the app never silently fails.

**FRs covered:** FR16, FR17, FR18, FR19, FR20

ErrorMessage component with inline errors below failed items, structured backend error responses (ApiResponse<T> envelope), errors persist until next successful action on that item, retry-in-place pattern, optimistic rollback with smooth transitions.

## Epic 1: Project Foundation & First Task

A developer can clone the repo, run the app, and a user can add and see their first todo item persisted in the database.

### Story 1.1: Monorepo Scaffold & Shared Types

As a **developer**,
I want a properly structured monorepo with shared types and build configuration,
So that I have a solid foundation to build the frontend and backend against a single source of truth.

**Acceptance Criteria:**

**Given** a fresh clone of the repository
**When** I inspect the project structure
**Then** I see a pnpm workspace with `frontend/`, `backend/`, and `shared/` packages
**And** `pnpm-workspace.yaml` lists all three packages
**And** each package has its own `package.json` and `tsconfig.json` with strict mode enabled

**Given** the shared package exists
**When** I inspect `@todo/shared`
**Then** `schema.ts` defines a `todos` table with columns: `id` (uuid, PK, default gen_random_uuid()), `text` (text, not null), `is_completed` (boolean, default false), `created_at` (timestamp, default now())
**And** `types.ts` exports `Todo`, `CreateTodoRequest`, and `ApiResponse<T>` types
**And** `index.ts` barrel-exports everything from `schema.ts` and `types.ts`

**Given** the monorepo root
**When** I inspect project configuration
**Then** `.gitignore` excludes `node_modules/`, `.env`, `dist/`, and `*.local`
**And** `.env.example` files exist in both `backend/` and `frontend/` with documented variables

**Given** the monorepo is set up
**When** I inspect test infrastructure
**Then** Vitest is configured in both `frontend/` and `backend/` packages
**And** `e2e/` directory exists at monorepo root with `playwright.config.ts`
**And** `backend/.env.test` (gitignored) documents the test `DATABASE_URL`
**And** `pnpm -r test` runs Vitest across frontend and backend
**And** `pnpm --filter e2e test` is the documented Playwright command

### Story 1.2: Backend API — Create & List Todos

As a **user**,
I want to add todo items and see them persisted,
So that my tasks survive page refreshes and browser sessions.

**Acceptance Criteria:**

**Given** the backend is running
**When** I send `POST /api/todos` with `{ "text": "Buy milk" }`
**Then** I receive a `201` response with `{ success: true, data: { id, text, isCompleted: false, createdAt } }`
**And** the todo is persisted in PostgreSQL

**Given** todos exist in the database
**When** I send `GET /api/todos`
**Then** I receive a `200` response with `{ success: true, data: [...] }` containing all todos
**And** todos are sorted by `created_at` DESC (newest first)

**Given** the backend is running
**When** I send `POST /api/todos` with empty text or whitespace-only text
**Then** I receive a `400` response with `{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }`

**Given** a fresh database
**When** I run `drizzle-kit migrate`
**Then** the `todos` table is created from the migration files

**Given** the backend code
**When** I inspect the architecture
**Then** `app.ts` creates the Fastify instance and registers plugins
**And** `db.ts` registers Drizzle as a Fastify plugin accessible as `fastify.db`
**And** `todo.service.ts` contains business logic returning domain types
**And** `todo.routes.ts` wraps service responses in `ApiResponse<T>`
**And** Pino logging is enabled via `logger: true`
**And** `server.ts` starts the server on the configured PORT

**Given** the backend code is complete
**When** I run `pnpm --filter backend test`
**Then** `todo.service.test.ts` passes with tests covering: create returns a todo with all fields, list returns todos sorted by `created_at` DESC, create rejects empty/whitespace text
**And** `todo.routes.test.ts` passes with integration tests covering: POST 201 success, POST 400 validation error, GET 200 returns list, responses use `ApiResponse<T>` envelope

### Story 1.3: Frontend — Add & View Todos

As a **user**,
I want to open the app and immediately see my todos, and add new ones by typing and pressing Enter,
So that I can capture and track tasks without any setup or friction.

**Acceptance Criteria:**

**Given** the app is open and todos exist in the backend
**When** the page loads
**Then** all todos are displayed in a list (newest first)
**And** no login or setup is required

**Given** the app is open
**When** I type text in the input field and press Enter
**Then** the new todo appears in the list after backend confirmation (pessimistic create)
**And** the input field clears after successful submission

**Given** the frontend code
**When** I inspect the architecture
**Then** `todoApi.ts` is the single module for all API calls, unwrapping `ApiResponse<T>`
**And** `useTodos.ts` is an SWR hook consuming `todoApi` functions
**And** Vite proxy forwards `/api/*` requests to `localhost:3000`

**Given** the app is running
**When** I add a todo and refresh the page
**Then** the todo persists and is visible on reload

**Given** the frontend code is complete
**When** I run `pnpm --filter frontend test`
**Then** `useTodos.test.ts` passes with tests covering: hook returns todos from API, hook triggers mutate after create
**And** `todoApi.test.ts` passes with tests covering: API functions call correct endpoints, responses are unwrapped from `ApiResponse<T>`

### Story 1.4: README & Developer Setup

As a **developer**,
I want clear setup documentation,
So that I can go from clone to running app without additional guidance.

**Acceptance Criteria:**

**Given** I have cloned the repository
**When** I follow the README instructions
**Then** I can install dependencies, set up the database, run migrations, and start the app with documented commands
**And** `pnpm -r dev` starts both frontend and backend concurrently

**Given** the README exists
**When** I read it
**Then** it documents: prerequisites (Node.js, pnpm, PostgreSQL), environment setup (.env from .env.example), migration command, and dev start command
**And** the API endpoints are listed with their methods and paths
**And** the project structure is briefly described
**And** test commands are documented: `pnpm -r test` (unit/integration), `pnpm --filter e2e test` (E2E)

**Given** the full Epic 1 is complete and both servers are running
**When** I run `pnpm --filter e2e test`
**Then** at least 1 Playwright E2E test passes covering: user opens app, adds a todo via Enter, todo appears in the list

## Epic 2: Complete Task Lifecycle

A user can manage their full task list — mark tasks complete/incomplete, delete tasks, and see immediate visual feedback for every action.

### Story 2.1: Backend — Toggle & Delete Endpoints

As a **user**,
I want to mark tasks complete/incomplete and delete tasks,
So that I can manage my task list and clear irrelevant items.

**Acceptance Criteria:**

**Given** a todo exists with `isCompleted: false`
**When** I send `PATCH /api/todos/:id` with `{ "isCompleted": true }`
**Then** I receive a `200` response with the updated todo showing `isCompleted: true`
**And** the change is persisted in PostgreSQL

**Given** a todo exists with `isCompleted: true`
**When** I send `PATCH /api/todos/:id` with `{ "isCompleted": false }`
**Then** I receive a `200` response with the updated todo showing `isCompleted: false`

**Given** a todo exists
**When** I send `DELETE /api/todos/:id`
**Then** I receive a `200` response with `{ success: true, data: { id } }`
**And** the todo is removed from the database

**Given** a non-existent todo ID
**When** I send `PATCH /api/todos/:id` or `DELETE /api/todos/:id`
**Then** I receive a `404` response with `{ success: false, error: { code: "NOT_FOUND", message: "..." } }`

**Given** the backend code
**When** I inspect the service layer
**Then** `todo.service.ts` handles toggle and delete, throwing on not-found
**And** `todo.routes.ts` catches service errors and returns structured `ApiResponse<T>` envelopes

**Given** the backend code is complete
**When** I run `pnpm --filter backend test`
**Then** `todo.service.test.ts` includes tests for: toggle updates `isCompleted`, delete removes todo, toggle/delete throw on non-existent ID
**And** `todo.routes.test.ts` includes tests for: PATCH 200 success, DELETE 200 success, PATCH/DELETE 404 for missing ID

### Story 2.2: Toggle Task Completion

As a **user**,
I want to mark tasks as complete or incomplete with a single click,
So that I can track my progress at a glance.

**Acceptance Criteria:**

**Given** the app displays a list of todos
**When** I click a task item
**Then** the task toggles between complete and incomplete visually before backend confirmation (optimistic)
**And** completed tasks show strikethrough text and muted styling to distinguish from active tasks

**Given** I click a task to toggle it
**When** the backend confirms the update
**Then** the visual state remains as toggled

**Given** I click a task to toggle it
**When** the backend fails to respond
**Then** the visual state reverts smoothly to its prior state (0.15s transition)

**Given** a toggle request is in-flight for a specific task
**When** I try to interact with that same task
**Then** the task's toggle action is disabled
**And** all other tasks remain fully interactive

**Given** the toggle feature is complete
**When** I run `pnpm --filter frontend test`
**Then** `TaskItem.test.tsx` includes tests for: clicking toggles visual state optimistically, completed task shows strikethrough styling, toggle action is disabled during in-flight request

### Story 2.3: Delete Task

As a **user**,
I want to delete tasks I no longer need,
So that my list stays relevant and tidy.

**Acceptance Criteria:**

**Given** a task is displayed in the list
**When** I click the delete control on that task
**Then** the task is removed from the list immediately (optimistic)
**And** no confirmation dialog is shown

**Given** a task was optimistically removed
**When** the backend confirms the deletion
**Then** the task remains removed

**Given** a task was optimistically removed
**When** the backend fails to delete
**Then** the task reappears in its original position in the list

**Given** a delete request is in-flight for a specific task
**When** I try to interact with that same task
**Then** the task's actions are disabled
**And** all other tasks remain fully interactive

**Given** a task with long text
**When** I view the task in the list
**Then** the text wraps gracefully without breaking layout
**And** the completion control and delete control remain visible and accessible

**Given** the delete feature is complete
**When** I run `pnpm --filter frontend test`
**Then** `TaskItem.test.tsx` includes tests for: clicking delete removes task optimistically, delete action is disabled during in-flight request
**And** `DeleteButton.test.tsx` includes tests for: renders delete control, fires callback on click

### Story 2.4: AddButton & Input Validation

As a **user**,
I want a visible add button and smart input handling,
So that I have multiple ways to add tasks and never submit empty ones by accident.

**Acceptance Criteria:**

**Given** the input field is empty or contains only whitespace
**When** I view the AddButton
**Then** it is visually disabled (dimmed) and non-interactive

**Given** the input field contains text
**When** I view the AddButton
**Then** it is visually active (amber) and clickable

**Given** the input field contains text
**When** I click the AddButton
**Then** the task is submitted (same behaviour as pressing Enter)
**And** the input clears and the AddButton returns to disabled state

**Given** the input field is empty
**When** I press Enter or click the AddButton
**Then** no API call is made (client-side rejection)

**Given** the input contains leading or trailing whitespace (e.g. "  Buy milk  ")
**When** I submit the task
**Then** the whitespace is trimmed before submission (submitted as "Buy milk")

**Given** the AddButton and validation features are complete
**When** I run `pnpm --filter frontend test`
**Then** `AddButton.test.tsx` includes tests for: renders disabled when input empty, renders active when input has text, fires submit on click
**And** `TaskInput.test.tsx` includes tests for: rejects empty input on Enter, trims whitespace before submission

**Given** Epic 2 is complete and both servers are running
**When** I run `pnpm --filter e2e test`
**Then** at least 3 Playwright E2E tests pass covering: toggle a task complete/incomplete, delete a task, add a task via AddButton click

## Epic 3: Visual Design & Responsive Experience

The app looks and feels like the bee-themed product — warm palette, honeycomb checkboxes, responsive layout across desktop and mobile, with loading and empty states that feel polished.

### Story 3.1: Design System & Bee Theme

As a **user**,
I want the app to feel warm and inviting with a consistent bee-themed aesthetic,
So that using the app feels personal and enjoyable rather than sterile.

**Acceptance Criteria:**

**Given** the app is loaded
**When** I view any page
**Then** all colours are rendered from 12 CSS custom properties defined in `:root` in `index.css`
**And** no hardcoded colour values exist in any component CSS

**Given** the design tokens are defined
**When** I inspect the values
**Then** they match the confirmed MVP palette: `--color-background: #FFF8EE`, `--color-accent: #F5A623`, `--color-text: #3D2E1F`, `--color-desktop-bg: #C9A96E`, `--color-error: #D32F2F`, `--color-hover: #FFF0D6`, `--color-hex-idle: #FFF5E5`, `--color-hex-stroke: #D4B87A`, `--color-hex-focus: #FFE8B8`, `--color-done-text: #B8A68E`, `--color-input-border: #E8D5B5`, `--color-placeholder: #C4A97D`
**And** post-MVP: when accessibility work begins (keyboard navigation, WCAG AA), update 4 tokens to contrast-checked values: `--color-placeholder: #826B4F`, `--color-done-text: #7A6D5B`, `--color-input-border: #A08862`, `--color-hex-stroke: #9A8250`

**Given** the app is loaded
**When** I view any text
**Then** Patrick Hand font is loaded from Google Fonts with `cursive, sans-serif` fallback

**Given** the design system is applied
**When** I run `pnpm --filter frontend test`
**Then** a test verifies all 12 CSS custom properties are defined in `:root` and no component CSS contains hardcoded colour hex values

### Story 3.2: BeeHeader & CardShell Layout

As a **user**,
I want to see the friendly bee mascot and a polished layout that adapts to my device,
So that the app feels like a complete product on both my phone and desktop.

**Acceptance Criteria:**

**Given** the app is loaded
**When** I view the top of the page
**Then** a static bee SVG is displayed prominently
**And** "my todos" title is shown below the bee in Patrick Hand font

**Given** I am on a mobile device (< 768px)
**When** I view the app
**Then** the layout is full-bleed with no card treatment, no border-radius, no shadow

**Given** I am on a desktop or tablet (>= 768px)
**When** I view the app
**Then** the content is displayed in a 560px centered card with `border-radius: 20px`
**And** the card has shadow `0 4px 24px rgba(61, 46, 31, 0.18), 0 1px 4px rgba(61, 46, 31, 0.10)`
**And** the outer background is Honey Oak (`--color-desktop-bg`)

**Given** the CSS implementation
**When** I inspect the responsive approach
**Then** base styles are mobile-first (full-bleed)
**And** a single `@media (min-width: 768px)` breakpoint adds the card layout

**Given** the layout components are complete
**When** I run `pnpm --filter frontend test`
**Then** `BeeHeader.test.tsx` passes with tests covering: renders bee SVG, renders "my todos" title
**And** `CardShell.test.tsx` passes with tests covering: renders children content

### Story 3.3: HexCheckbox & Styled Task Items

As a **user**,
I want honeycomb-shaped checkboxes and polished task styling,
So that interacting with my tasks feels distinctive and satisfying.

**Acceptance Criteria:**

**Given** a task is displayed
**When** I view the completion control
**Then** it renders as an SVG honeycomb hexagon (not a standard checkbox)

**Given** a task is incomplete
**When** I view the hex checkbox
**Then** it shows pale fill (`--color-hex-idle`) with muted stroke (`--color-hex-stroke`)

**Given** a task is complete
**When** I view the hex checkbox
**Then** it shows solid amber fill (`--color-accent`) with a white checkmark
**And** the task text has strikethrough and uses `--color-done-text`

**Given** I hover over a task item
**When** the hover state activates
**Then** the task background shifts to `--color-hover`
**And** the delete button becomes visible (opacity transition 0.15s)

**Given** the delete button
**When** no hover or focus is on the task
**Then** the delete button is hidden (opacity: 0)

**Given** any state change (hex toggle, hover, delete visibility)
**When** the transition occurs
**Then** state changes use 0.15s ease timing
**And** delete slide-out uses 0.2s ease timing (opacity + translateX)

**Given** the user has `prefers-reduced-motion: reduce` enabled
**When** any transition occurs
**Then** all `transition-duration` and `animation-duration` are set to `0.01s`

**Given** the styled components are complete
**When** I run `pnpm --filter frontend test`
**Then** `HexCheckbox.test.tsx` passes with tests covering: renders SVG hexagon, idle state has correct fill, completed state shows checkmark and accent fill
**And** `TaskItem.test.tsx` includes tests for: completed task shows strikethrough and `--color-done-text`

### Story 3.4: Loading Skeleton & Empty State

As a **user**,
I want clear visual feedback while data loads and a helpful empty state on first visit,
So that I'm never confused about what the app is doing or how to use it.

**Acceptance Criteria:**

**Given** the app is loading data from the backend
**When** the SWR fetch is in progress
**Then** a skeleton placeholder is displayed with pulsing hex shapes and text bars
**And** the skeleton rows mirror the real task layout (hex + text line)
**And** the bee header and input field render immediately above the skeleton (no skeleton for those)
**And** skeleton animation uses `opacity 1→0.4` over 1.5s ease-in-out with 0.15s staggered delay per row

**Given** the app is loaded (empty or populated list)
**When** I view the input field
**Then** the placeholder always reads "add a task..." regardless of how many tasks exist
**And** no other instructional text or ghost tasks are shown

**Given** the loading and empty states are complete
**When** I run `pnpm --filter frontend test`
**Then** `TaskList.test.tsx` includes tests for: renders skeleton when loading, renders empty state with input placeholder when no todos exist, renders todo items when data is present

**Given** Epic 3 is complete and both servers are running
**When** I run `pnpm --filter e2e test`
**Then** at least 4 Playwright E2E tests pass (cumulative) including: app displays bee header and themed layout, loading skeleton appears before data loads

## Epic 4: Error Handling & Resilience

When something goes wrong, the user sees it clearly, can keep working, and can retry — the app never silently fails.

### Story 4.1: Backend Structured Error Responses

As a **user**,
I want the backend to return clear, consistent error information,
So that the frontend can tell me exactly what went wrong.

**Acceptance Criteria:**

**Given** a request fails due to validation (e.g. empty text on create)
**When** the backend responds
**Then** it returns a `400` with `{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }`

**Given** a request targets a non-existent todo ID
**When** the backend responds
**Then** it returns a `404` with `{ success: false, error: { code: "NOT_FOUND", message: "..." } }`

**Given** an unexpected server error occurs
**When** the backend responds
**Then** it returns a `500` with `{ success: false, error: { code: "INTERNAL_ERROR", message: "..." } }`
**And** the error is logged via Pino

**Given** any endpoint (GET, POST, PATCH, DELETE)
**When** any error occurs
**Then** the response always uses the `ApiResponse<T>` envelope format
**And** no endpoint ever returns an unstructured error or silently swallows a failure

**Given** the structured error responses are complete
**When** I run `pnpm --filter backend test`
**Then** `todo.routes.test.ts` includes tests for: 400 returns VALIDATION_ERROR envelope, 404 returns NOT_FOUND envelope, 500 returns INTERNAL_ERROR envelope, all error responses match `ApiResponse<T>` shape

### Story 4.2: Inline Error Display & Retry

As a **user**,
I want to see what went wrong right where it happened, keep working, and retry easily,
So that errors never block me or leave me confused.

**Acceptance Criteria:**

**Given** I submit a new task and the backend fails
**When** the error response is received
**Then** an inline error message appears below the input field: "Task couldn't be added. Try again."
**And** the input retains my entered text and focus so I can press Enter to retry immediately
**And** the error uses `role="alert"` for screen reader announcement
**And** the error clears when my next create succeeds

**Given** I toggle a task and the backend fails
**When** the error response is received
**Then** the task's visual state reverts smoothly to its prior state (0.15s transition)
**And** an inline error message appears below the task item: "Couldn't update task. Try again."
**And** clicking the task again retries the toggle
**And** the error clears when the next toggle on that item succeeds

**Given** I delete a task and the backend fails
**When** the error response is received
**Then** the task reappears in its original position in the list
**And** an inline error message appears below the task item: "Task couldn't be deleted. Try again."
**And** clicking the delete control again retries the deletion
**And** the error clears when the next delete on that item succeeds

**Given** an error is displayed on one task
**When** I interact with other tasks
**Then** all other tasks remain fully interactive — errors on one item never block the rest

**Given** an error is displayed
**When** no dismiss action is taken
**Then** the error persists until the next successful action on that item — no timers, no dismiss buttons

**Given** the inline error features are complete
**When** I run `pnpm --filter frontend test`
**Then** `ErrorMessage.test.tsx` passes with tests covering: renders error text, has `role="alert"` attribute
**And** `TaskItem.test.tsx` includes tests for: displays error message on failed toggle, reverts visual state on toggle failure, displays error message on failed delete, task reappears on delete failure
**And** `TaskInput.test.tsx` includes tests for: displays error message on failed create, retains input text and focus on create failure, error clears on next successful create

**Given** Epic 4 is complete and both servers are running
**When** I run `pnpm --filter e2e test`
**Then** at least 5 Playwright E2E tests pass (cumulative across all epics) including: error message displays when backend is unavailable and user can retry successfully
