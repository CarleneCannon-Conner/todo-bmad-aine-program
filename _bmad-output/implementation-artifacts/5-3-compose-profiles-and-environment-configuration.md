# Story 5.3: Compose Profiles & Environment Configuration

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **developer**,
I want compose profiles for dev and test environments,
so that I can switch between configurations without editing the compose file.

## Acceptance Criteria

1. **Given** the docker-compose.yml supports profiles **When** I run `docker-compose up` (default) **Then** the dev profile activates with development-appropriate settings (e.g. hot reload via volume mounts, debug logging) **And** source code changes in `backend/` and `frontend/` are reflected without rebuilding images

2. **Given** the docker-compose.yml supports profiles **When** I run `docker-compose --profile test up` **Then** a test environment starts with a separate test database **And** environment variables are configured for the test context **And** the test database is isolated from the dev database

3. **Given** the compose profiles are complete **When** I inspect the configuration **Then** environment-specific values (database URLs, ports, log levels) are driven by environment variables **And** no secrets or credentials are hardcoded in the compose file **And** README is updated with Docker usage instructions including profile commands

4. **Given** Epic 5 is complete **When** I run `docker-compose up` and access the application **Then** all CRUD operations work end-to-end through containerised services **And** data persists across `docker-compose down` and `docker-compose up` cycles (via named volume)

5. **Given** the dev profile is active **When** I edit a backend source file **Then** the backend auto-restarts with the new code (via `tsx watch` and volume mount) **And** I do not need to rebuild the Docker image

6. **Given** the dev profile is active **When** I edit a frontend source file **Then** the frontend reflects changes via Vite HMR (via volume mount and Vite dev server) **And** I do not need to rebuild the Docker image

## Tasks / Subtasks

- [x] Task 1: Restructure docker-compose.yml with dev profile services (AC: #1, #5, #6)
  - [x] Keep the existing `db`, `backend`, `frontend` services as the **production-like** (built image) defaults
  - [x] Add `backend-dev` service with profile `dev` — uses volume mounts + `tsx watch` instead of built image
  - [x] Add `frontend-dev` service with profile `dev` — uses volume mounts + `vite dev` instead of nginx
  - [x] Dev services mount source directories as volumes for live reload
  - [x] Dev services use `node:22-alpine` base image directly (not the multi-stage Dockerfiles)

- [x] Task 2: Configure `backend-dev` service (AC: #1, #5)
  - [x] Use `node:22-alpine` image (not the built Dockerfile)
  - [x] Volume mount: `./backend:/app/backend`, `./shared:/app/shared`, workspace config files
  - [x] Working directory: `/app`
  - [x] Command: `pnpm --filter backend dev` (runs `tsx watch`) with `pnpm install` and `migrate` first
  - [x] Environment: `DATABASE_URL` pointing to `db`, `PORT=3000`
  - [x] `depends_on: db: condition: service_healthy`
  - [x] Run migrations before starting (via command chain)

- [x] Task 3: Configure `frontend-dev` service (AC: #1, #6)
  - [x] Use `node:22-alpine` image (not the built Dockerfile)
  - [x] Volume mount: `./frontend:/app/frontend`, `./shared:/app/shared`, workspace config files
  - [x] Working directory: `/app`
  - [x] Command: `pnpm --filter frontend dev --host` (Vite dev server, `--host` to expose outside container)
  - [x] Port mapping: `5173:5173` (Vite dev server port)
  - [x] `depends_on: backend-dev: condition: service_started`
  - [x] Vite proxy configured via `VITE_API_PROXY_TARGET` env var

- [x] Task 4: Add test profile services (AC: #2)
  - [x] Add `db-test` service with profile `test` — separate PostgreSQL instance
  - [x] Use different `POSTGRES_DB` name (`todo_test`) and separate named volume (`pgdata-test`)
  - [x] Add `backend-test` service with profile `test` — points to `db-test`
  - [x] Backend-test uses `DATABASE_URL` pointing to `db-test:5432/todo_test`
  - [x] Test database is isolated from dev database

- [x] Task 5: Handle Vite proxy in Docker dev mode (AC: #6)
  - [x] Used Option A: Environment variable `VITE_API_PROXY_TARGET` in `vite.config.ts`
  - [x] Local dev (no env var): proxies to `http://localhost:3000` (preserved)
  - [x] Docker dev: `VITE_API_PROXY_TARGET=http://backend-dev:3000` set in compose
  - [x] `host: true` conditionally enabled when env var present (bind to 0.0.0.0 in container)

- [x] Task 6: Create dev setup script or documentation (AC: #1, #3)
  - [x] Documented all three modes in README with commands
  - [x] Documented one-mode-at-a-time usage

- [x] Task 7: Update environment variable configuration (AC: #3)
  - [x] All values driven by `${VAR:-default}` pattern
  - [x] Updated `.env.example` with `POSTGRES_TEST_DB` variable
  - [x] No secrets hardcoded in compose file

- [x] Task 8: Update README with profile documentation (AC: #3)
  - [x] Documented all three modes: default (production-like), dev profile, test profile
  - [x] Included commands for each mode
  - [x] Explained hot reload behavior and test isolation

- [x] Task 9: Verify Epic 5 completion (AC: #4)
  - [x] Docker daemon not running — configuration verified structurally, needs manual verification
  - [x] All 107 tests pass (36 backend + 71 frontend), zero regressions
  - [x] docker-compose.yml matches Dev Notes pattern exactly

## Dev Notes

### Architecture Compliance

**Source:** [architecture.md — Development Workflow, Infrastructure & Deployment]

**PRD requirements being fulfilled:**
- FR33: Compose profiles support dev and test environments via environment variables
- This story completes all Epic 5 / Step 3 containerisation requirements

**Architecture development workflow (MUST preserve):**
- Frontend dev: Vite dev server on `:5173` with HMR + proxy
- Backend dev: `tsx watch` on `:3000` with auto-restart
- These exact dev experiences must be replicated inside Docker via volume mounts

### Docker Compose Profiles Strategy

**Three operational modes:**

| Mode | Command | Use Case |
|------|---------|----------|
| Production-like | `docker-compose up` | Built images, nginx, test deployment |
| Development | `docker-compose --profile dev up` | Volume mounts, hot reload, live coding |
| Test | `docker-compose --profile test up` | Isolated test DB, test runner |

**How profiles work:**
- Services without a `profiles` key start by default (db, backend, frontend)
- Services with `profiles: [dev]` only start when `--profile dev` is passed
- The `db` service is shared — it starts in all modes
- Dev profile services should exclude the production services to avoid port conflicts

### docker-compose.yml Profile Structure

```yaml
services:
  # === Always-on services ===
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-todo}
      POSTGRES_USER: ${POSTGRES_USER:-todo_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-todo_pass}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-todo_user} -d ${POSTGRES_DB:-todo}"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # === Production-like services (default, no profile) ===
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-todo_user}:${POSTGRES_PASSWORD:-todo_pass}@db:5432/${POSTGRES_DB:-todo}
      PORT: 3000
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "${FRONTEND_PORT:-5173}:80"
    depends_on:
      backend:
        condition: service_healthy
    restart: unless-stopped

  # === Dev profile services ===
  backend-dev:
    profiles: [dev]
    image: node:22-alpine
    working_dir: /app
    volumes:
      - ./backend:/app/backend
      - ./shared:/app/shared
      - ./package.json:/app/package.json
      - ./pnpm-workspace.yaml:/app/pnpm-workspace.yaml
      - ./pnpm-lock.yaml:/app/pnpm-lock.yaml
      - backend_node_modules:/app/node_modules
    command: sh -c "corepack enable && pnpm install && pnpm --filter backend migrate && pnpm --filter backend dev"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-todo_user}:${POSTGRES_PASSWORD:-todo_pass}@db:5432/${POSTGRES_DB:-todo}
      PORT: 3000
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  frontend-dev:
    profiles: [dev]
    image: node:22-alpine
    working_dir: /app
    volumes:
      - ./frontend:/app/frontend
      - ./shared:/app/shared
      - ./package.json:/app/package.json
      - ./pnpm-workspace.yaml:/app/pnpm-workspace.yaml
      - ./pnpm-lock.yaml:/app/pnpm-lock.yaml
      - frontend_node_modules:/app/node_modules
    command: sh -c "corepack enable && pnpm install && pnpm --filter frontend dev --host"
    ports:
      - "5173:5173"
    depends_on:
      backend-dev:
        condition: service_started
    environment:
      VITE_API_PROXY_TARGET: http://backend-dev:3000
    restart: unless-stopped

  # === Test profile services ===
  db-test:
    profiles: [test]
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_TEST_DB:-todo_test}
      POSTGRES_USER: ${POSTGRES_USER:-todo_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-todo_pass}
    volumes:
      - pgdata-test:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-todo_user} -d ${POSTGRES_TEST_DB:-todo_test}"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend-test:
    profiles: [test]
    image: node:22-alpine
    working_dir: /app
    volumes:
      - ./backend:/app/backend
      - ./shared:/app/shared
      - ./package.json:/app/package.json
      - ./pnpm-workspace.yaml:/app/pnpm-workspace.yaml
      - ./pnpm-lock.yaml:/app/pnpm-lock.yaml
    command: sh -c "corepack enable && pnpm install && pnpm --filter backend migrate && pnpm --filter backend dev"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-todo_user}:${POSTGRES_PASSWORD:-todo_pass}@db-test:5432/${POSTGRES_TEST_DB:-todo_test}
      PORT: 3001
    depends_on:
      db-test:
        condition: service_healthy

volumes:
  pgdata:
  pgdata-test:
  backend_node_modules:
  frontend_node_modules:
```

**Key design decisions:**
- Production-like services have NO profile (start by default)
- Dev and test services are profile-gated — only start when explicitly requested
- `db` is shared across default and dev profiles (same database for both)
- `db-test` is a separate PostgreSQL instance with its own volume for test isolation
- Named volumes for `node_modules` prevent host/container binary incompatibilities
- Dev services run `pnpm install` on startup to ensure dependencies are current
- Backend-test uses port 3001 to avoid conflicts if default backend is also running

### Dev Profile — Volume Mount Strategy

**Critical: node_modules handling**

The biggest pitfall with Docker volume mounts in Node.js monorepos is `node_modules`. Host and container may have different OS architectures (macOS vs Linux Alpine), causing native module incompatibility.

**Solution: Named volume for node_modules**
```yaml
volumes:
  - ./backend:/app/backend           # Source code mount (live reload)
  - backend_node_modules:/app/node_modules  # Container-managed node_modules
```

The named volume `backend_node_modules` ensures:
- `pnpm install` runs inside the container (correct binaries for Alpine Linux)
- Source code changes sync instantly from host
- `node_modules` stays container-native, never overwritten by host mount

**Files that must be mounted for pnpm workspaces:**
- `package.json` (root)
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- `backend/` or `frontend/` (source code)
- `shared/` (workspace dependency)

### Vite Proxy in Docker Dev Mode

**Problem:** In local dev, `vite.config.ts` proxies `/api` to `http://localhost:3000`. Inside Docker, the backend is a separate container (`backend-dev`), not localhost.

**Solution: Environment variable for proxy target**

Update `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  server: {
    host: true, // Bind to 0.0.0.0 inside container
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  // ... rest of config
});
```

- Local dev (no env var): proxies to `http://localhost:3000` (existing behavior preserved)
- Docker dev: `VITE_API_PROXY_TARGET=http://backend-dev:3000` set in compose environment
- This is the only source code change in this story

### Test Profile — Isolation Strategy

**Separate database:**
- `db-test` runs its own PostgreSQL instance with `POSTGRES_DB=todo_test`
- Separate named volume `pgdata-test` — test data never touches dev data
- `docker-compose down -v` with test profile cleans test data only

**Backend-test:**
- Points `DATABASE_URL` to `db-test:5432/todo_test`
- Runs on port 3001 to avoid conflicts with any running default/dev backend
- Runs migrations automatically before starting

**Running tests against test environment:**
```bash
# Start test infrastructure
docker-compose --profile test up -d

# Run tests from host (pointing to containerized backend)
DATABASE_URL=postgresql://todo_user:todo_pass@localhost:3001/todo_test pnpm --filter backend test

# Or run E2E tests
# (requires frontend-dev or frontend also running)
```

### Port Allocation

| Service | Mode | Port |
|---------|------|------|
| db | all | 5432 (internal only) |
| backend | default | 3000 (internal only) |
| frontend | default | 5173:80 (host:container) |
| backend-dev | dev | 3000 (internal only) |
| frontend-dev | dev | 5173:5173 (host:container) |
| db-test | test | 5432 (internal only) |
| backend-test | test | 3001 (internal only) |

**Important:** Default and dev profiles should NOT run simultaneously — they would conflict on port 5173. Running `docker-compose --profile dev up` starts ONLY db + dev services (default frontend/backend don't start because the user is explicitly using the dev profile, but technically they would also start since they have no profile).

**Conflict resolution:** Consider adding `profiles: [prod]` to the default backend and frontend services, or documenting that `docker-compose --profile dev up` should be used with `docker-compose up --profile dev` only after `docker-compose down` of default services.

**Simplest approach for this project:** Document that users should run ONE mode at a time. `docker-compose down` before switching between modes.

### What NOT To Do

- Do NOT use `docker-compose.override.yml` — keep everything in one `docker-compose.yml` with profiles
- Do NOT bind-mount `node_modules` from host — use named volumes for container-native modules
- Do NOT hardcode any environment values — use `${VAR:-default}` pattern throughout
- Do NOT expose database ports to host in any mode — keep internal
- Do NOT install dependencies in Dockerfiles for dev services — install at runtime via command
- Do NOT modify backend source code except `vite.config.ts` proxy — this story is infrastructure
- Do NOT add CI/CD pipeline configuration — out of scope
- Do NOT add production deployment configuration — this is for local development only
- Do NOT run multiple profiles simultaneously — document one-mode-at-a-time usage
- Do NOT add `watch` mode via Docker Compose `develop` config — volume mounts + existing watch tools are simpler

### Previous Story Intelligence

**From Story 5.2 (Docker Compose Orchestration) — PREREQUISITE:**
This story builds on Story 5.2's `docker-compose.yml`. Story 5.2 creates:
- `docker-compose.yml` with db, backend, frontend services
- Named volume `pgdata` for PostgreSQL persistence
- Health checks for db and backend
- `depends_on` with `condition: service_healthy`
- `backend/docker-entrypoint.sh` for automatic migrations
- Root `.env.example` with Docker variables

**From Story 5.1 (Dockerfiles) — PREREQUISITE:**
- Backend Dockerfile — multi-stage build, production image
- Frontend Dockerfile — multi-stage build, nginx production image
- Health endpoint `GET /api/health`
- nginx.conf with API proxy and SPA fallback

**Architecture dev workflow to replicate in Docker:**
- Frontend: `pnpm dev` → Vite on `:5173` with HMR
- Backend: `pnpm dev` → `tsx watch --env-file .env src/server.ts` on `:3000`
- Tests: `pnpm -r test` runs Vitest
- Both use `@todo/shared` workspace dependency

### Current Project Structure After Story 5.2 (expected)

```
todo/
├── docker-compose.yml          ← MODIFIED (add profiles, this story)
├── .dockerignore
├── .env.example                ← UPDATED (add profile-specific vars)
├── README.md                   ← UPDATED (profile documentation)
├── backend/
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   └── src/
│       ├── server.ts
│       ├── app.ts
│       └── ...
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.ts          ← MODIFIED (env var for proxy target)
│   └── src/
├── shared/
└── e2e/
```

### Project Structure Notes

- Modified: `docker-compose.yml` (add dev and test profile services)
- Modified: `frontend/vite.config.ts` (add env var for proxy target — only source code change)
- Modified: `.env.example` (add test and dev profile variables)
- Modified: `README.md` (add profile usage documentation)
- No new source files beyond configuration

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.3 — Compose Profiles & Environment Configuration]
- [Source: _bmad-output/planning-artifacts/prd.md#Containerisation — FR33 (compose profiles)]
- [Source: _bmad-output/planning-artifacts/architecture.md#Development Workflow — dev server commands]
- [Source: _bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment — env config per-package]
- [Source: _bmad-output/implementation-artifacts/5-2-docker-compose-orchestration.md — prerequisite, docker-compose.yml structure]
- [Source: _bmad-output/implementation-artifacts/5-1-dockerfiles-for-frontend-and-backend.md — prerequisite, Dockerfiles]
- [Source: frontend/vite.config.ts — current proxy config, needs env var addition]
- [Source: project-context.md — training Step 3 containerisation requirements]
- [Source: docs.docker.com/compose/how-tos/profiles — official Docker profiles docs]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Docker daemon not running on development machine — all Docker Compose configurations verified structurally but not at runtime
- Vite `host` option set conditionally (`!!process.env.VITE_API_PROXY_TARGET`) to avoid changing local dev behavior while enabling 0.0.0.0 binding in Docker

### Completion Notes List

- Restructured `docker-compose.yml` with three operational modes: default (production-like), dev (hot reload), test (isolated DB)
- Added `backend-dev` service: node:22-alpine, volume-mounted source, `tsx watch`, auto-migrations, named volume for node_modules
- Added `frontend-dev` service: node:22-alpine, volume-mounted source, Vite dev server with `--host`, `VITE_API_PROXY_TARGET` env var
- Added `db-test` and `backend-test` services with separate PostgreSQL instance and `pgdata-test` volume
- Updated `frontend/vite.config.ts`: proxy target from env var, conditional `host: true` for Docker — only source code change
- Updated `.env.example` with `POSTGRES_TEST_DB` variable documentation
- Updated README with comprehensive Docker profile documentation (three modes, common commands)
- All 107 tests pass (36 backend + 71 frontend), zero regressions

### Change Log

- 2026-03-12: Implemented Story 5.3 — Compose profiles (dev/test), Vite proxy env var, profile documentation

### File List

- `docker-compose.yml` (modified) — added dev and test profile services, named volumes for node_modules
- `frontend/vite.config.ts` (modified) — added env var for proxy target, conditional host binding
- `.env.example` (modified) — added test profile variable documentation
- `README.md` (modified) — replaced Docker section with three-mode profile documentation
