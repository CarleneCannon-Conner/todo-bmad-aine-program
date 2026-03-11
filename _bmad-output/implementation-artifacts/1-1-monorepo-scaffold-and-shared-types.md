# Story 1.1: Monorepo Scaffold & Shared Types

Status: ready-for-dev

## Story

As a **developer**,
I want a properly structured monorepo with shared types and build configuration,
so that I have a solid foundation to build the frontend and backend against a single source of truth.

## Acceptance Criteria

1. **Given** a fresh clone of the repository **When** I inspect the project structure **Then** I see a pnpm workspace with `frontend/`, `backend/`, and `shared/` packages **And** `pnpm-workspace.yaml` lists all three packages **And** each package has its own `package.json` and `tsconfig.json` with strict mode enabled

2. **Given** the shared package exists **When** I inspect `@todo/shared` **Then** `schema.ts` defines a `todos` table with columns: `id` (uuid, PK, default gen_random_uuid()), `text` (text, not null), `is_completed` (boolean, default false), `created_at` (timestamp, default now()) **And** `types.ts` exports `Todo`, `CreateTodoRequest`, and `ApiResponse<T>` types **And** `index.ts` barrel-exports everything from `schema.ts` and `types.ts`

3. **Given** the monorepo root **When** I inspect project configuration **Then** `.gitignore` excludes `node_modules/`, `.env`, `dist/`, and `*.local` **And** `.env.example` files exist in both `backend/` and `frontend/` with documented variables

4. **Given** the monorepo is set up **When** I inspect test infrastructure **Then** Vitest is configured in both `frontend/` and `backend/` packages **And** `e2e/` directory exists at monorepo root with `playwright.config.ts` **And** `backend/.env.test` (gitignored) documents the test `DATABASE_URL` **And** `pnpm -r test` runs Vitest across frontend and backend **And** `pnpm --filter e2e test` is the documented Playwright command

## Tasks / Subtasks

- [ ] Task 1: Initialize monorepo root (AC: #1)
  - [ ] Create root `package.json` with `"private": true`
  - [ ] Create `pnpm-workspace.yaml` listing `frontend`, `backend`, `shared`
  - [ ] Create root `.gitignore` (node_modules/, .env, dist/, *.local, *.tsbuildinfo, .env.test)
- [ ] Task 2: Create shared package `@todo/shared` (AC: #2)
  - [ ] Create `shared/package.json` with `name: "@todo/shared"`, set `"main": "index.ts"` and `"types": "index.ts"`
  - [ ] Create `shared/tsconfig.json` with strict mode
  - [ ] Create `shared/schema.ts` with Drizzle `todos` table definition
  - [ ] Create `shared/types.ts` with `Todo`, `CreateTodoRequest`, `ApiResponse<T>`
  - [ ] Create `shared/index.ts` barrel re-exporting schema.ts and types.ts
  - [ ] Install `drizzle-orm` and `pg` as dependencies in shared
- [ ] Task 3: Scaffold frontend package (AC: #1, #4)
  - [ ] Run `pnpm create vite@latest frontend -- --template react-ts`
  - [ ] Add `"@todo/shared": "workspace:*"` to frontend `package.json` dependencies
  - [ ] Verify `tsconfig.json` has strict mode
  - [ ] Create `frontend/.env.example` with documented variables (e.g., `VITE_API_URL`)
  - [ ] Add Vitest config to frontend (vitest.config.ts or vite.config.ts with test block)
  - [ ] Install vitest, @testing-library/react, @testing-library/jest-dom, jsdom as devDependencies
  - [ ] Add `"test": "vitest run"` script to package.json
- [ ] Task 4: Scaffold backend package (AC: #1, #4)
  - [ ] Create `backend/package.json` with scripts: `dev`, `start`, `test`
  - [ ] `dev` script: `tsx watch --env-file .env src/server.ts`
  - [ ] `test` script: `vitest run`
  - [ ] Create `backend/tsconfig.json` with strict mode, target ES2022+
  - [ ] Install fastify, drizzle-orm, pg, @todo/shared (workspace:*)
  - [ ] Install devDependencies: typescript, @types/node, tsx, vitest, @types/pg
  - [ ] Create `backend/.env.example` with `DATABASE_URL=postgresql://user:password@localhost:5432/todo_dev` and `PORT=3000`
  - [ ] Create `backend/.env.test` (gitignored) documenting test `DATABASE_URL`
  - [ ] Create `backend/drizzle.config.ts` pointing to shared schema
- [ ] Task 5: Scaffold E2E test infrastructure (AC: #4)
  - [ ] Create `e2e/` directory at monorepo root
  - [ ] Create `e2e/package.json` with playwright dependency
  - [ ] Create `e2e/playwright.config.ts` with baseURL pointing to frontend dev server
  - [ ] Create placeholder `e2e/tests/` directory
- [ ] Task 6: Verify workspace setup (AC: #1, #4)
  - [ ] Run `pnpm install` from root — all workspace dependencies resolve
  - [ ] Verify `pnpm -r test` runs Vitest in both frontend and backend
  - [ ] Verify shared types importable from both frontend and backend

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Starter Template Evaluation + Implementation Patterns]

- **Monorepo tool:** pnpm workspaces (NOT Turborepo, NOT npm workspaces)
- **Workspace structure:** Exactly 3 packages: `frontend/`, `backend/`, `shared/` — plus `e2e/` at root
- **Shared package name:** Must be `@todo/shared` — all imports use `import { ... } from '@todo/shared'`
- **Barrel export convention:** `shared/index.ts` re-exports everything. Never import subpaths like `@todo/shared/schema`
- **Workspace dependency:** Both frontend and backend must declare `"@todo/shared": "workspace:*"` in package.json

### Exact Versions (Verified Current)

| Package | Version | Notes |
|---------|---------|-------|
| Vite | 7.3.1 | `pnpm create vite@latest` will pull this |
| Fastify | 5.7.1 | `pnpm add fastify` |
| Drizzle ORM | 0.45.1 | `pnpm add drizzle-orm` |
| Vitest | 4.0.18 | `pnpm add -D vitest` |
| TypeScript | latest stable | Strict mode in every package |
| Node.js | 18+ | Vite minimum requirement |
| tsx | latest stable | Backend dev runner |
| Playwright | latest stable | E2E tests |

### Drizzle Schema Definition

**Source:** [architecture.md — Data Architecture + epics.md AC #2]

```typescript
// shared/schema.ts
import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  text: text('text').notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Column naming:** snake_case in DB (`is_completed`, `created_at`), Drizzle maps to camelCase in code (`isCompleted`, `createdAt`).

### TypeScript Type Definitions

**Source:** [architecture.md — API Format Standards + Shared Package Convention]

```typescript
// shared/types.ts
import { todos } from './schema';
import { InferSelectModel } from 'drizzle-orm';

export type Todo = InferSelectModel<typeof todos>;

export interface CreateTodoRequest {
  text: string;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
} | {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
```

**Critical:** `ApiResponse<T>` is a discriminated union — `success: true` gives `data`, `success: false` gives `error`. This envelope is used by ALL backend endpoints.

### TypeScript Configuration

Each package needs its own `tsconfig.json` with strict mode. Key settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- **Shared:** Target ES2022, module NodeNext (for pkg consumption)
- **Backend:** Target ES2022, module NodeNext, outDir dist
- **Frontend:** Generated by Vite template — keep Vite defaults, ensure strict is on

### Backend Dev Script

**Source:** [architecture.md — Development Workflow]

```json
{
  "scripts": {
    "dev": "tsx watch --env-file .env src/server.ts",
    "start": "node dist/server.js",
    "test": "vitest run"
  }
}
```

Use `tsx watch` with `--env-file` flag (Node-native .env loading via tsx). Do NOT use dotenv package.

### Drizzle Config

**Source:** [architecture.md — Data Architecture]

```typescript
// backend/drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: '../shared/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

Install `drizzle-kit` as a backend devDependency. Migration files go in `backend/drizzle/`.

### Vite Proxy (Frontend)

**Source:** [architecture.md — Frontend Architecture]

The frontend `vite.config.ts` needs a proxy to forward `/api/*` to the backend:

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

This is needed from Story 1.2 onward but should be set up now.

### .gitignore Must Include

```
node_modules/
.env
.env.test
dist/
*.local
*.tsbuildinfo
pnpm-lock.yaml  # optional — some teams commit this
```

### Frontend Vitest Configuration

Vitest for React needs jsdom environment. In `vite.config.ts`:

```typescript
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

Create `frontend/src/test-setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

### Naming Conventions (Full Project)

**Source:** [architecture.md — Naming Conventions]

| Layer | Convention | Example |
|-------|-----------|---------|
| DB tables | plural snake_case | `todos` |
| DB columns | snake_case | `is_completed`, `created_at` |
| API/JSON fields | camelCase | `isCompleted`, `createdAt` |
| Frontend components | PascalCase files | `TaskItem.tsx`, `TaskItem.css` |
| Frontend non-components | camelCase files | `useTodos.ts`, `todoApi.ts` |
| Backend files | dot-notation | `todo.routes.ts`, `todo.service.ts` |
| Functions/variables | camelCase | `createTodo` |
| Types/interfaces | PascalCase | `Todo`, `ApiResponse<T>` |

### What NOT To Do

- Do NOT install Turborepo, npm workspaces, or Lerna — pnpm workspaces only
- Do NOT use dotenv package — use Node/tsx native `--env-file` flag
- Do NOT create any component files yet — this story is scaffold only
- Do NOT create backend route/service files yet — that's Story 1.2
- Do NOT create any frontend component folders yet — that's Story 1.3+
- Do NOT install SWR, @fastify/type-provider-typebox, or UI libraries yet
- Do NOT create actual E2E test files yet — just the infrastructure (playwright.config.ts)
- Do NOT add a user_id column to the schema — explicitly deferred per architecture
- Do NOT import from `@todo/shared/schema` subpath — always use `@todo/shared` barrel

### Project Structure After This Story

```
todo/
├── package.json              ← root, private: true
├── pnpm-workspace.yaml       ← packages: [frontend, backend, shared]
├── .gitignore
├── e2e/
│   ├── package.json
│   ├── playwright.config.ts
│   └── tests/               ← empty directory
├── shared/
│   ├── package.json          ← @todo/shared
│   ├── tsconfig.json
│   ├── index.ts              ← barrel export
│   ├── schema.ts             ← Drizzle todos table
│   └── types.ts              ← Todo, CreateTodoRequest, ApiResponse<T>
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── .env.test             ← gitignored
│   ├── drizzle.config.ts
│   └── src/                  ← empty, ready for Story 1.2
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts        ← includes proxy + vitest config
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── main.tsx           ← Vite template default
│       ├── App.tsx            ← Vite template default
│       ├── test-setup.ts      ← @testing-library/jest-dom import
│       └── ...               ← Vite template defaults
└── pnpm-lock.yaml
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
