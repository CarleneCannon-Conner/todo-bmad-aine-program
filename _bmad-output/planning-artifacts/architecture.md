---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-11'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - project-context.md
workflowType: 'architecture'
project_name: 'todo'
user_name: 'Carlene'
date: '2026-03-11'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
27 FRs across 6 categories:
- Task Management (FR1–FR7): Full CRUD — create, read, toggle completion, delete. Each todo: text, completion status, creation timestamp.
- List State & Display (FR8–FR10): Visual distinction between complete/incomplete, meaningful empty state with placeholder "add a task..." (same at all times), immediate load on open.
- Input & Interaction (FR11–FR15, FR27–FR29): Submit via Enter or AddButton, AddButton disabled without valid input, loading state during fetch, immediate UI feedback on all actions, graceful long text wrapping, per-item action disable during in-flight requests, client-side empty/whitespace rejection with trim.
- Error Handling (FR16–FR20): Visible inline error state per action (create, toggle, delete) below the affected item, structured backend error responses, no silent failures, errors must not block continued use, errors clear on next successful action.
- Visual Design & Theme (FR21–FR23): Bumble bee colour palette (12 confirmed tokens), static bee SVG, responsive desktop and mobile with single 768px breakpoint.
- Developer/Operator (FR24–FR26): README-driven setup, conventional structure, minimal documented API.

**Non-Functional Requirements:**
- Performance: All user actions <200ms; initial page load <500ms for ~20 items; no page reload for state changes
- Reliability: Zero data loss across sessions; all writes durable; all failures surface to user; errors must not block continued interaction
- Maintainability: Conventional structure; developer onboards from README alone; small, self-evident API surface; single source of truth for shared types
- Accessibility (MVP): No formal WCAG compliance required. Semantic HTML included as zero-cost default. MVP uses original design palette values; WCAG contrast-adjusted tokens deferred to post-MVP alongside keyboard navigation, screen reader support, ARIA roles, and reduced motion (WCAG 2.1 AA).

**Project Deliverable Constraints:**
These are training/project requirements, not product NFRs. They inform architectural awareness but must not drive MVP over-engineering. Where a deliverable would complicate the MVP, it is noted as a future concern.
- Docker Compose containerisation (Dockerfiles + docker-compose.yml)
- Test coverage minimum 70%
- 5+ passing Playwright E2E tests
- WCAG AA accessibility audit
- Security review
- AI integration log

**Scale & Complexity:**
- Primary domain: Full-stack web application
- Complexity level: Low — single user, no auth, single-entity CRUD
- Estimated architectural components: 3 (Frontend SPA, Backend API, Database)
- Frontend component count: 7 interactive (HexCheckbox, TaskItem, TaskInput, AddButton, DeleteButton, ErrorMessage, TaskList) + 2 layout (BeeHeader, CardShell) — relevant for story decomposition

### Architectural Principles

- **No silent failures:** Every write path — API call, state mutation, database operation — must have an observable outcome. This is a system-wide contract, not just an error handling concern. Success confirms visually; failure surfaces inline with retry affordance. No fire-and-forget.

### Technical Constraints & Dependencies

- Future containerisation: architecture must not prevent Docker Compose orchestration — but this must not complicate MVP structure
- Future extensibility: data model and API must not prevent user authentication and multi-user support. User_id is **deferred entirely** — no stub column, no schema complexity for MVP. Adding a user_id column and WHERE clause is a straightforward migration when auth lands.
- All tooling must be open source and free for local development
- Local dev database required for persistent storage with ACID compliance
- UX spec prescribes specific design tokens, font (Patrick Hand via Google Fonts), and component patterns — architecture must support these without additional build tooling
- Mobile-first CSS with single breakpoint at 768px
- SVG-based honeycomb hex checkboxes — frontend must support inline SVG rendering

### Cross-Cutting Concerns Identified

- **Error handling**: Shared response envelope used by every backend endpoint and every frontend action — success/error structure with typed error codes and messages
- **Persistence durability**: Every write confirmed durable before UI reflects success for create; optimistic for toggle/delete with smooth rollback on failure
- **Shared TypeScript types**: Single source of truth for entity types, API contracts, and error shapes — shared across frontend and backend. Also serves as a **testing advantage**: one contract definition means one assertion target across unit, integration, and E2E tests.
- **Accessibility (MVP)**: Semantic HTML structure as zero-cost default. MVP uses original design palette; WCAG contrast-adjusted colour tokens deferred to post-MVP alongside keyboard navigation, ARIA roles, `prefers-reduced-motion`, and screen reader announcements (WCAG 2.1 AA).
- **Design token system**: 12 CSS custom properties define the entire visual language — all colours, no hardcoded values
- **Responsive design**: Mobile-first, single 768px breakpoint, card layout on desktop
- **Optimistic/pessimistic mutation strategy**: Create is pessimistic (wait for server), toggle and delete are optimistic (instant UI, rollback on failure with 0.15s transitions). Testability of this pattern is a test design concern — requires a single API boundary module on the frontend for clean mocking.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application — custom monorepo. No single CLI covers the full stack, so initialization is a structured sequence.

### Starter Options Considered

- **ts-rest-workspace**: pnpm monorepo with Fastify + React/Vite + shared packages — closest match, but bundles ts-rest, react-query, tailwindcss, and shadcn/ui. More to strip out than to build from scratch.
- **Fuelstack**: Turborepo + Fastify + Drizzle + Vite React — includes Turborepo, Next.js, and Jest which don't match our tooling choices.
- **Custom monorepo + Vite react-ts template**: Selected — gives full control, aligns exactly with confirmed decisions, well-documented setup path.

### Selected Approach: Custom pnpm Monorepo + Vite react-ts template

**Rationale:** No off-the-shelf starter matches our exact stack (pnpm workspaces + React/Vite/TS + Fastify/TS + Drizzle + shared types package). Custom setup is minimal — three package inits and one Vite scaffold — and gives precise control over every architectural decision already confirmed.

**Current Verified Versions:**
- Vite: 7.3.1 (stable)
- Fastify: 5.7.1
- Drizzle ORM: 0.45.1
- Vitest: 4.0.18
- Node.js: 18+ required (Vite minimum)

**Initialization Sequence:**

```bash
# 1. Monorepo root
mkdir todo && cd todo
pnpm init
echo "packages:\n  - frontend\n  - backend\n  - shared" > pnpm-workspace.yaml

# 2. Frontend (official Vite CLI)
pnpm create vite@latest frontend -- --template react-ts

# 3. Backend
mkdir backend && cd backend && pnpm init
pnpm add fastify && pnpm add -D typescript @types/node tsx

# 4. Shared package (@todo/shared)
mkdir ../shared && cd ../shared && pnpm init
# set name to @todo/shared in package.json
```

**Architectural Decisions Established by This Setup:**

**Language & Runtime:** TypeScript throughout — strict tsconfig in each package, shared via workspace

**Styling Solution:** Plain CSS with custom properties — no framework, no build dependency beyond Vite. 12 design tokens in `:root`, applied via `var()`.

**Build Tooling:** Vite 7.x — dev server, HMR, proxy config in vite.config.ts for /api/*

**Testing Framework:** Vitest 4.x — shares Vite's transform pipeline and config. Playwright for E2E.

**Code Organisation:**
```
todo/
  pnpm-workspace.yaml
  package.json
  frontend/       ← React SPA (Vite react-ts template)
  backend/        ← Fastify API (manual setup)
  shared/         ← @todo/shared (schema.ts + types.ts)
```

**Development Experience:**
- Frontend: `pnpm dev` in frontend/ starts Vite on :5173
- Backend: `pnpm dev` in backend/ starts `tsx watch --env-file .env src/server.ts` on :3000
- Root: `pnpm -r dev` runs all packages concurrently

**Note:** Project initialization using this sequence should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
All resolved in steps 2-3 (stack, ORM, monorepo structure, shared types).

**Important Decisions (Shape Architecture):**
Resolved below — validation, migrations, styling, state management, env config, logging.

**Deferred Decisions (Post-MVP):**
- Authentication & authorisation (PRD: explicitly excluded from MVP)
- Docker Compose containerisation (post-MVP training deliverable)
- HTTPS / transport security (deferred to deployment context)
- API documentation / OpenAPI (4 endpoints — README sufficient for MVP)
- Frontend routing (single page — no router needed)
- CI/CD pipeline (post-MVP)
- CORS configuration (deferred until deployment; Vite proxy covers dev)
- Scaling strategy (single user, no scaling concerns)

### Data Architecture

- **Validation:** TypeBox (bundled with Fastify) — TypeScript-native schemas with type inference, zero extra dependencies, first-class Fastify integration
- **Migrations:** `drizzle-kit generate` + `drizzle-kit migrate` — SQL migration files from day one for audit trail and future Docker-readiness
- **ID format:** UUID v4 via PostgreSQL `gen_random_uuid()` — stored as `uuid` in database, `string` in TypeScript
- **Default sort order:** `ORDER BY created_at DESC` — newest todos at the top

### Authentication & Security

- **MVP:** No authentication — single user, no sensitive data
- **Future-proofing:** User_id deferred entirely — no stub column for MVP. API route structure supports auth middleware insertion without restructuring
- **Input validation:** TypeBox on all mutating endpoints prevents injection

### API & Communication Patterns

- **Endpoints:** 4 routes — `GET /api/todos`, `POST /api/todos`, `PATCH /api/todos/:id`, `DELETE /api/todos/:id`
- **Error contract:** `ApiResponse<T>` envelope (confirmed in step 2)
- **Documentation:** README only for MVP — API is small and self-evident
- **Backend port:** 3000 (Fastify default)

### Frontend Architecture

- **Styling:** Plain CSS with custom properties — 12 design tokens defined in `:root`, applied via `var()`. No framework, no build dependency.
- **State management:** SWR for server state — per-query loading/error states, minimal API
- **Routing:** None — single page application with no navigation
- **Component structure:** `frontend/src/components/` — 9 components (7 interactive + 2 layout), each in its own folder with co-located `.tsx`, `.css`, `.test.tsx`, and `index.ts` barrel export

### Infrastructure & Deployment

- **Environment config:** Per-package `.env` + `.env.example` files; `.env` in `.gitignore`, `.env.example` committed. Backend uses Node-native `--env-file` flag, frontend uses Vite-native `.env` loading. Simple startup check for required vars (DATABASE_URL, PORT) — no validation library.
- **Logging:** Fastify built-in Pino logger (`logger: true`) — structured JSON, zero config, automatic request logging
- **Containerisation:** Post-MVP — architecture designed to not prevent Docker Compose orchestration

### Decision Impact Analysis

**Implementation Sequence:**
1. Monorepo + workspace setup (pnpm init, workspace config)
2. Shared package with Drizzle schema + types
3. Backend: Fastify + Drizzle + migrations + TypeBox validation
4. Frontend: React + SWR + CSS custom properties
5. Integration: Vite proxy wiring

**Cross-Component Dependencies:**
- `@todo/shared` must be set up before frontend or backend can import types
- Drizzle schema must exist before migrations can be generated
- Backend must be running before frontend can proxy API calls

## Implementation Patterns & Consistency Rules

### Naming Conventions

**Database (PostgreSQL/Drizzle):**
- Tables: plural snake_case → `todos`
- Columns: snake_case → `created_at`, `is_completed`
- Indexes: `idx_<table>_<column>` → `idx_todos_created_at`

**API / JSON:**
- Response body fields: camelCase → `createdAt`, `isCompleted`
- Transformation at DB boundary via Drizzle schema mapping

**Frontend Files:**
- Components: PascalCase → `TaskItem.tsx`, `TaskItem.css`, `TaskItem.test.tsx`
- Non-components: camelCase → `useTodos.ts`, `todoApi.ts`

**Backend Files:**
- Dot-notation, flat in `src/` → `todo.routes.ts`, `todo.service.ts`, `todo.routes.test.ts`, `todo.service.test.ts`

**Code:**
- Functions/variables: camelCase → `createTodo`, `isCompleted`
- Types/interfaces: PascalCase → `Todo`, `ApiResponse<T>`, `CreateTodoRequest`

### Project Structure

```
todo/
  pnpm-workspace.yaml
  package.json
  e2e/                       ← Playwright E2E tests (monorepo root)
  frontend/src/
    components/              ← folder-per-component, each with index.ts + .tsx + .css + .test.tsx
    hooks/                   ← custom hooks (useTodos.ts)
    api/                     ← todoApi.ts (single fetch wrapper, single mock boundary)
    App.tsx / App.css
    main.tsx
    index.css                ← :root design tokens + global resets
  backend/src/
    todo.routes.ts           ← route definitions
    todo.routes.test.ts      ← co-located route tests
    todo.service.ts          ← business logic
    todo.service.test.ts     ← co-located service tests
    db.ts                    ← Drizzle client registered as Fastify plugin
    app.ts                   ← Fastify app factory
    server.ts                ← entry point
  shared/
    schema.ts                ← Drizzle table definitions
    types.ts                 ← ApiResponse<T>, Todo, CreateTodoRequest, etc.
    index.ts                 ← barrel export re-exporting schema.ts + types.ts
```

### Shared Package Convention

- All imports from shared use `import { ... } from '@todo/shared'`
- `shared/index.ts` is the barrel export — re-exports everything from `schema.ts` and `types.ts`
- Never import from subpaths (`@todo/shared/schema`) — always go through the barrel
- Workspace dependency: both frontend and backend `package.json` must declare `"@todo/shared": "workspace:*"`

### API Format Standards

**Response envelope:**
```ts
// Success
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string } }
```

**HTTP status codes:**
- GET 200 / POST 201 / PATCH 200 / DELETE 200
- Errors: 400 (validation), 404 (not found), 500 (server)

**Dates:** ISO 8601 strings (`"2026-03-11T14:30:00.000Z"`)

### Service / Route Boundary

- **Services** return domain types (`Todo[]`, `Todo`) — never API envelopes
- **Services** throw on error (e.g., not found) — never return error objects
- **Routes** catch service errors and wrap in `ApiResponse<T>` envelope
- **Routes** are the only layer that sets HTTP status codes

### Frontend API Boundary

- **`todoApi.ts`** is the single module for all API calls — no direct `fetch` in components or hooks
- `todoApi.ts` unwraps `ApiResponse<T>` — returns `.data` on success, throws on error responses
- SWR hooks consume `todoApi` functions — SWR expects throws for error state handling
- All mocking in tests targets `todoApi` — single mock boundary

### Fastify Plugin Pattern

- Drizzle client registered as a Fastify plugin via `fastify-plugin`
- Accessed on the Fastify instance as `fastify.db`
- Plugin registered in `app.ts` during app factory setup

### Process Patterns

**Mutation strategy:**
- Create: pessimistic — wait for server response before adding to UI
- Toggle/Delete: optimistic — update UI immediately, rollback on failure with 0.15s transition

**Error handling:**
- Inline below affected item, per-action error state: `{ id: string, action: 'create' | 'toggle' | 'delete', message: string }`
- Errors clear on next successful action against that item
- SWR `mutate()` handles optimistic rollback

**Loading states (FR28):**
- Per-action, not global — each item tracks its own loading state
- Create input and AddButton disable during in-flight request
- Toggle and delete controls disable on the specific item while its request is in-flight; other items remain fully interactive
- No global spinner

**Validation (FR29):**
- Frontend: reject empty input client-side without API call; trim leading/trailing whitespace before submission
- AddButton disabled when input is empty/whitespace-only
- Backend: TypeBox validates all mutations before service layer

**SWR cache:**
- Key: `"/api/todos"` (matches endpoint path)
- Revalidate via `mutate("/api/todos")`

### Testing Patterns

- **Unit/integration tests:** co-located with source files (`.test.ts` / `.test.tsx`)
- **E2E tests:** `e2e/` directory at monorepo root (Playwright, spans frontend + backend)
- **Test database:** separate PostgreSQL database via `DATABASE_URL` in `.env.test`
- **Test runner:** Vitest for unit/integration, Playwright for E2E
- **Test DB reset:** Truncate tables before each individual test (Vitest integration tests); truncate once before the suite (Playwright E2E)

### Enforcement Guidelines

**All AI agents MUST:**
- Follow naming conventions exactly — no deviation without architecture update
- Use `@todo/shared` barrel import for all shared types — never redeclare, never import subpaths
- Route all API calls through `todoApi.ts` — no direct fetch in components
- Use the `ApiResponse<T>` envelope for every backend response
- Keep services pure (domain types + throw) and routes as the envelope boundary
- Register Drizzle as a Fastify plugin — no bare singleton imports
- Use folder-per-component pattern — each component in its own directory with `index.ts` barrel, co-located CSS and tests
- Import components via barrel: `import { TaskItem } from '../components/TaskItem'` (not `../components/TaskItem/TaskItem`)
- Place E2E tests in `e2e/` at monorepo root

## Project Structure & Boundaries

### Complete Project Directory Structure

```
todo/
├── README.md
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── .gitignore
├── .env.example
│
├── e2e/
│   ├── package.json
│   ├── playwright.config.ts
│   └── tests/
│       └── todo-crud.spec.ts
│
├── shared/
│   ├── package.json                 ← name: @todo/shared
│   ├── tsconfig.json
│   ├── index.ts                     ← barrel export
│   ├── schema.ts                    ← Drizzle table definitions (todos)
│   └── types.ts                     ← ApiResponse<T>, Todo, CreateTodoRequest
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                         ← DATABASE_URL, PORT (gitignored)
│   ├── .env.example
│   ├── .env.test                    ← test DATABASE_URL (gitignored)
│   ├── drizzle.config.ts
│   ├── drizzle/                     ← generated SQL migration files
│   │   └── *.sql
│   └── src/
│       ├── server.ts                ← entry point (listen on PORT)
│       ├── app.ts                   ← Fastify app factory + plugin registration
│       ├── db.ts                    ← Drizzle client as Fastify plugin
│       ├── todo.routes.ts           ← 4 route handlers (GET, POST, PATCH, DELETE)
│       ├── todo.routes.test.ts
│       ├── todo.service.ts          ← business logic (domain types + throw)
│       └── todo.service.test.ts
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts               ← proxy /api/* → localhost:3000
    ├── index.html
    ├── .env.example
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── App.css
        ├── index.css                ← :root design tokens (12 vars) + global resets
        ├── api/
        │   └── todoApi.ts           ← fetch wrapper, unwraps ApiResponse<T>
        ├── hooks/
        │   └── useTodos.ts          ← SWR hook wrapping todoApi
        └── components/
            ├── BeeHeader/
            │   ├── index.ts
            │   ├── BeeHeader.tsx
            │   └── BeeHeader.css
            ├── CardShell/
            │   ├── index.ts
            │   ├── CardShell.tsx
            │   └── CardShell.css
            ├── TaskList/
            │   ├── index.ts
            │   ├── TaskList.tsx
            │   ├── TaskList.css
            │   └── TaskList.test.tsx
            ├── TaskInput/
            │   ├── index.ts
            │   ├── TaskInput.tsx
            │   ├── TaskInput.css
            │   └── TaskInput.test.tsx
            ├── AddButton/
            │   ├── index.ts
            │   ├── AddButton.tsx
            │   ├── AddButton.css
            │   └── AddButton.test.tsx
            ├── TaskItem/
            │   ├── index.ts
            │   ├── TaskItem.tsx
            │   ├── TaskItem.css
            │   └── TaskItem.test.tsx
            ├── HexCheckbox/
            │   ├── index.ts
            │   ├── HexCheckbox.tsx
            │   ├── HexCheckbox.css
            │   └── HexCheckbox.test.tsx
            ├── DeleteButton/
            │   ├── index.ts
            │   ├── DeleteButton.tsx
            │   ├── DeleteButton.css
            │   └── DeleteButton.test.tsx
            └── ErrorMessage/
                ├── index.ts
                ├── ErrorMessage.tsx
                ├── ErrorMessage.css
                └── ErrorMessage.test.tsx
```

### Architectural Boundaries

**API Boundary:**
- Single boundary at `/api/*` — Vite proxies to Fastify in dev
- Frontend only talks to backend through `todoApi.ts` → `GET/POST/PATCH/DELETE /api/todos`
- Backend only talks to database through `fastify.db` (Drizzle plugin)

**Component Boundaries:**
- Components receive data via props and SWR — no direct API calls
- `useTodos` hook is the single bridge between `todoApi.ts` and React components
- State flows down: `App → TaskList → TaskItem → (HexCheckbox, DeleteButton, ErrorMessage)`; `App → TaskInput + AddButton`

**Data Boundaries:**
- `@todo/shared` is the contract layer — both frontend and backend depend on it, never on each other
- Drizzle schema is the single source of truth for DB shape
- `types.ts` is the single source of truth for API contracts

### Requirements to Structure Mapping

**Task Management (FR1–FR7):**
- Create: `TaskInput` + `AddButton` → `todoApi.ts` → `todo.routes.ts` → `todo.service.ts`
- Read: `useTodos.ts` → `todoApi.ts` → `todo.routes.ts` → `todo.service.ts`
- Toggle: `HexCheckbox` → `useTodos` (optimistic) → `todoApi.ts` → `todo.routes.ts`
- Delete: `DeleteButton` → `useTodos` (optimistic) → `todoApi.ts` → `todo.routes.ts`

**List State & Display (FR8–FR10):**
- `TaskList` — empty state, item rendering, completion visual distinction
- `TaskItem` — completed/incomplete styling via CSS classes

**Input & Interaction (FR11–FR15, FR27–FR29):**
- `TaskInput` — Enter submit, placeholder "add a task..." (same at all times, not conditional), long text wrapping
- `AddButton` — circular "+" button beside TaskInput, disabled when input empty, active when text present (FR12, FR13)
- Per-item action disable while request in-flight (FR28)
- Client-side empty rejection + whitespace trim (FR29)

**Error Handling (FR16–FR20):**
- `ErrorMessage` — inline display below input field (create errors) and below task items (toggle/delete errors)
- Create error: input retains text and focus for immediate retry (FR16)
- `todo.routes.ts` — structured `ApiResponse<T>` error envelope
- `todoApi.ts` — throws on error responses for SWR consumption

**Visual Design & Theme (FR21–FR23):**
- `index.css` — 12 design tokens in `:root`
- `BeeHeader` — static bee SVG
- All `.css` files — responsive via 768px breakpoint

**Accessibility (MVP — zero-cost defaults):**
- Semantic HTML elements (`<button>`, `<input>`, `<ul>/<li>`)
- MVP uses original design palette values; WCAG contrast-adjusted tokens (placeholder, done-text, input-border, hex-stroke) deferred to post-MVP
- `aria-label` attributes on AddButton, DeleteButton, TaskInput (free to add, no runtime cost)
- Full WCAG 2.1 AA (keyboard nav, ARIA roles, screen reader, reduced motion, contrast-adjusted tokens) is post-MVP

**Touch & Responsive (FR23):**
- Minimum tap target: 44×44px for all interactive elements
- Mobile-first CSS, single 768px breakpoint

### Data Flow

```
User Action → Component → useTodos (SWR) → todoApi.ts → HTTP → Fastify Route → Service → Drizzle → PostgreSQL
                                     ↑                                                          |
                                     └──────────── ApiResponse<T> ──────────────────────────────┘
```

### Development Workflow

- `pnpm -r dev` from root starts all packages
- Frontend: Vite dev server (:5173) with HMR + proxy
- Backend: `tsx watch` (:3000) with auto-restart
- Tests: `pnpm -r test` runs Vitest across frontend + backend
- E2E: `pnpm --filter e2e test` runs Playwright (requires running dev servers)
- Migrations: `pnpm --filter backend drizzle-kit generate` then `drizzle-kit migrate`

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All technology choices verified compatible — pnpm workspaces + Vite 7.x + React + Fastify 5.x + Drizzle 0.45.x + SWR + TypeBox + Vitest 4.x + Playwright. TypeBox bundled with Fastify (zero extra deps). No version conflicts.

**Pattern Consistency:** Naming conventions consistent across all layers (snake_case DB → camelCase API/code → PascalCase types/components). Service/route boundary clean. Shared barrel import prevents type drift. Component barrel exports prevent import path inconsistency.

**Structure Alignment:** Folder-per-component with index.ts barrels. Monorepo workspace dependencies correct. E2E at root spans full stack. All patterns support the architecture.

No contradictions found.

### Requirements Coverage (PRD v2026-03-11)

**All 29 FRs covered:**

| FR | Status | Notes |
|----|--------|-------|
| FR1–FR7 | Covered | Full CRUD through TaskInput/AddButton → todoApi → routes → service → Drizzle |
| FR8 | Covered | TaskItem CSS classes for complete/incomplete |
| FR9 | Covered | TaskInput placeholder "add a task..." (same at all times) |
| FR10 | Covered | SWR fetches on mount, no auth |
| FR11 | Covered | TaskInput Enter submit |
| FR12 | Covered | AddButton component — circular "+" beside input |
| FR13 | Covered | AddButton disabled when input empty, active when text present |
| FR14 | Covered | Per-action loading states |
| FR15 | Covered | Optimistic toggle/delete, pessimistic create |
| FR16 | Covered | ErrorMessage inline below input; input retains text + focus |
| FR17 | Covered | ErrorMessage inline below item; visual state reverts smoothly |
| FR18 | Covered | ErrorMessage inline below item; task reappears in position |
| FR19 | Covered | All errors surface inline, persist until next success |
| FR20 | Covered | ApiResponse<T> structured envelope |
| FR21–FR23 | Covered | 12 CSS tokens, BeeHeader SVG, 768px breakpoint |
| FR24–FR26 | Covered | README-driven, conventional structure, 4-endpoint API |
| FR27 | Covered | CSS wrapping in TaskItem |
| FR28 | Covered | Per-item action disable during in-flight requests |
| FR29 | Covered | Client-side empty rejection, whitespace trim before submission |

**NFR Coverage:**
- Performance <200ms: Optimistic updates instant; pessimistic create within budget on local network
- Initial load <500ms: SWR fetch on mount, trivial payload for ~20 items
- Zero data loss: PostgreSQL ACID + pessimistic creates
- Structured errors: ApiResponse<T> envelope on all routes
- Errors non-blocking: Per-item error state, auto-clear on success
- Accessibility (MVP): Semantic HTML as zero-cost default; original design palette for MVP; WCAG contrast-adjusted tokens + full WCAG 2.1 AA post-MVP

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analysed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined (folder-per-component with barrel exports)
- [x] Process patterns documented (optimistic/pessimistic, error handling, loading, validation)
- [x] Service/route boundary specified
- [x] Frontend API boundary specified

**Project Structure**
- [x] Complete directory structure defined with all files
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete
- [x] All 29 FRs traced to specific components

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Every FR traceable to specific files and components
- Clear boundaries between all layers (DB → service → route → API → todoApi → SWR → components)
- Shared types package prevents contract drift
- Patterns comprehensive enough to prevent AI agent conflicts
- Optimistic/pessimistic strategy well-defined per action type

**Post-MVP Items (Explicitly Deferred):**
- WCAG 2.1 AA formal compliance (keyboard nav, ARIA roles, screen reader, reduced motion)
- Docker Compose containerisation
- Authentication & multi-user
- CI/CD pipeline
- CORS configuration

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure, boundaries, and barrel export conventions
- Refer to this document for all architectural questions

**First Implementation Priority:**
1. Monorepo + workspace setup (pnpm init, workspace config, tsconfigs)
2. Shared package with Drizzle schema + types + barrel export
3. Backend: Fastify app factory + Drizzle plugin + routes + service + migrations
4. Frontend: Vite scaffold + CSS tokens + components + SWR hooks + todoApi
5. Integration: Vite proxy wiring + E2E test setup
